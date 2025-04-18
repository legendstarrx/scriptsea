import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../context/AuthContext';

export function useAuthRedirect() {
  const { user } = useAuth();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user) {
      router.push('/generate');
    } else {
      setIsLoading(false);
    }
  }, [user, router]);

  return isLoading;
} 