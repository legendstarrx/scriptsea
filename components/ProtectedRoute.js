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

  // Do not block page render with a visible loading gate.
  // We redirect in the effect once auth state is known.
  if (loading) return children;

  // Allow access to public pages without authentication
  if (publicPages.includes(router.pathname)) {
    return children;
  }

  // For protected pages, check authentication
  if (!user) {
    return null;
  }

  return children;
} 