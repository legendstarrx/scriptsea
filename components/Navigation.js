import Link from 'next/link';
import { useRouter } from 'next/router';
import { useAuth } from '../context/AuthContext';
import { useState } from 'react';
import SubscriptionModal from './SubscriptionModal';

export default function Navigation() {
  const router = useRouter();
  const { user, userProfile, logout } = useAuth();
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);

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
                  padding: '0.5rem 1rem',
                  borderRadius: '8px',
                  fontWeight: '500'
                }}>
                  Sign Up
                </Link>
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
              </>
            )}
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
    </>
  );
} 