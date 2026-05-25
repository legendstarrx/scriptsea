/**
 * payment-success.tsx
 *
 * 1. On mount: call /api/account/sync-subscription (pull-based, reliable)
 *    → This queries Polar API directly — no waiting for webhooks.
 * 2. If sync confirms Pro → redirect immediately.
 * 3. If sync finds nothing (Polar hasn't processed yet) → poll /api/auth/me
 *    as a fallback for up to 45 seconds.
 * 4. After 45 s without confirmation → redirect anyway; generate page will retry.
 */

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '../lib/supabaseClient';

const WHATSAPP = 'https://wa.me/447474762495';

type Stage = 'syncing' | 'polling' | 'slow' | 'confirmed' | 'timeout';

export default function PaymentSuccess() {
  const router                = useRouter();
  const [stage, setStage]     = useState<Stage>('syncing');
  const [manualSyncing, setManualSyncing] = useState(false);
  const pollingRef             = useRef(false);
  const timerRef               = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ── Helpers ──────────────────────────────────────────────────────────────

  const getToken = async (): Promise<string | null> => {
    if (!supabase) return null;
    const { data } = await supabase.auth.getSession();
    return data?.session?.access_token || null;
  };

  /** Call pull-based sync endpoint — returns true if Pro was activated */
  const syncSubscription = async (): Promise<boolean> => {
    const token = await getToken();
    if (!token) return false;
    try {
      const res  = await fetch('/api/account/sync-subscription', {
        method:  'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) return false;
      const data = await res.json();
      const p    = data?.profile || {};
      return Boolean(
        data?.activated ||
        p.subscription === 'pro' ||
        p.subscription_status === 'active' ||
        p.paid
      );
    } catch {
      return false;
    }
  };

  /** Poll /api/auth/me to see if webhook updated the DB */
  const checkIfPro = async (): Promise<boolean> => {
    const token = await getToken();
    if (!token) return false;
    try {
      const res  = await fetch('/api/auth/me', { headers: { Authorization: `Bearer ${token}` } });
      if (!res.ok) return false;
      const data = await res.json();
      const p    = data?.profile || {};
      return Boolean(p.subscription === 'pro' || p.subscription_status === 'active' || p.paid);
    } catch {
      return false;
    }
  };

  const handleConfirmed = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setStage('confirmed');
    setTimeout(() => router.push('/generate?payment=success'), 1500);
  };

  // ── Main effect ───────────────────────────────────────────────────────────
  useEffect(() => {
    if (!router.isReady || pollingRef.current) return;
    pollingRef.current = true;

    // After 14 s show "taking longer" support links
    timerRef.current = setTimeout(() => {
      setStage((s) => (s === 'polling' ? 'slow' : s));
    }, 14000);

    const run = async () => {
      // ── Step 1: Pull-based sync (fast, reliable) ─────────────────────────
      try {
        const isPro = await syncSubscription();
        if (isPro) { handleConfirmed(); return; }
      } catch {/* ignore, fall through to polling */}

      setStage('polling');

      // ── Step 2: Webhook-based polling (fallback) ──────────────────────────
      const MAX   = 22;   // ~44 seconds
      const DELAY = 2000;

      for (let i = 0; i < MAX; i++) {
        const isPro = await checkIfPro();
        if (isPro) { handleConfirmed(); return; }
        await new Promise((r) => setTimeout(r, DELAY));

        // Re-try sync every 3rd poll (webhook might have fired by now)
        if (i > 0 && i % 3 === 0) {
          try {
            const retrySync = await syncSubscription();
            if (retrySync) { handleConfirmed(); return; }
          } catch {/* ignore */}
        }
      }

      // Timed out — redirect anyway, generate page will re-check
      if (timerRef.current) clearTimeout(timerRef.current);
      setStage('timeout');
      setTimeout(() => router.push('/generate?payment=success'), 3000);
    };

    run();
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router.isReady]);

  // ── Manual sync button ────────────────────────────────────────────────────
  const handleManualSync = async () => {
    setManualSyncing(true);
    try {
      const isPro = await syncSubscription();
      if (isPro) { handleConfirmed(); return; }
      // Still not found — try plain check
      const isPro2 = await checkIfPro();
      if (isPro2) { handleConfirmed(); return; }
      alert('Still activating. Please wait a moment and try again, or contact support.');
    } catch {
      alert('Something went wrong. Please contact support@scriptsea.com');
    } finally {
      setManualSyncing(false);
    }
  };

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div style={bg}>
      <div style={card}>
        {stage === 'confirmed' ? (
          <>
            <div style={{ ...circle, background: '#22c55e' }}>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
            <h1 style={heading}>You&rsquo;re Pro! 🎉</h1>
            <p style={sub}>Your account has been activated. Taking you to your dashboard&hellip;</p>
          </>
        ) : stage === 'timeout' ? (
          <>
            <div style={{ ...circle, background: '#FF3366' }}>
              <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
            <h1 style={heading}>Payment confirmed!</h1>
            <p style={sub}>Activation is taking longer than usual. Redirecting you now — your access will be ready shortly.</p>
          </>
        ) : (
          <>
            {/* Animated icon */}
            <div style={{ ...circle, background: '#FF3366' }}>
              <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>

            <h1 style={heading}>Payment confirmed!</h1>
            <p style={sub}>
              {stage === 'syncing'
                ? 'Activating your Pro access…'
                : stage === 'slow'
                  ? 'Almost there — finishing up your activation…'
                  : 'Activating your Pro access…'}
            </p>

            {/* Progress bar */}
            <div style={barTrack}>
              <div style={barFill} />
            </div>

            <p style={hint}>Please keep this page open for just a moment.</p>

            {/* Support links + manual sync — only after slow stage */}
            {(stage === 'slow') && (
              <div style={helpBox}>
                <p style={{ margin: '0 0 12px', color: '#444', fontSize: '0.87rem', lineHeight: 1.6 }}>
                  Taking longer than expected? Click below to check your account status now:
                </p>
                <button
                  onClick={handleManualSync}
                  disabled={manualSyncing}
                  style={syncButtonStyle}
                >
                  {manualSyncing ? 'Checking…' : '✓ Activate my Pro access now'}
                </button>
                <p style={{ margin: '12px 0 0', color: '#aaa', fontSize: '0.78rem' }}>
                  Still need help?{' '}
                  <a href={WHATSAPP} target="_blank" rel="noopener noreferrer" style={linkStyle}>
                    WhatsApp
                  </a>
                  {' '}or{' '}
                  <a href="mailto:support@scriptsea.com" style={linkStyle}>
                    Email us
                  </a>
                </p>
              </div>
            )}
          </>
        )}
      </div>

      <style>{`
        @keyframes shimmer {
          0%   { transform: translateX(-100%); }
          100% { transform: translateX(200%); }
        }
      `}</style>
    </div>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────

const bg: React.CSSProperties = {
  minHeight: '100vh',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  background: 'linear-gradient(135deg, #fff5f7 0%, #ffffff 100%)',
  padding: '1rem',
};

const card: React.CSSProperties = {
  background: 'white',
  borderRadius: '24px',
  padding: 'clamp(2rem,5vw,3rem) clamp(1.5rem,4vw,2.5rem)',
  maxWidth: '440px',
  width: '100%',
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

const syncButtonStyle: React.CSSProperties = {
  display: 'block', width: '100%',
  padding: '12px', background: '#FF3366',
  color: 'white', border: 'none', borderRadius: '10px',
  fontSize: '0.95rem', fontWeight: 600, cursor: 'pointer',
};

const linkStyle: React.CSSProperties = {
  color: '#FF3366', textDecoration: 'none', fontWeight: 600,
};
