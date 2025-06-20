import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
    this.setState({
      error,
      errorInfo
    });
  }

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen flex items-center justify-center bg-base-200">
          <div className="max-w-md p-8 bg-base-100 rounded-lg shadow-lg">
            <h2 className="text-2xl font-bold text-error mb-4">Something went wrong</h2>
            <p className="text-base-content mb-4">
              An unexpected error has occurred. Please try refreshing the page.
            </p>
            {process.env.NODE_ENV === 'development' && (
              <div className="mt-4">
                <p className="font-mono text-sm text-error">{this.state.error?.toString()}</p>
                <pre className="mt-2 p-4 bg-base-300 rounded overflow-auto text-xs">
                  {this.state.errorInfo?.componentStack}
                </pre>
              </div>
            )}
            <button
              className="btn btn-primary mt-4"
              onClick={() => window.location.reload()}
            >
              Refresh Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
} 