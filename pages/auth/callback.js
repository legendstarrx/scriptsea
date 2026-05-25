import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabaseClient';

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
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #fff5f7 0%, #ffffff 100%)',
      padding: '1rem',
    }}>
      <div style={{
        width: '100%',
        maxWidth: '400px',
        background: 'white',
        borderRadius: '20px',
        boxShadow: '0 8px 32px rgba(0,0,0,0.08)',
        padding: '2.5rem 2rem',
        textAlign: 'center',
      }}>
        {/* Spinner */}
        <div style={{ marginBottom: '20px' }}>
          <svg
            width="48" height="48" viewBox="0 0 48 48"
            style={{ animation: 'spin 0.9s linear infinite' }}
          >
            <circle
              cx="24" cy="24" r="20"
              fill="none" stroke="#f3d5de" strokeWidth="4"
            />
            <path
              d="M24 4 a20 20 0 0 1 20 20"
              fill="none" stroke="#FF3366" strokeWidth="4" strokeLinecap="round"
            />
          </svg>
        </div>

        <p style={{ color: '#444', fontSize: '1rem', margin: 0, fontWeight: 500 }}>
          {message}
        </p>

        <style>{`
          @keyframes spin {
            0%   { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    </div>
  );
}
