import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { REST_TIMER_PRESETS } from '../../utils/constants';
import './RestTimer.css';

const RestTimer = ({ initialSeconds = 60, onComplete }) => {
  const [secondsLeft, setSecondsLeft] = useState(initialSeconds);
  const [isRunning, setIsRunning] = useState(false);
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    if (!isRunning || secondsLeft <= 0) return;
    const timer = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          setIsRunning(false);
          setIsComplete(true);
          if (navigator.vibrate) navigator.vibrate([100, 50, 100]);
          onComplete?.();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [isRunning, secondsLeft, onComplete]);

  const formatTime = (secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const handlePreset = (secs) => {
    setSecondsLeft(secs);
    setIsRunning(true);
    setIsComplete(false);
  };

  const handleReset = () => {
    setIsRunning(false);
    setIsComplete(false);
    setSecondsLeft(initialSeconds);
  };

  return (
    <div className="rest-timer">
      <div className="rest-timer-display">
        <span className="rest-timer-value">{formatTime(secondsLeft)}</span>
        {isComplete && <span className="rest-timer-done">Done!</span>}
      </div>
      <div className="rest-timer-presets">
        {REST_TIMER_PRESETS.map((sec) => (
          <button
            key={sec}
            type="button"
            className="rest-timer-preset-btn"
            onClick={() => handlePreset(sec)}
            disabled={isRunning}
          >
            {sec < 60 ? `${sec}s` : `${sec / 60}m`}
          </button>
        ))}
      </div>
      <div className="rest-timer-actions">
        {!isRunning && !isComplete && (
          <button type="button" className="rest-timer-start" onClick={() => setIsRunning(true)}>
            Start
          </button>
        )}
        {isRunning && (
          <button type="button" className="rest-timer-pause" onClick={() => setIsRunning(false)}>
            Pause
          </button>
        )}
        {(isComplete || isRunning) && (
          <button type="button" className="rest-timer-reset" onClick={handleReset}>
            Reset
          </button>
        )}
      </div>
    </div>
  );
};

RestTimer.propTypes = {
  initialSeconds: PropTypes.number,
  onComplete: PropTypes.func
};

export default RestTimer;
