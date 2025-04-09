import '../styles/globals.css';
import { AuthProvider } from '../context/AuthContext';
import Head from 'next/head';
import { useEffect } from 'react';
import { initializeApp, getApps } from 'firebase/app';

// Update your Firebase config
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: "scriptsea.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  // ... other config options ...
};

// Add custom auth domain
if (!getApps().length) {
  initializeApp({
    ...firebaseConfig,
    authDomain: "scriptsea.com"
  });
}

function MyApp({ Component, pageProps }) {
  // Load Flutter payment script
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
    <AuthProvider>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>ScriptSea - AI Script Generator</title>
        <meta name="description" content="Generate professional scripts with AI" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Component {...pageProps} />
    </AuthProvider>
  );
}

export default MyApp; 