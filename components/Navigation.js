import Link from 'next/link';
import { useRouter } from 'next/router';
import { useAuth } from '../context/AuthContext';
import { useState } from 'react';
import SubscriptionModal from './SubscriptionModal';
import ContactModal from './ContactModal';
import Image from 'next/image';

export default function Navigation() {
  const router = useRouter();
  const { user, userProfile, logout } = useAuth();
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);
  const [showContactModal, setShowContactModal] = useState(false);

  // Add null check for subscription status
  const isFreePlan = !userProfile?.subscription || userProfile.subscription === 'free';

  const handleUpgrade = (plan) => {
    const paymentLink = plan === 'monthly' 
      ? 'https://flutterwave.com/pay/vsxo1pgmcjhl'
      : 'https://flutterwave.com/pay/x1wjudjheco3';
    window.open(paymentLink, '_blank');
  };

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
        padding: '1rem 2rem',
        background: 'white',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        position: 'sticky',
        top: 0,
        zIndex: 1000
      }}>
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <Link href="/" style={{
            textDecoration: 'none',
            color: '#FF3366',
            fontSize: '1.5rem',
            fontWeight: 'bold'
          }}>
            ScriptSea
          </Link>

          <div style={{
            display: 'flex',
            gap: '1.5rem',
            alignItems: 'center'
          }}>
            {user ? (
              <>
                <Link href="/generate" style={{
                  textDecoration: 'none',
                  color: '#333',
                  fontWeight: '500'
                }}>
                  Generate
                </Link>
                {isFreePlan && (
                  <button
                    onClick={() => setShowSubscriptionModal(true)}
                    style={{
                      background: '#FF3366',
                      color: 'white',
                      padding: '0.5rem 1rem',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      fontWeight: '500',
                      border: 'none'
                    }}
                  >
                    Upgrade
                  </button>
                )}
                <button
                  onClick={handleSignOut}
                  style={{
                    background: 'none',
                    border: '1px solid #FF3366',
                    color: '#FF3366',
                    padding: '0.5rem 1rem',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontWeight: '500'
                  }}
                >
                  Sign Out
                </button>
                {user && user.email === 'legendstarr2024@gmail.com' && (
                  <Link 
                    href="/admin"
                    className="nav-link admin-link"
                  >
                    Admin Dashboard
                  </Link>
                )}
              </>
            ) : (
              <>
                <Link href="/login" style={{
                  textDecoration: 'none',
                  color: '#333',
                  fontWeight: '500'
                }}>
                  Login
                </Link>
                <Link href="/register" style={{
                  textDecoration: 'none',
                  background: '#FF3366',
                  color: 'white',
                  padding: '0.4rem 0.8rem',
                  borderRadius: '6px',
                  fontSize: '0.9rem',
                  fontWeight: '500'
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
                padding: '0.3rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
              title="Contact Us"
            >
              <svg 
                width="24" 
                height="24" 
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
        </div>
      </nav>

      {showSubscriptionModal && (
        <SubscriptionModal 
          isOpen={showSubscriptionModal}
          onClose={() => setShowSubscriptionModal(false)}
          userProfile={userProfile}
        />
      )}

      {showContactModal && (
        <ContactModal 
          isOpen={showContactModal}
          onClose={() => setShowContactModal(false)}
        />
      )}
    </>
  );
} 