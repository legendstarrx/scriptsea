import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../context/AuthContext';

const publicPages = ['/pricing', '/privacy', '/login', '/register', '/auth/callback'];

function FullPageSpinner() {
  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#ffffff',
        zIndex: 9999,
      }}
    >
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '16px',
          animation: 'fadeIn 0.2s ease',
        }}
      >
        {/* ScriptSea logo mark */}
        <span
          style={{
            fontSize: '1.6rem',
            fontWeight: '800',
            background: 'linear-gradient(135deg, #FF3366 0%, #FF1A53 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}
        >
          ScriptSea
        </span>

        {/* Animated ring */}
        <div
          style={{
            width: '36px',
            height: '36px',
            borderRadius: '50%',
            border: '3px solid #FFE5EC',
            borderTopColor: '#FF3366',
            animation: 'spin 0.7s linear infinite',
          }}
        />
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
      `}</style>
    </div>
  );
}

export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!router.isReady) return;
    if (!loading && !user && !publicPages.includes(router.pathname)) {
      router.replace('/login');
    }
  }, [user, loading, router]);

  // While auth is resolving, show a branded full-page spinner.
  if (loading) return <FullPageSpinner />;

  // Allow public pages without authentication.
  if (publicPages.includes(router.pathname)) return children;

  // If no user after loading completes, show spinner while redirect fires.
  if (!user) return <FullPageSpinner />;

  return children;
}
