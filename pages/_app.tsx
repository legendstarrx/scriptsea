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

  // Load Flutterwave script only when needed (on payment pages)
  useEffect(() => {
    if (router.pathname.includes('/payment') || router.pathname.includes('/subscription')) {
      const script = document.createElement('script');
      script.src = 'https://checkout.flutterwave.com/v3.js';
      script.async = true;
      document.body.appendChild(script);

      return () => {
        document.body.removeChild(script);
      };
    }
  }, [router.pathname]);

  useEffect(() => {
    const initTimeout = setTimeout(() => {
      setIsInitializing(false);
    }, 3000);

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
    return () => clearTimeout(initTimeout);
  }, []);

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