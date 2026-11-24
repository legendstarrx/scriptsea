import { useEffect } from 'react';
import { useRouter } from 'next/router';
import Script from 'next/script';
import { ADSENSE_CLIENT } from '../lib/ads';

/**
 * Loads Google AdSense. Only blog pages render this, so Auto ads can only
 * appear on the blog, never on the app, pricing or tool pages.
 */
export default function AdSenseScript() {
  const router = useRouter();

  // Once the ad script has loaded it stays in memory, so leaving the blog with a
  // client-side link would carry it to other pages. Leave the blog with a full
  // page load instead, so non-blog pages never have the ad script.
  useEffect(() => {
    if (!ADSENSE_CLIENT) return undefined;
    const onRouteChange = (url) => {
      if (url.startsWith('/blog')) return;
      window.location.assign(url);
      router.events.emit('routeChangeError');
      // eslint-disable-next-line no-throw-literal
      throw 'Leaving the blog with a full page load (keeps ads on the blog only).';
    };
    router.events.on('routeChangeStart', onRouteChange);
    return () => router.events.off('routeChangeStart', onRouteChange);
  }, [router]);

  if (!ADSENSE_CLIENT) return null;
  return (
    <Script
      id="adsense"
      async
      strategy="afterInteractive"
      crossOrigin="anonymous"
      src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_CLIENT}`}
    />
  );
}
