import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useRouter } from 'next/router';

const AdminRoute = ({ children }) => {
  const { user, loading } = useAuth();
  const router = useRouter();

  React.useEffect(() => {
    if (!loading && (!user || user.email !== 'legendstarr2024@gmail.com')) {
      router.push('/');
    }
  }, [user, loading, router]);

  if (loading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  if (!user || user.email !== 'legendstarr2024@gmail.com') {
    return null;
  }

  return children;
};

export default AdminRoute; 