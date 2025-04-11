type ErrorEvent = {
  message: string;
  filename?: string;
  lineno?: number;
  colno?: number;
  error?: Error;
};

export const initErrorHandling = () => {
  if (typeof window === 'undefined') return;

  // Keep error handlers
  window.onerror = (message, filename, lineno, colno, error) => {
    console.error('Global error:', {
      message,
      filename,
      lineno,
      colno,
      stack: error?.stack
    });
    return false;
  };

  window.onunhandledrejection = (event) => {
    console.error('Unhandled promise rejection:', {
      reason: event.reason,
      stack: event.reason?.stack
    });
  };

  // Remove storage clearing code
  // Remove service worker unregistration if no longer needed
};

// Firebase error monitoring
export const initFirebaseErrorMonitoring = () => {
  if (typeof window === 'undefined') return;

  const originalConsoleError = console.error;
  console.error = (...args) => {
    // Check for common Firebase errors
    const errorString = args.join(' ');
    if (errorString.includes('Firebase') || errorString.includes('Firestore')) {
      console.log('Firebase/Firestore error detected:', {
        timestamp: new Date().toISOString(),
        error: args
      });
    }
    originalConsoleError.apply(console, args);
  };
}; 