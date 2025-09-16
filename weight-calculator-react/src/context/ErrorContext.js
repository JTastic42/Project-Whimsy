import React, { createContext, useContext, useState, useCallback } from 'react';
import PropTypes from 'prop-types';

const ErrorContext = createContext({
  reportError: () => {},
  errorHistory: [],
  clearErrorHistory: () => {}
});

export const useErrorReporting = () => {
  const context = useContext(ErrorContext);
  if (!context) {
    throw new Error('useErrorReporting must be used within an ErrorProvider');
  }
  return context;
};

export const ErrorProvider = ({ children, maxHistorySize = 10 }) => {
  const [errorHistory, setErrorHistory] = useState([]);

  const reportError = useCallback((error, context, errorId) => {
    const errorReport = {
      id: errorId || `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString(),
      message: error.message || 'Unknown error',
      stack: error.stack,
      context: context || 'Unknown context',
      userAgent: navigator.userAgent,
      url: window.location.href,
      localStorage: {
        available: !!window.localStorage,
        quotaExceeded: false
      }
    };

    // Check for localStorage quota issues
    try {
      const testKey = 'error_test_key';
      localStorage.setItem(testKey, 'test');
      localStorage.removeItem(testKey);
    } catch (e) {
      if (e.name === 'QuotaExceededError') {
        errorReport.localStorage.quotaExceeded = true;
      }
    }

    console.group(`🚨 Error Report: ${errorReport.id}`);
    console.error('Error:', error);
    console.info('Context:', context);
    console.info('Full Report:', errorReport);
    console.groupEnd();

    setErrorHistory(prev => {
      const newHistory = [...prev, errorReport];
      // Keep only the latest entries
      return newHistory.slice(-maxHistorySize);
    });

    // Future: Send to external error reporting service
    // This is where you'd integrate with Sentry, LogRocket, etc.
    if (process.env.NODE_ENV === 'production') {
      // analytics.reportError(errorReport);
      console.info('Error would be sent to monitoring service in production');
    }

    return errorReport;
  }, [maxHistorySize]);

  const clearErrorHistory = useCallback(() => {
    setErrorHistory([]);
  }, []);

  const contextValue = {
    reportError,
    errorHistory,
    clearErrorHistory
  };

  return (
    <ErrorContext.Provider value={contextValue}>
      {children}
    </ErrorContext.Provider>
  );
};

ErrorProvider.propTypes = {
  children: PropTypes.node.isRequired,
  maxHistorySize: PropTypes.number
};

export { ErrorContext };
export default ErrorProvider;