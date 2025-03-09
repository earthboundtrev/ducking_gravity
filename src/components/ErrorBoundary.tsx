import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
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
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gradient-to-b from-[#1E3A5F] to-[#3B82F6] flex items-center justify-center">
          <div className="bg-white/10 backdrop-blur-md rounded-lg p-12 text-center max-w-lg mx-4">
            <h1 className="text-3xl font-bold text-white mb-4">Oops!</h1>
            <p className="text-gray-200 mb-8">
              Something went wrong. Please try again later.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="bg-[#22C55E] text-white px-8 py-4 rounded-lg font-semibold
                       hover:bg-[#22C55E]/80 transition-all duration-300"
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