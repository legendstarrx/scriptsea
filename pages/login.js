import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { signInWithEmailAndPassword, signInWithPopup } from 'firebase/auth';
import { auth, googleProvider } from '../lib/firebase';
import { useAuth } from '../context/AuthContext';
import Navigation from '../components/Navigation';
import Footer from '../components/Footer';
import { useAuthRedirect } from '../hooks/useAuthRedirect';

export default function Login() {
  const isLoading = useAuthRedirect();
  const router = useRouter();
  const { login, signInWithGoogle, logout, resetPassword } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [message, setMessage] = useState({ type: '', text: '' });
  const [showResetPassword, setShowResetPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [showResetModal, setShowResetModal] = useState(false);
  const [resetMessage, setResetMessage] = useState(null);
  const [isLoadingAuth, setIsLoadingAuth] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isBanned, setIsBanned] = useState(false);
  const [isVPNDetected, setIsVPNDetected] = useState(false);

  // Check IP status on page load
  useEffect(() => {
    const checkIpStatus = async () => {
      try {
        const ipCheck = await fetch('/api/auth/check-ip', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json'
          }
        });
        
        if (!ipCheck.ok) {
          const errorData = await ipCheck.json();
          if (ipCheck.status === 403 && errorData.error) {
            setIsBanned(true);
            setMessage({
              type: 'error',
              text: errorData.message || 'Access denied. Please contact support.'
            });
          }
          return;
        }

        const ipData = await ipCheck.json();
        if (ipData.error === 'IP banned') {
          setIsBanned(true);
          setMessage({
            type: 'error',
            text: ipData.message
          });
        } else if (ipData.error === 'VPN detected') {
          setIsVPNDetected(true);
          setMessage({
            type: 'error',
            text: ipData.message || 'VPN usage is not allowed. Please disable your VPN to continue.'
          });
        }
      } catch (error) {
        console.error('Error checking IP status:', error);
      }
    };

    checkIpStatus();
  }, []);

  const isAccessBlocked = isBanned || isVPNDetected;

  if (isLoading) {
    return <div>Loading...</div>;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoadingAuth(true);
    setErrorMessage('');
    
    try {
      // Check if IP is banned before attempting login
      const ipCheck = await fetch('/api/auth/check-ip', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!ipCheck.ok) {
        const errorData = await ipCheck.json();
        if (ipCheck.status === 403 && errorData.error) {
          throw new Error(errorData.message || 'Access denied. Please contact support.');
        }
      }

      const ipData = await ipCheck.json();
      if (ipData.error === 'IP banned' || ipData.error === 'VPN detected') {
        throw new Error(ipData.message);
      }

      const user = await login(formData.email, formData.password);
      if (user) {
        setMessage({
          type: 'success',
          text: 'Login successful! Redirecting...'
        });
        router.push('/generate');
      }
    } catch (error) {
      console.error('Login error:', error);
      let errorMessage = 'Login failed. Please try again.';
      
      if (error.code === 'auth/invalid-credential' || error.code === 'auth/wrong-password') {
        errorMessage = 'Incorrect password. Please try again.';
      } else if (error.code === 'auth/user-not-found') {
        errorMessage = 'No account found with this email. Please check your email or sign up.';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'Please enter a valid email address.';
      } else if (error.code === 'auth/too-many-requests') {
        errorMessage = 'Too many failed attempts. Please try again later or reset your password.';
      } else if (error.code === 'auth/network-request-failed') {
        errorMessage = 'Network error. Please check your internet connection and try again.';
      } else if (error.message.includes('banned') || error.message.includes('VPN detected')) {
        errorMessage = error.message;
      }
      
      setMessage({
        type: 'error',
        text: errorMessage
      });
    } finally {
      setIsLoadingAuth(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsLoadingAuth(true);
    setErrorMessage('');
    setMessage({ type: '', text: '' }); // Clear any existing messages
    
    try {
      const result = await signInWithGoogle();
      if (result?.user) {
        try {
          // Check IP after successful sign-in
          const ipCheck = await fetch('/api/auth/check-ip', {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json'
            }
          });

          if (!ipCheck.ok) {
            const errorData = await ipCheck.json();
            if (ipCheck.status === 403 && errorData.error) {
              // Set error message first
              setMessage({
                type: 'error',
                text: errorData.message || 'Access denied. Please contact support.'
              });
              // Then log out
              await logout();
              setIsLoadingAuth(false);
              return; // Return early to prevent redirect
            }
          }
          
          const ipData = await ipCheck.json();
          if (ipData.error === 'IP banned' || ipData.error === 'VPN detected') {
            // Set error message first
            setMessage({
              type: 'error',
              text: ipData.message
            });
            // Then log out
            await logout();
            setIsLoadingAuth(false);
            return; // Return early to prevent redirect
          }

          // If not banned, proceed with success
          setMessage({
            type: 'success',
            text: 'Login successful! Redirecting...'
          });
          await router.replace('/generate');
        } catch (ipError) {
          // Handle IP check error
          console.error('IP check error:', ipError);
          await logout(); // Log out user if IP check fails
          setMessage({
            type: 'error',
            text: ipError.message || 'Error checking IP address. Please try again.'
          });
        }
      }
    } catch (error) {
      console.error('Google Sign-in error:', error);
      let errorMessage = '';
      
      if (error.code === 'auth/popup-blocked') {
        errorMessage = 'Popup was blocked. Please allow popups for this site to use Google sign-in.';
      } else if (error.code === 'auth/cancelled-popup-request' || error.code === 'auth/popup-closed-by-user') {
        // Don't show error for user-initiated popup closures
        return;
      } else if (error.code === 'auth/network-request-failed') {
        errorMessage = 'Network error. Please check your connection and try again.';
      } else {
        // For any other errors, show a generic message
        errorMessage = 'Failed to sign in with Google. Please try again or use email/password.';
      }
      
      if (errorMessage) {
        setMessage({
          type: 'error',
          text: errorMessage
        });
      }
    } finally {
      setIsLoadingAuth(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear message when user starts typing
    setMessage({ type: '', text: '' });
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setIsLoadingAuth(true);
    
    try {
      await resetPassword(resetEmail);
      setResetMessage({ type: 'success', text: 'Password reset instructions sent to your email!' });
      setShowResetModal(false);
    } catch (error) {
      setResetMessage({ type: 'error', text: error.message });
    } finally {
      setIsLoadingAuth(false);
    }
  };

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
        padding: '1rem',
        background: 'linear-gradient(135deg, #fff5f7 0%, #ffffff 100%)'
      }}>
        <div style={{
          width: '100%',
          maxWidth: '400px',
          padding: '2rem',
          paddingTop: '2rem',
          background: 'white',
          borderRadius: '16px',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)',
          marginTop: '80px'
        }}>
          <h1 style={{
            fontSize: 'clamp(1.5rem, 4vw, 2rem)',
            color: '#333',
            marginBottom: '2rem',
            textAlign: 'center'
          }}>
            Login to Your Account
          </h1>

          {message.text && (
            <div style={{
              padding: '1rem',
              marginBottom: '1rem',
              borderRadius: '8px',
              backgroundColor: message.type === 'error' ? 'rgba(255, 51, 102, 0.1)' : 'rgba(72, 187, 120, 0.1)',
              color: message.type === 'error' ? '#FF3366' : '#48BB78',
              border: `1px solid ${message.type === 'error' ? '#FF3366' : '#48BB78'}`,
              animation: 'slideIn 0.3s ease',
              textAlign: 'center'
            }}>
              {message.text}
            </div>
          )}

          {errorMessage && (
            <div style={{
              padding: '1rem',
              marginBottom: '1rem',
              borderRadius: '8px',
              backgroundColor: 'rgba(255, 51, 102, 0.1)',
              color: '#FF3366',
              border: '1px solid #FF3366',
              animation: 'slideIn 0.3s ease',
              textAlign: 'center'
            }}>
              {errorMessage}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{
                display: 'block',
                marginBottom: '0.5rem',
                color: '#666',
                fontSize: '0.875rem'
              }}>
                Email
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                disabled={isAccessBlocked}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #ddd',
                  borderRadius: '8px',
                  fontSize: '1rem',
                  opacity: isAccessBlocked ? 0.6 : 1,
                  cursor: isAccessBlocked ? 'not-allowed' : 'text'
                }}
              />
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{
                display: 'block',
                marginBottom: '0.5rem',
                color: '#666',
                fontSize: '0.875rem'
              }}>
                Password
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                disabled={isAccessBlocked}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #ddd',
                  borderRadius: '8px',
                  fontSize: '1rem',
                  opacity: isAccessBlocked ? 0.6 : 1,
                  cursor: isAccessBlocked ? 'not-allowed' : 'text'
                }}
              />
              <div style={{
                textAlign: 'right',
                marginTop: '0.5rem'
              }}>
                <button
                  type="button"
                  onClick={() => setShowResetModal(true)}
                  disabled={isAccessBlocked}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#FF3366',
                    fontSize: '0.875rem',
                    cursor: isAccessBlocked ? 'not-allowed' : 'pointer',
                    padding: '0.25rem 0.5rem',
                    opacity: isAccessBlocked ? 0.6 : 1
                  }}
                >
                  Forgot Password?
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoadingAuth || isAccessBlocked}
              style={{
                width: '100%',
                padding: '12px',
                backgroundColor: isAccessBlocked ? '#e0e0e0' : '#FF3366',
                color: isAccessBlocked ? '#999' : 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '1rem',
                fontWeight: '500',
                cursor: isAccessBlocked ? 'not-allowed' : 'pointer',
                opacity: isLoadingAuth || isAccessBlocked ? 0.7 : 1,
                transition: 'all 0.2s'
              }}
            >
              {isLoadingAuth ? 'Signing in...' : 'Sign in'}
            </button>

            <div style={{
              display: 'flex',
              alignItems: 'center',
              margin: '1.5rem 0',
              gap: '1rem'
            }}>
              <div style={{ flex: 1, height: '1px', background: '#eee' }} />
              <span style={{ color: '#666', fontSize: '0.875rem' }}>or</span>
              <div style={{ flex: 1, height: '1px', background: '#eee' }} />
            </div>

            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={isLoadingAuth || isAccessBlocked}
              style={{
                width: '100%',
                padding: '12px',
                backgroundColor: isAccessBlocked ? '#f5f5f5' : 'white',
                color: isAccessBlocked ? '#999' : '#333',
                border: '1px solid #ddd',
                borderRadius: '8px',
                fontSize: '1rem',
                fontWeight: '500',
                cursor: isAccessBlocked ? 'not-allowed' : 'pointer',
                opacity: isLoadingAuth || isAccessBlocked ? 0.7 : 1,
                transition: 'all 0.2s',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px'
              }}
            >
              <img src="/google.svg" alt="Google" style={{ 
                width: '20px', 
                height: '20px',
                opacity: isAccessBlocked ? 0.5 : 1 
              }} />
              Sign in with Google
            </button>

            <p style={{
              marginTop: '1.5rem',
              textAlign: 'center',
              color: '#666',
              fontSize: '0.875rem'
            }}>
              Don't have an account?{' '}
              <a
                onClick={() => !isAccessBlocked && router.push('/register')}
                style={{
                  color: isAccessBlocked ? '#999' : '#FF3366',
                  textDecoration: 'none',
                  cursor: isAccessBlocked ? 'not-allowed' : 'pointer',
                  opacity: isAccessBlocked ? 0.7 : 1
                }}
              >
                Sign up
              </a>
            </p>
          </form>
        </div>
      </main>
      <Footer />

      {/* Reset Password Modal */}
      {showResetModal && !isAccessBlocked && (
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
          zIndex: 1000
        }}>
          <div style={{
            background: 'white',
            padding: '2rem',
            borderRadius: '12px',
            width: '100%',
            maxWidth: '400px',
            position: 'relative'
          }}>
            <button
              onClick={() => {
                setShowResetModal(false);
                setResetMessage(null);
              }}
              style={{
                position: 'absolute',
                top: '1rem',
                right: '1rem',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                fontSize: '1.5rem',
                color: '#666'
              }}
            >
              ×
            </button>

            <h2 style={{
              fontSize: '1.5rem',
              color: '#333',
              marginBottom: '1.5rem',
              textAlign: 'center'
            }}>
              Reset Password
            </h2>

            {resetMessage && (
              <div style={{
                padding: '1rem',
                marginBottom: '1rem',
                borderRadius: '8px',
                backgroundColor: resetMessage.type === 'error' ? '#FEE2E2' : '#DCFCE7',
                color: resetMessage.type === 'error' ? '#DC2626' : '#16A34A',
                textAlign: 'center'
              }}>
                {resetMessage.text}
              </div>
            )}

            <form onSubmit={handleResetPassword}>
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{
                  display: 'block',
                  marginBottom: '0.5rem',
                  color: '#666',
                  fontSize: '0.875rem'
                }}>
                  Email
                </label>
                <input
                  type="email"
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                  required
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #ddd',
                    borderRadius: '8px',
                    fontSize: '1rem'
                  }}
                />
              </div>

              <button
                type="submit"
                disabled={isLoadingAuth}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  background: '#FF3366',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '1rem',
                  fontWeight: '500',
                  cursor: 'pointer'
                }}
              >
                {isLoadingAuth ? 'Sending...' : 'Send Reset Link'}
              </button>
            </form>
          </div>
        </div>
      )}

      <style jsx global>{`
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
} 