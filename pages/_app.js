import '../styles/globals.css';
import { AuthProvider } from '../context/AuthContext';
import Head from 'next/head';
import { enableIndexedDbPersistence } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useEffect } from 'react';

function MyApp({ Component, pageProps }) {
  useEffect(() => {
    // Enable persistence with multi-tab support
    if (typeof window !== 'undefined') {
      enableIndexedDbPersistence(db, {
        synchronizeTabs: true
      }).catch((err) => {
        if (err.code === 'failed-precondition') {
          console.log('Multiple tabs open, persistence can only be enabled in one tab at a time.');
        } else if (err.code === 'unimplemented') {
          console.log('The current browser doesn\'t support persistence.');
        }
      });
    }
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