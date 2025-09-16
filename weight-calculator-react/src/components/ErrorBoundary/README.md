# Error Boundary System

This directory contains a comprehensive error boundary implementation for the Weight Calculator React app. The system provides graceful error handling and recovery for different types of application failures.

## 🏗️ Architecture Overview

```
ErrorProvider (Context)
└── GlobalErrorBoundary
    └── DataServiceErrorBoundary
        └── App Components
            ├── FeatureErrorBoundary (Calculator)
            ├── FeatureErrorBoundary (Logger)
            ├── FeatureErrorBoundary (Data Manager)
            └── UserSelectorErrorBoundary
```

## 📁 Components

### Base Components

#### `BaseErrorBoundary.js`
- **Purpose**: Foundation class for all error boundaries
- **Features**: Error catching, reporting, retry functionality
- **Props**: `name`, `fallback`, `onError`, `fallbackProps`

### Specialized Error Boundaries

#### `GlobalErrorBoundary.js`
- **Scope**: Application-wide errors
- **Fallback**: Full-screen error page with reload options
- **Recovery**: App retry, hard reload, reset & reload

#### `DataServiceErrorBoundary.js`
- **Scope**: Data service and storage errors
- **Fallback**: Data service error screen
- **Recovery**: Retry service, clear app data, reset all data

#### `FeatureErrorBoundary.js`
- **Scope**: Individual feature/tab errors
- **Fallback**: Feature unavailable message
- **Recovery**: Feature retry, simplified version fallback

#### `UserSelectorErrorBoundary.js`
- **Scope**: User management system errors
- **Fallback**: User system error screen
- **Recovery**: Retry user system, reset user data

## 🎨 Styling

### `ErrorBoundary.css`
- **Responsive**: Mobile-first design with desktop enhancements
- **Themed**: Light and dark mode support
- **Accessible**: High contrast, keyboard navigation
- **Interactive**: Hover states, smooth transitions

### Design Patterns
- **Global**: Red theme, full viewport coverage
- **Data Service**: Red theme, bordered container
- **Feature**: Yellow/warning theme, dashed borders
- **User Selector**: Blue/info theme, solid borders

## 🔧 Context & Hooks

### `ErrorContext.js`
- **Error Reporting**: Centralized error tracking
- **Error History**: Last 10 errors with full context
- **Production Ready**: Prepared for external service integration

### `useAsyncError.js`
- **Async Error Handling**: Converts async errors to boundary-catchable errors
- **Error Reporting**: Automatic error reporting integration
- **Helper Functions**: `useAsyncErrorHandler`, `withAsyncErrorHandling`

## 🧪 Testing

### `ErrorTestComponent.js` (Development Only)
- **Render Errors**: Test component render failures
- **Async Errors**: Test async operation failures
- **Storage Errors**: Test storage quota/access errors
- **Null Reference**: Test common JavaScript errors

### Test Scenarios
1. **Normal Operation**: Verify functionality remains intact
2. **Feature Isolation**: Error in one tab doesn't affect others
3. **Data Recovery**: Data service errors allow data recovery
4. **User Experience**: Clear error messages and recovery paths

## 🚀 Usage Examples

### Basic Error Boundary
```jsx
import { FeatureErrorBoundary } from './components/ErrorBoundary';

<FeatureErrorBoundary featureName="My Feature">
  <MyComponent />
</FeatureErrorBoundary>
```

### With Async Error Handling
```jsx
import { useAsyncError } from './hooks/useAsyncError';

const MyComponent = () => {
  const asyncError = useAsyncError();
  
  const handleOperation = async () => {
    try {
      await riskyOperation();
    } catch (error) {
      asyncError(error, 'My Component - Risky Operation');
    }
  };
};
```

### Error Reporting
```jsx
import { useErrorReporting } from './context/ErrorContext';

const MyComponent = () => {
  const { reportError, errorHistory } = useErrorReporting();
  
  const handleCustomError = (error) => {
    reportError(error, 'Custom Context', 'custom-error-id');
  };
};
```

## 🔄 Error Recovery Strategies

### Automatic Recovery
- **Component Remount**: Retry button remounts failed components
- **State Reset**: Clear error state and restore functionality
- **Service Reinitialize**: Restart failed services

### User-Driven Recovery
- **Progressive Options**: Multiple recovery strategies per error type
- **Data Preservation**: Export data before destructive operations
- **Graceful Degradation**: Continue using working features

### Production Considerations
- **Error Reporting**: Ready for Sentry, LogRocket, or custom services
- **Performance**: Minimal overhead when no errors occur
- **Bundle Size**: ~3KB gzipped for complete system

## 🛠️ Maintenance

### Adding New Error Boundaries
1. Create new boundary extending `BaseErrorBoundary`
2. Define specific fallback component
3. Add custom recovery strategies
4. Update component tree structure

### Error Classification
- **Critical**: Use `GlobalErrorBoundary` or `DataServiceErrorBoundary`
- **Feature**: Use `FeatureErrorBoundary` with appropriate `featureName`
- **Component**: Use `BaseErrorBoundary` with custom fallback

### Monitoring & Analytics
- Implement `onError` callbacks to send to monitoring services
- Use error history for debugging and pattern analysis
- Monitor error boundary trigger frequency in production

## 📊 Error Types Handled

### React Errors
- ✅ Component render errors
- ✅ Event handler errors (via async error hook)
- ✅ Lifecycle method errors
- ✅ Hook errors

### Async Errors
- ✅ Promise rejections (with async error hook)
- ✅ Network failures
- ✅ Storage operations
- ✅ Service initialization

### Application Errors
- ✅ Data service failures
- ✅ User management errors
- ✅ Feature-specific failures
- ✅ Storage quota exceeded

This error boundary system provides comprehensive error handling while maintaining excellent user experience and developer productivity.