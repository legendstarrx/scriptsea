const normalizeSubscriptionValue = (value) => String(value || '').trim().toLowerCase();

const pickFirstDefined = (obj, keys, fallback = null) => {
  if (!obj) return fallback;
  for (const key of keys) {
    const value = obj[key];
    if (value !== undefined && value !== null) {
      return value;
    }
  }
  return fallback;
};

export const normalizeSubscriptionProfile = (profile = {}) => {
  const subscription = normalizeSubscriptionValue(
    pickFirstDefined(profile, ['subscription'])
  );
  const subscriptionStatus = normalizeSubscriptionValue(
    pickFirstDefined(profile, ['subscriptionStatus', 'subscription_status'])
  );
  const subscriptionType = pickFirstDefined(profile, ['subscriptionType', 'subscription_type']);
  const paid = Boolean(pickFirstDefined(profile, ['paid'], false));
  const scriptsLimit = Number(pickFirstDefined(profile, ['scriptsLimit', 'scripts_limit'], 0) || 0);
  const scriptsRemaining = Number(pickFirstDefined(profile, ['scriptsRemaining', 'scripts_remaining'], 0) || 0);

  return {
    subscription,
    subscriptionStatus,
    subscriptionType: subscriptionType || null,
    paid,
    scriptsLimit,
    scriptsRemaining
  };
};

export const hasProAccess = (profile = {}) => {
  const normalized = normalizeSubscriptionProfile(profile);
  return normalized.subscription === 'pro' ||
    normalized.subscription === 'premium' ||
    normalized.subscriptionStatus === 'active' ||
    normalized.paid ||
    Boolean(normalized.subscriptionType) ||
    normalized.scriptsLimit > 0 ||
    normalized.scriptsRemaining > 0;
};

export const getPlanLabel = (profile = {}) => {
  const normalized = normalizeSubscriptionProfile(profile);
  if (!hasProAccess(profile)) return 'Starter';
  if (normalized.subscriptionType === 'monthly') return 'Pro Monthly';
  if (normalized.subscriptionType === 'weekly') return 'Pro Weekly';
  return 'Pro';
};
