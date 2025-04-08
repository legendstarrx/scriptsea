import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Allow access to pricing and privacy pages without authentication
    const publicPages = ['/pricing', '/privacy'];
    if (!loading && !user && !publicPages.includes(router.pathname)) {
      router.push('/login');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #fff5f7 0%, #ffffff 100%)'
      }}>
        <div style={{
          padding: '2rem',
          background: 'white',
          borderRadius: '12px',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)',
          textAlign: 'center'
        }}>
          <div style={{
            fontSize: '1.25rem',
            color: '#333',
            marginBottom: '1rem'
          }}>
            Loading...
          </div>
        </div>
      </div>
    );
  }

  // Allow access to public pages without authentication
  const publicPages = ['/pricing', '/privacy'];
  if (publicPages.includes(router.pathname)) {
    return children;
  }

  // For protected pages, check authentication
  if (!user) {
    return null;
  }

  return children;
} 