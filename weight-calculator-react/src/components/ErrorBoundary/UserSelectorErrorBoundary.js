import React from 'react';
import PropTypes from 'prop-types';
import BaseErrorBoundary from './BaseErrorBoundary';

const UserSelectorErrorFallback = ({ error, retry, errorId, name }) => (
  <div className="user-selector-error-container">
    <div className="error-content">
      <h3>👤 User System Error</h3>
      <p>There was a problem with the user selection system.</p>
      
      <p className="error-message">
        You may not be able to switch users or access user-specific data right now.
      </p>

      <details className="error-details">
        <summary>Error Details (ID: {errorId})</summary>
        <div className="error-technical">
          <p><strong>Component:</strong> {name}</p>
          <p><strong>Error:</strong> {error?.message || 'User system unavailable'}</p>
          <p><strong>Impact:</strong> User switching and profile management may be affected</p>
        </div>
      </details>

      <div className="error-actions">
        <button onClick={retry} className="retry-btn">
          🔄 Retry User System
        </button>
        <button 
          onClick={() => {
            localStorage.removeItem('weight_calculator_current_user');
            localStorage.removeItem('weight_calculator_users');
            window.location.reload();
          }} 
          className="reset-users-btn"
        >
          👥 Reset User Data
        </button>
      </div>

      <div className="error-help">
        <p><strong>Temporary workaround:</strong></p>
        <ul>
          <li>You can continue using the app with default settings</li>
          <li>Your workout data should still be accessible</li>
          <li>User switching will be restored after fixing this issue</li>
        </ul>
      </div>
    </div>
  </div>
);

const UserSelectorErrorBoundary = ({ children, onError }) => (
  <BaseErrorBoundary
    name="UserSelector"
    fallback={UserSelectorErrorFallback}
    onError={onError}
  >
    {children}
  </BaseErrorBoundary>
);

UserSelectorErrorBoundary.propTypes = {
  children: PropTypes.node.isRequired,
  onError: PropTypes.func
};

UserSelectorErrorFallback.propTypes = {
  error: PropTypes.instanceOf(Error),
  retry: PropTypes.func.isRequired,
  errorId: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired
};

export default UserSelectorErrorBoundary;