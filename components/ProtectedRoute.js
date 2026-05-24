import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../context/AuthContext';

const publicPages = ['/pricing', '/privacy', '/login', '/register', '/auth/callback'];

export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!router.isReady) return;
    if (!loading && !user && !publicPages.includes(router.pathname)) {
      router.replace('/login');
      const timer = setTimeout(() => {
        if (window.location.pathname !== '/login') {
          window.location.assign('/login');
        }
      }, 900);
      return () => clearTimeout(timer);
    }
  }, [user, loading, router]);

  if (loading) {
    return null;
  }

  // Allow access to public pages without authentication
  if (publicPages.includes(router.pathname)) {
    return children;
  }

  // For protected pages, check authentication
  if (!user) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        Redirecting...
      </div>
    );
  }

  return children;
} 