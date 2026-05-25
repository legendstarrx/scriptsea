import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '../lib/supabaseClient';

const WHATSAPP = 'https://wa.me/447474762495';

type Stage = 'activating' | 'slow' | 'confirmed' | 'error';

export default function PaymentSuccess() {
  const router = useRouter();
  const [stage, setStage]   = useState<Stage>('activating');
  const pollingRef           = useRef(false);
  const timerRef             = useRef<ReturnType<typeof setTimeout> | null>(null);

  const checkIfPro = async (): Promise<boolean> => {
    try {
      if (!supabase) return false;
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData?.session?.access_token;
      if (!token) return false;

      const res = await fetch('/api/auth/me', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) return false;
      const data = await res.json();
      const p = data?.profile || {};
      return Boolean(
        p.subscription === 'pro' ||
        p.subscription_status === 'active' ||
        p.paid
      );
    } catch {
      return false;
    }
  };

  useEffect(() => {
    if (!router.isReady || pollingRef.current) return;
    pollingRef.current = true;

    // After 12 s show "taking a little longer" message
    timerRef.current = setTimeout(() => {
      setStage((s) => (s === 'activating' ? 'slow' : s));
    }, 12000);

    const poll = async () => {
      const MAX   = 30;       // up to ~60 seconds
      const DELAY = 2000;

      for (let i = 0; i < MAX; i++) {
        const isPro = await checkIfPro();
        if (isPro) {
          if (timerRef.current) clearTimeout(timerRef.current);
          setStage('confirmed');
          setTimeout(() => router.push('/generate?payment=success'), 1800);
          return;
        }
        await new Promise((r) => setTimeout(r, DELAY));
      }

      // Still not confirmed after ~60 s — redirect anyway, page will re-check
      if (timerRef.current) clearTimeout(timerRef.current);
      router.push('/generate?payment=success');
    };

    poll();
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router.isReady]);

  return (
    <div style={bg}>
      <div style={card}>
        {stage === 'confirmed' ? (
          // ── Success ──────────────────────────────────────────────────────────
          <>
            <div style={{ ...circle, background: '#FF3366' }}>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
            <h1 style={heading}>You&rsquo;re Pro! 🎉</h1>
            <p style={sub}>Access confirmed. Taking you to your dashboard&hellip;</p>
          </>
        ) : (
          // ── Loading / slow ────────────────────────────────────────────────
          <>
            <div style={{ ...circle, background: '#FF3366' }}>
              <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>

            <h1 style={heading}>Payment confirmed!</h1>
            <p style={sub}>
              {stage === 'slow'
                ? 'Activating your Pro access — this is taking a little longer than usual…'
                : 'Activating your Pro access…'}
            </p>

            {/* Animated bar */}
            <div style={barTrack}>
              <div style={barFill} />
            </div>

            <p style={hint}>Please keep this page open for a moment.</p>

            {/* Show support link only when it&apos;s been slow */}
            {stage === 'slow' && (
              <div style={helpBox}>
                <p style={{ margin: 0, color: '#555', fontSize: '0.85rem' }}>
                  Taking too long?{' '}
                  <a
                    href={WHATSAPP}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ color: '#FF3366', fontWeight: 600, textDecoration: 'none' }}
                  >
                    Chat with support
                  </a>
                  {' '}or{' '}
                  <a
                    href="mailto:support@scriptsea.com"
                    style={{ color: '#FF3366', fontWeight: 600, textDecoration: 'none' }}
                  >
                    email us
                  </a>
                  {' '}— we&rsquo;ll activate your account manually within minutes.
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
  padding: 'clamp(2rem, 5vw, 3rem) clamp(1.5rem, 4vw, 2.5rem)',
  maxWidth: '440px',
  width: '100%',
  textAlign: 'center',
  boxShadow: '0 8px 40px rgba(0,0,0,0.1)',
};

const circle: React.CSSProperties = {
  width: 68,
  height: 68,
  borderRadius: '50%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  margin: '0 auto 24px',
};

const heading: React.CSSProperties = {
  margin: '0 0 10px',
  fontSize: 'clamp(1.4rem, 5vw, 1.8rem)',
  color: '#1a1a1a',
  fontWeight: 700,
};

const sub: React.CSSProperties = {
  color: '#666',
  fontSize: '0.97rem',
  lineHeight: 1.6,
  margin: '0 0 24px',
};

const barTrack: React.CSSProperties = {
  height: 6,
  background: '#f3d5de',
  borderRadius: 3,
  overflow: 'hidden',
  margin: '0 0 16px',
};

const barFill: React.CSSProperties = {
  height: '100%',
  background: 'linear-gradient(90deg, #FF3366, #ff6b8a)',
  borderRadius: 3,
  width: '40%',
  animation: 'shimmer 1.6s ease-in-out infinite',
};

const hint: React.CSSProperties = {
  color: '#aaa',
  fontSize: '0.8rem',
  margin: '0 0 16px',
};

const helpBox: React.CSSProperties = {
  background: '#fff9fb',
  border: '1px solid #ffd6e0',
  borderRadius: '12px',
  padding: '14px 16px',
  marginTop: '8px',
};
