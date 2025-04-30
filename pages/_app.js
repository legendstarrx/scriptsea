import { AuthProvider } from '../context/AuthContext';
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/next';

function MyApp({ Component, pageProps }) {
  return (
    <AuthProvider>
      <Component {...pageProps} />
      <Analytics debug={process.env.NODE_ENV === 'development'} />
      <SpeedInsights />
    </AuthProvider>
  );
}

export default MyApp; 