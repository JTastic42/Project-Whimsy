import React from 'react';
import PropTypes from 'prop-types';

class BaseErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: null
    };
  }

  static getDerivedStateFromError(error) {
    return {
      hasError: true,
      errorId: `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({
      error,
      errorInfo
    });

    console.error(`${this.props.name} Error Boundary:`, error);
    console.error('Component Stack:', errorInfo.componentStack);
    console.error('Error Info:', errorInfo);
    
    if (this.props.onError) {
      this.props.onError(error, errorInfo, this.state.errorId);
    }
  }

  retry = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: null
    });
  };

  render() {
    if (this.state.hasError) {
      return this.props.fallback({
        error: this.state.error,
        errorInfo: this.state.errorInfo,
        errorId: this.state.errorId,
        retry: this.retry,
        name: this.props.name,
        ...this.props.fallbackProps
      });
    }

    return this.props.children;
  }
}

BaseErrorBoundary.propTypes = {
  children: PropTypes.node.isRequired,
  name: PropTypes.string.isRequired,
  fallback: PropTypes.func.isRequired,
  onError: PropTypes.func,
  fallbackProps: PropTypes.object
};

BaseErrorBoundary.defaultProps = {
  fallbackProps: {}
};

export default BaseErrorBoundary;