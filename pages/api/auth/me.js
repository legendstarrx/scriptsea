import { supabaseAdmin } from '../../../lib/supabaseAdmin';

/**
 * GET /api/auth/me
 *
 * Returns the authenticated user's profile.
 * Uses the Supabase service-role (admin) key — completely bypasses RLS.
 * This is the ONLY profile endpoint the frontend uses.
 */
export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  if (!supabaseAdmin) {
    return res.status(500).json({ error: 'Server not configured.' });
  }

  const token = (req.headers.authorization || '').replace('Bearer ', '').trim();
  if (!token) return res.status(401).json({ error: 'No token provided.' });

  // Verify the token and get the Supabase user
  const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);
  if (authError || !user) {
    return res.status(401).json({ error: 'Invalid or expired token.' });
  }

  try {
    // Fetch profile using admin client — no RLS restrictions
    let { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .maybeSingle();

    // Create profile if it doesn't exist yet (new user)
    if (!profile) {
      const newProfile = {
        id: user.id,
        email: user.email,
        display_name: user.user_metadata?.display_name || user.user_metadata?.full_name || null,
        photo_url: user.user_metadata?.avatar_url || null,
        subscription: 'starter',
        subscription_status: 'inactive',
        scripts_remaining: 0,
        scripts_generated: 0,
        scripts_limit: 0,
        paid: false,
        email_verified: Boolean(user.email_confirmed_at),
        last_login_at: new Date().toISOString(),
      };
      const { data: created } = await supabaseAdmin
        .from('profiles')
        .insert(newProfile)
        .select()
        .single();
      profile = created || newProfile;
    }

    return res.status(200).json({ profile });
  } catch (err) {
    console.error('[/api/auth/me]', err);
    return res.status(500).json({ error: 'Failed to load profile.' });
  }
}
