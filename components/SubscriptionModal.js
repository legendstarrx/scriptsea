import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { getPlanLabel, hasProAccess } from '../utils/subscription';

const WHATSAPP_NUMBER = '+447474762495';

const SubscriptionModal = ({ isOpen, onClose, userProfile }) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const isPro = hasProAccess(userProfile || {});
  const isWeekly = (userProfile?.subscriptionType || userProfile?.subscription_type) === 'weekly';
  const isMonthly = (userProfile?.subscriptionType || userProfile?.subscription_type) === 'monthly';
  const currentLabel = getPlanLabel(userProfile || {});

  const handleUpgrade = async (plan) => {
    try {
      setLoading(true);
      setError('');
      const response = await fetch('/api/create-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          plan,
          userId: user?.uid,
          email: user?.email,
        }),
      });
      const data = await response.json();
      if (data.success && data.paymentLink) {
        window.location.href = data.paymentLink;
      } else {
        setError('Could not create payment link. Please try again.');
      }
    } catch (_err) {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  // ── Already on monthly (best plan) ──────────────────────────────────────
  if (isPro && isMonthly) {
    return (
      <Overlay onClose={onClose}>
        <ModalBox onClose={onClose}>
          <div style={{ textAlign: 'center', padding: '10px 0 20px' }}>
            <div style={badgeStyle}>PRO MONTHLY</div>
            <h2 style={headingStyle}>You're on our best plan 🎉</h2>
            <p style={subStyle}>
              Enjoy 60 scripts every month — everything ScriptSea has to offer, at the best rate.
            </p>
            <button onClick={onClose} style={primaryButtonStyle}>
              Back to creating
            </button>
          </div>
        </ModalBox>
      </Overlay>
    );
  }

  // ── Already weekly → upsell to monthly ──────────────────────────────────
  if (isPro && isWeekly) {
    return (
      <Overlay onClose={onClose}>
        <ModalBox onClose={onClose}>
          <div style={{ textAlign: 'center', padding: '4px 0 8px', marginBottom: '16px' }}>
            <span style={{ ...badgeStyle, background: '#f0f0f0', color: '#555' }}>
              Current: Pro Weekly
            </span>
          </div>

          <h2 style={{ ...headingStyle, marginBottom: '8px' }}>Level up to Monthly</h2>
          <p style={subStyle}>
            You're already a Pro creator. Monthly gives you 4× more scripts and better value —
            one simple upgrade, no interruption to your workflow.
          </p>

          {/* Comparison */}
          <div style={comparisonGrid}>
            <div style={{ ...planCompareCard, opacity: 0.6 }}>
              <p style={compLabel}>Weekly</p>
              <p style={compPrice}>$4.99</p>
              <p style={compSub}>15 scripts / week</p>
              <p style={compSub}>~$20 / month</p>
            </div>
            <div style={{ ...planCompareCard, border: '2px solid #FF3366', background: '#fff5f7' }}>
              <div style={bestValuePill}>Best value</div>
              <p style={compLabel}>Monthly</p>
              <p style={{ ...compPrice, color: '#FF3366' }}>$19.99</p>
              <p style={{ ...compSub, fontWeight: 600, color: '#333' }}>60 scripts / month</p>
              <p style={compSub}>Save time &amp; money</p>
            </div>
          </div>

          <button
            onClick={() => handleUpgrade('monthly')}
            disabled={loading}
            style={{ ...primaryButtonStyle, marginTop: '20px' }}
          >
            {loading ? 'Processing…' : 'Upgrade to Monthly — $19.99'}
          </button>
          <button onClick={onClose} style={ghostButtonStyle}>
            Stay on Weekly
          </button>
          {error && <p style={errorStyle}>{error}</p>}
        </ModalBox>
      </Overlay>
    );
  }

  // ── Not pro at all → show both plans ────────────────────────────────────
  return (
    <Overlay onClose={onClose}>
      <ModalBox onClose={onClose}>
        <h2 style={{ ...headingStyle, marginBottom: '6px' }}>Go Pro and publish faster</h2>
        <p style={{ ...subStyle, marginBottom: '24px' }}>
          Unlock AI-powered script workflows built for creators who want consistent growth.
        </p>

        <div style={{ textAlign: 'center', marginBottom: '20px', fontSize: '0.85rem', color: '#888' }}>
          Current plan:{' '}
          <span style={{ fontWeight: 600, color: '#333' }}>{currentLabel}</span>
        </div>

        <div style={plansGrid}>
          {/* Weekly */}
          <div style={planCard}>
            <p style={planName}>Pro Weekly</p>
            <p style={planPrice}>$4.99<span style={planPer}>/week</span></p>
            <ul style={featureList}>
              {['15 scripts per week', 'All content formats', 'Export PDF & Word', 'Thumbnail suggestions', 'Creator style matching', 'Priority support'].map((f) => (
                <li key={f} style={featureItem}><span style={check}>✓</span>{f}</li>
              ))}
            </ul>
            <button
              onClick={() => handleUpgrade('weekly')}
              disabled={loading}
              style={outlineButtonStyle}
            >
              {loading ? 'Processing…' : 'Start Weekly'}
            </button>
          </div>

          {/* Monthly */}
          <div style={{ ...planCard, border: '2px solid #FF3366', background: '#fff9fb' }}>
            <div style={bestValuePill}>Most popular</div>
            <p style={{ ...planName, color: '#FF3366' }}>Pro Monthly</p>
            <p style={planPrice}>$19.99<span style={planPer}>/month</span></p>
            <ul style={featureList}>
              {['60 scripts per month', 'All content formats', 'Export PDF & Word', 'Thumbnail suggestions', 'Creator style matching', 'Priority support'].map((f) => (
                <li key={f} style={featureItem}><span style={check}>✓</span>{f}</li>
              ))}
            </ul>
            <button
              onClick={() => handleUpgrade('monthly')}
              disabled={loading}
              style={primaryButtonStyle}
            >
              {loading ? 'Processing…' : 'Start Monthly'}
            </button>
          </div>
        </div>

        {error && <p style={errorStyle}>{error}</p>}

        <p style={{ textAlign: 'center', fontSize: '0.78rem', color: '#aaa', marginTop: '16px' }}>
          Questions?{' '}
          <a
            href={`https://wa.me/${WHATSAPP_NUMBER.replace('+', '')}`}
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: '#FF3366', textDecoration: 'none' }}
          >
            Chat with us
          </a>
        </p>
      </ModalBox>
    </Overlay>
  );
};

// ── Sub-components ────────────────────────────────────────────────────────────

function Overlay({ children, onClose }) {
  return (
    <div
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      style={{
        position: 'fixed', inset: 0,
        background: 'rgba(0,0,0,0.55)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        zIndex: 1000, padding: '16px',
      }}
    >
      {children}
    </div>
  );
}

function ModalBox({ children, onClose }) {
  return (
    <div style={{
      background: 'white', borderRadius: '20px', padding: '28px 28px 24px',
      maxWidth: '560px', width: '100%', maxHeight: '92vh',
      overflowY: 'auto', position: 'relative',
      boxShadow: '0 8px 40px rgba(0,0,0,0.18)',
    }}>
      <button
        onClick={onClose}
        style={{
          position: 'absolute', top: '16px', right: '16px',
          background: 'none', border: 'none', fontSize: '1.5rem',
          cursor: 'pointer', color: '#999', lineHeight: 1,
        }}
      >×</button>
      {children}
    </div>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────

const headingStyle = {
  margin: 0, fontSize: 'clamp(1.3rem, 4vw, 1.6rem)',
  color: '#1a1a1a', fontWeight: 700, textAlign: 'center',
};
const subStyle = {
  color: '#666', lineHeight: 1.6, textAlign: 'center',
  fontSize: '0.95rem', margin: '10px 0 0',
};
const badgeStyle = {
  display: 'inline-block', background: '#FF3366', color: 'white',
  padding: '5px 14px', borderRadius: '20px', fontWeight: 700,
  fontSize: '0.8rem', letterSpacing: '0.04em', marginBottom: '14px',
};
const primaryButtonStyle = {
  display: 'block', width: '100%', padding: '13px',
  background: '#FF3366', color: 'white', border: 'none',
  borderRadius: '12px', fontSize: '1rem', fontWeight: 600,
  cursor: 'pointer', transition: 'all 0.2s',
};
const outlineButtonStyle = {
  ...primaryButtonStyle,
  background: 'transparent', color: '#FF3366',
  border: '1.5px solid #FF3366',
};
const ghostButtonStyle = {
  display: 'block', width: '100%', padding: '11px',
  background: 'none', color: '#888', border: 'none',
  borderRadius: '12px', fontSize: '0.9rem',
  cursor: 'pointer', marginTop: '8px',
};
const errorStyle = {
  color: '#FF3366', textAlign: 'center', fontSize: '0.85rem',
  marginTop: '12px',
};
const comparisonGrid = {
  display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px',
  margin: '20px 0 0',
};
const planCompareCard = {
  border: '1.5px solid #eee', borderRadius: '14px',
  padding: '16px 12px', textAlign: 'center', position: 'relative',
};
const compLabel = { margin: 0, fontWeight: 700, fontSize: '0.9rem', color: '#333' };
const compPrice = { margin: '8px 0 4px', fontSize: '1.5rem', fontWeight: 700, color: '#333' };
const compSub = { margin: '2px 0', fontSize: '0.8rem', color: '#888' };
const bestValuePill = {
  position: 'absolute', top: '-11px', left: '50%', transform: 'translateX(-50%)',
  background: '#FF3366', color: 'white', fontSize: '0.7rem', fontWeight: 700,
  padding: '3px 10px', borderRadius: '20px', whiteSpace: 'nowrap',
};
const plansGrid = {
  display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
  gap: '16px',
};
const planCard = {
  border: '1.5px solid #eee', borderRadius: '16px',
  padding: '20px 18px', position: 'relative',
};
const planName = {
  margin: '0 0 4px', fontWeight: 700, fontSize: '1rem', color: '#333',
};
const planPrice = {
  margin: '0 0 16px', fontSize: '1.8rem', fontWeight: 700, color: '#1a1a1a',
};
const planPer = { fontSize: '0.85rem', fontWeight: 400, color: '#888' };
const featureList = { listStyle: 'none', margin: '0 0 18px', padding: 0 };
const featureItem = {
  display: 'flex', alignItems: 'flex-start', gap: '8px',
  fontSize: '0.88rem', color: '#444', padding: '4px 0',
};
const check = { color: '#FF3366', fontWeight: 700, flexShrink: 0 };

export default SubscriptionModal;
