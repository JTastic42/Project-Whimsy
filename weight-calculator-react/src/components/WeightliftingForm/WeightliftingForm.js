import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { WEIGHTLIFTING_EXERCISES } from '../../utils/constants';
import RestTimer from '../RestTimer';
import WeightCalculatorModal from '../WeightCalculatorModal';
import './WeightliftingForm.css';

const WeightliftingForm = ({
  initialData,
  unit,
  selectedBarbell,
  templates,
  onSave,
  onCancel,
  onSaveTemplate,
  onUseTemplate,
  onPreferenceChange
}) => {
  const [exercise, setExercise] = useState(initialData?.exercise || '');
  const [sets, setSets] = useState(
    initialData?.sets?.length > 0
      ? initialData.sets.map((s) => ({ weight: String(s.weight), reps: String(s.reps) }))
      : [{ weight: '', reps: '' }]
  );
  const [notes, setNotes] = useState(initialData?.notes || '');
  const [showCalcModal, setShowCalcModal] = useState(false);
  const [showRestTimer, setShowRestTimer] = useState(false);
  const [targetSetForCalc, setTargetSetForCalc] = useState(null);
  const [error, setError] = useState('');

  const addSet = () => {
    setSets((prev) => [...prev, { weight: prev[prev.length - 1]?.weight || '', reps: prev[prev.length - 1]?.reps || '' }]);
  };

  const removeSet = (index) => {
    if (sets.length <= 1) return;
    setSets((prev) => prev.filter((_, i) => i !== index));
  };

  const updateSet = (index, field, value) => {
    setSets((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: value };
      return next;
    });
  };

  const openCalcForSet = (index) => {
    setTargetSetForCalc(index);
    setShowCalcModal(true);
  };

  const handleUseWeight = (weightStr) => {
    if (targetSetForCalc !== null && sets[targetSetForCalc]) {
      updateSet(targetSetForCalc, 'weight', weightStr);
    }
    setTargetSetForCalc(null);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (!exercise.trim()) {
      setError('Please select an exercise');
      return;
    }

    const parsedSets = sets
      .map((s) => ({
        weight: parseFloat(s.weight) || 0,
        reps: parseInt(s.reps, 10) || 0
      }))
      .filter((s) => s.reps > 0);

    if (parsedSets.length === 0) {
      setError('Please add at least one set with reps');
      return;
    }

    onSave({
      type: 'weightlifting',
      date: initialData?.date || new Date().toISOString().split('T')[0],
      exercise: exercise.trim(),
      unit: unit,
      barbell: selectedBarbell?.label || 'Olympic Barbell (45 lbs)',
      sets: parsedSets,
      notes: notes.trim() || '',
      completed: true,
      id: initialData?.id,
      userId: initialData?.userId
    });
  };

  return (
    <div className="weightlifting-form">
      <div className="form-header">
        <h3>Log Weightlifting</h3>
        {onCancel && (
          <button type="button" className="form-cancel-btn" onClick={onCancel}>
            Back
          </button>
        )}
      </div>

      <form onSubmit={handleSubmit}>
        <div className="input-group">
          <label htmlFor="wl-exercise">Exercise</label>
          <select
            id="wl-exercise"
            value={exercise}
            onChange={(e) => setExercise(e.target.value)}
            required
          >
            <option value="">Select exercise</option>
            {WEIGHTLIFTING_EXERCISES.map((ex) => (
              <option key={ex} value={ex}>{ex}</option>
            ))}
          </select>
        </div>

        {templates && templates.length > 0 && (
          <div className="input-group">
            <label>Use template</label>
            <select
              value=""
              onChange={(e) => {
                const id = e.target.value;
                if (id) {
                  const t = templates.find((tpl) => tpl.id === id);
                  if (t) {
                    setExercise(t.exercise || '');
                    setSets(
                      (t.sets && t.sets.length > 0)
                        ? t.sets.map((s) => ({ weight: String(s.weight), reps: String(s.reps) }))
                        : [{ weight: '', reps: '' }]
                    );
                    onUseTemplate?.(t);
                  }
                }
              }}
            >
              <option value="">-- Choose template --</option>
              {templates.map((t) => (
                <option key={t.id} value={t.id}>{t.name}</option>
              ))}
            </select>
          </div>
        )}

        <div className="sets-section">
          <div className="sets-header">
            <label>Sets</label>
            <button type="button" className="add-set-btn" onClick={addSet}>
              + Add set
            </button>
          </div>
          {sets.map((s, i) => (
            <div key={i} className="set-row">
              <span className="set-number">Set {i + 1}</span>
              <div className="set-weight">
                <input
                  type="text"
                  value={s.weight}
                  onChange={(e) => updateSet(i, 'weight', e.target.value)}
                  placeholder={`Weight (${unit})`}
                  inputMode="decimal"
                />
                <button
                  type="button"
                  className="calc-quick-btn"
                  onClick={() => openCalcForSet(i)}
                  title="Plate calculator"
                >
                  ⚖️
                </button>
              </div>
              <input
                type="number"
                min="1"
                value={s.reps}
                onChange={(e) => updateSet(i, 'reps', e.target.value)}
                placeholder="Reps"
                className="set-reps"
              />
              {sets.length > 1 && (
                <button type="button" className="remove-set-btn" onClick={() => removeSet(i)} aria-label="Remove set">
                  ×
                </button>
            )}
            </div>
          ))}
        </div>

        <div className="rest-timer-section">
          <button type="button" className="toggle-rest-btn" onClick={() => setShowRestTimer(!showRestTimer)}>
            {showRestTimer ? 'Hide' : 'Show'} rest timer
          </button>
          {showRestTimer && <RestTimer initialSeconds={60} />}
        </div>

        <div className="input-group">
          <label htmlFor="wl-notes">Notes (optional)</label>
          <textarea
            id="wl-notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={2}
            placeholder="How did it feel?"
          />
        </div>

        {error && <p className="form-error">{error}</p>}

        <div className="form-actions">
          <button type="submit" className="submit-btn">
            {initialData?.id ? 'Update' : 'Log'} Workout
          </button>
          {onSaveTemplate && (
            <button
              type="button"
              className="save-template-btn"
              onClick={() => {
                const name = window.prompt('Template name:');
                if (name?.trim()) {
                  const parsedSets = sets
                    .filter((s) => s.reps && parseInt(s.reps, 10) > 0)
                    .map((s) => ({ weight: parseFloat(s.weight) || 0, reps: parseInt(s.reps, 10) }));
                  if (parsedSets.length > 0 && exercise) {
                    onSaveTemplate({ name: name.trim(), exercise, sets: parsedSets, type: 'weightlifting' });
                  }
                }
              }}
            >
              Save as template
            </button>
          )}
        </div>
      </form>

      <WeightCalculatorModal
        isOpen={showCalcModal}
        onClose={() => { setShowCalcModal(false); setTargetSetForCalc(null); }}
        onUseWeight={handleUseWeight}
        unit={unit}
        selectedBarbell={selectedBarbell}
        onPreferenceChange={onPreferenceChange}
      />
    </div>
  );
};

WeightliftingForm.propTypes = {
  initialData: PropTypes.shape({
    id: PropTypes.string,
    date: PropTypes.string,
    exercise: PropTypes.string,
    sets: PropTypes.array,
    notes: PropTypes.string,
    userId: PropTypes.string
  }),
  unit: PropTypes.oneOf(['lbs', 'kg']).isRequired,
  selectedBarbell: PropTypes.object.isRequired,
  templates: PropTypes.array,
  onSave: PropTypes.func.isRequired,
  onCancel: PropTypes.func,
  onSaveTemplate: PropTypes.func,
  onUseTemplate: PropTypes.func,
  onPreferenceChange: PropTypes.func
};

export default WeightliftingForm;
