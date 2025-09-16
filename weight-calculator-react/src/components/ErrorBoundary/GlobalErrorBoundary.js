import React from 'react';
import PropTypes from 'prop-types';
import BaseErrorBoundary from './BaseErrorBoundary';

const GlobalErrorFallback = ({ error, retry, errorId, name }) => (
  <div className="global-error-container">
    <div className="error-content">
      <h1>🚫 Application Error</h1>
      <p>Something went wrong with the Weight Calculator. Don't worry, your data is safe.</p>
      <p className="error-message">We've encountered an unexpected issue that prevented the app from loading properly.</p>
      
      <details className="error-details">
        <summary>Technical Details (Error ID: {errorId})</summary>
        <div className="error-technical">
          <p><strong>Component:</strong> {name}</p>
          <p><strong>Error:</strong> {error?.message || 'Unknown error'}</p>
          <p><strong>Time:</strong> {new Date().toLocaleString()}</p>
          {error?.stack && (
            <pre className="error-stack">{error.stack.split('\n').slice(0, 5).join('\n')}</pre>
          )}
        </div>
      </details>

      <div className="error-actions">
        <button onClick={retry} className="retry-btn">
          🔄 Retry Application
        </button>
        <button 
          onClick={() => {
            localStorage.clear();
            window.location.reload();
          }} 
          className="reset-btn"
        >
          🗑️ Reset & Reload
        </button>
        <button onClick={() => window.location.reload()} className="reload-btn">
          🔃 Hard Reload
        </button>
      </div>
      
      <div className="error-help">
        <p>If the problem persists:</p>
        <ul>
          <li>Try using a different browser</li>
          <li>Clear your browser cache</li>
          <li>Disable browser extensions</li>
          <li>Check your internet connection</li>
        </ul>
      </div>
    </div>
  </div>
);

const GlobalErrorBoundary = ({ children, onError }) => (
  <BaseErrorBoundary
    name="Global"
    fallback={GlobalErrorFallback}
    onError={onError}
  >
    {children}
  </BaseErrorBoundary>
);

GlobalErrorBoundary.propTypes = {
  children: PropTypes.node.isRequired,
  onError: PropTypes.func
};

GlobalErrorFallback.propTypes = {
  error: PropTypes.instanceOf(Error),
  retry: PropTypes.func.isRequired,
  errorId: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired
};

export default GlobalErrorBoundary;