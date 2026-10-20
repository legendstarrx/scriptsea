import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabaseClient';
import SEO from '../../components/SEO';
import { FullPageSpinner } from '../../components/ProtectedRoute';

export default function AuthCallbackPage() {
  const [message, setMessage] = useState('Completing sign-in…');

  useEffect(() => {
    // Hard fallback: if nothing resolves in 8 seconds, go back to login
    const fallbackTimer = setTimeout(() => {
      window.location.replace('/login');
    }, 8000);

    const finishAuth = async () => {
      try {
        if (!supabase) throw new Error('Auth service is not configured.');

        const hash = window.location.hash.startsWith('#')
          ? window.location.hash.slice(1)
          : window.location.hash;
        const hashParams  = new URLSearchParams(hash);
        const queryParams = new URLSearchParams(window.location.search);

        const hashError = hashParams.get('error_description') || hashParams.get('error');
        if (hashError) throw new Error(decodeURIComponent(hashError));

        const accessToken  = hashParams.get('access_token');
        const refreshToken = hashParams.get('refresh_token');
        const authCode     = queryParams.get('code');

        if (accessToken && refreshToken) {
          setMessage('Finalising your session…');
          const { error } = await supabase.auth.setSession({ access_token: accessToken, refresh_token: refreshToken });
          if (error) throw error;

        } else if (authCode) {
          setMessage('Finalising your session…');
          const { error } = await supabase.auth.exchangeCodeForSession(authCode);
          if (error) throw error;
        }
        // If neither token nor code, session may already be set — just redirect.

        // Clean sensitive tokens from the URL bar
        window.history.replaceState({}, document.title, window.location.pathname + window.location.search);
        clearTimeout(fallbackTimer);
        window.location.replace('/generate');

      } catch (err) {
        clearTimeout(fallbackTimer);
        console.error('Auth callback error:', err);
        setMessage(err?.message || 'Sign-in failed. Redirecting…');
        setTimeout(() => window.location.replace('/login'), 1200);
      }
    };

    finishAuth();
    return () => clearTimeout(fallbackTimer);
  }, []);

  return (
    <>
      <SEO title="Signing You In | ScriptSea" description="Completing sign in." path="/auth/callback" noindex />
      <FullPageSpinner label={message} />
    </>
  );
}
