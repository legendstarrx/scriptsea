import '../styles/globals.css';
import { AuthProvider } from '../context/AuthContext';
import Head from 'next/head';
import { useEffect } from 'react';
import { initializeApp, getApps } from 'firebase/app';
import { getAuth, connectAuthEmulator } from 'firebase/auth';
import ErrorBoundary from '../components/ErrorBoundary';

// Update your Firebase config
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: "www.scriptsea.com",
  projectId: process.env.FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID
};

// Initialize Firebase with error handling
if (!getApps().length) {
  try {
    const app = initializeApp(firebaseConfig);
    const auth = getAuth(app);
    
    // Enable persistence
    auth.setPersistence('local');
    
    // Add error event listener
    auth.onAuthStateChanged((user) => {
      if (user) {
        console.log('User is signed in');
      } else {
        console.log('No user is signed in');
      }
    }, (error) => {
      console.error('Auth state change error:', error);
    });
  } catch (error) {
    console.error('Firebase initialization error:', error);
  }
}

function MyApp({ Component, pageProps }) {
  // Load Flutter payment script securely
  useEffect(() => {
    const loadFlutterScript = () => {
      if (typeof window !== 'undefined' && !window.FlutterwaveCheckout) {
        const script = document.createElement('script');
        script.src = 'https://checkout.flutterwave.com/v3.js';
        script.async = true;
        document.body.appendChild(script);
      }
    };

    loadFlutterScript();
  }, []);

  return (
    <ErrorBoundary>
      <AuthProvider>
        <Head>
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <title>ScriptSea - AI Script Generator</title>
          <meta name="description" content="Generate professional scripts with AI" />
          <link rel="icon" href="/favicon.ico" />
          {/* Add security headers */}
          <meta httpEquiv="Content-Security-Policy" content="default-src 'self' https://www.scriptsea.com https://checkout.flutterwave.com; script-src 'self' 'unsafe-inline' https://checkout.flutterwave.com;" />
        </Head>
        <Component {...pageProps} />
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default MyApp; 