import Link from 'next/link';
import { useRouter } from 'next/router';
import { useAuth } from '../context/AuthContext';
import { useState } from 'react';
import SubscriptionModal from './SubscriptionModal';

export default function Navigation() {
  const router = useRouter();
  const { user, userProfile, logout } = useAuth();
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);

  const handleSignOut = async () => {
    try {
      await logout();
      router.push('/');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <>
      <nav style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 50,
        background: 'white',
        boxShadow: '0 1px 12px rgba(0, 0, 0, 0.06)',
        padding: '0.65rem 1rem',
        minHeight: '64px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '1rem'
        }}>
          <Link href="/" style={{
            textDecoration: 'none',
            color: '#FF3366',
            fontSize: '1.5rem',
            fontWeight: 'bold',
            background: 'linear-gradient(135deg, #FF3366 0%, #FF1A53 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            textFillColor: 'transparent'
          }}>
            ScriptSea
          </Link>
        </div>

        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem'
        }}>
          {user ? (
            <>
              <Link href="/generate" style={{
                textDecoration: 'none',
                color: '#333',
                fontWeight: '500',
                padding: '0.5rem 0.75rem',
                borderRadius: '6px',
                transition: 'all 0.2s ease',
                ':hover': {
                  background: '#f3f4f6'
                }
              }}>
                Generate
              </Link>
              <button
                onClick={() => setShowSubscriptionModal(true)}
                style={{
                  border: 'none',
                  borderRadius: '8px',
                  background: '#FF3366',
                  color: 'white',
                  padding: '0.45rem 0.8rem',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                Upgrade
              </button>
              <button
                onClick={handleSignOut}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#666',
                  padding: '0.5rem 0.75rem',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  ':hover': {
                    background: '#f3f4f6'
                  }
                }}
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link href="/register" style={{
                textDecoration: 'none',
                background: '#FF3366',
                color: 'white',
                padding: '0.5rem 0.75rem',
                borderRadius: '6px',
                fontSize: '0.9rem',
                fontWeight: '500',
                transition: 'all 0.2s ease',
                ':hover': {
                  background: '#FF1A53'
                }
              }}>
                Sign Up
              </Link>
            </>
          )}
        </div>
      </nav>

      {showSubscriptionModal && (
        <SubscriptionModal 
          isOpen={showSubscriptionModal}
          onClose={() => setShowSubscriptionModal(false)}
          userProfile={userProfile}
        />
      )}
    </>
  );
} 