import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../context/AuthContext';

export default function AdminProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    let mounted = true;

    const checkAuth = async () => {
      if (!loading) {
        const isAdmin = user?.email === 'legendstarr2024@gmail.com';
        
        if (mounted) {
          setIsAuthorized(isAdmin);
          
          if (!isAdmin && user) {
            router.push('/');
          }
        }
      }
    };

    checkAuth();

    return () => {
      mounted = false;
    };
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-pink-500"></div>
      </div>
    );
  }

  return isAuthorized ? children : null;
} 