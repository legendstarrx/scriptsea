import { supabaseAdmin } from '../../../lib/supabaseAdmin';
import { hasProAccess } from '../../../utils/subscription';

function isPaidProfile(profile) {
  return hasProAccess(profile);
}

function pickBestEmailProfile(profiles = [], preferredId) {
  if (!Array.isArray(profiles) || profiles.length === 0) return null;

  const sorted = [...profiles].sort((a, b) => {
    const paidDiff = Number(isPaidProfile(b)) - Number(isPaidProfile(a));
    if (paidDiff !== 0) return paidDiff;
    const timeA = new Date(a?.subscription_updated_at || a?.updated_at || a?.created_at || 0).getTime();
    const timeB = new Date(b?.subscription_updated_at || b?.updated_at || b?.created_at || 0).getTime();
    return timeB - timeA;
  });

  const preferred = sorted.find((row) => row.id === preferredId);
  if (preferred && isPaidProfile(preferred)) return preferred;
  return sorted[0];
}

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
      let merged = byId;

      // If a legacy row exists under same email and has paid/pro data, migrate it into the real user id row.
      if (user.email) {
        const { data: byEmailRows } = await supabaseAdmin
          .from('profiles')
          .select('*')
          .ilike('email', user.email)
          .limit(20);
        const byEmail = pickBestEmailProfile(byEmailRows || [], user.id);

        if (byEmail && byEmail.id !== user.id && isPaidProfile(byEmail) && !isPaidProfile(byId)) {
          const { error: mergeError } = await supabaseAdmin
            .from('profiles')
            .update({
              subscription: byEmail.subscription || byId.subscription,
              subscription_type: byEmail.subscription_type || byId.subscription_type,
              scripts_remaining: byEmail.scripts_remaining ?? byId.scripts_remaining,
              scripts_generated: byEmail.scripts_generated ?? byId.scripts_generated,
              scripts_limit: byEmail.scripts_limit ?? byId.scripts_limit,
              paid: byEmail.paid ?? byId.paid,
              subscription_updated_at: byEmail.subscription_updated_at || byId.subscription_updated_at || new Date().toISOString()
            })
            .eq('id', user.id);

          if (!mergeError) {
            await supabaseAdmin.from('profiles').update({ email: null }).eq('id', byEmail.id);
          }
        }
      }

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

      merged = refreshed || byId;
      return res.status(200).json({ profile: merged });
    }

    // Handle legacy row keyed to same email but different id.
    let legacyProfile = null;
    if (user.email) {
      const { data: byEmailRows } = await supabaseAdmin
        .from('profiles')
        .select('*')
        .ilike('email', user.email)
        .limit(20);
      legacyProfile = pickBestEmailProfile(byEmailRows || [], user.id);
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
