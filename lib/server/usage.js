import { supabaseAdmin } from '../supabaseAdmin';

export const FREE_GENERATIONS = 3;

export class UsageError extends Error {
  constructor(status, body) {
    super(body?.message || body?.error || 'Request failed');
    this.status = status;
    this.body = body;
  }
}

const isProProfile = (p) =>
  String(p?.subscription || '').toLowerCase() === 'pro' || p?.paid === true || p?.subscription_status === 'active';

/** Verifies the bearer token and returns the Supabase user. */
export async function requireUser(req) {
  if (!supabaseAdmin) throw new UsageError(500, { error: 'Server not configured' });
  const token = (req.headers.authorization || '').replace('Bearer ', '').trim();
  if (!token) throw new UsageError(401, { error: 'Authentication required.' });

  const { data, error } = await supabaseAdmin.auth.getUser(token);
  if (error || !data?.user) {
    const status = Number(error?.status);
    const transient = error && (!status || status >= 500 || status === 429);
    throw new UsageError(transient ? 503 : 401, {
      error: transient ? 'Auth service temporarily unavailable. Please try again.' : 'Invalid or expired session. Please sign in again.',
    });
  }
  return data.user;
}

async function loadProfile(user) {
  let { data: profile } = await supabaseAdmin
    .from('profiles')
    .select('subscription, subscription_status, paid, scripts_remaining, scripts_generated, scripts_limit')
    .eq('id', user.id)
    .maybeSingle();

  if (!profile) {
    const { data: created } = await supabaseAdmin
      .from('profiles')
      .insert({ id: user.id, email: user.email, scripts_generated: 0, scripts_remaining: 0 })
      .select('subscription, subscription_status, paid, scripts_remaining, scripts_generated, scripts_limit')
      .maybeSingle();
    profile = created || { scripts_generated: 0, scripts_remaining: 0, subscription: 'starter', paid: false };
  }
  return profile;
}

/**
 * Takes one generation credit BEFORE calling the AI. The update only succeeds if
 * the counter still holds the value we read (compare-and-set), so two requests
 * at the same moment on one account can't both spend the same credit.
 * Returns a ticket for refundCredit() if generation fails.
 */
export async function reserveCredit(user, { proOnly = false, freeAllowed = true, proMessage } = {}) {
  for (let attempt = 0; attempt < 4; attempt += 1) {
    const profile = await loadProfile(user);
    const isPro = isProProfile(profile);
    const generated = Number(profile.scripts_generated ?? 0);
    const remaining = Number(profile.scripts_remaining ?? 0);

    if ((proOnly || !freeAllowed) && !isPro) {
      throw new UsageError(403, { error: 'limit_reached', message: proMessage || 'This is part of Pro.' });
    }
    if (isPro && remaining <= 0) {
      throw new UsageError(403, { error: 'limit_reached', message: "You've used all your scripts for this period." });
    }
    if (!isPro && generated >= FREE_GENERATIONS) {
      throw new UsageError(403, { error: 'limit_reached', message: `You've used your ${FREE_GENERATIONS} free scripts. Upgrade to Pro to keep generating.` });
    }

    const patch = isPro
      ? { scripts_remaining: remaining - 1, scripts_generated: generated + 1 }
      : { scripts_generated: generated + 1 };
    let query = supabaseAdmin.from('profiles').update(patch).eq('id', user.id).eq('scripts_generated', generated);
    if (isPro) query = query.eq('scripts_remaining', remaining);
    const { data, error } = await query.select('id');

    if (error) throw new UsageError(500, { error: 'Could not update your usage. Please try again.' });
    if (data && data.length === 1) return { userId: user.id, isPro, generated, remaining };
    // Someone else changed the row between our read and write — read again.
  }
  throw new UsageError(409, { error: 'Too many requests at once. Please try again.' });
}

/** Gives the credit back after a failed generation (best effort). */
export async function refundCredit(ticket) {
  if (!ticket) return;
  try {
    for (let attempt = 0; attempt < 3; attempt += 1) {
      const { data: p } = await supabaseAdmin
        .from('profiles')
        .select('scripts_remaining, scripts_generated')
        .eq('id', ticket.userId)
        .maybeSingle();
      if (!p) return;
      const generated = Number(p.scripts_generated ?? 0);
      const remaining = Number(p.scripts_remaining ?? 0);
      const patch = ticket.isPro
        ? { scripts_remaining: remaining + 1, scripts_generated: Math.max(generated - 1, 0) }
        : { scripts_generated: Math.max(generated - 1, 0) };
      const { data } = await supabaseAdmin
        .from('profiles')
        .update(patch)
        .eq('id', ticket.userId)
        .eq('scripts_generated', generated)
        .select('id');
      if (data && data.length === 1) return;
    }
  } catch (err) {
    console.error('[usage] refund failed', err?.message);
  }
}

export function sendUsageError(res, err) {
  if (err instanceof UsageError) return res.status(err.status).json(err.body);
  console.error('[usage]', err);
  return res.status(500).json({ error: 'Something went wrong. Please try again.' });
}
