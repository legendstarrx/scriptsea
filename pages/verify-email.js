import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../context/AuthContext';
import SEO from '../components/SEO';
import AuthLayout from '../components/auth/AuthLayout';
import { Alert, Button, Icon, Spinner } from '../components/ui';

export default function VerifyEmail() {
  const router = useRouter();
  const { user, loading, checkEmailVerification, resendVerificationEmail } = useAuth();
  const [status, setStatus] = useState('checking'); // checking | pending | verified
  const [isSending, setIsSending] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const checkRef = useRef(checkEmailVerification);
  checkRef.current = checkEmailVerification;

  useEffect(() => {
    // Wait for auth to finish loading — redirecting on the first render (before
    // the session is restored) used to bounce new users to the login page.
    if (loading) return undefined;
    if (!user) {
      router.replace('/login');
      return undefined;
    }

    let cancelled = false;
    let intervalId;

    const onVerified = () => {
      if (cancelled) return;
      setStatus('verified');
      clearInterval(intervalId);
      setTimeout(() => router.replace('/generate'), 1200);
    };

    const check = async () => {
      try {
        const verified = await checkRef.current();
        if (cancelled) return;
        if (verified) onVerified();
        else setStatus('pending');
      } catch (error) {
        console.error('Error checking verification:', error);
        if (!cancelled) setStatus('pending');
      }
    };

    check();
    intervalId = setInterval(check, 5000);
    return () => {
      cancelled = true;
      clearInterval(intervalId);
    };
  }, [loading, user, router]);

  const handleResendEmail = async () => {
    setIsSending(true);
    setMessage({ type: '', text: '' });
    try {
      await resendVerificationEmail();
      setMessage({ type: 'success', text: 'Sent! Check your inbox (and the spam folder, just in case).' });
    } catch (_error) {
      setMessage({ type: 'error', text: 'Could not send the email. Please try again in a minute.' });
    } finally {
      setIsSending(false);
    }
  };

  const verified = status === 'verified';

  return (
    <>
      <SEO title="Verify Your Email | ScriptSea" description="Verify your email to start using ScriptSea." path="/verify-email" noindex />
      <AuthLayout
        title={verified ? 'You’re verified' : 'Check your email'}
        subtitle={verified
          ? 'Taking you to ScriptSea now...'
          : <>We sent a link to <span className="font-semibold text-zinc-800">{user?.email || 'your inbox'}</span>. Click it and this page will move on by itself.</>}
      >
        <div className="flex flex-col items-center rounded-3xl bg-zinc-50 p-8 text-center ring-1 ring-zinc-200/70">
          <div className={verified
            ? 'flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-500 text-white'
            : 'flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-500 text-white shadow-brand'}>
            {status === 'checking' ? <Spinner className="h-7 w-7" /> : <Icon name={verified ? 'check' : 'mail'} className="h-8 w-8" />}
          </div>
          {!verified && (
            <p className="mt-5 flex items-center gap-2 text-sm text-zinc-500">
              <Spinner className="h-4 w-4 text-brand-500" /> Waiting for you to click the link
            </p>
          )}
        </div>

        {message.text && (
          <div className="mt-6">
            <Alert tone={message.type === 'error' ? 'error' : 'success'}>{message.text}</Alert>
          </div>
        )}

        {!verified && (
          <div className="mt-6 flex flex-col gap-3">
            <Button variant="secondary" size="lg" className="w-full" icon="refresh" loading={isSending} onClick={handleResendEmail}>
              Resend email
            </Button>
            <Button variant="ghost" className="w-full" onClick={() => router.replace('/login')}>
              Back to sign in
            </Button>
          </div>
        )}
      </AuthLayout>
    </>
  );
}
