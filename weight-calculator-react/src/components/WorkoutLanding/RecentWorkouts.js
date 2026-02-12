import React from 'react';
import PropTypes from 'prop-types';
import { WORKOUT_TYPES } from '../../services/dataService';
import { calculatePace } from '../../utils/paceUtils';
import './WorkoutLanding.css';

const formatDate = (dateString) => {
  const d = new Date(dateString);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

const formatDuration = (minutes) => {
  if (minutes < 60) return `${Math.round(minutes)} min`;
  const h = Math.floor(minutes / 60);
  const m = Math.round(minutes % 60);
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
};

const WorkoutSummary = ({ workout }) => {
  const type = workout.type || WORKOUT_TYPES.WEIGHTLIFTING;

  if (type === WORKOUT_TYPES.WEIGHTLIFTING) {
    const sets = workout.sets || [];
    const summary = sets.length > 0
      ? sets.map((s, i) => `${s.weight}×${s.reps}`).join(', ')
      : `${workout.exercise}`;
    return (
      <span>
        {workout.exercise} · {sets.length} set{sets.length !== 1 ? 's' : ''}
        {summary && ` · ${summary}`}
      </span>
    );
  }

  if (type === WORKOUT_TYPES.RUNNING) {
    const dist = workout.distance;
    const unit = workout.distanceUnit || 'mi';
    const unitLabel = unit === 'mi' ? 'mi' : 'km';
    const dur = workout.duration;
    const pace = calculatePace(dist, dur, unit);
    return (
      <span>
        {workout.workoutType} · {dist} {unitLabel} · {formatDuration(dur)}
        {pace && ` · ${pace.formatted}`}
      </span>
    );
  }

  if (type === WORKOUT_TYPES.CYCLING) {
    const dist = workout.distance;
    const unit = workout.distanceUnit || 'mi';
    const unitLabel = unit === 'mi' ? 'mi' : 'km';
    const dur = workout.duration;
    const pace = calculatePace(dist, dur, unit);
    return (
      <span>
        {workout.terrain} · {dist} {unitLabel} · {formatDuration(dur)}
        {pace && ` · ${pace.formatted}`}
      </span>
    );
  }

  return <span>Workout</span>;
};

const RecentWorkouts = ({ workouts, onEdit, onDelete }) => {
  const recent = Array.isArray(workouts) ? workouts.slice(0, 3) : [];

  if (recent.length === 0) {
    return (
      <div className="recent-workouts">
        <h3>Recent Workouts</h3>
        <p className="recent-workouts-empty">No workouts recorded yet. Log one above!</p>
      </div>
    );
  }

  return (
    <div className="recent-workouts">
      <h3>Recent Workouts</h3>
      <div className="recent-workouts-list">
        {recent.map((w) => (
          <div key={w.id} className="recent-workout-item">
            <div className="recent-workout-main">
              <WorkoutSummary workout={w} />
            </div>
            <div className="recent-workout-meta">
              <span className="recent-workout-date">{formatDate(w.date)}</span>
            </div>
            <div className="recent-workout-actions">
              <button
                type="button"
                className="recent-workout-edit"
                onClick={() => onEdit(w)}
                aria-label="Edit"
              >
                ✎
              </button>
              <button
                type="button"
                className="recent-workout-delete"
                onClick={() => {
                  if (window.confirm('Delete this workout?')) onDelete(w);
                }}
                aria-label="Delete"
              >
                ×
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

RecentWorkouts.propTypes = {
  workouts: PropTypes.array.isRequired,
  onEdit: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired
};

export default RecentWorkouts;
