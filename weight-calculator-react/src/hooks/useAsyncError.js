import { useState, useCallback } from 'react';
import { useErrorReporting } from '../context/ErrorContext';

export const useAsyncError = () => {
  const [, setError] = useState();
  const { reportError } = useErrorReporting();
  
  return useCallback((error, context = 'Async Operation') => {
    console.error('Async error caught:', error);
    
    // Report the error for tracking
    const errorReport = reportError(error, context);
    
    // Throw the error to be caught by the nearest error boundary
    setError(() => {
      throw error;
    });
    
    return errorReport;
  }, [reportError, setError]);
};

export const useAsyncErrorHandler = () => {
  const asyncError = useAsyncError();
  
  return useCallback((asyncFn, context) => {
    return async (...args) => {
      try {
        return await asyncFn(...args);
      } catch (error) {
        asyncError(error, context);
        // The error is thrown by asyncError, so this won't execute
      }
    };
  }, [asyncError]);
};

export const withAsyncErrorHandling = (asyncFn, context = 'Async Function') => {
  return async (...args) => {
    try {
      return await asyncFn(...args);
    } catch (error) {
      console.error(`Error in ${context}:`, error);
      throw error; // Re-throw to be handled by error boundary
    }
  };
};

export default useAsyncError;