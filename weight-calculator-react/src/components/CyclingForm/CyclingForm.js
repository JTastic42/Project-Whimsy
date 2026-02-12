import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { CYCLING_TERRAINS } from '../../utils/constants';
import { calculatePace, parseDurationToMinutes } from '../../utils/paceUtils';
import './CyclingForm.css';

const CyclingForm = ({
  initialData,
  distanceUnit,
  templates,
  onSave,
  onCancel,
  onSaveTemplate,
  onUseTemplate
}) => {
  const [terrain, setTerrain] = useState(initialData?.terrain || 'Road');
  const [distance, setDistance] = useState(initialData?.distance?.toString() || '');
  const [duration, setDuration] = useState(
    initialData?.duration ? formatDurationForInput(initialData.duration) : ''
  );
  const [showSplits, setShowSplits] = useState(
    initialData?.splits?.length > 0
  );
  const [splits, setSplits] = useState(
    initialData?.splits?.length > 0
      ? initialData.splits
      : [{ distance: '', time: '' }]
  );
  const [notes, setNotes] = useState(initialData?.notes || '');
  const [error, setError] = useState('');

  function formatDurationForInput(mins) {
    if (mins >= 60) {
      const h = Math.floor(mins / 60);
      const m = Math.round(mins % 60);
      return `${h}:${m.toString().padStart(2, '0')}`;
    }
    return String(Math.round(mins));
  }

  const addSplit = () => {
    setSplits((prev) => [...prev, { distance: '', time: '' }]);
  };

  const removeSplit = (i) => {
    if (splits.length <= 1) return;
    setSplits((prev) => prev.filter((_, idx) => idx !== i));
  };

  const updateSplit = (i, field, value) => {
    setSplits((prev) => {
      const next = [...prev];
      next[i] = { ...next[i], [field]: value };
      return next;
    });
  };

  const durationMinutes = parseDurationToMinutes(duration);
  const distNum = parseFloat(distance);
  const paceResult = distNum > 0 && durationMinutes > 0 && !showSplits
    ? calculatePace(distNum, durationMinutes, distanceUnit)
    : null;

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    const dist = parseFloat(distance);
    const dur = durationMinutes;

    if (!dist || dist <= 0) {
      setError('Please enter a valid distance');
      return;
    }
    if (!dur || dur <= 0) {
      setError('Please enter duration');
      return;
    }

    let finalSplits = [];
    if (showSplits && splits.some((s) => s.distance || s.time)) {
      finalSplits = splits
        .filter((s) => s.distance || s.time)
        .map((s) => ({
          distance: parseFloat(s.distance) || null,
          time: s.time ? parseDurationToMinutes(s.time) : null
        }));
    }

    onSave({
      type: 'cycling',
      date: initialData?.date || new Date().toISOString().split('T')[0],
      terrain,
      distance: dist,
      distanceUnit: distanceUnit || 'mi',
      duration: dur,
      splits: finalSplits,
      notes: notes.trim() || '',
      completed: true,
      id: initialData?.id,
      userId: initialData?.userId
    });
  };

  return (
    <div className="cycling-form">
      <div className="form-header">
        <h3>Log Cycling</h3>
        {onCancel && (
          <button type="button" className="form-cancel-btn" onClick={onCancel}>
            Back
          </button>
        )}
      </div>

      <form onSubmit={handleSubmit}>
        <div className="form-row">
          <div className="input-group">
            <label htmlFor="cycle-terrain">Terrain</label>
            <select
              id="cycle-terrain"
              value={terrain}
              onChange={(e) => setTerrain(e.target.value)}
            >
              {CYCLING_TERRAINS.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>
          <div className="input-group">
            <label htmlFor="cycle-distance">Distance ({distanceUnit || 'mi'})</label>
            <input
              id="cycle-distance"
              type="number"
              step="0.01"
              min="0"
              value={distance}
              onChange={(e) => setDistance(e.target.value)}
              placeholder="e.g. 15"
            />
          </div>
          <div className="input-group">
            <label htmlFor="cycle-duration">Duration (min or HH:MM)</label>
            <input
              id="cycle-duration"
              type="text"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              placeholder="e.g. 72 or 1:12"
            />
          </div>
        </div>

        {paceResult && (
          <div className="pace-display">
            Average pace: <strong>{paceResult.formatted}</strong>
          </div>
        )}

        <div className="input-group splits-checkbox-group">
          <label className="splits-checkbox-label">
            <input
              type="checkbox"
              className="splits-checkbox"
              checked={showSplits}
              onChange={(e) => setShowSplits(e.target.checked)}
            />
            Include splits
          </label>
        </div>

        {showSplits && (
          <div className="splits-section">
            <label>Splits</label>
            {splits.map((s, i) => (
              <div key={i} className="split-row">
                <input
                  type="text"
                  value={s.distance}
                  onChange={(e) => updateSplit(i, 'distance', e.target.value)}
                  placeholder="Distance"
                  style={{ width: 100 }}
                />
                <input
                  type="text"
                  value={s.time}
                  onChange={(e) => updateSplit(i, 'time', e.target.value)}
                  placeholder="Time (min)"
                  style={{ width: 100 }}
                />
                {splits.length > 1 && (
                  <button type="button" className="remove-btn" onClick={() => removeSplit(i)}>×</button>
                )}
              </div>
            ))}
            <button type="button" className="add-split-btn" onClick={addSplit}>+ Add split</button>
          </div>
        )}

        <div className="input-group">
          <label htmlFor="cycle-notes">Notes (optional)</label>
          <textarea
            id="cycle-notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={2}
          />
        </div>

        {error && <p className="form-error">{error}</p>}

        <button type="submit" className="submit-btn">
          {initialData?.id ? 'Update' : 'Log'} Workout
        </button>
      </form>
    </div>
  );
};

CyclingForm.propTypes = {
  initialData: PropTypes.object,
  distanceUnit: PropTypes.oneOf(['mi', 'km']),
  templates: PropTypes.array,
  onSave: PropTypes.func.isRequired,
  onCancel: PropTypes.func,
  onSaveTemplate: PropTypes.func,
  onUseTemplate: PropTypes.func
};

export default CyclingForm;
