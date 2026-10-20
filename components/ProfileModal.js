import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { hasProAccess, getPlanLabel } from '../utils/subscription';
import { Alert, Badge, Button, Icon, Modal } from './ui';

const SUPPORT_WHATSAPP_URL = process.env.NEXT_PUBLIC_SUPPORT_WHATSAPP_URL || 'https://wa.me/447474762495';

export function initialsFor(user, userProfile) {
  const name = userProfile?.displayName || user?.displayName || user?.email || '?';
  return name.trim().charAt(0).toUpperCase();
}

export default function ProfileModal({ onClose, user, userProfile, onUpgrade }) {
  const { logout, deleteUserAccount } = useAuth();
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSignOut = async () => {
    setIsSigningOut(true);
    setError('');
    // logout() clears local state instantly and times out the network call at 5s.
    try { await logout(); } catch (_e) { /* already cleared locally */ }
    onClose?.();
    window.location.assign('/login');
  };

  const openSupport = (message) => {
    const separator = SUPPORT_WHATSAPP_URL.includes('?') ? '&' : '?';
    window.open(`${SUPPORT_WHATSAPP_URL}${separator}text=${encodeURIComponent(message)}`, '_blank', 'noopener,noreferrer');
  };

  const handleCancelSubscription = () => {
    openSupport(`Hi ScriptSea support, I want to cancel my subscription. My account email is: ${user?.email || ''}`);
    setSuccess('Opening WhatsApp so our team can cancel your plan.');
  };

  const handleDeleteAccount = () => {
    const confirmed = window.confirm('Are you sure you want to permanently delete your account? This cannot be undone.');
    if (!confirmed) return;
    setError('');
    setSuccess('');
    setIsDeletingAccount(true);
    deleteUserAccount()
      .then(() => {
        onClose?.();
        window.location.assign('/register');
      })
      .catch((deleteError) => {
        console.error('Delete account error:', deleteError);
        setError(deleteError?.message || 'Failed to delete account. Please try again.');
      })
      .finally(() => setIsDeletingAccount(false));
  };

  if (!user) return null;

  const isPro = hasProAccess(userProfile || {});
  const planLabel = isPro ? getPlanLabel(userProfile) : 'Free';
  const name = userProfile?.displayName || user.displayName;

  return (
    <Modal onClose={onClose} size="sm" labelledBy="profile-title">
      <div className="p-6 sm:p-8">
        <h2 id="profile-title" className="text-xl font-bold text-zinc-950">Your account</h2>

        <div className="mt-6 flex items-center gap-4">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-400 to-brand-600 text-xl font-bold text-white">
            {initialsFor(user, userProfile)}
          </div>
          <div className="min-w-0">
            {name && <p className="truncate font-semibold text-zinc-900">{name}</p>}
            <p className="truncate text-sm text-zinc-500">{user.email}</p>
            <div className="mt-1.5 flex flex-wrap items-center gap-2">
              <Badge tone={isPro ? 'brand' : 'zinc'}>{isPro && <Icon name="crown" className="h-3 w-3" />}{planLabel}</Badge>
              {isPro && userProfile?.scriptsRemaining != null && (
                <span className="text-xs text-zinc-500">{userProfile.scriptsRemaining} scripts left</span>
              )}
            </div>
          </div>
        </div>

        {!isPro && onUpgrade && (
          <button
            type="button"
            onClick={() => { onClose?.(); onUpgrade(); }}
            className="mt-6 flex w-full items-center gap-3 rounded-2xl bg-ink p-4 text-left text-white transition hover:bg-ink-soft"
          >
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-500"><Icon name="crown" className="h-5 w-5" /></span>
            <span className="flex-1">
              <span className="block font-semibold">Upgrade to Pro</span>
              <span className="block text-sm text-zinc-400">Longer scripts, video prompts, export</span>
            </span>
            <Icon name="arrowRight" className="h-5 w-5 text-zinc-400" />
          </button>
        )}

        {(error || success) && <div className="mt-5"><Alert tone={error ? 'error' : 'success'}>{error || success}</Alert></div>}

        <div className="mt-6 space-y-2">
          <Button variant="secondary" className="w-full justify-start" icon="whatsapp" onClick={() => openSupport('Hi ScriptSea support, I need help with my account.')}>
            Contact support
          </Button>
          {isPro && (
            <Button variant="secondary" className="w-full justify-start" icon="ban" onClick={handleCancelSubscription}>
              Cancel subscription
            </Button>
          )}
          <Button variant="secondary" className="w-full justify-start" icon="logout" loading={isSigningOut} onClick={handleSignOut}>
            Sign out
          </Button>
        </div>

        <div className="mt-6 border-t border-zinc-100 pt-5">
          <button
            type="button"
            onClick={handleDeleteAccount}
            disabled={isDeletingAccount}
            className="flex items-center gap-2 text-sm font-medium text-red-500 transition hover:text-red-700 disabled:opacity-50"
          >
            <Icon name="trash" className="h-4 w-4" />
            {isDeletingAccount ? 'Deleting account...' : 'Delete account'}
          </button>
        </div>
      </div>
    </Modal>
  );
}
