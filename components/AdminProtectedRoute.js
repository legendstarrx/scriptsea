import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../context/AuthContext';

export default function AdminProtectedRoute({ children }) {
  const { user, userProfile, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && (!user || user.email !== 'legendstarr2024@gmail.com')) {
      router.push('/');
    }
  }, [user, userProfile, loading, router]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-pink-500"></div>
      </div>
    );
  }

  // Check specifically for the admin email
  if (!user || user.email !== 'legendstarr2024@gmail.com') {
    return null;
  }

  return children;
} 