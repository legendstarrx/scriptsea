import React, { useState } from 'react';
import { useRouter } from 'next/router';
import { createUserWithEmailAndPassword, signInWithPopup } from 'firebase/auth';
import { auth, googleProvider } from '../lib/firebase';
import { useAuth } from '../context/AuthContext';
import Navigation from '../components/Navigation';
import Footer from '../components/Footer';
import { useAuthRedirect } from '../hooks/useAuthRedirect';

// List of temporary email domains to block
const TEMP_EMAIL_DOMAINS = [
  'tempmail.com',
  'temp-mail.org',
  'guerrillamail.com',
  'sharklasers.com',
  'mailinator.com',
  'yopmail.com',
  '10minutemail.com',
  'throwawaymail.com',
  'tempmail.net',
  'disposablemail.com'
];

// Password strength requirements
const PASSWORD_REQUIREMENTS = {
  minLength: 8,
  requireUppercase: true,
  requireLowercase: true,
  requireNumbers: true,
  requireSpecialChars: true
};

export default function Register() {
  useAuthRedirect();
  const router = useRouter();
  const { signup, signInWithGoogle } = useAuth();
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [passwordValidation, setPasswordValidation] = useState({
    length: false,
    uppercase: false,
    lowercase: false,
    number: false,
    special: false
  });

  const validateEmail = (email) => {
    // Basic email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return { valid: false, message: 'Please enter a valid email address' };
    }

    // Check for temporary email domains
    const domain = email.split('@')[1].toLowerCase();
    if (TEMP_EMAIL_DOMAINS.some(tempDomain => domain.includes(tempDomain))) {
      return { valid: false, message: 'Temporary email addresses are not allowed' };
    }

    return { valid: true };
  };

  const validatePassword = (password) => {
    return {
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /[0-9]/.test(password),
      special: /[!@#$%^&*(),.?":{}|<>]/.test(password)
    };
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    if (name === 'password') {
      setPasswordValidation(validatePassword(value));
    }

    // Clear any existing error messages
    setError('');
    setSuccess('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      // Basic validation
      if (!formData.fullName || !formData.email || !formData.password) {
        throw new Error('Please fill in all fields');
      }

      // Password validation
      const validation = validatePassword(formData.password);
      if (!Object.values(validation).every(Boolean)) {
        throw new Error('Please ensure your password meets all requirements');
      }

      setSuccess('Creating your account...');
      await signup(formData.email, formData.password, formData.fullName);
      setSuccess('Account created successfully! Redirecting...');
      
      // Delay redirect slightly to show success message
      setTimeout(() => {
        router.push('/generate');
      }, 1500);
    } catch (error) {
      console.error('Registration error:', error);
      setError(error.message || 'Failed to create account. Please try again.');
      setSuccess('');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      setSuccess('Signing in with Google...');
      const result = await signInWithGoogle();
      if (result?.user) {
        setSuccess('Sign in successful! Redirecting...');
        router.push('/generate');
      }
    } catch (error) {
      console.error('Google sign-in error:', error);
      setError(error.message || 'Failed to sign in with Google. Please try again.');
      setSuccess('');
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
        paddingTop: 'calc(80px + 2rem)',
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
            Create Your Account
          </h1>

          {(error || success) && (
            <div style={{
              padding: '1rem',
              marginBottom: '1rem',
              borderRadius: '8px',
              backgroundColor: error ? 'rgba(255, 51, 102, 0.1)' : 'rgba(72, 187, 120, 0.1)',
              color: error ? '#FF3366' : '#48BB78',
              border: `1px solid ${error ? '#FF3366' : '#48BB78'}`,
              animation: 'slideIn 0.3s ease'
            }}>
              {error || success}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div>
              <label style={{
                display: 'block',
                marginBottom: '8px',
                color: '#555',
                fontSize: '0.9rem'
              }}>
                Full Name
              </label>
              <input
                type="text"
                name="fullName"
                required
                value={formData.fullName}
                onChange={handleChange}
                style={{
                  width: '100%',
                  padding: '12px',
                  borderRadius: '8px',
                  border: '1px solid #ddd',
                  fontSize: '1rem',
                  transition: 'all 0.2s ease',
                  ':focus': {
                    outline: 'none',
                    borderColor: '#FF3366',
                    boxShadow: '0 0 0 2px rgba(255, 51, 102, 0.1)'
                  }
                }}
              />
            </div>

            <div>
              <label style={{
                display: 'block',
                marginBottom: '8px',
                color: '#555',
                fontSize: '0.9rem'
              }}>
                Email
              </label>
              <input
                type="email"
                name="email"
                required
                value={formData.email}
                onChange={handleChange}
                style={{
                  width: '100%',
                  padding: '12px',
                  borderRadius: '8px',
                  border: '1px solid #ddd',
                  fontSize: '1rem',
                  transition: 'all 0.2s ease',
                  ':focus': {
                    outline: 'none',
                    borderColor: '#FF3366',
                    boxShadow: '0 0 0 2px rgba(255, 51, 102, 0.1)'
                  }
                }}
              />
            </div>

            <div>
              <label style={{
                display: 'block',
                marginBottom: '8px',
                color: '#555',
                fontSize: '0.9rem'
              }}>
                Password
              </label>
              <input
                type="password"
                name="password"
                required
                value={formData.password}
                onChange={handleChange}
                style={{
                  width: '100%',
                  padding: '12px',
                  borderRadius: '8px',
                  border: '1px solid #ddd',
                  fontSize: '1rem',
                  transition: 'all 0.2s ease',
                  ':focus': {
                    outline: 'none',
                    borderColor: '#FF3366',
                    boxShadow: '0 0 0 2px rgba(255, 51, 102, 0.1)'
                  }
                }}
              />
              
              {/* Password requirements */}
              <div style={{
                marginTop: '0.75rem',
                padding: '0.75rem',
                backgroundColor: '#f8f9ff',
                borderRadius: '8px',
                fontSize: '0.8rem'
              }}>
                <div style={{
                  color: passwordValidation.length ? '#48BB78' : '#666',
                  marginBottom: '0.25rem'
                }}>
                  {passwordValidation.length ? '✓' : '○'} 8+ characters
                </div>
                <div style={{
                  color: passwordValidation.uppercase ? '#48BB78' : '#666',
                  marginBottom: '0.25rem'
                }}>
                  {passwordValidation.uppercase ? '✓' : '○'} Uppercase letter
                </div>
                <div style={{
                  color: passwordValidation.lowercase ? '#48BB78' : '#666',
                  marginBottom: '0.25rem'
                }}>
                  {passwordValidation.lowercase ? '✓' : '○'} Lowercase letter
                </div>
                <div style={{
                  color: passwordValidation.number ? '#48BB78' : '#666',
                  marginBottom: '0.25rem'
                }}>
                  {passwordValidation.number ? '✓' : '○'} Number
                </div>
                <div style={{
                  color: passwordValidation.special ? '#48BB78' : '#666'
                }}>
                  {passwordValidation.special ? '✓' : '○'} Special character
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              style={{
                background: isLoading ? '#FFE5EC' : '#FF3366',
                color: 'white',
                padding: '12px',
                borderRadius: '8px',
                border: 'none',
                fontSize: '1rem',
                fontWeight: '600',
                cursor: isLoading ? 'not-allowed' : 'pointer',
                opacity: isLoading ? 0.7 : 1,
                transition: 'all 0.2s ease',
                ':hover': {
                  background: '#FF1A53'
                }
              }}
            >
              {isLoading ? (
                <>
                  <span style={{
                    display: 'inline-block',
                    width: '16px',
                    height: '16px',
                    border: '2px solid #FF3366',
                    borderTopColor: 'transparent',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite'
                  }}></span>
                  Creating Account...
                </>
              ) : (
                'Create Account'
              )}
            </button>
          </form>

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
              src="https://www.google.com/favicon.ico"
              alt="Google"
              style={{ width: '20px', height: '20px' }}
            />
            Sign up with Google
          </button>

          <p style={{
            marginTop: '1.5rem',
            textAlign: 'center',
            color: '#666',
            fontSize: '0.875rem'
          }}>
            Already have an account?{' '}
            <a
              onClick={() => router.push('/login')}
              style={{
                color: '#FF3366',
                textDecoration: 'none',
                cursor: 'pointer'
              }}
            >
              Sign in
            </a>
          </p>
        </div>
      </main>
      <Footer />

      <style jsx global>{`
        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }
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