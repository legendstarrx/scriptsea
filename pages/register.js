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
  'disposablemail.com',
  'fakeinbox.com',
  'tempinbox.com',
  'trashmail.com',
  'getairmail.com',
  'tempmailaddress.com',
  'maildrop.cc',
  'getnada.com',
  'mailnesia.com',
  'mintemail.com',
  'spamgourmet.com',
  'tempail.com',
  'tempemail.net',
  'tempmailo.com',
  'tempomail.fr',
  'temporarymail.net',
  'throwawaymail.com',
  'tmpmail.org',
  'trashmail.com',
  'trashmail.io',
  'trashmail.net',
  'trashmailer.com',
  'trashymail.com',
  'wegwerfmail.de',
  'wegwerfmail.net',
  'wegwerfmail.org'
];

// List of allowed email domains
const ALLOWED_EMAIL_DOMAINS = [
  'gmail.com',
  'yahoo.com',
  'outlook.com',
  'hotmail.com',
  'aol.com',
  'icloud.com',
  'protonmail.com',
  'zoho.com',
  'mail.com',
  'yandex.com',
  'gmx.com',
  'live.com',
  'msn.com',
  'me.com',
  'mac.com',
  'inbox.com',
  'fastmail.com',
  'tutanota.com',
  'mail.ru',
  'qq.com',
  '163.com',
  '126.com',
  'yeah.net',
  'sina.com',
  'sohu.com',
  'aliyun.com',
  'naver.com',
  'daum.net',
  'kakao.com',
  'hanmail.net',
  'nate.com',
  'web.de',
  'gmx.de',
  't-online.de',
  'freenet.de',
  'arcor.de',
  '1und1.de',
  'virgilio.it',
  'libero.it',
  'alice.it',
  'tin.it',
  'wanadoo.fr',
  'orange.fr',
  'sfr.fr',
  'free.fr',
  'laposte.net',
  'neuf.fr',
  'numericable.fr',
  'bbox.fr',
  'club-internet.fr',
  'voila.fr',
  'noos.fr',
  'tele2.fr',
  'tiscali.fr',
  'aol.fr',
  'gmx.fr',
  'yahoo.fr',
  'hotmail.fr',
  'outlook.fr',
  'live.fr',
  'msn.fr',
  'me.com',
  'mac.com',
  'icloud.com',
  'protonmail.com',
  'tutanota.com',
  'mail.com',
  'gmx.com',
  'web.de',
  't-online.de',
  'freenet.de',
  'arcor.de',
  '1und1.de',
  'virgilio.it',
  'libero.it',
  'alice.it',
  'tin.it',
  'wanadoo.fr',
  'orange.fr',
  'sfr.fr',
  'free.fr',
  'laposte.net',
  'neuf.fr',
  'numericable.fr',
  'bbox.fr',
  'club-internet.fr',
  'voila.fr',
  'noos.fr',
  'tele2.fr',
  'tiscali.fr',
  'aol.fr',
  'gmx.fr',
  'yahoo.fr',
  'hotmail.fr',
  'outlook.fr',
  'live.fr',
  'msn.fr'
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
  const { signup, signInWithGoogle, logout } = useAuth();
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: ''
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
  const [isLoadingAuth, setIsLoadingAuth] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const validateEmail = (email) => {
    // Basic email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return { valid: false, message: 'Please enter a valid email address' };
    }

    // Check for temporary email domains
    const domain = email.split('@')[1].toLowerCase();
    if (TEMP_EMAIL_DOMAINS.some(tempDomain => domain.includes(tempDomain))) {
      return { 
        valid: false, 
        message: 'Temporary email addresses are not allowed. Please use a personal email from providers like Gmail, Yahoo, Outlook, etc.' 
      };
    }

    // Check if domain is in allowed list
    if (!ALLOWED_EMAIL_DOMAINS.some(allowedDomain => domain === allowedDomain)) {
      return { 
        valid: false, 
        message: 'Please use a personal email from major providers like Gmail, Yahoo, Outlook, etc. Temporary or disposable emails are not allowed.' 
      };
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
      // Check if IP is banned before attempting registration
      const ipCheck = await fetch('/api/auth/check-ip');
      const ipData = await ipCheck.json();
      
      if (ipData.error === 'IP banned') {
        throw new Error(ipData.message);
      }

      // Basic validation
      if (!formData.fullName || !formData.email || !formData.password || !formData.confirmPassword) {
        throw new Error('Please fill in all fields');
      }

      // Email validation
      const emailValidation = validateEmail(formData.email);
      if (!emailValidation.valid) {
        throw new Error(emailValidation.message);
      }

      // Password validation
      const validation = validatePassword(formData.password);
      if (!Object.values(validation).every(Boolean)) {
        throw new Error('Please ensure your password meets all requirements');
      }

      // Confirm password validation
      if (formData.password !== formData.confirmPassword) {
        throw new Error('Passwords do not match');
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
      let errorMessage = 'Failed to create account. Please try again.';
      
      if (error.code === 'auth/email-already-in-use') {
        errorMessage = 'This email is already registered. Please try logging in or use a different email.';
      } else if (error.code === 'auth/weak-password') {
        errorMessage = 'Password is too weak. Please use a stronger password with at least 8 characters, including uppercase, lowercase, numbers, and special characters.';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'Please enter a valid email address.';
      } else if (error.code === 'auth/network-request-failed') {
        errorMessage = 'Network error. Please check your internet connection and try again.';
      } else if (error.code === 'auth/operation-not-allowed') {
        errorMessage = 'Email/password accounts are not enabled. Please contact support.';
      } else if (error.message.includes('banned')) {
        errorMessage = error.message;
      } else {
        errorMessage = error.message;
      }
      
      setError(errorMessage);
      setSuccess('');
    } finally {
      setIsLoading(false);
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
        setSuccess('Registration successful! Redirecting...');
        await router.replace('/generate');
      }
    } catch (error) {
      console.error('Google Sign-in error:', error);
      let errorMessage = 'Failed to sign in with Google. Please try again.';
      
      if (error.message.includes('banned')) {
        errorMessage = error.message;
        setError(errorMessage);
      } else if (error.code === 'auth/popup-blocked' || error.code === 'auth/popup-closed-by-user') {
        errorMessage = 'Please unblock popups in your browser or sign in using email and password.';
        setError(errorMessage);
      } else if (error.code === 'auth/email-already-in-use') {
        errorMessage = 'This email is already registered. Please try logging in with your email and password.';
        setError(errorMessage);
      }
      
      setErrorMessage(errorMessage);
      if (error.message.includes('banned')) {
        await logout();
      }
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
        paddingTop: 'calc(50px + 1rem)',
        background: 'linear-gradient(135deg, #fff5f7 0%, #ffffff 100%)'
      }}>
        <div style={{
          width: '100%',
          maxWidth: '400px',
          padding: '2.5rem',
          background: 'white',
          borderRadius: '16px',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)',
          marginTop: '1rem'
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

            <div>
              <label style={{
                display: 'block',
                marginBottom: '8px',
                color: '#555',
                fontSize: '0.9rem'
              }}>
                Confirm Password
              </label>
              <input
                type="password"
                name="confirmPassword"
                required
                value={formData.confirmPassword}
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
            disabled={isLoadingAuth}
            style={{
              width: '100%',
              padding: '0.75rem',
              background: 'white',
              color: '#666',
              border: '1px solid #ddd',
              borderRadius: '8px',
              fontSize: '1rem',
              fontWeight: '500',
              cursor: isLoadingAuth ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              transition: 'all 0.2s ease',
              ':hover': {
                background: '#f8f9ff'
              }
            }}
          >
            <img
              src="/google.svg"
              alt="Google"
              style={{ width: '20px', height: '20px' }}
            />
            {isLoadingAuth ? 'Signing up...' : 'Sign up with Google'}
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