import React, { useState } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../context/AuthContext';
import Navigation from '../components/Navigation';
import Footer from '../components/Footer';

export default function VerifyEmail() {
  const router = useRouter();
  const { user, checkEmailVerification, resendVerificationEmail, logout } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

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

  const handleCheckVerification = async () => {
    setIsLoading(true);
    try {
      const isVerified = await checkEmailVerification();
      if (isVerified) {
        router.push('/generate');
      } else {
        setMessage({
          type: 'info',
          text: 'Email not verified yet. Please check your inbox.'
        });
      }
    } catch (error) {
      setMessage({
        type: 'error',
        text: 'Error checking verification status.'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  if (!user) {
    router.push('/login');
    return null;
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
        padding: '1rem',
        background: 'linear-gradient(135deg, #fff5f7 0%, #ffffff 100%)'
      }}>
        <div style={{
          width: '100%',
          maxWidth: '500px',
          padding: '2rem',
          background: 'white',
          borderRadius: '16px',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)',
          textAlign: 'center'
        }}>
          <h1 style={{
            fontSize: 'clamp(1.5rem, 4vw, 2rem)',
            color: '#333',
            marginBottom: '1rem'
          }}>
            Verify Your Email
          </h1>
          
          <p style={{
            color: '#666',
            marginBottom: '2rem',
            lineHeight: '1.6'
          }}>
            We've sent a verification email to {user.email}. Please check your inbox and click the verification link to continue.
          </p>

          {message.text && (
            <div style={{
              padding: '1rem',
              marginBottom: '1.5rem',
              borderRadius: '8px',
              backgroundColor: message.type === 'error' 
                ? 'rgba(255, 51, 102, 0.1)' 
                : message.type === 'success'
                ? 'rgba(72, 187, 120, 0.1)'
                : 'rgba(59, 130, 246, 0.1)',
              color: message.type === 'error'
                ? '#FF3366'
                : message.type === 'success'
                ? '#48BB78'
                : '#3B82F6',
              border: `1px solid ${
                message.type === 'error'
                  ? '#FF3366'
                  : message.type === 'success'
                  ? '#48BB78'
                  : '#3B82F6'
              }`
            }}>
              {message.text}
            </div>
          )}

          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem',
            marginBottom: '2rem'
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
              onClick={handleCheckVerification}
              disabled={isLoading}
              style={{
                padding: '0.75rem 1.5rem',
                background: 'white',
                color: '#666',
                border: '1px solid #ddd',
                borderRadius: '8px',
                fontSize: '1rem',
                fontWeight: '500',
                cursor: isLoading ? 'not-allowed' : 'pointer',
                opacity: isLoading ? 0.7 : 1
              }}
            >
              {isLoading ? 'Checking...' : 'Check Verification Status'}
            </button>

            <button
              onClick={handleLogout}
              style={{
                padding: '0.75rem 1.5rem',
                background: 'transparent',
                color: '#666',
                border: 'none',
                fontSize: '0.875rem',
                cursor: 'pointer'
              }}
            >
              Logout
            </button>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
} 