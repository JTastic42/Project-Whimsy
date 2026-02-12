import { useState, useEffect, useCallback } from 'react';
import WorkoutLanding from './components/WorkoutLanding';
import WeightliftingForm from './components/WeightliftingForm';
import RunningForm from './components/RunningForm';
import CyclingForm from './components/CyclingForm';
import DataManager from './components/DataManager';
import { UserSelector, AccountMenu, SettingsModal } from './components/UserProfile';
import { BARBELL_OPTIONS } from './utils/constants';
import { dataServiceFactory } from './services/dataServiceFactory';
import { userService } from './services/userService';
import { 
  GlobalErrorBoundary, 
  DataServiceErrorBoundary, 
  FeatureErrorBoundary, 
  UserSelectorErrorBoundary 
} from './components/ErrorBoundary';
import ErrorTestComponent from './components/ErrorTest/ErrorTestComponent';
import './App.css';
import './components/ErrorBoundary/ErrorBoundary.css';

const WorkoutApp = () => {
  const [selectedWorkoutType, setSelectedWorkoutType] = useState(null);
  const [editingWorkout, setEditingWorkout] = useState(null);
  const [isTransitioningOut, setIsTransitioningOut] = useState(false);
  const [showDataManager, setShowDataManager] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [themePreference, setThemePreference] = useState('light');
  const [darkMode, setDarkMode] = useState(false);
  const [unit, setUnit] = useState('lbs');
  const [distanceUnit, setDistanceUnit] = useState('mi');
  const [selectedBarbell, setSelectedBarbell] = useState(BARBELL_OPTIONS.lbs[0]);
  const [workoutHistory, setWorkoutHistory] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [dataService, setDataService] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [dataError, setDataError] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [showUserSelector, setShowUserSelector] = useState(false);
  const [userLoading, setUserLoading] = useState(true);

  const initializeDataService = useCallback(async (userId) => {
    try {
      setIsLoading(true);
      setDataError(null);
      setWorkoutHistory([]);

      let service;
      if (dataService && dataServiceFactory.getServiceInfo().initialized) {
        service = await dataServiceFactory.switchUser(userId);
      } else {
        service = await dataServiceFactory.initialize(null, userId);
      }
      setDataService(service);

      const preferences = await service.getPreferences();
      setUnit(preferences.unit || 'lbs');
      setDistanceUnit(preferences.distanceUnit || 'mi');
      const theme = preferences.theme || 'light';
      setThemePreference(theme);
      if (theme === 'system') {
        setDarkMode(window.matchMedia?.('(prefers-color-scheme: dark)')?.matches ?? false);
      } else {
        setDarkMode(theme === 'dark');
      }
      setSelectedBarbell(preferences.defaultBarbell || BARBELL_OPTIONS[preferences.unit || 'lbs'][0]);

      const [history, tmpls] = await Promise.all([
        service.getWorkoutHistory(),
        service.getTemplates?.() || Promise.resolve([])
      ]);
      setWorkoutHistory(history);
      setTemplates(tmpls || []);
    } catch (error) {
      console.error('Data service initialization failed:', error);
      setDataError('Failed to load user data.');
      setThemePreference('system');
      setDarkMode(window.matchMedia?.('(prefers-color-scheme: dark)')?.matches ?? false);
    } finally {
      setIsLoading(false);
    }
  }, [dataService]);

  useEffect(() => {
    const init = async () => {
      try {
        setUserLoading(true);
        setDataError(null);
        const existingUser = await userService.getCurrentUser();
        if (existingUser?.isActive) {
          setCurrentUser(existingUser);
          await initializeDataService(existingUser.id);
        } else {
          setShowUserSelector(true);
          if (dataServiceFactory.hasLegacyData()) {
            console.log('Legacy data found - will migrate after user selection');
          }
        }
      } catch (error) {
        console.error('User initialization failed:', error);
        setDataError('Failed to initialize. Please refresh.');
      } finally {
        setUserLoading(false);
      }
    };
    init();
  }, [initializeDataService]);

  useEffect(() => {
    document.documentElement.className = darkMode ? 'dark-theme' : 'light-theme';
  }, [darkMode]);

  useEffect(() => {
    if (themePreference === 'light') setDarkMode(false);
    else if (themePreference === 'dark') setDarkMode(true);
    else if (themePreference === 'system') {
      setDarkMode(window.matchMedia?.('(prefers-color-scheme: dark)')?.matches ?? false);
    }
  }, [themePreference]);

  useEffect(() => {
    if (themePreference === 'system' && dataService) {
      const media = window.matchMedia?.('(prefers-color-scheme: dark)');
      if (!media) return;
      const handler = () => setDarkMode(media.matches);
      media.addEventListener('change', handler);
      return () => media.removeEventListener('change', handler);
    }
  }, [themePreference, dataService]);

  useEffect(() => {
    if (dataService) {
      dataService.getPreferences()
        .then(prefs => dataService.savePreferences({ ...prefs, theme: themePreference }))
        .catch(e => console.error(e));
    }
  }, [themePreference, dataService]);

  const handlePreferenceChange = useCallback(async (prefs) => {
    if (prefs.unit) setUnit(prefs.unit);
    if (prefs.distanceUnit) setDistanceUnit(prefs.distanceUnit);
    if (prefs.defaultBarbell) setSelectedBarbell(prefs.defaultBarbell);
    if (dataService) {
      const current = await dataService.getPreferences();
      await dataService.savePreferences({ ...current, ...prefs }).catch(e => console.error(e));
    }
  }, [dataService]);

  const handleUserSelect = useCallback(async (user) => {
    try {
      setUserLoading(true);
      await userService.setCurrentUser(user);
      setCurrentUser(user);
      if (dataServiceFactory.hasLegacyData()) {
        await dataServiceFactory.migrateLegacyData(user.id);
      }
      await initializeDataService(user.id);
      setShowUserSelector(false);
    } catch (error) {
      console.error('Error selecting user:', error);
      setDataError('Failed to switch user.');
    } finally {
      setUserLoading(false);
    }
  }, [initializeDataService]);

  const refreshData = useCallback(async () => {
    if (dataService) {
      const [history, tmpls] = await Promise.all([
        dataService.getWorkoutHistory(),
        dataService.getTemplates?.() || Promise.resolve([])
      ]);
      setWorkoutHistory(history);
      setTemplates(tmpls || []);
    }
  }, [dataService]);

  const handleWorkoutSave = useCallback(async (workout) => {
    if (!dataService || !currentUser) return;
    try {
      const payload = { ...workout, userId: currentUser.id };
      if (workout.id) {
        await dataService.updateWorkout(workout.id, payload);
      } else {
        await dataService.saveWorkout(payload);
      }
      await refreshData();
      setSelectedWorkoutType(null);
      setEditingWorkout(null);
    } catch (error) {
      console.error('Error saving workout:', error);
    }
  }, [dataService, currentUser, refreshData]);

  const handleWorkoutDelete = useCallback(async (workout) => {
    if (!dataService) return;
    try {
      await dataService.deleteWorkout(workout.id);
      await refreshData();
      setEditingWorkout((prev) => (prev?.id === workout.id ? null : prev));
      setSelectedWorkoutType((prev) => (prev && editingWorkout?.id === workout.id ? null : prev));
    } catch (error) {
      console.error('Error deleting workout:', error);
    }
  }, [dataService, refreshData, editingWorkout]);

  const handleEditWorkout = useCallback((workout) => {
    setEditingWorkout(workout);
    setSelectedWorkoutType(workout.type || 'weightlifting');
  }, []);

  const handleSelectType = useCallback((type) => {
    setEditingWorkout(null);
    setSelectedWorkoutType(prev => prev === type ? null : type);
  }, []);

  const handleSaveTemplate = useCallback(async (template) => {
    if (!dataService) return;
    try {
      await dataService.saveTemplate({ ...template, type: 'weightlifting' });
      const tmpls = await dataService.getTemplates();
      setTemplates(tmpls || []);
    } catch (error) {
      console.error('Error saving template:', error);
    }
  }, [dataService]);

  const handleDataChange = useCallback(async () => {
    if (dataService && currentUser) {
      const prefs = await dataService.getPreferences();
      setUnit(prefs.unit || 'lbs');
      setDistanceUnit(prefs.distanceUnit || 'mi');
      const theme = prefs.theme || 'light';
      setThemePreference(theme);
      if (theme === 'system') {
        setDarkMode(window.matchMedia?.('(prefers-color-scheme: dark)')?.matches ?? false);
      } else {
        setDarkMode(theme === 'dark');
      }
      setSelectedBarbell(prefs.defaultBarbell);
      await refreshData();
    }
  }, [dataService, currentUser, refreshData]);

  if (userLoading) {
    return (
      <div className="weight-calculator">
        <div className="loading-container">
          <h2>Loading...</h2>
          <p>Initializing...</p>
        </div>
      </div>
    );
  }

  if (isLoading && currentUser) {
    return (
      <div className="weight-calculator">
        <div className="loading-container">
          <h2>Loading {currentUser.name}'s Data...</h2>
        </div>
      </div>
    );
  }

  if (showDataManager) {
    return (
      <div className="weight-calculator">
        <header className="calculator-header">
          <div className="header-content">
            <div className="header-text">
              <h1>Workout Tracker</h1>
              <p>Data Manager</p>
            </div>
            <div className="header-controls">
              <AccountMenu
                currentUser={currentUser}
                onOpenUserSelector={() => setShowUserSelector(true)}
                onOpenSettings={() => { setShowDataManager(false); setShowSettings(true); }}
                onLogOut={async () => {
                  await userService.clearCurrentUser();
                  setCurrentUser(null);
                  setWorkoutHistory([]);
                  setTemplates([]);
                  setShowUserSelector(true);
                  setShowDataManager(false);
                }}
              />
              <button className="unit-toggle" onClick={() => setShowDataManager(false)}>Back</button>
            </div>
          </div>
        </header>
        <div className="tab-content">
          <FeatureErrorBoundary featureName="Data Manager">
            <DataManager onDataChange={handleDataChange} />
            {process.env.NODE_ENV === 'development' && (
              <div style={{ marginTop: 20, borderTop: '2px solid var(--border-color)', paddingTop: 20 }}>
                <h3>Development Tools</h3>
                <ErrorTestComponent />
              </div>
            )}
          </FeatureErrorBoundary>
        </div>
      </div>
    );
  }

  return (
    <div className="weight-calculator">
      {dataError && (
        <div className="error-banner">
          <p>⚠️ {dataError}</p>
        </div>
      )}
      <header className="calculator-header">
        <div className="header-content">
          <div className="header-text">
            <h1>Workout Tracker</h1>
            <p>Log weightlifting, running, and cycling</p>
          </div>
          <div className="header-controls">
            <AccountMenu
              currentUser={currentUser}
              onOpenUserSelector={() => setShowUserSelector(true)}
              onOpenSettings={() => setShowSettings(true)}
              onLogOut={async () => {
                await userService.clearCurrentUser();
                setCurrentUser(null);
                setWorkoutHistory([]);
                setTemplates([]);
                setShowUserSelector(true);
              }}
            />
          </div>
        </div>
      </header>

      <div className="main-content">
        <WorkoutLanding
          workoutHistory={workoutHistory}
          selectedWorkoutType={selectedWorkoutType}
          onSelectType={handleSelectType}
          onEditWorkout={handleEditWorkout}
          onDeleteWorkout={handleWorkoutDelete}
        />

        {selectedWorkoutType === 'weightlifting' && (
          <div className={`form-container form-container-enter ${isTransitioningOut ? 'form-container-exit' : ''}`}>
            <FeatureErrorBoundary featureName="Weightlifting">
              <WeightliftingForm
                initialData={editingWorkout}
                unit={unit}
                selectedBarbell={selectedBarbell}
                templates={templates.filter(t => t.type === 'weightlifting')}
                onSave={handleWorkoutSave}
                onCancel={() => {
                  setIsTransitioningOut(true);
                  setTimeout(() => {
                    setSelectedWorkoutType(null);
                    setEditingWorkout(null);
                    setIsTransitioningOut(false);
                  }, 300);
                }}
                onSaveTemplate={handleSaveTemplate}
                onPreferenceChange={handlePreferenceChange}
              />
            </FeatureErrorBoundary>
          </div>
        )}

        {selectedWorkoutType === 'running' && (
          <div className={`form-container form-container-enter ${isTransitioningOut ? 'form-container-exit' : ''}`}>
            <FeatureErrorBoundary featureName="Running">
              <RunningForm
                initialData={editingWorkout}
                distanceUnit={distanceUnit}
                onSave={handleWorkoutSave}
                onCancel={() => {
                  setIsTransitioningOut(true);
                  setTimeout(() => {
                    setSelectedWorkoutType(null);
                    setEditingWorkout(null);
                    setIsTransitioningOut(false);
                  }, 300);
                }}
              />
            </FeatureErrorBoundary>
          </div>
        )}

        {selectedWorkoutType === 'cycling' && (
          <div className={`form-container form-container-enter ${isTransitioningOut ? 'form-container-exit' : ''}`}>
            <FeatureErrorBoundary featureName="Cycling">
              <CyclingForm
                initialData={editingWorkout}
                distanceUnit={distanceUnit}
                onSave={handleWorkoutSave}
                onCancel={() => {
                  setIsTransitioningOut(true);
                  setTimeout(() => {
                    setSelectedWorkoutType(null);
                    setEditingWorkout(null);
                    setIsTransitioningOut(false);
                  }, 300);
                }}
              />
            </FeatureErrorBoundary>
          </div>
        )}
      </div>

      <SettingsModal
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
        unit={unit}
        distanceUnit={distanceUnit}
        themePreference={themePreference}
        selectedBarbell={selectedBarbell}
        onUnitChange={(newUnit) => {
          handlePreferenceChange({
            unit: newUnit,
            defaultBarbell: BARBELL_OPTIONS[newUnit][0]
          });
          setUnit(newUnit);
          setSelectedBarbell(BARBELL_OPTIONS[newUnit][0]);
        }}
        onDistanceUnitChange={(newUnit) => {
          handlePreferenceChange({ distanceUnit: newUnit });
          setDistanceUnit(newUnit);
        }}
        onThemeChange={(theme) => {
          setThemePreference(theme);
        }}
        onBarbellChange={(barbell) => {
          handlePreferenceChange({ defaultBarbell: barbell });
          setSelectedBarbell(barbell);
        }}
        onOpenDataManager={() => {
          setShowSettings(false);
          setShowDataManager(true);
        }}
      />

      {showUserSelector && (
        <UserSelectorErrorBoundary>
          <UserSelector
            onUserSelect={handleUserSelect}
            onClose={() => currentUser && setShowUserSelector(false)}
            currentUser={currentUser}
          />
        </UserSelectorErrorBoundary>
      )}
    </div>
  );
};

function App() {
  const handleGlobalError = (error, errorInfo, errorId) => {
    console.error('Global error caught:', { error, errorInfo, errorId });
  };

  return (
    <GlobalErrorBoundary onError={handleGlobalError}>
      <DataServiceErrorBoundary>
        <div className="App">
          <WorkoutApp />
        </div>
      </DataServiceErrorBoundary>
    </GlobalErrorBoundary>
  );
}

export default App;
