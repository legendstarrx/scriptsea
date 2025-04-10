import Link from 'next/link';
import { useRouter } from 'next/router';
import { useAuth } from '../context/AuthContext';
import { useState } from 'react';

export default function Navigation() {
  const router = useRouter();
  const { user, signOut } = useAuth();
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);

  const handleUpgrade = (plan) => {
    const paymentLink = plan === 'monthly' 
      ? 'https://flutterwave.com/pay/vsxo1pgmcjhl'
      : 'https://flutterwave.com/pay/x1wjudjheco3';
    window.open(paymentLink, '_blank');
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
                <button
                  onClick={() => signOut()}
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
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Subscription Modal */}
      {showSubscriptionModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1001
        }}>
          <div style={{
            background: 'white',
            borderRadius: '16px',
            padding: '2rem',
            maxWidth: '500px',
            width: '90%',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)'
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '1.5rem'
            }}>
              <h2 style={{ margin: 0, color: '#333' }}>Choose Your Plan</h2>
              <button
                onClick={() => setShowSubscriptionModal(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '1.5rem',
                  cursor: 'pointer',
                  color: '#666'
                }}
              >
                ×
              </button>
            </div>

            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '1rem'
            }}>
              <div style={{
                padding: '1.5rem',
                border: '1px solid #eee',
                borderRadius: '12px'
              }}>
                <h3 style={{ margin: '0 0 1rem 0', color: '#333' }}>Current Plan</h3>
                <p style={{ margin: '0 0 0.5rem 0', color: '#666' }}>Free Plan</p>
                <p style={{ margin: 0, color: '#666' }}>3 scripts only forever</p>
              </div>

              <div style={{
                padding: '1.5rem',
                border: '1px solid #FF3366',
                borderRadius: '12px',
                background: '#FFF2F2'
              }}>
                <h3 style={{ margin: '0 0 1rem 0', color: '#333' }}>Monthly Plan</h3>
                <p style={{ margin: '0 0 0.5rem 0', color: '#FF3366', fontWeight: 'bold' }}>$4.99/month</p>
                <p style={{ margin: '0 0 1rem 0', color: '#666' }}>100 scripts per month</p>
                <button
                  onClick={() => handleUpgrade('monthly')}
                  style={{
                    background: '#FF3366',
                    color: 'white',
                    padding: '0.75rem 1.5rem',
                    borderRadius: '8px',
                    border: 'none',
                    cursor: 'pointer',
                    fontWeight: '500',
                    width: '100%'
                  }}
                >
                  Upgrade to Monthly
                </button>
              </div>

              <div style={{
                padding: '1.5rem',
                border: '1px solid #FF3366',
                borderRadius: '12px',
                background: '#FFF2F2'
              }}>
                <h3 style={{ margin: '0 0 1rem 0', color: '#333' }}>Yearly Plan</h3>
                <p style={{ margin: '0 0 0.5rem 0', color: '#FF3366', fontWeight: 'bold' }}>$49.99/year</p>
                <p style={{ margin: '0 0 1rem 0', color: '#666' }}>100 scripts per month</p>
                <button
                  onClick={() => handleUpgrade('yearly')}
                  style={{
                    background: '#FF3366',
                    color: 'white',
                    padding: '0.75rem 1.5rem',
                    borderRadius: '8px',
                    border: 'none',
                    cursor: 'pointer',
                    fontWeight: '500',
                    width: '100%'
                  }}
                >
                  Upgrade to Yearly
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
} 