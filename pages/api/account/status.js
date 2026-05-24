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

    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .maybeSingle();

    if (profileError) {
      return res.status(500).json({ error: profileError.message || 'Failed to fetch profile.' });
    }

    const isPro = isProProfile(profile || {});
    return res.status(200).json({
      isPro,
      planLabel: toPlanLabel(profile || {}),
      profile: profile || null
    });
  } catch (error) {
    return res.status(500).json({ error: error?.message || 'Internal server error.' });
  }
}
