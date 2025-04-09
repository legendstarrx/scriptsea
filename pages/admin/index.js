import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useRouter } from 'next/router';

export default function AdminDashboard() {
  const { user } = useAuth();
  const router = useRouter();

  React.useEffect(() => {
    if (!user?.isAdmin) {
      router.push('/');
    }
  }, [user, router]);

  if (!user?.isAdmin) {
    return null;
  }

  return (
    <div>
      <h1>Admin Dashboard</h1>
      {/* Add your admin dashboard content here */}
    </div>
  );
} 