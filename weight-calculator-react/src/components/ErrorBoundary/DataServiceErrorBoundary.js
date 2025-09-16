import React from 'react';
import PropTypes from 'prop-types';
import BaseErrorBoundary from './BaseErrorBoundary';

const DataServiceErrorFallback = ({ error, retry, errorId, name }) => (
  <div className="data-error-container">
    <div className="error-content">
      <h2>💾 Data Service Error</h2>
      <p>There was a problem accessing your workout data.</p>
      <p className="error-message">
        This might be due to storage issues or data corruption. Your workouts may be temporarily unavailable.
      </p>

      <details className="error-details">
        <summary>Error Details (ID: {errorId})</summary>
        <div className="error-technical">
          <p><strong>Service:</strong> {name}</p>
          <p><strong>Error:</strong> {error?.message || 'Data service unavailable'}</p>
          <p><strong>Possible causes:</strong></p>
          <ul>
            <li>Browser storage quota exceeded</li>
            <li>Corrupted data in localStorage</li>
            <li>Browser privacy settings blocking storage</li>
          </ul>
        </div>
      </details>

      <div className="error-actions">
        <button onClick={retry} className="retry-btn">
          🔄 Try Again
        </button>
        <button 
          onClick={() => {
            if (window.confirm('This will clear all your workout data. Are you sure?')) {
              localStorage.clear();
              window.location.reload();
            }
          }} 
          className="reset-btn"
        >
          🗑️ Reset All Data
        </button>
        <button 
          onClick={() => {
            try {
              const keys = Object.keys(localStorage).filter(key => 
                key.startsWith('workout_') || key.startsWith('preferences_') || key.startsWith('settings_')
              );
              keys.forEach(key => localStorage.removeItem(key));
              retry();
            } catch (e) {
              console.error('Failed to clear app data:', e);
            }
          }} 
          className="clear-btn"
        >
          🧹 Clear App Data Only
        </button>
      </div>

      <div className="error-help">
        <p><strong>Quick fixes to try:</strong></p>
        <ul>
          <li>Check if you have sufficient storage space</li>
          <li>Try refreshing the page</li>
          <li>Export your data before resetting if possible</li>
        </ul>
      </div>
    </div>
  </div>
);

const DataServiceErrorBoundary = ({ children, onError }) => (
  <BaseErrorBoundary
    name="DataService"
    fallback={DataServiceErrorFallback}
    onError={onError}
  >
    {children}
  </BaseErrorBoundary>
);

DataServiceErrorBoundary.propTypes = {
  children: PropTypes.node.isRequired,
  onError: PropTypes.func
};

DataServiceErrorFallback.propTypes = {
  error: PropTypes.instanceOf(Error),
  retry: PropTypes.func.isRequired,
  errorId: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired
};

export default DataServiceErrorBoundary;