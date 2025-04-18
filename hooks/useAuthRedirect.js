import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../context/AuthContext';

export function useAuthRedirect() {
  const { user } = useAuth();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Only redirect if user is already logged in when landing on the page
    if (user && (router.pathname === '/login' || router.pathname === '/register')) {
      router.replace('/generate');
    }
    setIsLoading(false);
  }, [user, router]);

  return isLoading;
} 