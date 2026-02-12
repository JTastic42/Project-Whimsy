import React from 'react';
import PropTypes from 'prop-types';
import WorkoutTypeCard from './WorkoutTypeCard';
import RecentWorkouts from './RecentWorkouts';
import './WorkoutLanding.css';

const WorkoutLanding = ({
  workoutHistory,
  selectedWorkoutType,
  onSelectType,
  onEditWorkout,
  onDeleteWorkout
}) => {
  const isFormActive = Boolean(selectedWorkoutType);
  return (
    <div className="workout-landing">
      <section className="workout-selection">
        <h2>What would you like to log?</h2>
        <div className="workout-type-cards">
          <WorkoutTypeCard
            type="weightlifting"
            label="Weightlifting"
            onClick={onSelectType}
          />
          <WorkoutTypeCard
            type="running"
            label="Running"
            onClick={onSelectType}
          />
          <WorkoutTypeCard
            type="cycling"
            label="Cycling"
            onClick={onSelectType}
          />
        </div>
      </section>
      <section className={`recent-section ${isFormActive ? 'recent-section-collapsed' : ''}`}>
        <RecentWorkouts
          workouts={workoutHistory}
          onEdit={onEditWorkout}
          onDelete={onDeleteWorkout}
        />
      </section>
    </div>
  );
};

WorkoutLanding.propTypes = {
  workoutHistory: PropTypes.array.isRequired,
  selectedWorkoutType: PropTypes.string,
  onSelectType: PropTypes.func.isRequired,
  onEditWorkout: PropTypes.func.isRequired,
  onDeleteWorkout: PropTypes.func.isRequired
};

export default WorkoutLanding;
