import { useEffect, useState } from 'react';
import type { AppProps } from 'next/app';
import { initErrorHandling, initFirebaseErrorMonitoring } from '../lib/errorHandling';
import { db } from '../lib/firebase';
import { enableNetwork } from 'firebase/firestore';
import { AuthProvider } from '../context/AuthContext';
import ErrorBoundary from '../components/ErrorBoundary';

function MyApp({ Component, pageProps }: AppProps) {
  const [isFirebaseInitialized, setIsFirebaseInitialized] = useState(false);

  useEffect(() => {
    const initializeApp = async () => {
      try {
        // Initialize error handling
        initErrorHandling();
        initFirebaseErrorMonitoring();

        // Monitor Firebase connection state
        await enableNetwork(db);
        console.log('Firebase connection established');
      } catch (error) {
        console.error('Firebase initialization error:', error);
        // Still set initialized to true so the app can function in a degraded state
        // rather than being stuck on the loading screen
      } finally {
        setIsFirebaseInitialized(true);
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
      if (typeof window !== 'undefined') {
        window.onerror = null;
        window.onunhandledrejection = null;
      }
    };
  }, []);

  // Show loading screen only during initialization
  if (!isFirebaseInitialized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="bg-white p-8 rounded-lg shadow-md text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Initializing...</h1>
          <p className="text-gray-600">Please wait while we set up your experience.</p>
        </div>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <AuthProvider>
        <Component {...pageProps} />
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default MyApp;