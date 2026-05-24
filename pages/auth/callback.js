import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '../../lib/supabaseClient';

export default function AuthCallbackPage() {
  const router = useRouter();
  const [message, setMessage] = useState('Completing sign-in...');

  useEffect(() => {
    const finishAuth = async () => {
      try {
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
          const { error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken
          });
          if (error) throw error;
        } else if (authCode) {
          const { error } = await supabase.auth.exchangeCodeForSession(authCode);
          if (error) throw error;
        }

        router.replace('/generate');
      } catch (error) {
        console.error('Auth callback error:', error);
        setMessage(error?.message || 'Sign-in failed. Redirecting...');
        setTimeout(() => router.replace('/login'), 1800);
      }
    };

    finishAuth();
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
