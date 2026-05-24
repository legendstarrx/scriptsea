import { supabaseAdmin } from '../../../lib/supabaseAdmin';

const isProProfile = (profile = {}) => {
  const subscription = String(profile.subscription || '').toLowerCase();
  return Boolean(profile.paid) ||
    subscription === 'pro' ||
    subscription === 'premium' ||
    Boolean(profile.subscription_type) ||
    (profile.scripts_limit ?? 0) > 0 ||
    (profile.scripts_remaining ?? 0) > 0;
};

const toPlanLabel = (profile = {}) => {
  if (!isProProfile(profile)) return 'Starter';
  if (profile.subscription_type === 'monthly') return 'Pro Monthly';
  if (profile.subscription_type === 'weekly') return 'Pro Weekly';
  return 'Pro';
};

const pickCanonicalProfile = (primaryProfile, secondaryProfile) => {
  if (!primaryProfile && !secondaryProfile) return null;
  if (!primaryProfile) return secondaryProfile;
  if (!secondaryProfile) return primaryProfile;
  if (isProProfile(secondaryProfile) && !isProProfile(primaryProfile)) return secondaryProfile;
  return primaryProfile;
};

const pickBestEmailProfile = (profiles = [], preferredId) => {
  if (!Array.isArray(profiles) || profiles.length === 0) return null;

  const sorted = [...profiles].sort((a, b) => {
    const proDiff = Number(isProProfile(b)) - Number(isProProfile(a));
    if (proDiff !== 0) return proDiff;
    const paidDiff = Number(Boolean(b?.paid)) - Number(Boolean(a?.paid));
    if (paidDiff !== 0) return paidDiff;
    const timeA = new Date(a?.subscription_updated_at || a?.updated_at || a?.created_at || 0).getTime();
    const timeB = new Date(b?.subscription_updated_at || b?.updated_at || b?.created_at || 0).getTime();
    return timeB - timeA;
  });

  const preferred = sorted.find((row) => row.id === preferredId);
  if (preferred && isProProfile(preferred)) return preferred;
  return sorted[0];
};

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  if (!supabaseAdmin) {
    return res.status(500).json({ error: 'Supabase admin is not configured.' });
  }

  try {
    const authHeader = req.headers.authorization || '';
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
    if (!token) {
      return res.status(401).json({ error: 'Missing auth token.' });
    }

    const {
      data: { user },
      error: authError
    } = await supabaseAdmin.auth.getUser(token);

    if (authError || !user) {
      return res.status(401).json({ error: 'Invalid session.' });
    }

    const { data: profileById, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .maybeSingle();

    if (profileError) {
      return res.status(500).json({ error: profileError.message || 'Failed to fetch profile.' });
    }

    let profileByEmail = null;
    if (user.email) {
      const { data } = await supabaseAdmin
        .from('profiles')
        .select('*')
        .ilike('email', user.email)
        .limit(20);
      profileByEmail = pickBestEmailProfile(data || [], user.id);
    }

    let canonicalProfile = pickCanonicalProfile(profileById, profileByEmail);

    // If a legacy paid row exists under same email with a different id, migrate paid state to current auth id row.
    if (
      profileByEmail &&
      profileByEmail.id !== user.id &&
      isProProfile(profileByEmail) &&
      (!profileById || !isProProfile(profileById))
    ) {
      const { error: mergeError } = await supabaseAdmin.from('profiles').upsert({
        id: user.id,
        email: user.email,
        display_name: profileById?.display_name || user.user_metadata?.display_name || user.user_metadata?.full_name || null,
        photo_url: profileById?.photo_url || user.user_metadata?.avatar_url || null,
        subscription: profileByEmail.subscription || 'pro',
        subscription_type: profileByEmail.subscription_type || null,
        scripts_remaining: profileByEmail.scripts_remaining ?? 0,
        scripts_generated: profileByEmail.scripts_generated ?? 0,
        scripts_limit: profileByEmail.scripts_limit ?? 0,
        paid: profileByEmail.paid ?? true,
        subscription_updated_at: profileByEmail.subscription_updated_at || new Date().toISOString(),
        last_login_at: new Date().toISOString()
      }, { onConflict: 'id' });

      // Never clear legacy rows here; this endpoint should be read-safe.
      // If merge failed, keep using paid legacy profile for plan resolution.
      if (mergeError) {
        canonicalProfile = profileByEmail;
      }
    }

    const { data: refreshedProfile } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .maybeSingle();

    const finalProfile = pickCanonicalProfile(refreshedProfile || null, canonicalProfile || null);
    const isPro = isProProfile(finalProfile || {});
    return res.status(200).json({
      isPro,
      planLabel: toPlanLabel(finalProfile || {}),
      profile: finalProfile
    });
  } catch (error) {
    return res.status(500).json({ error: error?.message || 'Internal server error.' });
  }
}
