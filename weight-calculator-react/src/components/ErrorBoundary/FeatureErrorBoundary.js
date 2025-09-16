import React from 'react';
import PropTypes from 'prop-types';
import BaseErrorBoundary from './BaseErrorBoundary';

const FeatureErrorFallback = ({ error, retry, errorId, featureName, name, fallbackContent }) => (
  <div className="feature-error-container">
    <div className="error-content">
      <h3>⚠️ {featureName} Unavailable</h3>
      <p>This feature encountered an error and couldn't load properly.</p>
      
      {error?.message && (
        <p className="error-message">
          <strong>Issue:</strong> {error.message}
        </p>
      )}

      <details className="error-details">
        <summary>Error Details (ID: {errorId})</summary>
        <div className="error-technical">
          <p><strong>Feature:</strong> {featureName}</p>
          <p><strong>Component:</strong> {name}</p>
          <p><strong>Error:</strong> {error?.message || 'Feature unavailable'}</p>
        </div>
      </details>

      <div className="error-actions">
        <button onClick={retry} className="retry-btn">
          🔄 Retry {featureName}
        </button>
        {fallbackContent && (
          <button 
            onClick={() => {
              // Could implement showing a simplified version
              retry();
            }} 
            className="fallback-btn"
          >
            📱 Try Simplified Version
          </button>
        )}
      </div>

      <div className="error-help">
        <p>You can still use other features of the Weight Calculator while we work on fixing this issue.</p>
      </div>
    </div>
  </div>
);

const FeatureErrorBoundary = ({ children, featureName, onError, fallbackContent }) => (
  <BaseErrorBoundary
    name={`Feature-${featureName}`}
    fallback={FeatureErrorFallback}
    onError={onError}
    fallbackProps={{ featureName, fallbackContent }}
  >
    {children}
  </BaseErrorBoundary>
);

FeatureErrorBoundary.propTypes = {
  children: PropTypes.node.isRequired,
  featureName: PropTypes.string.isRequired,
  onError: PropTypes.func,
  fallbackContent: PropTypes.node
};

FeatureErrorFallback.propTypes = {
  error: PropTypes.instanceOf(Error),
  retry: PropTypes.func.isRequired,
  errorId: PropTypes.string.isRequired,
  featureName: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  fallbackContent: PropTypes.node
};

export default FeatureErrorBoundary;