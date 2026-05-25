import { useEffect } from 'react';
import type { AppProps } from 'next/app';
import { AuthProvider } from '../context/AuthContext';
import ErrorBoundary from '../components/ErrorBoundary';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { Toaster } from 'react-hot-toast';
import '../styles/globals.css';
import ProtectedRoute from '../components/ProtectedRoute';
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import Script from 'next/script';
import { supabase } from '../lib/supabaseClient';

// Add this type definition
type CustomPageProps = {
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
  const router = useRouter();

  // (error handling initialisation removed — handled by ErrorBoundary)

  // Fallback OAuth hash handler: if provider returns tokens on "/", complete session and redirect.
  useEffect(() => {
    const resolveOAuthHash = async () => {
      if (typeof window === 'undefined') return;
      if (!supabase) return;
      if (window.location.pathname !== '/') return;
      if (!window.location.hash?.includes('access_token=')) return;

      try {
        const hash = window.location.hash.startsWith('#') ? window.location.hash.slice(1) : window.location.hash;
        const params = new URLSearchParams(hash);
        const accessToken = params.get('access_token');
        const refreshToken = params.get('refresh_token');

        if (!accessToken || !refreshToken) return;

        const { error } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken
        });

        if (error) throw error;

        // Clean sensitive hash tokens from URL immediately.
        window.history.replaceState({}, document.title, window.location.pathname + window.location.search);
        router.replace('/generate');
      } catch (error) {
        console.error('OAuth hash fallback failed:', error);
      }
    };

    resolveOAuthHash();
  }, [router]);

  // Track page views
  useEffect(() => {
    const handleRouteChange = (url: string) => {
      window.gtag?.('event', 'page_view', {
        page_path: url,
        page_title: document.title,
        page_location: window.location.href
      });
    };

    router.events.on('routeChangeComplete', handleRouteChange);
    return () => {
      router.events.off('routeChangeComplete', handleRouteChange);
    };
  }, [router.events]);

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=G-9VTGLJ644Y`}
        strategy="afterInteractive"
      />
      <Script id="google-analytics" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', 'G-9VTGLJ644Y');
        `}
      </Script>
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
            {Component.protected ? (
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
