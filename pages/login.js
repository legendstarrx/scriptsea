import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { auth } from '../lib/firebase';
import { useAuth } from '../context/AuthContext';
import Navigation from '../components/Navigation';
import Footer from '../components/Footer';

export default function Login() {
  const router = useRouter();
  const { user, signIn } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [message, setMessage] = useState({ type: '', text: '' });
  const [showResetPassword, setShowResetPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);
  const [resetMessage, setResetMessage] = useState(null);

  useEffect(() => {
    if (user) {
      router.push('/dashboard');
    }
  }, [user, router]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      await signIn();
      setMessage({
        type: 'success',
        text: 'Login successful! Redirecting...'
      });
      
      setTimeout(() => {
        router.push('/generate');
      }, 1500);
    } catch (error) {
      setMessage({
        type: 'error',
        text: error.message || 'Login failed. Please try again.'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = async () => {
    try {
      await signIn();
      router.push('/dashboard');
    } catch (error) {
      console.error('Login failed:', error);
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
    setIsLoading(true);
    
    try {
      // Add password reset logic here
      setResetMessage({ type: 'success', text: 'Password reset instructions sent to your email!' });
      setShowResetModal(false);
    } catch (error) {
      setResetMessage({ type: 'error', text: error.message });
    } finally {
      setIsLoading(false);
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
            <div style={{
              padding: '1rem',
              marginBottom: '1rem',
              borderRadius: '8px',
              backgroundColor: message.type === 'success' ? 'rgba(255, 51, 102, 0.1)' : 'rgba(255, 51, 102, 0.1)',
              color: message.type === 'success' ? '#FF3366' : '#FF3366',
              border: '1px solid #FF3366',
              animation: 'slideIn 0.3s ease'
            }}>
              {message.text}
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
            </div>

            <button
              type="submit"
              disabled={isLoading}
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
              {isLoading ? 'Signing in...' : 'Sign In'}
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
              onClick={handleLogin}
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
                src="/google-icon.png"
                alt="Google"
                style={{ width: '20px', height: '20px' }}
              />
              Continue with Google
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