import React, { useState } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../context/AuthContext';
import Navigation from '../components/Navigation';
import Footer from '../components/Footer';
import { useAuthRedirect } from '../hooks/useAuthRedirect';

const validatePassword = (password) => ({
  length: password.length >= 8,
  uppercase: /[A-Z]/.test(password),
  lowercase: /[a-z]/.test(password),
  number: /[0-9]/.test(password),
  special: /[!@#$%^&*(),.?":{}|<>]/.test(password)
});

export default function Register() {
  useAuthRedirect();
  const router = useRouter();
  const { signup, signInWithGoogle } = useAuth();
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingAuth, setIsLoadingAuth] = useState(false);
  const [isPasswordFocused, setIsPasswordFocused] = useState(false);
  const [passwordValidation, setPasswordValidation] = useState({
    length: false,
    uppercase: false,
    lowercase: false,
    number: false,
    special: false
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (name === 'password') setPasswordValidation(validatePassword(value));
    setError('');
    setSuccess('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      if (!formData.fullName || !formData.email || !formData.password || !formData.confirmPassword) {
        throw new Error('Please fill in all fields');
      }
      if (!Object.values(validatePassword(formData.password)).every(Boolean)) {
        throw new Error('Please ensure your password meets all requirements');
      }
      if (formData.password !== formData.confirmPassword) {
        throw new Error('Passwords do not match');
      }

      setSuccess('Creating your account...');
      const signupResult = await signup(formData.email, formData.password, formData.fullName);

      try {
        fetch('/api/subscribe', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: formData.email, name: formData.fullName })
        });
      } catch (newsletterError) {
        console.error('Newsletter subscription error:', newsletterError);
      }

      if (signupResult?.hasSession) {
        setSuccess('Account created successfully! Redirecting...');
        await router.replace('/generate');
      } else {
        setSuccess('Account created! Please verify your email to continue.');
        await router.replace('/verify-email');
      }
    } catch (err) {
      setError(err?.message || 'Failed to create account. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsLoadingAuth(true);
    setError('');
    setSuccess('');
    try {
      await signInWithGoogle();
    } catch (err) {
      setError(err?.message || 'Google sign-up failed.');
      setIsLoadingAuth(false);
    }
  };

  const showPasswordRules =
    (isPasswordFocused || formData.password.length > 0) &&
    !Object.values(passwordValidation).every(Boolean);

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
          paddingTop: 'calc(50px + 1rem)',
          background: 'linear-gradient(135deg, #fff5f7 0%, #ffffff 100%)'
        }}
      >
        <div
          style={{
            width: '100%',
            maxWidth: '420px',
            padding: '2.2rem',
            background: 'white',
            borderRadius: '16px',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)',
            marginTop: '1rem'
          }}
        >
          <h1 style={{ fontSize: '1.9rem', color: '#333', marginBottom: '1.4rem', textAlign: 'center' }}>
            Create Your Account
          </h1>

          {(error || success) && (
            <div
              style={{
                padding: '1rem',
                marginBottom: '1rem',
                borderRadius: '8px',
                backgroundColor: error ? 'rgba(255, 51, 102, 0.1)' : 'rgba(72, 187, 120, 0.1)',
                color: error ? '#FF3366' : '#48BB78',
                border: `1px solid ${error ? '#FF3366' : '#48BB78'}`
              }}
            >
              {error || success}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <input
              type="text"
              name="fullName"
              placeholder="Full Name"
              required
              value={formData.fullName}
              onChange={handleChange}
              style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #ddd' }}
            />
            <input
              type="email"
              name="email"
              placeholder="Email"
              required
              value={formData.email}
              onChange={handleChange}
              style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #ddd' }}
            />
            <input
              type="password"
              name="password"
              placeholder="Password"
              required
              value={formData.password}
              onChange={handleChange}
              onFocus={() => setIsPasswordFocused(true)}
              onBlur={() => setIsPasswordFocused(false)}
              style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #ddd' }}
            />
            <input
              type="password"
              name="confirmPassword"
              placeholder="Confirm Password"
              required
              value={formData.confirmPassword}
              onChange={handleChange}
              style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #ddd' }}
            />

            {showPasswordRules && (
              <div style={{ marginTop: '.2rem', padding: '.75rem', backgroundColor: '#f8f9ff', borderRadius: '8px', fontSize: '.8rem' }}>
                <div style={{ color: passwordValidation.length ? '#48BB78' : '#666' }}>{passwordValidation.length ? '✓' : '○'} 8+ characters</div>
                <div style={{ color: passwordValidation.uppercase ? '#48BB78' : '#666' }}>{passwordValidation.uppercase ? '✓' : '○'} Uppercase letter</div>
                <div style={{ color: passwordValidation.lowercase ? '#48BB78' : '#666' }}>{passwordValidation.lowercase ? '✓' : '○'} Lowercase letter</div>
                <div style={{ color: passwordValidation.number ? '#48BB78' : '#666' }}>{passwordValidation.number ? '✓' : '○'} Number</div>
                <div style={{ color: passwordValidation.special ? '#48BB78' : '#666' }}>{passwordValidation.special ? '✓' : '○'} Special character</div>
              </div>
            )}

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
              {isLoading ? 'Creating account...' : 'Create account'}
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
            disabled={isLoadingAuth}
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

          <p style={{ marginTop: '1.2rem', textAlign: 'center', color: '#666', fontSize: '.875rem' }}>
            Already have an account?{' '}
            <a onClick={() => router.push('/login')} style={{ color: '#FF3366', cursor: 'pointer' }}>
              Sign in
            </a>
          </p>
        </div>
      </main>
      <Footer />
    </div>
  );
}
