import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../context/AuthContext';

/**
 * Redirects authenticated users away from marketing / auth pages to /generate.
 * Waits for loading to settle before acting so we never redirect on stale state.
 */
export function useAuthRedirect() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return; // wait for auth to resolve
    if (
      user &&
      (router.pathname === '/login' ||
        router.pathname === '/register' ||
        router.pathname === '/')
    ) {
      router.replace('/generate');
    }
  }, [user, loading, router]);
}
