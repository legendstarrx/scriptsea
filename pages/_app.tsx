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
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";

// Add this type definition
type CustomPageProps = {
  adminOnly?: boolean;
  protected?: boolean;
};

type CustomAppProps = AppProps & {
  Component: AppProps['Component'] & CustomPageProps;
};

// Declare gtag as a global function
declare global {
  interface Window {
    gtag: (type: string, value: any, params?: any) => void;
    dataLayer: any[];
  }
}

function MyApp({ Component, pageProps }: CustomAppProps) {
  const [isInitializing, setIsInitializing] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Initialize error handling
    initErrorHandling();
    initFirebaseErrorMonitoring();

    // Enable Firestore network
    enableNetwork(db).then(() => {
      setIsInitializing(false);
    });
  }, []);

  // Track page views
  useEffect(() => {
    const handleRouteChange = (url: string) => {
      if (typeof window !== 'undefined' && typeof window.gtag === 'function') {
        window.gtag('event', 'page_view', {
          page_path: url,
          page_title: document.title,
          page_location: window.location.href
        });
      }
    };

    // Track initial page view
    if (typeof window !== 'undefined' && typeof window.gtag === 'function') {
      handleRouteChange(window.location.pathname + window.location.search);
    }

    router.events.on('routeChangeComplete', handleRouteChange);
    return () => {
      router.events.off('routeChangeComplete', handleRouteChange);
    };
  }, [router.events]);

  if (isInitializing) {
    return <LoadingSpinner />;
  }

  return (
    <>
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
      <Analytics />
      <SpeedInsights />
    </>
  );
}

export default MyApp;
