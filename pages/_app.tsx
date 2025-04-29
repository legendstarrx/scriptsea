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
import '../styles/globals.css';
import AdminProtectedRoute from '../components/AdminProtectedRoute';
import ProtectedRoute from '../components/ProtectedRoute';
import { Analytics } from "@vercel/analytics/react"
import { SpeedInsights } from "@vercel/speed-insights/next"

// Add this type definition
type CustomPageProps = {
  adminOnly?: boolean;
  protected?: boolean;
};

type CustomAppProps = AppProps & {
  Component: AppProps['Component'] & CustomPageProps;
};

function MyApp({ Component, pageProps }: CustomAppProps) {
  const [isInitializing, setIsInitializing] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Simple timeout to ensure minimal loading state
    const timeout = setTimeout(() => {
      setIsInitializing(false);
    }, 1000);

    return () => clearTimeout(timeout);
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
          {Component.adminOnly ? (
            <AdminProtectedRoute>
              <Component {...pageProps} />
            </AdminProtectedRoute>
          ) : Component.protected ? (
            <ProtectedRoute>
              <Component {...pageProps} />
            </ProtectedRoute>
          ) : (
            <Component {...pageProps} />
          )}
        </div>
        <Toaster position="top-center" />
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default MyApp;