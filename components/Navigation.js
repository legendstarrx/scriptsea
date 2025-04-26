import Link from 'next/link';
import { useRouter } from 'next/router';
import { useAuth } from '../context/AuthContext';
import { useState, useEffect } from 'react';
import ContactModal from './ContactModal';
import SubscriptionModal from './SubscriptionModal';
import Image from 'next/image';

const ADMIN_EMAIL = process.env.NEXT_PUBLIC_ADMIN_EMAIL;

export default function Navigation() {
  const router = useRouter();
  const { user, userProfile, loading, logout } = useAuth();
  const [showContactModal, setShowContactModal] = useState(false);
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    if (!loading && user?.email) {
      setIsAdmin(user.email === ADMIN_EMAIL);
    } else {
      setIsAdmin(false);
    }
  }, [user, loading]);

  // Add null check for subscription status
  const isFreePlan = !userProfile?.subscription || userProfile.subscription === 'free';

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
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
        padding: '0.5rem 1rem',
        height: '60px',
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
              <Link href="/login" style={{
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
                Login
              </Link>
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
          <button
            onClick={() => setShowContactModal(true)}
            style={{
              background: 'none',
              border: 'none',
              padding: '0.5rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
            title="Contact Us"
          >
            <svg 
              width="20" 
              height="20" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="#FF3366"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/>
            </svg>
          </button>
        </div>
      </nav>

      {showContactModal && (
        <ContactModal 
          isOpen={showContactModal}
          onClose={() => setShowContactModal(false)}
        />
      )}

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