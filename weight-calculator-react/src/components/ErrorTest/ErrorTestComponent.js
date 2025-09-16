import React, { useState } from 'react';
import PropTypes from 'prop-types';

const ErrorTestComponent = ({ errorType = 'none' }) => {
  const [count, setCount] = useState(0);

  // Different types of errors to test error boundaries
  if (errorType === 'render') {
    throw new Error('Render error: This is a test error thrown during component render');
  }

  if (errorType === 'async' && count > 2) {
    throw new Error('Async error: This error was triggered after state updates');
  }

  const handleAsyncError = async () => {
    try {
      // Simulate an async operation that fails
      await new Promise((resolve, reject) => {
        setTimeout(() => {
          reject(new Error('Async operation failed: Simulated network error'));
        }, 100);
      });
    } catch (error) {
      // This should be caught by error boundary if using useAsyncError
      throw error;
    }
  };

  const handleStorageError = () => {
    // Simulate a storage quota error
    throw new Error('Storage quota exceeded: Cannot save data');
  };

  const handleNullReference = () => {
    // Simulate a null reference error
    const obj = null;
    return obj.nonExistentProperty; // This will throw
  };

  return (
    <div style={{ 
      padding: '20px', 
      border: '2px dashed #ccc', 
      margin: '10px',
      background: '#f9f9f9'
    }}>
      <h3>🧪 Error Boundary Test Component</h3>
      <p>Count: {count}</p>
      
      <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
        <button onClick={() => setCount(count + 1)}>
          Normal Operation ({count})
        </button>
        
        <button 
          onClick={handleAsyncError}
          style={{ background: '#f59e0b', color: 'white' }}
        >
          ⚠️ Trigger Async Error
        </button>
        
        <button 
          onClick={handleStorageError}
          style={{ background: '#ef4444', color: 'white' }}
        >
          💾 Storage Error
        </button>
        
        <button 
          onClick={handleNullReference}
          style={{ background: '#8b5cf6', color: 'white' }}
        >
          🚫 Null Reference Error
        </button>
      </div>
      
      <div style={{ 
        marginTop: '15px', 
        padding: '10px', 
        background: '#e0f2fe', 
        borderRadius: '4px',
        fontSize: '14px'
      }}>
        <strong>Test Instructions:</strong>
        <ul style={{ margin: '5px 0', paddingLeft: '20px' }}>
          <li>Normal Operation: Should work fine</li>
          <li>Async Error: Should be caught by error boundary</li>
          <li>Storage Error: Should trigger feature error boundary</li>
          <li>Null Reference: Should trigger component error boundary</li>
        </ul>
      </div>
    </div>
  );
};

ErrorTestComponent.propTypes = {
  errorType: PropTypes.oneOf(['none', 'render', 'async'])
};

export default ErrorTestComponent;