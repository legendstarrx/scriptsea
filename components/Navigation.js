import Link from 'next/link';
import { useRouter } from 'next/router';
import { useAuth } from '../context/AuthContext';
import { useState } from 'react';
import SubscriptionModal from './SubscriptionModal';
import ProfileModal from './ProfileModal';

export default function Navigation() {
  const router = useRouter();
  const { user, userProfile, logout } = useAuth();
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const handleSignOut = async () => {
    setMenuOpen(false);
    try { await logout(); } catch (_e) {}
    window.location.assign('/');
  };

  return (
    <>
      <nav style={{
        position: 'fixed',
        top: 0, left: 0, right: 0,
        backgroundColor: 'rgba(255,255,255,0.95)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        padding: '0 20px',
        height: '64px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        boxShadow: '0 2px 10px rgba(0,0,0,0.06)',
        zIndex: 1000,
      }}>
        {/* Logo */}
        <Link href="/" style={{
          textDecoration: 'none',
          color: '#FF3366',
          fontSize: '1.5rem',
          fontWeight: 'bold',
          flexShrink: 0,
        }}>
          ScriptSea
        </Link>

        {/* Desktop right side */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
        }}>
          {user ? (
            <>
              {/* Upgrade button */}
              <button
                onClick={() => setShowSubscriptionModal(true)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '7px 14px',
                  backgroundColor: '#FF3366',
                  color: 'white',
                  border: 'none',
                  borderRadius: '20px',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  boxShadow: '0 2px 8px rgba(255,51,102,0.25)',
                }}
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 2L2 7L12 12L22 7L12 2Z" />
                  <path d="M2 17L12 22L22 17" />
                  <path d="M2 12L12 17L22 12" />
                </svg>
                Upgrade
              </button>

              {/* Profile button */}
              <button
                onClick={() => setShowProfileModal(true)}
                style={{
                  width: '36px', height: '36px',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  backgroundColor: '#f8f9ff',
                  border: 'none', borderRadius: '50%',
                  cursor: 'pointer',
                  flexShrink: 0,
                }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#666" strokeWidth="2">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
              </button>
            </>
          ) : (
            <>
              <Link href="/login" style={{
                textDecoration: 'none',
                color: '#555',
                fontSize: '0.9rem',
                fontWeight: 500,
                padding: '7px 12px',
              }}>
                Sign in
              </Link>
              <Link href="/register" style={{
                textDecoration: 'none',
                background: '#FF3366',
                color: 'white',
                padding: '7px 16px',
                borderRadius: '20px',
                fontSize: '0.9rem',
                fontWeight: 600,
                whiteSpace: 'nowrap',
              }}>
                Get started
              </Link>
            </>
          )}
        </div>
      </nav>

      {/* Modals */}
      {showSubscriptionModal && (
        <SubscriptionModal
          isOpen={showSubscriptionModal}
          onClose={() => setShowSubscriptionModal(false)}
          userProfile={userProfile}
        />
      )}
      {showProfileModal && (
        <ProfileModal
          onClose={() => setShowProfileModal(false)}
          user={user}
        />
      )}
    </>
  );
}
