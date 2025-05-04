import { AuthProvider } from '../context/AuthContext';
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/next';
import Head from 'next/head';

function MyApp({ Component, pageProps }) {
  return (
    <AuthProvider>
      <Head>
        <script async src="https://va.vercel-scripts.com/v1/script.js" />
      </Head>
      <Component {...pageProps} />
      <Analytics />
      <SpeedInsights />
    </AuthProvider>
  );
}

export default MyApp; 