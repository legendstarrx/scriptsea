import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../context/AuthContext';

// Only allow same-site relative paths (blocks "//evil.com" open redirects).
export function safeNextPath(next) {
  if (typeof next !== 'string') return null;
  if (!next.startsWith('/') || next.startsWith('//') || next.startsWith('/\\')) return null;
  return next;
}

/**
 * Redirects authenticated users away from marketing / auth pages to the app
 * (or back to the page they were trying to open, via ?next=).
 * Waits for loading to settle before acting so we never redirect on stale state.
 */
export function useAuthRedirect() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading || !router.isReady) return;
    if (
      user &&
      (router.pathname === '/login' ||
        router.pathname === '/register' ||
        router.pathname === '/')
    ) {
      router.replace(safeNextPath(router.query.next) || '/generate');
    }
  }, [user, loading, router]);
}
