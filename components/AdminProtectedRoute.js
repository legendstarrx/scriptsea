import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../context/AuthContext';

export default function AdminProtectedRoute({ children }) {
  const { user, userProfile, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    const checkAdmin = async () => {
      if (!loading) {
        const isAdmin = user?.email === 'legendstarr2024@gmail.com';
        if (!isAdmin) {
          console.log('Not admin, redirecting');
          await router.push('/');
        }
      }
    };

    checkAdmin();
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-pink-500"></div>
      </div>
    );
  }

  // Only render children if user is admin
  if (user?.email === 'legendstarr2024@gmail.com') {
    return children;
  }

  return null;
} 