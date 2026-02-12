import React from 'react';
import PropTypes from 'prop-types';
import './WorkoutLanding.css';

const ICONS = {
  weightlifting: (
    <svg viewBox="0 0 24 24" className="workout-type-svg" aria-hidden>
      <circle cx="5" cy="12" r="3" fill="currentColor" />
      <circle cx="19" cy="12" r="3" fill="currentColor" />
      <line x1="8" y1="12" x2="16" y2="12" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  ),
  running: (
    <svg viewBox="0 0 24 24" className="workout-type-svg" aria-hidden>
      <circle cx="12" cy="6" r="2.5" fill="currentColor" />
      <path d="M8 10l2 4 2-4 4 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </svg>
  ),
  cycling: (
    <svg viewBox="0 0 24 24" className="workout-type-svg" aria-hidden>
      <circle cx="6" cy="18" r="3.5" stroke="currentColor" strokeWidth="2" fill="none" />
      <circle cx="18" cy="18" r="3.5" stroke="currentColor" strokeWidth="2" fill="none" />
      <path d="M9.5 18l3-8 3 3 2.5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </svg>
  )
};

const WorkoutTypeCard = ({ type, label, onClick }) => (
  <button
    type="button"
    className="workout-type-card"
    onClick={() => onClick(type)}
  >
    <span className="workout-type-icon">{ICONS[type]}</span>
    <span className="workout-type-label">{label}</span>
  </button>
);

WorkoutTypeCard.propTypes = {
  type: PropTypes.oneOf(['weightlifting', 'running', 'cycling']).isRequired,
  label: PropTypes.string.isRequired,
  onClick: PropTypes.func.isRequired
};

export default WorkoutTypeCard;
