import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';

export default function VerifyEmail() {
  const router = useRouter();
  const { token } = router.query;
  const [status, setStatus] = useState('Verifying...');

  useEffect(() => {
    if (token) {
      fetch(`/api/verify?token=${token}`)
        .then(res => {
          if (res.ok) {
            setStatus('Email verified successfully! Redirecting...');
            setTimeout(() => {
              router.push('/login?verified=true');
            }, 2000);
          } else {
            setStatus('Verification failed. Please try again or contact support.');
          }
        })
        .catch(() => {
          setStatus('Verification failed. Please try again or contact support.');
        });
    }
  }, [token, router]);

  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '100vh',
      padding: '2rem'
    }}>
      <div style={{
        textAlign: 'center',
        maxWidth: '400px'
      }}>
        <h1>Email Verification</h1>
        <p>{status}</p>
      </div>
    </div>
  );
} 