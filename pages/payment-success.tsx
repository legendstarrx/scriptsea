import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '../lib/supabaseClient';

export default function PaymentSuccess() {
  const router = useRouter();
  const [status, setStatus] = useState('Payment received! Activating your Pro access...');
  const [dots, setDots] = useState('');
  const pollingRef = useRef(false);

  // Animated dots
  useEffect(() => {
    const t = setInterval(() => setDots((d) => (d.length >= 3 ? '' : d + '.')), 500);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    if (!router.isReady || pollingRef.current) return;
    pollingRef.current = true;

    const MAX_ATTEMPTS = 20;   // up to 40 seconds
    const INTERVAL_MS = 2000;

    const checkIfPro = async (): Promise<boolean> => {
      try {
        if (!supabase) return false;
        const { data: sessionData } = await supabase.auth.getSession();
        const token = sessionData?.session?.access_token;
        if (!token) return false;

        const res = await fetch('/api/account/status', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) return false;
        const data = await res.json();
        return Boolean(data?.isPro);
      } catch {
        return false;
      }
    };

    const poll = async () => {
      for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
        setStatus(`Activating Pro access${dots} (checking ${attempt + 1}/${MAX_ATTEMPTS})`);
        const isPro = await checkIfPro();
        if (isPro) {
          setStatus('Pro access confirmed! Redirecting you now...');
          router.push('/generate?payment=success');
          return;
        }
        await new Promise((r) => setTimeout(r, INTERVAL_MS));
      }
      // Webhook took too long — redirect anyway; syncServerPlan on the other page will retry
      setStatus('Almost there! Taking you to your dashboard...');
      router.push('/generate?payment=success');
    };

    poll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router.isReady]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md text-center max-w-md w-full mx-4">
        <div
          style={{
            width: 64,
            height: 64,
            borderRadius: '50%',
            backgroundColor: '#FF3366',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 24px',
          }}
        >
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold mb-4 text-gray-800">Checkout Complete!</h1>
        <p className="text-gray-600 mb-2">{status}</p>
        <p className="text-sm text-gray-400">Please don&apos;t close this page.</p>
        <div className="mt-6 flex justify-center">
          <div
            style={{
              width: 40,
              height: 4,
              borderRadius: 2,
              backgroundColor: '#FF3366',
              animation: 'progress 2s linear infinite',
            }}
          />
        </div>
        <style jsx>{`
          @keyframes progress {
            0% { transform: scaleX(0.2); opacity: 0.6; }
            50% { transform: scaleX(1); opacity: 1; }
            100% { transform: scaleX(0.2); opacity: 0.6; }
          }
        `}</style>
      </div>
    </div>
  );
}
