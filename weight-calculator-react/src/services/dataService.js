/**
 * Abstract Data Service Interface
 * 
 * This service provides a consistent interface for data operations
 * that can be implemented by different storage backends (localStorage, IndexedDB, cloud)
 */

import { generateWorkoutId, isValidWorkoutId, upgradeLegacyId } from '../utils/idGenerator.js';

// Data schema versions for migration
export const DATA_SCHEMA_VERSION = '2.0.0';

// Storage keys
export const STORAGE_KEYS = {
  WORKOUT_HISTORY: 'weightCalculator_workoutHistory',
  WORKOUT_TEMPLATES: 'weightCalculator_workoutTemplates',
  USER_PREFERENCES: 'weightCalculator_preferences',
  APP_SETTINGS: 'weightCalculator_settings',
  DATA_VERSION: 'weightCalculator_dataVersion'
};

// Workout types
export const WORKOUT_TYPES = {
  WEIGHTLIFTING: 'weightlifting',
  RUNNING: 'running',
  CYCLING: 'cycling'
};

// Default user preferences
export const DEFAULT_PREFERENCES = {
  unit: 'lbs',
  theme: 'light',
  distanceUnit: 'mi',
  defaultBarbell: { weight: 45, label: 'Olympic Barbell (45 lbs)' },
  autoSave: true,
  showNotifications: true
};

// Default app settings factory function
export const createDefaultSettings = () => ({
  dataVersion: DATA_SCHEMA_VERSION,
  lastBackup: null,
  totalWorkouts: 0,
  firstUse: new Date().toISOString()
});

// Static default settings (without firstUse)
export const DEFAULT_SETTINGS = {
  dataVersion: DATA_SCHEMA_VERSION,
  lastBackup: null,
  totalWorkouts: 0,
  firstUse: null // Will be set dynamically when needed
};

/**
 * Abstract DataService class
 * All storage implementations should extend this class
 */
export class DataService {
  constructor() {
    if (this.constructor === DataService) {
      throw new Error('DataService is an abstract class and cannot be instantiated directly');
    }
  }

  // Workout History Operations
  async getWorkoutHistory() {
    throw new Error('getWorkoutHistory method must be implemented');
  }

  async saveWorkout(workout) {
    throw new Error('saveWorkout method must be implemented');
  }

  async updateWorkout(workoutId, updates) {
    throw new Error('updateWorkout method must be implemented');
  }

  async deleteWorkout(workoutId) {
    throw new Error('deleteWorkout method must be implemented');
  }

  // Workout Template Operations
  async getTemplates() {
    throw new Error('getTemplates method must be implemented');
  }

  async saveTemplate(template) {
    throw new Error('saveTemplate method must be implemented');
  }

  async deleteTemplate(templateId) {
    throw new Error('deleteTemplate method must be implemented');
  }

  async clearWorkoutHistory() {
    throw new Error('clearWorkoutHistory method must be implemented');
  }

  // User Preferences Operations
  async getPreferences() {
    throw new Error('getPreferences method must be implemented');
  }

  async savePreferences(preferences) {
    throw new Error('savePreferences method must be implemented');
  }

  // App Settings Operations
  async getSettings() {
    throw new Error('getSettings method must be implemented');
  }

  async saveSettings(settings) {
    throw new Error('saveSettings method must be implemented');
  }

  // Data Management Operations
  async exportData() {
    throw new Error('exportData method must be implemented');
  }

  async importData(data) {
    throw new Error('importData method must be implemented');
  }

  async clearAllData() {
    throw new Error('clearAllData method must be implemented');
  }

  // Migration and Versioning
  async getDataVersion() {
    throw new Error('getDataVersion method must be implemented');
  }

  async migrateData(fromVersion, toVersion) {
    throw new Error('migrateData method must be implemented');
  }

  // Health Check
  async isHealthy() {
    throw new Error('isHealthy method must be implemented');
  }
}

/**
 * Data validation utilities
 */
export const DataValidators = {
  workout: (workout) => {
    const type = workout.type || WORKOUT_TYPES.WEIGHTLIFTING;
    const required = ['id', 'date', 'type'];
    const missing = required.filter(field => workout[field] === undefined || workout[field] === null);

    if (missing.length > 0) {
      throw new Error(`Missing required workout fields: ${missing.join(', ')}`);
    }

    if (!Object.values(WORKOUT_TYPES).includes(type)) {
      throw new Error(`Invalid workout type: ${type}`);
    }

    if (type === WORKOUT_TYPES.WEIGHTLIFTING) {
      if (!workout.exercise || typeof workout.exercise !== 'string') {
        throw new Error('Weightlifting workout requires exercise');
      }
      if (!['lbs', 'kg'].includes(workout.unit || 'lbs')) {
        throw new Error('Unit must be either "lbs" or "kg"');
      }
      const sets = workout.sets;
      if (!Array.isArray(sets) || sets.length === 0) {
        throw new Error('Weightlifting workout requires at least one set');
      }
      for (let i = 0; i < sets.length; i++) {
        const s = sets[i];
        if (typeof s.weight !== 'number' || s.weight < 0) {
          throw new Error(`Set ${i + 1}: weight must be a non-negative number`);
        }
        if (typeof s.reps !== 'number' || s.reps <= 0) {
          throw new Error(`Set ${i + 1}: reps must be a positive number`);
        }
      }
    } else if (type === WORKOUT_TYPES.RUNNING || type === WORKOUT_TYPES.CYCLING) {
      if (typeof workout.distance !== 'number' || workout.distance <= 0) {
        throw new Error(`${type} workout requires positive distance`);
      }
      if (typeof workout.duration !== 'number' || workout.duration <= 0) {
        throw new Error(`${type} workout requires positive duration (minutes)`);
      }
      if (!['mi', 'km'].includes(workout.distanceUnit || 'mi')) {
        throw new Error('Distance unit must be either "mi" or "km"');
      }
      if (type === WORKOUT_TYPES.RUNNING && !workout.workoutType) {
        throw new Error('Running workout requires workoutType');
      }
      if (type === WORKOUT_TYPES.CYCLING && !workout.terrain) {
        throw new Error('Cycling workout requires terrain');
      }
    }

    return true;
  },

  preferences: (preferences) => {
    if (preferences.unit && !['lbs', 'kg'].includes(preferences.unit)) {
      throw new Error('Unit preference must be either "lbs" or "kg"');
    }

    if (preferences.theme && !['light', 'dark', 'system'].includes(preferences.theme)) {
      throw new Error('Theme preference must be "light", "dark", or "system"');
    }

    if (preferences.distanceUnit && !['mi', 'km'].includes(preferences.distanceUnit)) {
      throw new Error('Distance unit preference must be either "mi" or "km"');
    }

    return true;
  }
};

/**
 * Data transformation utilities
 */
export const DataTransformers = {
  // Ensure workout has all required fields with defaults (polymorphic schema)
  normalizeWorkout: (workout, existingIds = new Set()) => {
    let workoutId = workout.id;

    // Generate ID if missing or invalid
    if (!workoutId || !isValidWorkoutId(workoutId)) {
      workoutId = generateWorkoutId(existingIds);
    } else if (/^\d+$/.test(workoutId)) {
      workoutId = upgradeLegacyId(workoutId, existingIds);
    }

    const type = workout.type || WORKOUT_TYPES.WEIGHTLIFTING;
    const base = {
      id: workoutId,
      date: workout.date || new Date().toISOString().split('T')[0],
      type,
      completed: Boolean(workout.completed),
      notes: workout.notes || '',
      templateId: workout.templateId || null,
      userId: workout.userId || null,
      createdAt: workout.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    if (type === WORKOUT_TYPES.WEIGHTLIFTING) {
      // Migrate legacy: sets (num) + reps (num) -> sets: [{ weight, reps }]
      let sets = workout.sets;
      if (Array.isArray(sets) && sets.length > 0) {
        sets = sets.map(s => ({
          weight: typeof s.weight === 'number' ? s.weight : (workout.actualWeight ?? workout.targetWeight ?? 0),
          reps: typeof s.reps === 'number' ? s.reps : 1
        }));
      } else if (typeof workout.sets === 'number' && typeof workout.reps === 'number') {
        const weight = workout.actualWeight ?? workout.targetWeight ?? 0;
        sets = Array.from({ length: workout.sets }, () => ({ weight, reps: workout.reps }));
      } else {
        sets = [{ weight: workout.actualWeight ?? workout.targetWeight ?? 0, reps: workout.reps || 1 }];
      }
      return {
        ...base,
        exercise: workout.exercise || '',
        unit: workout.unit || 'lbs',
        barbell: workout.barbell || 'Olympic Barbell (45 lbs)',
        sets
      };
    }

    if (type === WORKOUT_TYPES.RUNNING) {
      return {
        ...base,
        workoutType: workout.workoutType || 'Long Run',
        distance: Number(workout.distance) || 0,
        distanceUnit: workout.distanceUnit || 'mi',
        duration: Number(workout.duration) || 0,
        splits: Array.isArray(workout.splits) ? workout.splits : []
      };
    }

    if (type === WORKOUT_TYPES.CYCLING) {
      return {
        ...base,
        terrain: workout.terrain || 'Road',
        distance: Number(workout.distance) || 0,
        distanceUnit: workout.distanceUnit || 'mi',
        duration: Number(workout.duration) || 0,
        splits: Array.isArray(workout.splits) ? workout.splits : []
      };
    }

    return base;
  },

  // Prepare data for export
  prepareExportData: (workouts, preferences, settings) => {
    return {
      version: DATA_SCHEMA_VERSION,
      exportDate: new Date().toISOString(),
      workouts: workouts.map(DataTransformers.normalizeWorkout),
      preferences: { ...DEFAULT_PREFERENCES, ...preferences },
      settings: { ...DEFAULT_SETTINGS, ...settings },
      metadata: {
        totalWorkouts: workouts.length,
        dateRange: workouts.length > 0 ? {
          earliest: Math.min(...workouts.map(w => new Date(w.date).getTime())),
          latest: Math.max(...workouts.map(w => new Date(w.date).getTime()))
        } : null
      }
    };
  }
};