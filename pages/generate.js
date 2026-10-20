import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/router';
import { toast } from 'react-hot-toast';
import SEO from '../components/SEO';
import ProtectedRoute, { FullPageSpinner } from '../components/ProtectedRoute';
import SubscriptionModal from '../components/SubscriptionModal';
import AppShell from '../components/app/AppShell';
import ScriptStudio from '../components/app/ScriptStudio';
import PromptStudio from '../components/app/PromptStudio';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabaseClient';
import { getPlanLabel, hasProAccess } from '../utils/subscription';

const FREE_SCRIPTS = 3;
// URL value ⇄ internal tab key. The tab lives in the URL so a refresh keeps it.
const TAB_FROM_QUERY = { prompts: 'video-prompt', ads: 'ad' };
const QUERY_FROM_TAB = { 'video-prompt': 'prompts', ad: 'ads' };

export default function Generate() {
  const router = useRouter();
  const { user, userProfile, refreshUserProfile } = useAuth();
  const [serverPlan, setServerPlan] = useState(null);
  // Full-page overlay while activating Pro after a payment redirect
  const [activatingPro, setActivatingPro] = useState(false);
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);
  const [videoPromptInitialInput, setVideoPromptInitialInput] = useState('');

  const activeTab = TAB_FROM_QUERY[router.query.tab] || 'script';
  const setActiveTab = useCallback((tab) => {
    const query = { ...router.query };
    if (QUERY_FROM_TAB[tab]) query.tab = QUERY_FROM_TAB[tab];
    else delete query.tab;
    router.replace({ pathname: '/generate', query }, undefined, { shallow: true });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [router]);

  // serverPlan (from /api/auth/me) is the authoritative, DB-backed status.
  // Once loaded, both the Pro flag and the label come from it so they can never
  // disagree. Before it loads, fall back to the context profile to avoid flicker.
  const profileIsProUser = hasProAccess(userProfile || {});
  const isProUser = serverPlan ? Boolean(serverPlan.isPro) : profileIsProUser;
  const currentPlanLabel = serverPlan ? serverPlan.planLabel : getPlanLabel(userProfile || {});

  const fetchServerPlan = useCallback(async () => {
    if (!supabase) return null;
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
    if (sessionError) throw sessionError;
    const accessToken = sessionData?.session?.access_token;
    if (!accessToken) return null;

    const response = await fetch('/api/auth/me', { headers: { Authorization: `Bearer ${accessToken}` } });
    const payload = await response.json();
    if (!response.ok) throw new Error(payload?.error || 'Failed to fetch account status.');

    const profile = payload?.profile || {};
    return {
      isPro: hasProAccess(profile),
      planLabel: getPlanLabel(profile),
      subscription: profile.subscription,
      subscriptionStatus: profile.subscription_status,
      subscriptionType: profile.subscription_type,
      scriptsRemaining: profile.scripts_remaining ?? 0,
      scriptsLimit: profile.scripts_limit ?? 0,
      scriptsGenerated: profile.scripts_generated ?? 0,
      paid: profile.paid ?? false,
    };
  }, []);

  const syncServerPlan = useCallback(async ({ extendedRetry = false } = {}) => {
    // After a payment redirect extendedRetry=true: poll longer for the async Polar webhook.
    const maxAttempts = extendedRetry ? 25 : 6;
    const delayMs = extendedRetry ? 600 : 400;
    for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
      try {
        const status = await fetchServerPlan();
        if (status) {
          setServerPlan(status);
          if (!extendedRetry || status.isPro) return status;
        }
      } catch (_error) {
        // retry below
      }
      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }
    return null;
  }, [fetchServerPlan]);

  useEffect(() => {
    if (!user?.uid) return;
    syncServerPlan().catch(() => {});
  }, [user?.uid, syncServerPlan]);

  // Keep the usage meter fresh after each generation.
  const refreshUsage = useCallback(async () => {
    await refreshUserProfile().catch(() => {});
    const fresh = await fetchServerPlan().catch(() => null);
    if (fresh) setServerPlan(fresh);
  }, [refreshUserProfile, fetchServerPlan]);

  const usage = useMemo(() => {
    const src = userProfile
      ? { left: userProfile.scriptsRemaining, total: userProfile.scriptsLimit, generated: userProfile.scriptsGenerated, type: userProfile.subscriptionType }
      : { left: serverPlan?.scriptsRemaining, total: serverPlan?.scriptsLimit, generated: serverPlan?.scriptsGenerated, type: serverPlan?.subscriptionType };
    if (isProUser) {
      const total = src.total || (src.type === 'monthly' ? 60 : 15);
      const left = Math.max(0, Number(src.left ?? 0));
      const period = src.type === 'monthly' ? 'month' : src.type === 'weekly' ? 'week' : 'period';
      return { left, total, label: `${left} of ${total} scripts left this ${period}` };
    }
    const left = Math.max(0, FREE_SCRIPTS - Number(src.generated ?? 0));
    return {
      left,
      total: FREE_SCRIPTS,
      label: left > 0 ? `${left} of ${FREE_SCRIPTS} free scripts left` : 'You’ve used your free scripts',
    };
  }, [userProfile, serverPlan, isProUser]);

  // ── Payment redirect handling (?payment=success|failed|error) ─────────────
  useEffect(() => {
    const { payment } = router.query;
    if (!payment) return;

    const handlePaymentStatus = async () => {
      if (payment === 'success') {
        // Show overlay immediately so the user never sees "Free"
        setActivatingPro(true);

        let proActivated = false;
        try {
          const { data: sessionData } = await supabase.auth.getSession();
          const token = sessionData?.session?.access_token;

          if (token) {
            // Try sync-subscription up to 10 times (40 seconds total), 4s apart
            for (let i = 0; i < 10; i += 1) {
              const syncRes = await fetch('/api/account/sync-subscription', {
                method: 'POST',
                headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
                body: JSON.stringify({}),
              });
              if (syncRes.ok) {
                const syncData = await syncRes.json();
                const p = syncData?.profile || {};
                proActivated = Boolean(
                  syncData?.activated || p.subscription === 'pro' || p.subscription_status === 'active' || p.paid
                );
              }
              if (proActivated) break;
              await new Promise((r) => setTimeout(r, 4000));
            }
          }
        } catch (_e) { /* fall through */ }

        await refreshUserProfile().catch(() => {});
        const fresh = await fetchServerPlan().catch(() => null);
        if (fresh) setServerPlan(fresh);

        setActivatingPro(false);
        router.replace('/generate', undefined, { shallow: true });

        if (proActivated) toast.success('Payment successful! Your Pro access is now active. 🎉');
        else toast.success('Payment received! If your plan hasn’t updated, please contact support.');
      } else if (payment === 'failed') {
        toast.error('Payment failed. Please try again or contact support.');
        router.replace('/generate', undefined, { shallow: true });
      } else if (payment === 'error') {
        toast.error('An error occurred. Please contact support if payment was deducted.');
        router.replace('/generate', undefined, { shallow: true });
      }
    };

    handlePaymentStatus().catch((err) => {
      console.error('Payment status error:', err);
      setActivatingPro(false);
      router.replace('/generate', undefined, { shallow: true });
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router.query.payment]);

  const openUpgrade = useCallback(() => setShowSubscriptionModal(true), []);

  const sendToPrompts = useCallback((scriptBody) => {
    setVideoPromptInitialInput(`${scriptBody}-${Date.now()}`);
    setActiveTab('video-prompt');
  }, [setActiveTab]);

  if (activatingPro) {
    return (
      <ProtectedRoute>
        <FullPageSpinner label="Activating your Pro access… just a moment." />
      </ProtectedRoute>
    );
  }

  return (
    <>
      <SEO title="Create | ScriptSea" description="Write viral scripts and AI video prompts." path="/generate" noindex />
      <ProtectedRoute>
        <AppShell
          activeTab={activeTab}
          onTabChange={setActiveTab}
          isPro={isProUser}
          planLabel={currentPlanLabel}
          usage={usage}
          onUpgrade={openUpgrade}
          user={user}
          userProfile={userProfile}
        >
          {/* Both studios stay mounted so switching tabs never loses your work. */}
          <div hidden={activeTab !== 'script'}>
            <ScriptStudio
              isProUser={isProUser}
              onUpgrade={openUpgrade}
              onSendToPrompts={sendToPrompts}
              refreshUserProfile={refreshUsage}
            />
          </div>
          <div hidden={activeTab !== 'ad'}>
            <ScriptStudio
              mode="ad"
              isProUser={isProUser}
              onUpgrade={openUpgrade}
              onSendToPrompts={sendToPrompts}
              refreshUserProfile={refreshUsage}
            />
          </div>
          <div hidden={activeTab !== 'video-prompt'}>
            <PromptStudio
              isProUser={isProUser}
              onUpgrade={openUpgrade}
              initialInput={videoPromptInitialInput}
              onGenerated={refreshUsage}
            />
          </div>
        </AppShell>

        <SubscriptionModal
          isOpen={showSubscriptionModal}
          onClose={() => setShowSubscriptionModal(false)}
          userProfile={userProfile}
        />
      </ProtectedRoute>
    </>
  );
}
