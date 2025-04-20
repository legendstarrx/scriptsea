import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../context/AuthContext';
import Navigation from '../components/Navigation';
import Footer from '../components/Footer';

export default function VerifyEmail() {
  const router = useRouter();
  const { user, checkEmailVerification, resendVerificationEmail } = useAuth();
  const [isVerified, setIsVerified] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    const checkVerification = async () => {
      if (user) {
        const verified = await checkEmailVerification();
        setIsVerified(verified);
        setIsLoading(false);
        
        if (verified) {
          // Redirect to generate page after a short delay to show success message
          setTimeout(() => {
            router.replace('/generate');
          }, 1500);
        }
      } else {
        router.replace('/login');
      }
    };

    checkVerification();
  }, [user, checkEmailVerification, router]);

  const handleResendEmail = async () => {
    setIsLoading(true);
    setMessage({ type: '', text: '' });
    
    try {
      await resendVerificationEmail();
      setMessage({
        type: 'success',
        text: 'Verification email sent! Please check your inbox.'
      });
    } catch (error) {
      setMessage({
        type: 'error',
        text: 'Failed to send verification email. Please try again.'
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column'
      }}>
        <Navigation />
        <main style={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '2rem'
        }}>
          <div style={{
            textAlign: 'center',
            padding: '2rem',
            background: 'white',
            borderRadius: '12px',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
            maxWidth: '500px',
            width: '100%'
          }}>
            <div style={{
              width: '50px',
              height: '50px',
              border: '3px solid #f3f3f3',
              borderTop: '3px solid #FF3366',
              borderRadius: '50%',
              margin: '0 auto 1.5rem',
              animation: 'spin 1s linear infinite'
            }} />
            <h2 style={{ color: '#333', marginBottom: '1rem' }}>Checking Email Verification...</h2>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column'
    }}>
      <Navigation />
      <main style={{
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem'
      }}>
        <div style={{
          textAlign: 'center',
          padding: '2rem',
          background: 'white',
          borderRadius: '12px',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
          maxWidth: '500px',
          width: '100%'
        }}>
          {isVerified ? (
            <>
              <div style={{
                width: '50px',
                height: '50px',
                background: '#48BB78',
                borderRadius: '50%',
                margin: '0 auto 1.5rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <svg 
                  width="24" 
                  height="24" 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  stroke="white"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M20 6L9 17l-5-5" />
                </svg>
              </div>
              <h2 style={{ color: '#333', marginBottom: '1rem' }}>Email Verified!</h2>
              <p style={{ color: '#666', marginBottom: '1.5rem' }}>
                Your email has been successfully verified. Redirecting you to the generate page...
              </p>
            </>
          ) : (
            <>
              <div style={{
                width: '50px',
                height: '50px',
                background: '#FF3366',
                borderRadius: '50%',
                margin: '0 auto 1.5rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <svg 
                  width="24" 
                  height="24" 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  stroke="white"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" />
                  <path d="M12 8v4" />
                  <path d="M12 16h.01" />
                </svg>
              </div>
              <h2 style={{ color: '#333', marginBottom: '1rem' }}>Email Not Verified</h2>
              <p style={{ color: '#666', marginBottom: '1.5rem' }}>
                Please check your email and click the verification link. If you haven't received the email, you can request a new one.
              </p>

              {message.text && (
                <div style={{
                  padding: '1rem',
                  marginBottom: '1.5rem',
                  borderRadius: '8px',
                  backgroundColor: message.type === 'error' 
                    ? 'rgba(255, 51, 102, 0.1)' 
                    : 'rgba(72, 187, 120, 0.1)',
                  color: message.type === 'error'
                    ? '#FF3366'
                    : '#48BB78',
                  border: `1px solid ${
                    message.type === 'error'
                      ? '#FF3366'
                      : '#48BB78'
                  }`
                }}>
                  {message.text}
                </div>
              )}

              <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '1rem'
              }}>
                <button
                  onClick={handleResendEmail}
                  disabled={isLoading}
                  style={{
                    padding: '0.75rem 1.5rem',
                    background: '#FF3366',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '1rem',
                    fontWeight: '500',
                    cursor: isLoading ? 'not-allowed' : 'pointer',
                    opacity: isLoading ? 0.7 : 1
                  }}
                >
                  {isLoading ? 'Sending...' : 'Resend Verification Email'}
                </button>

                <button
                  onClick={() => router.replace('/login')}
                  style={{
                    padding: '0.75rem 1.5rem',
                    background: 'transparent',
                    color: '#666',
                    border: '1px solid #ddd',
                    borderRadius: '8px',
                    fontSize: '1rem',
                    fontWeight: '500',
                    cursor: 'pointer'
                  }}
                >
                  Back to Login
                </button>
              </div>
            </>
          )}
        </div>
      </main>
      <Footer />

      <style jsx global>{`
        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </div>
  );
} 