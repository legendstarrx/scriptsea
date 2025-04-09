import '../styles/globals.css';
import { AuthProvider } from '../context/AuthContext';
import Head from 'next/head';
import { useEffect } from 'react';
import ErrorBoundary from '../components/ErrorBoundary';
import { auth } from '../lib/firebase';

function MyApp({ Component, pageProps }) {
  useEffect(() => {
    // Add auth state listener
    const unsubscribe = auth?.onAuthStateChanged(
      (user) => {
        if (user) {
          console.log('User is signed in');
        } else {
          console.log('No user is signed in');
        }
      },
      (error) => {
        console.error('Auth state change error:', error);
      }
    );

    // Load Flutterwave script
    const loadFlutterScript = () => {
      if (typeof window !== 'undefined' && !window.FlutterwaveCheckout) {
        const script = document.createElement('script');
        script.src = 'https://checkout.flutterwave.com/v3.js';
        script.async = true;
        document.body.appendChild(script);
      }
    };

    loadFlutterScript();
    return () => unsubscribe?.();
  }, []);

  return (
    <ErrorBoundary>
      <AuthProvider>
        <Head>
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <title>ScriptSea - AI Script Generator</title>
          <meta name="description" content="Generate professional scripts with AI" />
          <link rel="icon" href="/favicon.ico" />
          <meta httpEquiv="Content-Security-Policy" content={`
            default-src 'self' https://*.scriptsea.com https://*.firebaseapp.com https://*.googleapis.com;
            script-src 'self' 'unsafe-inline' https://*.firebaseapp.com https://*.googleapis.com https://checkout.flutterwave.com;
            connect-src 'self' https://*.scriptsea.com https://*.firebaseio.com https://*.googleapis.com wss://*.firebaseio.com;
            img-src 'self' https://*.scriptsea.com https://*.firebaseapp.com data:;
            style-src 'self' 'unsafe-inline';
            font-src 'self' data:;
          `.replace(/\s+/g, ' ').trim()} />
        </Head>
        <Component {...pageProps} />
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default MyApp; 