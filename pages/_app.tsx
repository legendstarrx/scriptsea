import { useEffect, useState } from 'react';
import type { AppProps } from 'next/app';
import { initErrorHandling, initFirebaseErrorMonitoring } from '../lib/errorHandling';
import { db } from '../lib/firebase';
import { enableNetwork } from 'firebase/firestore';
import { AuthProvider } from '../context/AuthContext';
import ErrorBoundary from '../components/ErrorBoundary';
import LoadingSpinner from '../components/LoadingSpinner';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { Toaster } from 'react-hot-toast';

function MyApp({ Component, pageProps }: AppProps) {
  const [isInitializing, setIsInitializing] = useState(true);
  const router = useRouter();

  // Reduce initialization timeout and add progress tracking
  useEffect(() => {
    let mounted = true;

    const init = async () => {
      try {
        // Initialize Firebase network first
        await enableNetwork(db);
        
        // If component is still mounted, update state
        if (mounted) {
          setIsInitializing(false);
        }
      } catch (error) {
        console.error('Initialization error:', error);
        if (mounted) {
          setIsInitializing(false);
        }
      }
    };

    // Start initialization immediately
    init();

    // Fallback timeout - shorter than before
    const timeout = setTimeout(() => {
      if (mounted) {
        setIsInitializing(false);
      }
    }, 2000); // Reduced from 3000ms to 2000ms

    return () => {
      mounted = false;
      clearTimeout(timeout);
    };
  }, []);

  // Move script loading to a separate effect
  useEffect(() => {
    if (router.pathname.includes('/payment') || router.pathname.includes('/subscription')) {
      const script = document.createElement('script');
      script.src = 'https://checkout.flutterwave.com/v3.js';
      script.async = true;
      script.defer = true; // Add defer
      document.body.appendChild(script);

      return () => {
        if (script.parentNode) {
          script.parentNode.removeChild(script);
        }
      };
    }
  }, [router.pathname]);

  if (isInitializing) {
    return <LoadingSpinner />;
  }

  return (
    <ErrorBoundary>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>ScriptSea - AI Script Generator</title>
        <meta name="description" content="Generate professional scripts with AI" />
        <link rel="icon" href="/favicon.ico" />
        
        {/* Cache control headers */}
        <meta httpEquiv="Cache-Control" content="no-cache, no-store, must-revalidate" />
        <meta httpEquiv="Pragma" content="no-cache" />
        <meta httpEquiv="Expires" content="0" />
        
        {/* Preconnect to critical domains */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
      </Head>
      <AuthProvider>
        <div id="app-root" className="min-h-screen">
          <Component {...pageProps} />
        </div>
        <Toaster position="top-center" />
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default MyApp;