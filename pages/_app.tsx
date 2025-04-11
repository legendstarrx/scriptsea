import { useEffect, useState } from 'react';
import type { AppProps } from 'next/app';
import { initErrorHandling, initFirebaseErrorMonitoring } from '../lib/errorHandling';
import { db } from '../lib/firebase';
import { enableNetwork } from 'firebase/firestore';
import { AuthProvider } from '../context/AuthContext';
import ErrorBoundary from '../components/ErrorBoundary';

function MyApp({ Component, pageProps }: AppProps) {
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
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

      // Clear storage as a test (remove this in production)
      try {
        localStorage.clear();
        sessionStorage.clear();
      } catch (error) {
        console.error('Storage clear error:', error);
      }

      // Unregister service workers
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.getRegistrations().then(function(registrations) {
          for(let registration of registrations) {
            registration.unregister();
          }
        }).catch(console.error);
      }
    }

    // Initialize error handling
    initErrorHandling();
    initFirebaseErrorMonitoring();

    // Add page load performance monitoring
    const pageLoadTime = performance.now();
    console.log(`Page loaded in ${pageLoadTime}ms`);

    // Monitor Firebase connection state
    const monitorFirebaseConnection = async () => {
      try {
        await enableNetwork(db);
        console.log('Firebase connection established');
        setIsInitialized(true);
      } catch (error) {
        console.error('Firebase connection error:', error);
        setIsInitialized(true); // Still set to true so the app renders even if Firebase fails
      }
    };

    monitorFirebaseConnection();

    // Cleanup function
    return () => {
      if (typeof window !== 'undefined') {
        window.onerror = null;
        window.onunhandledrejection = null;
      }
    };
  }, []);

  // Show loading screen only during initialization
  if (!isInitialized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="bg-white p-8 rounded-lg shadow-md text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Loading...</h1>
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