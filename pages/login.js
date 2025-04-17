import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../context/AuthContext';
import Navigation from '../components/Navigation';
import Footer from '../components/Footer';
import { toast } from 'react-toastify';

export default function Login() {
  const router = useRouter();
  const { login, signInWithGoogle } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [message, setMessage] = useState({ type: '', text: '' });
  const [isLoading, setIsLoading] = useState(false);
  const { error } = router.query;

  useEffect(() => {
    if (error === 'banned') {
      toast.error('Your account has been banned. Please contact support for more information.');
    }
  }, [error]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      await login(formData.email, formData.password);
      router.push('/generate');
    } catch (error) {
      setMessage({
        type: 'error',
        text: error.message || 'Login failed. Please try again.'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    try {
      await signInWithGoogle();
      router.push('/generate');
    } catch (error) {
      setMessage({
        type: 'error',
        text: error.message || 'Google sign-in failed. Please try again.'
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <Navigation />
      <main style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem',
        background: '#f9fafb'
      }}>
        <div style={{
          width: '100%',
          maxWidth: '400px',
          padding: '2rem',
          background: 'white',
          borderRadius: '12px',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
          animation: 'slideIn 0.5s ease-out'
        }}>
          <h1 style={{
            fontSize: '1.875rem',
            fontWeight: '700',
            textAlign: 'center',
            marginBottom: '2rem',
            color: '#1F2937'
          }}>Sign in to your account</h1>

          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '1.5rem' }}>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #ddd',
                  borderRadius: '8px',
                  fontSize: '1rem'
                }}
                placeholder="Email address"
              />
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #ddd',
                  borderRadius: '8px',
                  fontSize: '1rem'
                }}
                placeholder="Password"
              />
            </div>

            {message.text && (
              <div style={{
                color: message.type === 'error' ? '#DC2626' : '#059669',
                marginBottom: '1rem',
                fontSize: '0.875rem'
              }}>
                {message.text}
              </div>
            )}

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
                cursor: isLoading ? 'not-allowed' : 'pointer'
              }}
            >
              {isLoading ? 'Signing in...' : 'Sign In'}
            </button>

            <div style={{
              margin: '1.5rem 0',
              display: 'flex',
              alignItems: 'center',
              gap: '1rem'
            }}>
              <div style={{ flex: 1, height: '1px', background: '#ddd' }} />
              <span style={{ color: '#666' }}>or</span>
              <div style={{ flex: 1, height: '1px', background: '#ddd' }} />
            </div>

            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={isLoading}
              style={{
                width: '100%',
                padding: '0.75rem',
                background: 'white',
                color: '#666',
                border: '1px solid #ddd',
                borderRadius: '8px',
                fontSize: '1rem',
                fontWeight: '500',
                cursor: isLoading ? 'not-allowed' : 'pointer',
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
                href="/register"
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