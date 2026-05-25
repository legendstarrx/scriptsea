/**
 * payment-success.tsx
 *
 * After Polar redirects here:
 * 1. Read checkout_id from URL — verify it directly with Polar (fastest + most reliable)
 * 2. Try 5 lookup paths via /api/account/sync-subscription (email, customer_id, etc.)
 * 3. Retry every 4 seconds for up to 60 seconds
 * 4. On success → redirect to /generate immediately
 * 5. On timeout → redirect anyway; generate page re-checks
 */

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '../lib/supabaseClient';

const WHATSAPP = 'https://wa.me/447474762495';
const RETRY_INTERVAL_MS = 4000;
const MAX_RETRIES = 15; // 60 seconds total

type Stage = 'loading' | 'confirmed' | 'timeout';

/** Write Pro into the AuthContext localStorage cache so generate loads instantly */
function writeProToCache(profile: Record<string, unknown>) {
  try {
    const cached = JSON.parse(localStorage.getItem('ss_profile_v1') || 'null') || {};
    const merged = {
      ...cached,
      ...profile,
      subscription:       'pro',
      subscriptionStatus: 'active',
      subscription_status: 'active',
      paid:               true,
      isPro:              true,
    };
    localStorage.setItem('ss_profile_v1', JSON.stringify(merged));
  } catch { /* private mode / quota — ignore */ }
}

export default function PaymentSuccess() {
  const router                = useRouter();
  const [stage, setStage]     = useState<Stage>('loading');
  const [attempt, setAttempt] = useState(0);
  const [slow, setSlow]       = useState(false);
  const [manualChecking, setManualChecking] = useState(false);
  const stopRef               = useRef(false);

  const getToken = async (): Promise<string | null> => {
    if (!supabase) return null;
    const { data } = await supabase.auth.getSession();
    return data?.session?.access_token || null;
  };

  const trySyncSubscription = async (checkoutId?: string | null): Promise<boolean> => {
    const token = await getToken();
    if (!token) return false;
    try {
      const res = await fetch('/api/account/sync-subscription', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ checkoutId: checkoutId || null }),
      });
      if (!res.ok) return false;
      const data = await res.json();
      const p    = data?.profile || {};
      const isPro = Boolean(
        data?.activated ||
        p.subscription === 'pro' ||
        p.subscription_status === 'active' ||
        p.paid
      );
      if (isPro) writeProToCache(p);
      return isPro;
    } catch {
      return false;
    }
  };

  // ── Main polling loop ─────────────────────────────────────────────────────
  useEffect(() => {
    if (!router.isReady) return;
    stopRef.current = false;

    const checkoutId = router.query.checkout_id as string | undefined;

    // Show "taking longer" hint after 16 seconds
    const slowTimer = setTimeout(() => setSlow(true), 16000);

    const run = async () => {
      // Small initial delay to let Polar finish creating the subscription
      await new Promise(r => setTimeout(r, 2000));

      for (let i = 0; i < MAX_RETRIES; i++) {
        if (stopRef.current) return;
        setAttempt(i + 1);

        const isPro = await trySyncSubscription(checkoutId);
        if (isPro) {
          clearTimeout(slowTimer);
          setStage('confirmed');
          setTimeout(() => router.push('/generate?payment=success'), 1200);
          return;
        }

        if (i < MAX_RETRIES - 1) {
          await new Promise(r => setTimeout(r, RETRY_INTERVAL_MS));
        }
      }

      // Timed out
      clearTimeout(slowTimer);
      setStage('timeout');
      setTimeout(() => router.push('/generate?payment=success'), 2500);
    };

    run();
    return () => {
      stopRef.current = true;
      clearTimeout(slowTimer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router.isReady]);

  // ── Manual "check now" button ─────────────────────────────────────────────
  const handleManualCheck = async () => {
    setManualChecking(true);
    const checkoutId = router.query.checkout_id as string | undefined;
    const isPro = await trySyncSubscription(checkoutId);
    if (isPro) {
      stopRef.current = true;
      setStage('confirmed');
      setTimeout(() => router.push('/generate?payment=success'), 1200);
    } else {
      alert('Still activating — please wait a few more seconds and try again, or contact support.');
    }
    setManualChecking(false);
  };

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div style={bg}>
      <div style={card}>

        {stage === 'confirmed' ? (
          /* ── Success ──────────────────────────────────────────────────── */
          <>
            <div style={{ ...circle, background: '#22c55e' }}>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
            <h1 style={heading}>You&rsquo;re Pro! 🎉</h1>
            <p style={sub}>Your account is active. Taking you to your dashboard&hellip;</p>
          </>

        ) : stage === 'timeout' ? (
          /* ── Timeout ──────────────────────────────────────────────────── */
          <>
            <div style={{ ...circle, background: '#FF3366' }}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
                <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
            </div>
            <h1 style={heading}>Taking longer than usual</h1>
            <p style={sub}>Your payment went through but activation is delayed. Please contact support and we&rsquo;ll activate your account manually right away.</p>
            <a href={WHATSAPP} target="_blank" rel="noopener noreferrer" style={ctaBtn}>
              WhatsApp support
            </a>
            <a href="mailto:support@scriptsea.com" style={{ ...ctaBtn, background: '#f3f4f6', color: '#374151', marginTop: 8 }}>
              Email support@scriptsea.com
            </a>
          </>

        ) : (
          /* ── Loading / polling ────────────────────────────────────────── */
          <>
            <div style={{ ...circle, background: '#FF3366' }}>
              {/* Animated spinner */}
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"
                style={{ animation: 'spin 1s linear infinite' }}>
                <path d="M12 2a10 10 0 0 1 10 10" strokeLinecap="round"/>
              </svg>
            </div>

            <h1 style={heading}>Activating your Pro access…</h1>
            <p style={sub}>
              {slow
                ? 'This is taking a moment — please keep the page open.'
                : 'Almost done, just a few seconds…'}
            </p>

            {/* Progress bar */}
            <div style={barTrack}>
              <div style={barFill} />
            </div>

            <p style={hint}>Please don&rsquo;t close this page.</p>

            {slow && (
              <div style={helpBox}>
                <p style={{ margin: '0 0 12px', color: '#555', fontSize: '0.87rem', lineHeight: 1.6 }}>
                  Taking longer than expected? Try checking now:
                </p>
                <button onClick={handleManualCheck} disabled={manualChecking} style={syncBtn}>
                  {manualChecking ? 'Checking…' : '✓ Activate my Pro access now'}
                </button>
                <p style={{ margin: '12px 0 0', color: '#aaa', fontSize: '0.78rem' }}>
                  Still need help?{' '}
                  <a href={WHATSAPP} target="_blank" rel="noopener noreferrer" style={link}>WhatsApp</a>
                  {' '}or{' '}
                  <a href="mailto:support@scriptsea.com" style={link}>Email us</a>
                </p>
              </div>
            )}
          </>
        )}

      </div>

      <style>{`
        @keyframes spin   { to { transform: rotate(360deg); } }
        @keyframes shimmer { 0% { transform:translateX(-100%); } 100% { transform:translateX(200%); } }
      `}</style>
    </div>
  );
}

// ── Styles ───────────────────────────────────────────────────────────────────

const bg: React.CSSProperties = {
  minHeight: '100vh',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  background: 'linear-gradient(135deg,#fff5f7 0%,#ffffff 100%)',
  padding: '1rem',
};

const card: React.CSSProperties = {
  background: 'white',
  borderRadius: '24px',
  padding: 'clamp(2rem,5vw,3rem) clamp(1.5rem,4vw,2.5rem)',
  maxWidth: '440px', width: '100%',
  textAlign: 'center',
  boxShadow: '0 8px 40px rgba(0,0,0,0.10)',
};

const circle: React.CSSProperties = {
  width: 68, height: 68, borderRadius: '50%',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  margin: '0 auto 24px',
};

const heading: React.CSSProperties = {
  margin: '0 0 10px',
  fontSize: 'clamp(1.4rem,5vw,1.8rem)',
  color: '#1a1a1a', fontWeight: 700,
};

const sub: React.CSSProperties = {
  color: '#666', fontSize: '0.97rem',
  lineHeight: 1.6, margin: '0 0 24px',
};

const barTrack: React.CSSProperties = {
  height: 6, background: '#f3d5de',
  borderRadius: 3, overflow: 'hidden', margin: '0 0 16px',
};

const barFill: React.CSSProperties = {
  height: '100%',
  background: 'linear-gradient(90deg,#FF3366,#ff6b8a)',
  borderRadius: 3, width: '40%',
  animation: 'shimmer 1.6s ease-in-out infinite',
};

const hint: React.CSSProperties = {
  color: '#bbb', fontSize: '0.8rem', margin: '0 0 16px',
};

const helpBox: React.CSSProperties = {
  background: '#fff9fb', border: '1px solid #ffd6e0',
  borderRadius: '14px', padding: '16px',
};

const syncBtn: React.CSSProperties = {
  display: 'block', width: '100%', padding: '12px',
  background: '#FF3366', color: 'white', border: 'none',
  borderRadius: '10px', fontSize: '0.95rem', fontWeight: 600, cursor: 'pointer',
};

const ctaBtn: React.CSSProperties = {
  display: 'block', width: '100%', padding: '13px',
  background: '#FF3366', color: 'white', textDecoration: 'none',
  borderRadius: '12px', fontSize: '0.97rem', fontWeight: 600,
  marginTop: 12, boxSizing: 'border-box',
};

const link: React.CSSProperties = {
  color: '#FF3366', textDecoration: 'none', fontWeight: 600,
};
