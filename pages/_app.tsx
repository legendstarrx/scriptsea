import { useEffect } from 'react';
import type { AppProps } from 'next/app';
import { initErrorHandling, initFirebaseErrorMonitoring } from '../lib/errorHandling';
import { db } from '../lib/firebase';
import { enableNetwork } from 'firebase/firestore';
import { AuthProvider } from '../context/AuthContext';
import ErrorBoundary from '../components/ErrorBoundary';

function MyApp({ Component, pageProps }: AppProps) {
  useEffect(() => {
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
      } catch (error) {
        console.error('Firebase connection error:', error);
      }
    };

    monitorFirebaseConnection();

    // Cleanup function
    return () => {
      // Optionally disable network when component unmounts
      // disableNetwork(db).catch(console.error);
    };
  }, []);

  return (
    <AuthProvider>
      <ErrorBoundary>
        <Component {...pageProps} />
      </ErrorBoundary>
    </AuthProvider>
  );
}

export default MyApp;