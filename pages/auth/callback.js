import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabaseClient';

export default function AuthCallbackPage() {
  const [message, setMessage] = useState('Completing sign-in...');

  useEffect(() => {
    const fallbackTimer = setTimeout(() => {
      window.location.replace('/login');
    }, 3000);

    const finishAuth = async () => {
      try {
        if (!supabase) {
          throw new Error('Auth service is not configured.');
        }

        const hash = window.location.hash.startsWith('#')
          ? window.location.hash.slice(1)
          : window.location.hash;
        const hashParams = new URLSearchParams(hash);
        const queryParams = new URLSearchParams(window.location.search);

        const hashError = hashParams.get('error_description') || hashParams.get('error');
        if (hashError) {
          throw new Error(decodeURIComponent(hashError));
        }

        const accessToken = hashParams.get('access_token');
        const refreshToken = hashParams.get('refresh_token');
        const authCode = queryParams.get('code');

        if (accessToken && refreshToken) {
          const setSessionPromise = supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken
          });
          const timeoutPromise = new Promise((_, reject) =>
            setTimeout(() => reject(new Error('Sign-in timeout. Please try again.')), 2500)
          );
          const { error } = await Promise.race([setSessionPromise, timeoutPromise]);
          if (error) throw error;
        } else if (authCode) {
          const exchangePromise = supabase.auth.exchangeCodeForSession(authCode);
          const timeoutPromise = new Promise((_, reject) =>
            setTimeout(() => reject(new Error('Sign-in timeout. Please try again.')), 2500)
          );
          const { error } = await Promise.race([exchangePromise, timeoutPromise]);
          if (error) throw error;
        }

        window.history.replaceState({}, document.title, window.location.pathname + window.location.search);
        window.location.replace('/generate');
      } catch (error) {
        console.error('Auth callback error:', error);
        setMessage(error?.message || 'Sign-in failed. Redirecting...');
        setTimeout(() => window.location.replace('/login'), 900);
      }
    };

    finishAuth();
    return () => clearTimeout(fallbackTimer);
  }, [router]);

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #fff5f7 0%, #ffffff 100%)',
        padding: '1rem'
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '420px',
          background: 'white',
          borderRadius: '16px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
          padding: '1.4rem',
          textAlign: 'center',
          color: '#333'
        }}
      >
        {message}
      </div>
    </div>
  );
}
