import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../context/AuthContext';

const ADMIN_EMAIL = process.env.NEXT_PUBLIC_ADMIN_EMAIL;

export default function AdminProtectedRoute({ children }) {
  const { user, userProfile, loading } = useAuth();
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    let mounted = true;

    const checkAuth = async () => {
      console.log('AdminProtectedRoute - Checking auth:', {
        loading,
        user: user?.email,
        adminEmail: ADMIN_EMAIL,
        userProfile: userProfile?.email
      });

      if (!loading) {
        // First check if we have a user
        if (!user?.email) {
          console.log('AdminProtectedRoute - No user email, redirecting');
          router.push('/');
          return;
        }

        const isAdmin = user.email === ADMIN_EMAIL;
        console.log('AdminProtectedRoute - Is admin:', isAdmin);
        
        if (mounted) {
          setIsAuthorized(isAdmin);
          
          if (!isAdmin) {
            console.log('AdminProtectedRoute - Not admin, redirecting');
            router.push('/');
          }
        }
      }
    };

    checkAuth();

    return () => {
      mounted = false;
    };
  }, [user, loading, router, userProfile]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-pink-500"></div>
      </div>
    );
  }

  // Only render children if explicitly authorized
  return isAuthorized ? children : (
    <div className="flex justify-center items-center h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-pink-500"></div>
    </div>
  );
} 