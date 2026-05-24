import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../context/AuthContext';

export function useAuthRedirect() {
  const { user } = useAuth();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Redirect authenticated users away from auth/landing pages to generator.
    if (user && (router.pathname === '/login' || router.pathname === '/register' || router.pathname === '/')) {
      router.replace('/generate');
    }
    setIsLoading(false);
  }, [user, router]);

  return isLoading;
} 