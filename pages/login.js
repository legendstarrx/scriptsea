import React, { useState } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../context/AuthContext';
import Navigation from '../components/Navigation';
import Footer from '../components/Footer';
import { useAuthRedirect } from '../hooks/useAuthRedirect';

export default function Login() {
  const isRedirectLoading = useAuthRedirect();
  const router = useRouter();
  const { login, signInWithGoogle, resetPassword } = useAuth();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [message, setMessage] = useState({ type: '', text: '' });
  const [showResetModal, setShowResetModal] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  if (isRedirectLoading) return <div>Loading...</div>;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage({ type: '', text: '' });
    try {
      await login(formData.email, formData.password);
      setMessage({ type: 'success', text: 'Login successful! Redirecting...' });
      await router.replace('/generate');
    } catch (error) {
      const text = error?.message?.toLowerCase().includes('invalid')
        ? 'Invalid login details. Please try again.'
        : 'Login failed. Please try again.';
      setMessage({ type: 'error', text });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    setMessage({ type: '', text: '' });
    try {
      await signInWithGoogle();
    } catch (error) {
      setMessage({ type: 'error', text: error?.message || 'Google sign-in failed.' });
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await resetPassword(resetEmail);
      setMessage({ type: 'success', text: 'Password reset instructions sent.' });
      setShowResetModal(false);
      setResetEmail('');
    } catch (error) {
      setMessage({ type: 'error', text: error?.message || 'Failed to send reset email.' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navigation />
      <main
        style={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '1rem',
          background: 'linear-gradient(135deg, #fff5f7 0%, #ffffff 100%)'
        }}
      >
        <div
          style={{
            width: '100%',
            maxWidth: '420px',
            padding: '2rem',
            background: 'white',
            borderRadius: '16px',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)',
            marginTop: '80px'
          }}
        >
          <h1 style={{ fontSize: '1.9rem', color: '#333', marginBottom: '1.5rem', textAlign: 'center' }}>
            Login
          </h1>

          {message.text && (
            <div
              style={{
                padding: '1rem',
                marginBottom: '1rem',
                borderRadius: '8px',
                backgroundColor: message.type === 'error' ? 'rgba(255, 51, 102, 0.1)' : 'rgba(72, 187, 120, 0.1)',
                color: message.type === 'error' ? '#FF3366' : '#48BB78',
                border: `1px solid ${message.type === 'error' ? '#FF3366' : '#48BB78'}`,
                textAlign: 'center'
              }}
            >
              {message.text}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '.5rem', color: '#666', fontSize: '.875rem' }}>
                Email
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={(e) => setFormData((p) => ({ ...p, email: e.target.value }))}
                required
                style={{ width: '100%', padding: '.75rem', border: '1px solid #ddd', borderRadius: '8px' }}
              />
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '.5rem', color: '#666', fontSize: '.875rem' }}>
                Password
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={(e) => setFormData((p) => ({ ...p, password: e.target.value }))}
                required
                style={{ width: '100%', padding: '.75rem', border: '1px solid #ddd', borderRadius: '8px' }}
              />
              <div style={{ textAlign: 'right', marginTop: '.5rem' }}>
                <button
                  type="button"
                  onClick={() => setShowResetModal(true)}
                  style={{ background: 'none', border: 'none', color: '#FF3366', cursor: 'pointer' }}
                >
                  Forgot Password?
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              style={{
                width: '100%',
                padding: '12px',
                backgroundColor: '#FF3366',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '1rem',
                fontWeight: '500',
                cursor: 'pointer',
                opacity: isLoading ? 0.7 : 1
              }}
            >
              {isLoading ? 'Signing in...' : 'Sign in'}
            </button>
          </form>

          <div style={{ display: 'flex', alignItems: 'center', margin: '1.2rem 0', gap: '1rem' }}>
            <div style={{ flex: 1, height: '1px', background: '#eee' }} />
            <span style={{ color: '#666', fontSize: '.875rem' }}>or</span>
            <div style={{ flex: 1, height: '1px', background: '#eee' }} />
          </div>

          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={isLoading}
            style={{
              width: '100%',
              padding: '12px',
              backgroundColor: 'white',
              color: '#333',
              border: '1px solid #ddd',
              borderRadius: '8px',
              fontSize: '1rem',
              fontWeight: '500',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px'
            }}
          >
            <img src="/google.svg" alt="Google" style={{ width: '20px', height: '20px' }} />
            Continue with Google
          </button>

          <p style={{ marginTop: '1.25rem', textAlign: 'center', color: '#666', fontSize: '.875rem' }}>
            Don't have an account?{' '}
            <a onClick={() => router.push('/register')} style={{ color: '#FF3366', cursor: 'pointer' }}>
              Sign up
            </a>
          </p>
        </div>
      </main>
      <Footer />

      {showResetModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0,0,0,.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000
          }}
        >
          <div style={{ background: 'white', padding: '2rem', borderRadius: '12px', width: '100%', maxWidth: '400px' }}>
            <h2 style={{ marginBottom: '1rem' }}>Reset Password</h2>
            <form onSubmit={handleResetPassword}>
              <input
                type="email"
                value={resetEmail}
                onChange={(e) => setResetEmail(e.target.value)}
                placeholder="Your email"
                required
                style={{ width: '100%', padding: '.75rem', border: '1px solid #ddd', borderRadius: '8px', marginBottom: '1rem' }}
              />
              <div style={{ display: 'flex', gap: '.75rem' }}>
                <button type="submit" style={{ flex: 1, padding: '.75rem', background: '#FF3366', color: 'white', border: 'none', borderRadius: '8px' }}>
                  Send
                </button>
                <button
                  type="button"
                  onClick={() => setShowResetModal(false)}
                  style={{ flex: 1, padding: '.75rem', background: 'white', color: '#FF3366', border: '1px solid #FF3366', borderRadius: '8px' }}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
