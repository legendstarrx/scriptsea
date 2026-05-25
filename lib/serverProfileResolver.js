import { getPlanLabel, hasProAccess } from '../utils/subscription';

const PRO_FIELDS = [
  'subscription',
  'subscription_status',
  'subscription_type',
  'paid',
  'scripts_remaining',
  'scripts_limit',
  'subscription_updated_at'
];

const safeDate = (value) => {
  const ts = new Date(value || 0).getTime();
  return Number.isFinite(ts) ? ts : 0;
};

const scoreProfile = (profile) => {
  if (!profile) return -1;
  const paidScore = hasProAccess(profile) ? 1000 : 0;
  const updatedScore = safeDate(profile.subscription_updated_at || profile.updated_at || profile.created_at);
  const limitScore = Number(profile.scripts_limit || 0) + Number(profile.scripts_remaining || 0);
  return paidScore + updatedScore + limitScore;
};

const pickBestProfile = (profiles = [], preferredId) => {
  if (!Array.isArray(profiles) || profiles.length === 0) return null;

  const sorted = [...profiles].sort((a, b) => scoreProfile(b) - scoreProfile(a));
  const preferred = sorted.find((row) => row.id === preferredId);
  if (preferred && hasProAccess(preferred)) return preferred;
  return sorted[0];
};

const pickCanonicalProfile = (profileById, profileByEmailBest) => {
  if (!profileById && !profileByEmailBest) return null;
  if (!profileById) return profileByEmailBest;
  if (!profileByEmailBest) return profileById;
  return hasProAccess(profileByEmailBest) && !hasProAccess(profileById)
    ? profileByEmailBest
    : profileById;
};

const safeUpsertProfile = async (supabaseAdmin, payload) => {
  const { error } = await supabaseAdmin.from('profiles').upsert(payload, { onConflict: 'id' });
  if (!error) return;

  // Backward compatibility for DBs missing subscription_status.
  if (String(error.message || '').toLowerCase().includes('subscription_status')) {
    const { subscription_status, ...fallbackPayload } = payload;
    const fallback = await supabaseAdmin.from('profiles').upsert(fallbackPayload, { onConflict: 'id' });
    if (fallback.error) throw fallback.error;
    return;
  }

  throw error;
};

const inferPlanFromPayment = (payment) => {
  const plan = payment?.plan_type === 'monthly' ? 'monthly' : 'weekly';
  const scriptsLimit = plan === 'monthly' ? 500 : 100;
  return { plan, scriptsLimit };
};

const explainProReason = (profile = {}) => {
  const reasons = [];
  const subscription = String(profile.subscription || '').toLowerCase();
  const subscriptionStatus = String(profile.subscription_status || '').toLowerCase();
  if (subscription === 'pro' || subscription === 'premium') reasons.push(`subscription=${subscription}`);
  if (subscriptionStatus === 'active') reasons.push('subscription_status=active');
  if (profile.paid) reasons.push('paid=true');
  if (profile.subscription_type) reasons.push(`subscription_type=${profile.subscription_type}`);
  if ((profile.scripts_limit ?? 0) > 0) reasons.push(`scripts_limit=${profile.scripts_limit}`);
  if ((profile.scripts_remaining ?? 0) > 0) reasons.push(`scripts_remaining=${profile.scripts_remaining}`);
  return reasons.length ? reasons.join(', ') : 'no-pro-signals';
};

export const resolveCanonicalProfile = async (supabaseAdmin, user, { withLogs = true } = {}) => {
  const log = (...args) => {
    if (withLogs) console.info('[subscription-resolver]', ...args);
  };

  const { data: profileById, error: profileByIdError } = await supabaseAdmin
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .maybeSingle();
  if (profileByIdError) throw profileByIdError;

  let profilesByEmail = [];
  if (user.email) {
    const { data, error } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .ilike('email', user.email)
      .limit(50);
    if (error) throw error;
    profilesByEmail = data || [];
  }

  const profileByEmailBest = pickBestProfile(profilesByEmail, user.id);
  let finalProfile = pickCanonicalProfile(profileById, profileByEmailBest);

  log('auth_user', { id: user.id, email: user.email || null });
  log('profile_by_id', profileById ? { id: profileById.id, subscription: profileById.subscription, paid: profileById.paid } : null);
  log('profiles_by_email_count', profilesByEmail.length);
  log('profile_by_email_best', profileByEmailBest ? { id: profileByEmailBest.id, subscription: profileByEmailBest.subscription, paid: profileByEmailBest.paid } : null);

  // Migrate legacy paid/pro row from email-based row to auth-id row.
  if (
    profileByEmailBest &&
    profileByEmailBest.id !== user.id &&
    hasProAccess(profileByEmailBest) &&
    (!profileById || !hasProAccess(profileById))
  ) {
    const payload = {
      id: user.id,
      email: user.email,
      display_name: profileById?.display_name || user.user_metadata?.display_name || user.user_metadata?.full_name || null,
      photo_url: profileById?.photo_url || user.user_metadata?.avatar_url || null,
      subscription: profileByEmailBest.subscription || 'pro',
      subscription_status: profileByEmailBest.subscription_status || 'active',
      subscription_type: profileByEmailBest.subscription_type || null,
      paid: profileByEmailBest.paid ?? true,
      scripts_remaining: profileByEmailBest.scripts_remaining ?? 0,
      scripts_generated: profileByEmailBest.scripts_generated ?? 0,
      scripts_limit: profileByEmailBest.scripts_limit ?? 0,
      subscription_updated_at: profileByEmailBest.subscription_updated_at || new Date().toISOString(),
      last_login_at: new Date().toISOString()
    };
    await safeUpsertProfile(supabaseAdmin, payload);
  }

  // Payment evidence fallback.
  if (!hasProAccess(finalProfile || {})) {
    const { data: paymentByUserId } = await supabaseAdmin
      .from('payments')
      .select('*')
      .eq('provider', 'polar')
      .eq('status', 'successful')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    const { data: paymentByEmail } = user.email
      ? await supabaseAdmin
          .from('payments')
          .select('*')
          .eq('provider', 'polar')
          .eq('status', 'successful')
          .ilike('user_email', user.email)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle()
      : { data: null };

    const payment = paymentByUserId || paymentByEmail || null;
    if (payment) {
      const { plan, scriptsLimit } = inferPlanFromPayment(payment);
      const payload = {
        id: user.id,
        email: user.email,
        display_name: finalProfile?.display_name || user.user_metadata?.display_name || user.user_metadata?.full_name || null,
        photo_url: finalProfile?.photo_url || user.user_metadata?.avatar_url || null,
        subscription: 'pro',
        subscription_status: 'active',
        subscription_type: plan,
        scripts_remaining: Math.max(finalProfile?.scripts_remaining ?? 0, scriptsLimit),
        scripts_generated: finalProfile?.scripts_generated ?? 0,
        scripts_limit: Math.max(finalProfile?.scripts_limit ?? 0, scriptsLimit),
        paid: true,
        subscription_updated_at: new Date().toISOString(),
        last_login_at: new Date().toISOString()
      };
      await safeUpsertProfile(supabaseAdmin, payload);
    }
  }

  const { data: refreshedProfile, error: refreshedError } = await supabaseAdmin
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .maybeSingle();
  if (refreshedError) throw refreshedError;

  finalProfile = refreshedProfile || finalProfile || null;

  log('final_profile', finalProfile ? {
    id: finalProfile.id,
    subscription: finalProfile.subscription,
    subscription_status: finalProfile.subscription_status,
    subscription_type: finalProfile.subscription_type,
    paid: finalProfile.paid,
    scripts_limit: finalProfile.scripts_limit,
    scripts_remaining: finalProfile.scripts_remaining
  } : null);
  log('isPro', hasProAccess(finalProfile || {}), explainProReason(finalProfile || {}));

  return {
    profile: finalProfile,
    isPro: hasProAccess(finalProfile || {}),
    planLabel: getPlanLabel(finalProfile || {}),
    proReason: explainProReason(finalProfile || {})
  };
};

export { PRO_FIELDS };
