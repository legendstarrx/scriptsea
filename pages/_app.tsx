import { useEffect, useState } from 'react';
import type { AppProps } from 'next/app';
import { initErrorHandling, initFirebaseErrorMonitoring } from '../lib/errorHandling';
import { db } from '../lib/firebase';
import { enableNetwork, getFirestore } from 'firebase/firestore';
import { AuthProvider } from '../context/AuthContext';
import ErrorBoundary from '../components/ErrorBoundary';
import { useRouter } from 'next/router';

function MyApp({ Component, pageProps }: AppProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [initError, setInitError] = useState<Error | null>(null);
  const router = useRouter();

  // Add a connection status check
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    // Network status monitoring
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    setIsOnline(navigator.onLine);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    
    const initializeApp = async () => {
      try {
        // Set a timeout to show loading state for at least 1 second
        timeoutId = setTimeout(() => setIsLoading(true), 0);

        // Initialize error handling
        initErrorHandling();
        initFirebaseErrorMonitoring();

        // Monitor Firebase connection state
        await enableNetwork(db);
        console.log('Firebase connection established');

        // Add a small delay to ensure everything is properly initialized
        await new Promise(resolve => setTimeout(resolve, 1000));

      } catch (error) {
        console.error('Firebase initialization error:', error);
        setInitError(error as Error);
      } finally {
        clearTimeout(timeoutId);
        setIsLoading(false);
      }
    };

    initializeApp();

    // Global error handlers
    if (typeof window !== 'undefined') {
      window.onerror = function (msg, url, lineNo, columnNo, error) {
        console.error('Global Error:', {
          message: msg,
          url,
          lineNo,
          columnNo,
          error,
          timestamp: new Date().toISOString()
        });
      };

      window.onunhandledrejection = function (event) {
        console.error('Unhandled Promise Rejection:', {
          reason: event.reason,
          timestamp: new Date().toISOString()
        });
      };
    }

    return () => {
      clearTimeout(timeoutId);
      if (typeof window !== 'undefined') {
        window.onerror = null;
        window.onunhandledrejection = null;
      }
    };
  }, []);

  useEffect(() => {
    // Register service worker
    if ('serviceWorker' in navigator && process.env.NODE_ENV === 'production') {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js').then(
          registration => {
            console.log('ServiceWorker registration successful');
          },
          err => {
            console.error('ServiceWorker registration failed:', err);
          }
        );
      });
    }
  }, []);

  // Show loading screen with retry option if offline
  if (isLoading || !isOnline) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="bg-white p-8 rounded-lg shadow-md text-center max-w-md">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">
            {isLoading ? 'Loading...' : 'Connection Lost'}
          </h1>
          <p className="text-gray-600 mb-4">
            {isLoading 
              ? 'Please wait while we set up your experience.'
              : 'Please check your internet connection.'}
          </p>
          {!isOnline && (
            <button
              onClick={() => window.location.reload()}
              className="bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600"
            >
              Retry Connection
            </button>
          )}
        </div>
      </div>
    );
  }

  // Show error screen if initialization failed
  if (initError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="bg-white p-8 rounded-lg shadow-md text-center max-w-md">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Initialization Error</h1>
          <p className="text-gray-600 mb-4">{initError.message}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <AuthProvider>
        <div id="app-root" className="min-h-screen">
          <Component {...pageProps} />
        </div>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default MyApp;