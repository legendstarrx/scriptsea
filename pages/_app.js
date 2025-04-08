import '../styles/globals.css';
import { AuthProvider } from '../context/AuthContext';
import Head from 'next/head';
import { useEffect } from 'react';
import { initializeApp, getApps } from 'firebase/app';

// Update your Firebase config
const firebaseConfig = {
  // ... other config options ...
  authDomain: "scriptsea.com", // Update this to your domain
};

// Initialize Firebase with custom domain
if (!getApps().length) {
  initializeApp(firebaseConfig);
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