import React, { useState } from 'react';
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

  if (isLoading) {
    return <div>Loading...</div>;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoadingAuth(true);
    setErrorMessage('');
    
    try {
      // Check if IP is banned before attempting login
      const ipCheck = await fetch('/api/auth/check-ip');
      const ipData = await ipCheck.json();
      
      if (ipData.error === 'IP banned') {
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
      
      if (error.code === 'auth/wrong-password' || error.code === 'auth/user-not-found') {
        errorMessage = 'Incorrect email or password.';
      } else if (error.code === 'auth/too-many-requests') {
        errorMessage = 'Too many failed attempts. Please try again later.';
      } else if (error.message.includes('banned')) {
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
    
    try {
      // Check if IP is banned before attempting Google sign-in
      const ipCheck = await fetch('/api/auth/check-ip');
      const ipData = await ipCheck.json();
      
      if (ipData.error === 'IP banned') {
        throw new Error(ipData.message);
      }

      const result = await signInWithGoogle();
      if (result?.user) {
        setMessage({
          type: 'success',
          text: 'Login successful! Redirecting...'
        });
        await router.replace('/generate');
      }
    } catch (error) {
      console.error('Google Sign-in error:', error);
      let errorMessage = 'Failed to sign in with Google. Please try again.';
      
      if (error.message.includes('banned')) {
        errorMessage = error.message;
      }
      
      setErrorMessage(errorMessage);
      if (error.message.includes('banned')) {
        await logout();
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
          background: 'white',
          borderRadius: '16px',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)',
          marginTop: '2rem'
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
            <div
              style={{
                padding: '1rem',
                marginBottom: '1rem',
                borderRadius: '8px',
                backgroundColor: message.type === 'error' ? '#FEE2E2' : '#DCFCE7',
                color: message.type === 'error' ? '#DC2626' : '#16A34A',
                textAlign: 'center'
              }}
            >
              {message.text}
            </div>
          )}

          {errorMessage && (
            <div style={{
              padding: '1rem',
              marginBottom: '1rem',
              backgroundColor: '#FEE2E2',
              color: '#DC2626',
              borderRadius: '8px',
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
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #ddd',
                  borderRadius: '8px',
                  fontSize: '1rem'
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
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #ddd',
                  borderRadius: '8px',
                  fontSize: '1rem'
                }}
              />
              <div style={{
                textAlign: 'right',
                marginTop: '0.5rem'
              }}>
                <button
                  type="button"
                  onClick={() => setShowResetModal(true)}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#FF3366',
                    fontSize: '0.875rem',
                    cursor: 'pointer',
                    padding: '0.25rem 0.5rem'
                  }}
                >
                  Forgot Password?
                </button>
              </div>
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
                cursor: 'pointer',
                marginBottom: '1rem'
              }}
            >
              {isLoadingAuth ? 'Signing in...' : 'Sign In'}
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
              style={{
                width: '100%',
                padding: '0.75rem',
                background: 'white',
                color: '#666',
                border: '1px solid #ddd',
                borderRadius: '8px',
                fontSize: '1rem',
                fontWeight: '500',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem'
              }}
            >
              <img
                src="/google.svg"
                alt="Google"
                style={{ width: '20px', height: '20px' }}
              />
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
                onClick={() => router.push('/register')}
                style={{
                  color: '#FF3366',
                  textDecoration: 'none',
                  cursor: 'pointer'
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
      {showResetModal && (
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
    </div>
  );
} 