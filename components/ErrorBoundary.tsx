import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
}

export default class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('React error boundary caught error:', {
      error,
      errorInfo,
      timestamp: new Date().toISOString()
    });
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
          <div className="bg-white p-8 rounded-lg shadow-md text-center max-w-lg">
            <h1 className="text-2xl font-bold text-red-600 mb-4">Something went wrong</h1>
            <p className="text-gray-600 mb-4">
              We're having trouble loading this page. This might be due to a temporary network issue or system maintenance.
            </p>
            <div className="space-y-4">
              <button
                onClick={() => window.location.reload()}
                className="bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600 w-full"
              >
                Reload Page
              </button>
              <button
                onClick={() => {
                  // Clear storage and reload
                  try {
                    localStorage.clear();
                    sessionStorage.clear();
                  } catch (e) {
                    console.error('Storage clear error:', e);
                  }
                  window.location.reload();
                }}
                className="bg-gray-500 text-white px-6 py-2 rounded hover:bg-gray-600 w-full"
              >
                Clear Cache & Reload
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
} 