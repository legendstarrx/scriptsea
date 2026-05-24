import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useRouter } from 'next/router';

const SUPPORT_WHATSAPP_URL = process.env.NEXT_PUBLIC_SUPPORT_WHATSAPP_URL || 'https://wa.me/1234567890';

export default function ProfileModal({ onClose, user }) {
  const router = useRouter();
  const { logout, deleteUserAccount } = useAuth();
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSignOut = async () => {
    try {
      setIsSigningOut(true);
      setError('');
      await logout();
      onClose?.();
      await router.replace('/login');
    } catch (signOutError) {
      console.error('Error signing out:', signOutError);
      setError(signOutError?.message || 'Sign out failed. Please try again.');
    } finally {
      setIsSigningOut(false);
    }
  };

  const openSupport = (message) => {
    const encodedMessage = encodeURIComponent(message);
    const separator = SUPPORT_WHATSAPP_URL.includes('?') ? '&' : '?';
    const whatsappLink = `${SUPPORT_WHATSAPP_URL}${separator}text=${encodedMessage}`;
    window.open(whatsappLink, '_blank', 'noopener,noreferrer');
  };

  const handleCancelSubscription = () => {
    const accountEmail = user?.email || '';
    openSupport(`Hi ScriptSea support, I want to cancel my subscription. My account email is: ${accountEmail}`);
    setSuccess('Opening WhatsApp support for subscription cancellation.');
  };

  const handleDeleteAccount = () => {
    const confirmed = window.confirm('Are you sure you want to permanently delete your account? This action cannot be undone.');
    if (!confirmed) return;

    setError('');
    setSuccess('');
    setIsDeletingAccount(true);

    deleteUserAccount()
      .then(() => {
        onClose?.();
        router.replace('/register');
      })
      .catch((deleteError) => {
        console.error('Delete account error:', deleteError);
        setError(deleteError?.message || 'Failed to delete account. Please try again.');
      })
      .finally(() => {
        setIsDeletingAccount(false);
      });
  };

  if (!user) return null;

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1001
      }}
    >
      <div
        style={{
          background: 'white',
          borderRadius: '16px',
          padding: '2rem',
          maxWidth: '500px',
          width: '90%',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)'
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '1.25rem'
          }}
        >
          <h2 style={{ margin: 0, color: '#333' }}>Profile</h2>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '1.5rem',
              cursor: 'pointer',
              color: '#666'
            }}
          >
            ×
          </button>
        </div>

        <div style={{ marginBottom: '1.5rem' }}>
          <h3 style={{ marginBottom: '0.8rem', color: '#333' }}>Account Information</h3>
          <div
            style={{
              padding: '1rem',
              background: '#f8f9ff',
              borderRadius: '12px'
            }}
          >
            <p style={{ margin: 0, color: '#666' }}>
              <strong>Email:</strong> {user.email}
            </p>
          </div>
        </div>

        <div style={{ display: 'grid', gap: '0.75rem', marginBottom: '1rem' }}>
          <button type="button" onClick={handleCancelSubscription} style={secondaryActionStyle}>
            Cancel subscription (contact support)
          </button>
          <button type="button" onClick={handleDeleteAccount} disabled={isDeletingAccount} style={deleteActionStyle}>
            {isDeletingAccount ? 'Deleting account...' : 'Delete account'}
          </button>
        </div>

        {error && (
          <div
            style={{
              padding: '0.75rem',
              background: '#FFE5EC',
              color: '#FF3366',
              borderRadius: '8px',
              fontSize: '0.9rem',
              marginBottom: '0.8rem'
            }}
          >
            {error}
          </div>
        )}

        {success && (
          <div
            style={{
              padding: '0.75rem',
              background: '#D1FAE5',
              color: '#065F46',
              borderRadius: '8px',
              fontSize: '0.9rem',
              marginBottom: '0.8rem'
            }}
          >
            {success}
          </div>
        )}

        <button type="button" onClick={handleSignOut} disabled={isSigningOut} style={signOutButtonStyle}>
          {isSigningOut ? 'Signing out...' : 'Sign Out'}
        </button>
      </div>
    </div>
  );
}

const secondaryActionStyle = {
  padding: '0.75rem 1rem',
  border: '1px solid #FFD2DD',
  borderRadius: '10px',
  background: '#FFF7FA',
  color: '#333',
  cursor: 'pointer',
  fontWeight: 500,
  width: '100%',
  textAlign: 'left'
};

const deleteActionStyle = {
  ...secondaryActionStyle,
  border: '1px solid #FF8BA7',
  background: '#FFF2F6',
  color: '#D3134A'
};

const signOutButtonStyle = {
  padding: '0.85rem 1rem',
  border: 'none',
  borderRadius: '10px',
  background: '#FF3366',
  color: '#fff',
  cursor: 'pointer',
  fontWeight: 600,
  width: '100%'
};
