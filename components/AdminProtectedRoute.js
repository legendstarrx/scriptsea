import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../context/AuthContext';

export default function AdminProtectedRoute({ children }) {
  const { user, userProfile, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && (!user || !userProfile?.isAdmin)) {
      router.push('/');
    }
  }, [user, userProfile, loading, router]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!userProfile?.isAdmin) {
    return null;
  }

  return children;
} 