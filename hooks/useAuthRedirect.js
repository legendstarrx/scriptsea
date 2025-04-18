import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../context/AuthContext';

export function useAuthRedirect(redirectIfAuthed = true) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Don't redirect while loading auth state
    if (loading) return;

    // Get the intended destination from query params or default to /generate
    const destination = router.query.redirect || '/generate';
    
    if (redirectIfAuthed) {
      // Redirect authenticated users away from auth pages
      if (user) {
        router.replace(destination);
      }
    } else {
      // Redirect unauthenticated users to login
      if (!user) {
        router.replace(`/login?redirect=${encodeURIComponent(router.asPath)}`);
      }
    }
  }, [user, loading, router, redirectIfAuthed]);

  return { user, loading };
} 