import { supabaseAdmin } from '../../../lib/supabaseAdmin';
import { hasProAccess } from '../../../utils/subscription';

/**
 * GET /api/auth/me
 *
 * THE single profile endpoint the frontend uses (both AuthContext and pages).
 * Uses the Supabase service-role (admin) key — completely bypasses RLS.
 *
 * It is self-healing: if the user's own row is NOT Pro but there is proof the
 * user paid (a successful row in `payments`, or a duplicate profile row that
 * shares this email and IS Pro), it activates Pro on THIS user's row before
 * returning. This guarantees a paying user is always Pro on the row keyed by
 * their auth id — eliminating the "Starter after purchase" flip.
 */

const PAID_STATUSES = ['successful', 'succeeded', 'paid', 'completed'];

const planLimits = (planType) => (planType === 'monthly' ? 60 : 15);

/**
 * Persist Pro onto the row keyed by `userId`. Returns the updated row, or null.
 * Falls back to a payload without `subscription_status` if that column is
 * missing in older databases.
 */
async function activateProRow(userId, planType, existing = {}) {
  const limit = planLimits(planType);
  const patch = {
    subscription: 'pro',
    subscription_status: 'active',
    subscription_type: planType,
    scripts_limit: limit,
    scripts_remaining: Math.max(Number(existing.scripts_remaining || 0), limit),
    paid: true,
    subscription_updated_at: new Date().toISOString(),
  };

  let { data, error } = await supabaseAdmin
    .from('profiles')
    .update(patch)
    .eq('id', userId)
    .select()
    .maybeSingle();

  if (error && String(error.message || '').toLowerCase().includes('subscription_status')) {
    const { subscription_status: _s, ...fallback } = patch;
    ({ data, error } = await supabaseAdmin
      .from('profiles')
      .update(fallback)
      .eq('id', userId)
      .select()
      .maybeSingle());
  }

  if (error) {
    console.error('[/api/auth/me] activateProRow error:', error.message);
    return null;
  }
  return data || null;
}

/**
 * Look for proof the user paid. Returns a plan type string ('monthly' |
 * 'weekly') if Pro should be granted, otherwise null.
 */
async function findPaidPlan(user) {
  // 1. Successful payment recorded for this user id
  try {
    const { data } = await supabaseAdmin
      .from('payments')
      .select('plan_type, status, created_at')
      .eq('user_id', user.id)
      .in('status', PAID_STATUSES)
      .order('created_at', { ascending: false })
      .limit(1);
    if (data && data.length) return data[0].plan_type === 'monthly' ? 'monthly' : 'weekly';
  } catch (_e) { /* payments table may not exist — ignore */ }

  // 2. Successful payment recorded for this email (covers duplicate-id rows)
  if (user.email) {
    try {
      const { data } = await supabaseAdmin
        .from('payments')
        .select('plan_type, status, created_at')
        .ilike('user_email', user.email)
        .in('status', PAID_STATUSES)
        .order('created_at', { ascending: false })
        .limit(1);
      if (data && data.length) return data[0].plan_type === 'monthly' ? 'monthly' : 'weekly';
    } catch (_e) { /* ignore */ }
  }

  // 3. A different profile row with the same email that is already Pro
  if (user.email) {
    try {
      const { data: rows } = await supabaseAdmin
        .from('profiles')
        .select('*')
        .ilike('email', user.email);
      const proRow = (rows || []).find((r) => r.id !== user.id && hasProAccess(r));
      if (proRow) return proRow.subscription_type === 'monthly' ? 'monthly' : 'weekly';
    } catch (_e) { /* ignore */ }
  }

  return null;
}

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  if (!supabaseAdmin) {
    return res.status(500).json({ error: 'Server not configured.' });
  }

  const token = (req.headers.authorization || '').replace('Bearer ', '').trim();
  if (!token) return res.status(401).json({ error: 'No token provided.' });

  const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);
  if (authError || !user) {
    return res.status(401).json({ error: 'Invalid or expired token.' });
  }

  try {
    let { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .maybeSingle();

    // Create the row if this is the user's first visit
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
        .maybeSingle();
      profile = created || newProfile;
    }

    // Self-heal: if not Pro but there is proof of payment, activate Pro now.
    if (!hasProAccess(profile)) {
      const paidPlan = await findPaidPlan(user);
      if (paidPlan) {
        const healed = await activateProRow(user.id, paidPlan, profile);
        if (healed) {
          console.log(`[/api/auth/me] self-healed Pro — userId=${user.id} plan=${paidPlan}`);
          profile = healed;
        }
      }
    }

    return res.status(200).json({ profile });
  } catch (err) {
    console.error('[/api/auth/me]', err);
    return res.status(500).json({ error: 'Failed to load profile.' });
  }
}
