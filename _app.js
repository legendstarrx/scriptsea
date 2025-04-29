import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { AuthProvider } from '../context/AuthContext';

function MyApp({ Component, pageProps }) {
  return (
    <AuthProvider>
      <Component {...pageProps} />
      <Analytics />
      <SpeedInsights />
    </AuthProvider>
  );
}

export default MyApp; 