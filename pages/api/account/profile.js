import { supabaseAdmin } from '../../../lib/supabaseAdmin';

function buildDefaultProfile(user) {
  return {
    id: user.id,
    email: user.email,
    display_name: user.user_metadata?.display_name || user.user_metadata?.full_name || null,
    photo_url: user.user_metadata?.avatar_url || null,
    subscription: 'starter',
    subscription_type: null,
    scripts_remaining: 0,
    scripts_generated: 0,
    scripts_limit: 0,
    paid: false,
    email_verified: Boolean(user.email_confirmed_at),
    last_login_at: new Date().toISOString(),
    subscription_updated_at: new Date().toISOString()
  };
}

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
      error: userError
    } = await supabaseAdmin.auth.getUser(token);

    if (userError || !user) {
      return res.status(401).json({ error: 'Invalid session.' });
    }

    const { data: byId, error: byIdError } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .maybeSingle();

    if (byIdError) {
      return res.status(500).json({ error: byIdError.message || 'Failed to load profile.' });
    }

    if (byId) {
      await supabaseAdmin
        .from('profiles')
        .update({
          email: user.email,
          display_name: user.user_metadata?.display_name || user.user_metadata?.full_name || byId.display_name,
          photo_url: user.user_metadata?.avatar_url || byId.photo_url,
          email_verified: Boolean(user.email_confirmed_at),
          last_login_at: new Date().toISOString()
        })
        .eq('id', user.id);

      const { data: refreshed } = await supabaseAdmin
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();

      return res.status(200).json({ profile: refreshed || byId });
    }

    // Handle legacy row keyed to same email but different id.
    let legacyProfile = null;
    if (user.email) {
      const { data: byEmail } = await supabaseAdmin
        .from('profiles')
        .select('*')
        .eq('email', user.email)
        .maybeSingle();
      legacyProfile = byEmail || null;
    }

    const nextProfile = {
      ...buildDefaultProfile(user),
      ...(legacyProfile
        ? {
            subscription: legacyProfile.subscription || 'starter',
            subscription_type: legacyProfile.subscription_type || null,
            scripts_remaining: legacyProfile.scripts_remaining ?? 0,
            scripts_generated: legacyProfile.scripts_generated ?? 0,
            scripts_limit: legacyProfile.scripts_limit ?? 0,
            paid: legacyProfile.paid ?? false,
            subscription_updated_at: legacyProfile.subscription_updated_at || new Date().toISOString()
          }
        : {})
    };

    if (legacyProfile && legacyProfile.id !== user.id) {
      await supabaseAdmin.from('profiles').update({ email: null }).eq('id', legacyProfile.id);
    }

    const { error: upsertError } = await supabaseAdmin.from('profiles').upsert(nextProfile, { onConflict: 'id' });
    if (upsertError) {
      return res.status(500).json({ error: upsertError.message || 'Failed to sync profile.' });
    }

    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .maybeSingle();

    return res.status(200).json({ profile });
  } catch (error) {
    return res.status(500).json({ error: error?.message || 'Internal server error.' });
  }
}
