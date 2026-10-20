import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useAuth } from '../context/AuthContext';
import { useAuthRedirect, safeNextPath } from '../hooks/useAuthRedirect';
import SEO from '../components/SEO';
import AuthLayout, { GoogleButton, OrDivider, PasswordInput } from '../components/auth/AuthLayout';
import { Alert, Button, FieldLabel, Modal, TextInput } from '../components/ui';

export default function Login() {
  useAuthRedirect();
  const router = useRouter();
  const { login, signInWithGoogle, resetPassword } = useAuth();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [showResetModal, setShowResetModal] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isResetting, setIsResetting] = useState(false);

  const next = safeNextPath(router.query.next);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage({ type: '', text: '' });
    try {
      await login(formData.email, formData.password);
      await router.replace(next || '/generate');
    } catch (error) {
      const text = error?.message?.toLowerCase().includes('invalid')
        ? 'That email and password don’t match. Try again.'
        : 'Sign in failed. Please try again.';
      setMessage({ type: 'error', text });
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
    setIsResetting(true);
    try {
      await resetPassword(resetEmail);
      setMessage({ type: 'success', text: 'Check your inbox. We sent you a link to reset your password.' });
      setShowResetModal(false);
      setResetEmail('');
    } catch (error) {
      setMessage({ type: 'error', text: error?.message || 'Failed to send reset email.' });
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <>
      <SEO title="Sign In | ScriptSea" description="Sign in to ScriptSea to write viral scripts and AI video prompts." path="/login" noindex />
      <AuthLayout
        title="Welcome back"
        subtitle="Sign in to keep creating."
        footer={
          <>
            New to ScriptSea?{' '}
            <Link href={next ? `/register?next=${encodeURIComponent(next)}` : '/register'} className="font-semibold text-brand-600 hover:text-brand-700">
              Create a free account
            </Link>
          </>
        }
      >
        {message.text && (
          <div className="mb-6">
            <Alert tone={message.type === 'error' ? 'error' : 'success'} onClose={() => setMessage({ type: '', text: '' })}>
              {message.text}
            </Alert>
          </div>
        )}

        <GoogleButton onClick={handleGoogleSignIn} disabled={isLoading}>Continue with Google</GoogleButton>
        <OrDivider />

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <FieldLabel htmlFor="email">Email</FieldLabel>
            <TextInput
              id="email"
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              value={formData.email}
              onChange={(e) => setFormData((p) => ({ ...p, email: e.target.value }))}
              required
            />
          </div>
          <div>
            <FieldLabel
              htmlFor="password"
              right={
                <button type="button" onClick={() => { setResetEmail(formData.email); setShowResetModal(true); }}
                  className="text-sm font-medium text-brand-600 hover:text-brand-700">
                  Forgot password?
                </button>
              }
            >
              Password
            </FieldLabel>
            <PasswordInput
              id="password"
              autoComplete="current-password"
              placeholder="Your password"
              value={formData.password}
              onChange={(e) => setFormData((p) => ({ ...p, password: e.target.value }))}
              show={showPassword}
              onToggle={() => setShowPassword((s) => !s)}
              required
            />
          </div>
          <Button type="submit" size="lg" className="w-full" loading={isLoading}>
            Sign in
          </Button>
        </form>
      </AuthLayout>

      <Modal open={showResetModal} onClose={() => setShowResetModal(false)} size="sm" labelledBy="reset-title">
        <form onSubmit={handleResetPassword} className="p-6 sm:p-8">
          <h2 id="reset-title" className="text-xl font-bold text-zinc-950">Reset your password</h2>
          <p className="mt-1.5 text-sm text-zinc-500">We&apos;ll email you a link to set a new one.</p>
          <div className="mt-6">
            <FieldLabel htmlFor="reset-email">Email</FieldLabel>
            <TextInput id="reset-email" type="email" value={resetEmail} onChange={(e) => setResetEmail(e.target.value)}
              placeholder="you@example.com" required autoFocus />
          </div>
          <div className="mt-6 flex gap-3">
            <Button variant="secondary" className="flex-1" onClick={() => setShowResetModal(false)}>Cancel</Button>
            <Button type="submit" className="flex-1" loading={isResetting}>Send link</Button>
          </div>
        </form>
      </Modal>
    </>
  );
}
