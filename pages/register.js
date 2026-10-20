import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useAuth } from '../context/AuthContext';
import { useAuthRedirect, safeNextPath } from '../hooks/useAuthRedirect';
import SEO from '../components/SEO';
import AuthLayout, { GoogleButton, OrDivider, PasswordInput } from '../components/auth/AuthLayout';
import { Alert, Button, FieldLabel, Icon, TextInput, cx } from '../components/ui';

const validatePassword = (password) => ({
  length: password.length >= 8,
  uppercase: /[A-Z]/.test(password),
  lowercase: /[a-z]/.test(password),
  number: /[0-9]/.test(password),
  special: /[!@#$%^&*(),.?":{}|<>]/.test(password)
});

const RULES = [
  ['length', '8+ characters'],
  ['uppercase', 'One uppercase'],
  ['lowercase', 'One lowercase'],
  ['number', 'One number'],
  ['special', 'One symbol'],
];

export default function Register() {
  useAuthRedirect();
  const router = useRouter();
  const { signup, signInWithGoogle } = useAuth();
  const [formData, setFormData] = useState({ fullName: '', email: '', password: '', confirmPassword: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingAuth, setIsLoadingAuth] = useState(false);
  const [isPasswordFocused, setIsPasswordFocused] = useState(false);
  const [passwordValidation, setPasswordValidation] = useState(validatePassword(''));

  const next = safeNextPath(router.query.next);

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
        throw new Error('Please make sure your password meets all the rules');
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
        setSuccess('Account created! Taking you in...');
        await router.replace(next || '/generate');
      } else {
        setSuccess('Account created! Please verify your email to continue.');
        await router.replace('/verify-email');
      }
    } catch (err) {
      setError(err?.message || 'Failed to create account. Please try again.');
      setSuccess('');
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

  const showPasswordRules = isPasswordFocused || formData.password.length > 0;
  const passwordsMismatch = formData.confirmPassword.length > 0 && formData.confirmPassword !== formData.password;

  return (
    <>
      <SEO title="Create Your Free Account | ScriptSea" description="Sign up free and get 3 AI scripts. No credit card needed." path="/register" noindex />
      <AuthLayout
        title="Create your free account"
        subtitle="3 free scripts. No credit card. Takes 20 seconds."
        footer={
          <>
            Already have an account?{' '}
            <Link href={next ? `/login?next=${encodeURIComponent(next)}` : '/login'} className="font-semibold text-brand-600 hover:text-brand-700">
              Sign in
            </Link>
          </>
        }
      >
        {(error || success) && (
          <div className="mb-6">
            <Alert tone={error ? 'error' : 'success'} onClose={error ? () => setError('') : undefined}>
              {error || success}
            </Alert>
          </div>
        )}

        <GoogleButton onClick={handleGoogleSignIn} disabled={isLoadingAuth || isLoading}>Sign up with Google</GoogleButton>
        <OrDivider />

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <FieldLabel htmlFor="fullName">Name</FieldLabel>
            <TextInput id="fullName" name="fullName" autoComplete="name" placeholder="Your name"
              value={formData.fullName} onChange={handleChange} required />
          </div>
          <div>
            <FieldLabel htmlFor="email">Email</FieldLabel>
            <TextInput id="email" name="email" type="email" autoComplete="email" placeholder="you@example.com"
              value={formData.email} onChange={handleChange} required />
          </div>
          <div>
            <FieldLabel htmlFor="password">Password</FieldLabel>
            <PasswordInput
              id="password" name="password" autoComplete="new-password" placeholder="Create a password"
              value={formData.password} onChange={handleChange}
              onFocus={() => setIsPasswordFocused(true)} onBlur={() => setIsPasswordFocused(false)}
              show={showPassword} onToggle={() => setShowPassword((s) => !s)} required
            />
            {showPasswordRules && (
              <ul className="mt-3 grid grid-cols-2 gap-x-3 gap-y-1.5">
                {RULES.map(([key, label]) => (
                  <li key={key} className={cx('flex items-center gap-1.5 text-[13px] transition',
                    passwordValidation[key] ? 'text-emerald-600' : 'text-zinc-400')}>
                    <Icon name={passwordValidation[key] ? 'check' : 'plus'}
                      className={cx('h-3.5 w-3.5', !passwordValidation[key] && 'rotate-45')} />
                    {label}
                  </li>
                ))}
              </ul>
            )}
          </div>
          <div>
            <FieldLabel htmlFor="confirmPassword">Confirm password</FieldLabel>
            <PasswordInput
              id="confirmPassword" name="confirmPassword" autoComplete="new-password" placeholder="Type it again"
              value={formData.confirmPassword} onChange={handleChange}
              show={showPassword} onToggle={() => setShowPassword((s) => !s)} required
            />
            {passwordsMismatch && <p className="mt-2 text-[13px] text-red-600">Passwords don&apos;t match yet.</p>}
          </div>

          <Button type="submit" size="lg" className="w-full" loading={isLoading}>
            Create free account
          </Button>
          <p className="text-center text-xs text-zinc-400">
            By signing up you agree to our{' '}
            <Link href="/privacy" className="underline hover:text-zinc-600">Privacy Policy</Link>.
          </p>
        </form>
      </AuthLayout>
    </>
  );
}
