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
      try {
        window?.va?.track('pageview', { 
          url,
          referrer: document.referrer,
          user_agent: window.navigator.userAgent,
          timestamp: new Date().toISOString()
        });
      } catch (error) {
        console.error('Analytics error:', error);
      }
    };

    router.events.on('routeChangeComplete', handleRouteChange);
    
    // Track initial pageview
    handleRouteChange(window.location.pathname + window.location.search);

    return () => {
      router.events.off('routeChangeComplete', handleRouteChange);
    };
  }, [router]);

  return (
    <AuthProvider>
      <Component {...pageProps} />
      <Analytics 
        beforeSend={(event) => {
          // Add custom properties to all events
          return {
            ...event,
            url: window.location.href,
            timestamp: new Date().toISOString()
          }
        }}
      />
      <SpeedInsights />
    </AuthProvider>
  );
}

export default MyApp; 