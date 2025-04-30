import { AuthProvider } from '../context/AuthContext';
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/next';
import { useRouter } from 'next/router';
import { useEffect } from 'react';

function MyApp({ Component, pageProps }) {
  const router = useRouter();

  useEffect(() => {
    // Track route changes
    const handleRouteChange = (url) => {
      window?.va?.track('pageview');
    };

    router.events.on('routeChangeComplete', handleRouteChange);
    return () => {
      router.events.off('routeChangeComplete', handleRouteChange);
    };
  }, [router]);

  return (
    <AuthProvider>
      <Component {...pageProps} />
      <Analytics mode={process.env.NODE_ENV === 'production' ? 'production' : 'development'} />
      <SpeedInsights />
    </AuthProvider>
  );
}

export default MyApp; 