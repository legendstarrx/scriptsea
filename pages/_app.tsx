import { useEffect, useState } from 'react';
import type { AppProps } from 'next/app';
import { initErrorHandling, initFirebaseErrorMonitoring } from '../lib/errorHandling';
import { db } from '../lib/firebase';
import { enableNetwork, getFirestore } from 'firebase/firestore';
import { AuthProvider } from '../context/AuthContext';
import ErrorBoundary from '../components/ErrorBoundary';
import { useRouter } from 'next/router';
import LoadingScreen from '../components/LoadingScreen';

function MyApp({ Component, pageProps }: AppProps) {
  const [isInitializing, setIsInitializing] = useState(true);
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
    // Set a maximum timeout for initialization
    const timeout = setTimeout(() => {
      setIsInitializing(false);
    }, 5000); // 5 seconds maximum loading time

    // Initialize your app
    const init = async () => {
      try {
        await enableNetwork(db);
        setIsInitializing(false);
      } catch (error) {
        console.error('Initialization error:', error);
        setIsInitializing(false);
      }
    };

    init();

    return () => clearTimeout(timeout);
  }, []);

  useEffect(() => {
    // Register service worker
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator && process.env.NODE_ENV === 'production') {
      window.addEventListener('load', async () => {
        try {
          const registration = await navigator.serviceWorker.register('/sw.js', {
            scope: '/',
          });
          console.log('ServiceWorker registration successful:', registration);
        } catch (error) {
          console.error('ServiceWorker registration failed:', error);
        }
      });
    }
  }, []);

  // Show loading screen with retry option if offline
  if (isInitializing || !isOnline) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="bg-white p-8 rounded-lg shadow-md text-center max-w-md">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">
            {isInitializing ? 'Loading...' : 'Connection Lost'}
          </h1>
          <p className="text-gray-600 mb-4">
            {isInitializing 
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