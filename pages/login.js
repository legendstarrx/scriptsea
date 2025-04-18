import React, { useState } from 'react';
import { useRouter } from 'next/router';
import { signInWithEmailAndPassword, signInWithPopup, signOut } from 'firebase/auth';
import { auth, googleProvider, db } from '../lib/firebase';
import { useAuth } from '../context/AuthContext';
import Navigation from '../components/Navigation';
import Footer from '../components/Footer';
import { useAuthRedirect } from '../hooks/useAuthRedirect';
import { getDoc, doc, updateDoc } from 'firebase/firestore';

export default function Login() {
  const router = useRouter();
  const { login, signInWithGoogle, logout } = useAuth();
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

  // This will handle redirecting authenticated users
  useAuthRedirect(true);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoadingAuth(true);
    
    try {
      await login(formData.email, formData.password);
      setMessage({
        type: 'success',
        text: 'Login successful! Redirecting...'
      });
      await router.replace('/generate');
    } catch (error) {
      setMessage({
        type: 'error',
        text: error.message || 'Login failed. Please try again.'
      });
    } finally {
      setIsLoadingAuth(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsLoadingAuth(true);
    setErrorMessage('');
    
    try {
      await signInWithGoogle();
      // Don't set any messages or do any redirects here
      // The redirect and user setup will be handled by AuthContext
    } catch (error) {
      console.error('Google Sign-in error:', error);
      setErrorMessage(
        error.message === 'Your account has been banned. Please contact support.' 
          ? error.message 
          : 'Failed to sign in with Google. Please try again.'
      );
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
      // Add password reset logic here
      setResetMessage({ type: 'success', text: 'Password reset instructions sent to your email!' });
      setShowResetModal(false);
    } catch (error) {
      setResetMessage({ type: 'error', text: error.message });
    } finally {
      setIsLoadingAuth(false);
    }
  };

  const handleEmailLogin = async (e) => {
    e.preventDefault();
    setIsLoadingAuth(true);
    setErrorMessage('');

    try {
      const userCredential = await signInWithEmailAndPassword(auth, formData.email, formData.password);
      const userId = userCredential.user.uid;

      // Check if user is banned
      const userDoc = await getDoc(doc(db, 'users', userId));
      if (userDoc.exists() && userDoc.data().banned) {
        await signOut(auth);
        throw new Error('Your account has been banned. Please contact support.');
      }

      // Update last login timestamp
      await updateDoc(doc(db, 'users', userId), {
        lastLogin: new Date().toISOString()
      });

      // Redirect to generate page
      router.replace('/generate');
    } catch (err) {
      console.error('Login error:', err);
      let errorMessage = 'An error occurred during login. Please try again.';
      
      if (err.message === 'Your account has been banned. Please contact support.') {
        errorMessage = err.message;
      } else if (err.code === 'auth/wrong-password' || err.code === 'auth/user-not-found') {
        errorMessage = 'Invalid email or password.';
      } else if (err.code === 'auth/too-many-requests') {
        errorMessage = 'Too many failed attempts. Please try again later.';
      }
      
      setErrorMessage(errorMessage);
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

          <form onSubmit={handleEmailLogin}>
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
    </div>
  );
} 