import '../styles/globals.css';
import { AuthProvider } from '../context/AuthContext';
import Head from 'next/head';
import { useEffect } from 'react';
import { Toaster } from 'react-hot-toast';

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
      <Toaster position="top-center" />
    </AuthProvider>
  );
}

export default MyApp; 