import { useState } from 'react';
import Link from 'next/link';
import ProfileModal, { initialsFor } from '../ProfileModal';
import { Badge, Icon, Modal, cx } from '../ui';

const NAV = [
  { key: 'script', label: 'Script Writer', short: 'Script', icon: 'script' },
  { key: 'ad', label: 'Ad Scripts', short: 'Ads', icon: 'megaphone', isNew: true },
  { key: 'video-prompt', label: 'Video Prompts', short: 'Prompts', icon: 'clapper', pro: true },
];

/** usage: { left, total, label } */
function UsageCard({ isPro, planLabel, usage, onUpgrade }) {
  const pct = usage.total > 0 ? Math.min(100, Math.round((usage.left / usage.total) * 100)) : 0;
  return (
    <div className="rounded-2xl bg-zinc-50 p-4 ring-1 ring-zinc-200/70">
      <div className="flex items-center justify-between">
        <span className="text-sm font-semibold text-zinc-900">{isPro ? planLabel : 'Free plan'}</span>
        {isPro && <Icon name="crown" className="h-4 w-4 text-brand-500" />}
      </div>
      <div className="mt-3 h-2 overflow-hidden rounded-full bg-zinc-200">
        <div className={cx('h-full rounded-full transition-all', pct <= 20 ? 'bg-amber-500' : 'bg-brand-500')} style={{ width: `${pct}%` }} />
      </div>
      <p className="mt-2 text-[13px] text-zinc-500">{usage.label}</p>
      {!isPro && (
        <button
          type="button"
          onClick={onUpgrade}
          className="mt-3 flex h-10 w-full items-center justify-center gap-2 rounded-xl bg-brand-500 text-sm font-semibold text-white shadow-brand transition hover:bg-brand-600"
        >
          <Icon name="crown" className="h-4 w-4" /> Upgrade to Pro
        </button>
      )}
    </div>
  );
}

function ContactModal({ onClose }) {
  return (
    <Modal onClose={onClose} size="sm" labelledBy="contact-title">
      <div className="p-6 sm:p-8">
        <h2 id="contact-title" className="text-xl font-bold text-zinc-950">Need a hand?</h2>
        <p className="mt-1.5 text-sm text-zinc-500">We usually reply within a few hours.</p>
        <div className="mt-6 space-y-3">
          <a href="https://wa.me/447474762495" target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-3 rounded-2xl p-4 ring-1 ring-zinc-200 transition hover:bg-zinc-50">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#25D366]/10 text-[#25D366]"><Icon name="whatsapp" /></span>
            <span><span className="block font-semibold text-zinc-900">Chat on WhatsApp</span><span className="text-sm text-zinc-500">Fastest way to reach us</span></span>
          </a>
          <a href="mailto:support@scriptsea.com"
            className="flex items-center gap-3 rounded-2xl p-4 ring-1 ring-zinc-200 transition hover:bg-zinc-50">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-50 text-brand-500"><Icon name="mail" /></span>
            <span><span className="block font-semibold text-zinc-900">Email us</span><span className="text-sm text-zinc-500">support@scriptsea.com</span></span>
          </a>
        </div>
      </div>
    </Modal>
  );
}

export default function AppShell({ activeTab, onTabChange, isPro, planLabel, usage, onUpgrade, user, userProfile, children }) {
  const [showProfile, setShowProfile] = useState(false);
  const [showContact, setShowContact] = useState(false);
  const initial = initialsFor(user, userProfile);
  const displayName = userProfile?.displayName || user?.displayName || 'Your account';

  return (
    <div className="min-h-screen bg-[#f6f6f8] font-sans text-zinc-900">
      {/* ── Desktop sidebar ───────────────────────────────────────────── */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col border-r border-zinc-200/70 bg-white px-4 py-5 lg:flex">
        <Link href="/" className="flex items-center gap-2.5 px-2">
          <img src="/favicon.svg" alt="" className="h-8 w-8 rounded-lg" />
          <span className="text-lg font-bold text-zinc-950">ScriptSea</span>
        </Link>

        <nav className="mt-8 space-y-1" aria-label="Tools">
          <p className="px-3 pb-2 text-[11px] font-semibold uppercase tracking-wider text-zinc-400">Create</p>
          {NAV.map((item) => {
            const active = activeTab === item.key;
            return (
              <button
                key={item.key}
                type="button"
                onClick={() => onTabChange(item.key)}
                aria-current={active ? 'page' : undefined}
                className={cx(
                  'flex h-11 w-full items-center gap-3 rounded-xl px-3 text-[15px] font-semibold transition',
                  active ? 'bg-brand-50 text-brand-600' : 'text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900'
                )}
              >
                <Icon name={item.icon} className="h-5 w-5" />
                <span className="flex-1 text-left">{item.label}</span>
                {item.pro && !isPro && <Badge tone="zinc" className="!px-2 text-[10px]">PRO</Badge>}
                {item.isNew && <Badge className="!px-2 text-[10px]">NEW</Badge>}
              </button>
            );
          })}
        </nav>

        <div className="mt-auto space-y-3">
          <UsageCard isPro={isPro} planLabel={planLabel} usage={usage} onUpgrade={onUpgrade} />
          <button type="button" onClick={() => setShowContact(true)}
            className="flex h-10 w-full items-center gap-3 rounded-xl px-3 text-sm font-medium text-zinc-600 transition hover:bg-zinc-100 hover:text-zinc-900">
            <Icon name="help" className="h-[18px] w-[18px]" /> Help & support
          </button>
          <button type="button" onClick={() => setShowProfile(true)}
            className="flex w-full items-center gap-3 rounded-2xl p-2 text-left transition hover:bg-zinc-100">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-brand-400 to-brand-600 text-sm font-bold text-white">{initial}</span>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-sm font-semibold text-zinc-900">{displayName}</span>
              <span className="block truncate text-xs text-zinc-500">{user?.email}</span>
            </span>
            <Icon name="chevronDown" className="h-4 w-4 -rotate-90 text-zinc-400" />
          </button>
        </div>
      </aside>

      {/* ── Mobile top bar ────────────────────────────────────────────── */}
      <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-zinc-200/70 bg-white/90 px-4 backdrop-blur lg:hidden">
        <Link href="/" className="flex items-center gap-2">
          <img src="/favicon.svg" alt="" className="h-7 w-7 rounded-lg" />
          <span className="font-bold text-zinc-950">ScriptSea</span>
        </Link>
        <div className="flex items-center gap-2">
          {isPro ? (
            <Badge><Icon name="crown" className="h-3 w-3" />{usage.left} left</Badge>
          ) : (
            <button type="button" onClick={onUpgrade}
              className="flex h-8 items-center gap-1.5 rounded-full bg-brand-500 px-3 text-xs font-bold text-white shadow-brand">
              <Icon name="crown" className="h-3.5 w-3.5" /> Upgrade
            </button>
          )}
          <button type="button" onClick={() => setShowProfile(true)} aria-label="Account"
            className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-brand-400 to-brand-600 text-xs font-bold text-white">
            {initial}
          </button>
        </div>
      </header>

      <main className="pb-24 lg:pb-0 lg:pl-64">{children}</main>

      {/* ── Mobile bottom tabs ────────────────────────────────────────── */}
      <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-zinc-200/70 bg-white/95 pb-[env(safe-area-inset-bottom)] backdrop-blur lg:hidden" aria-label="Tools">
        <div className="grid grid-cols-4">
          {NAV.map((item) => {
            const active = activeTab === item.key;
            return (
              <button key={item.key} type="button" onClick={() => onTabChange(item.key)}
                className={cx('flex h-16 flex-col items-center justify-center gap-1 text-xs font-semibold', active ? 'text-brand-600' : 'text-zinc-500')}>
                <Icon name={item.icon} className="h-[22px] w-[22px]" />
                {item.short}
              </button>
            );
          })}
          <button type="button" onClick={() => setShowContact(true)}
            className="flex h-16 flex-col items-center justify-center gap-1 text-xs font-semibold text-zinc-500">
            <Icon name="help" className="h-[22px] w-[22px]" />
            Help
          </button>
        </div>
      </nav>

      {showProfile && (
        <ProfileModal user={user} userProfile={userProfile} onClose={() => setShowProfile(false)} onUpgrade={onUpgrade} />
      )}
      {showContact && <ContactModal onClose={() => setShowContact(false)} />}
    </div>
  );
}

export function PageHeader({ title, subtitle, right }) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-zinc-950 sm:text-[28px]">{title}</h1>
        {subtitle && <p className="mt-1 text-[15px] text-zinc-500">{subtitle}</p>}
      </div>
      {right}
    </div>
  );
}
