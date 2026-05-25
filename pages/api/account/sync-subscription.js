/**
 * POST /api/account/sync-subscription
 *
 * Pull-based Pro activation. Queries Polar API directly to verify payment.
 * Uses 4 independent lookup paths so at least one always works.
 *
 * Body (optional): { checkoutId: string }
 */

import { supabaseAdmin } from '../../../lib/supabaseAdmin';

const POLAR_API = 'https://api.polar.sh/v1';

async function polarGet(path, token) {
  try {
    const res = await fetch(`${POLAR_API}${path}`, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
    if (!res.ok) {
      console.warn(`[sync-subscription] Polar ${path} → ${res.status}`);
      return null;
    }
    return res.json();
  } catch (e) {
    console.warn(`[sync-subscription] Polar fetch error for ${path}:`, e?.message);
    return null;
  }
}

function extractPlanType(obj) {
  const monthlyId = process.env.POLAR_PRODUCT_MONTHLY_ID;
  const weeklyId  = process.env.POLAR_PRODUCT_WEEKLY_ID;

  const productId =
    obj?.product_id ||
    obj?.product?.id ||
    obj?.items?.[0]?.product_id ||
    null;

  if (productId && monthlyId && productId === monthlyId) return 'monthly';
  if (productId && weeklyId  && productId === weeklyId)  return 'weekly';

  const interval =
    obj?.product?.recurring_interval ||
    obj?.recurring_interval ||
    obj?.price?.recurring_interval ||
    null;
  if (interval === 'month') return 'monthly';
  if (interval === 'week')  return 'weekly';

  const name = (obj?.product?.name || '').toLowerCase();
  if (name.includes('month')) return 'monthly';

  return 'weekly';
}

/** Activate Pro in the DB. Returns true on success. */
async function activateProInDB(userId, planType) {
  const scriptsLimit = planType === 'monthly' ? 60 : 15;
  const { error } = await supabaseAdmin
    .from('profiles')
    .update({
      subscription:            'pro',
      subscription_status:     'active',
      subscription_type:       planType,
      scripts_remaining:       scriptsLimit,
      scripts_limit:           scriptsLimit,
      paid:                    true,
      subscription_updated_at: new Date().toISOString(),
    })
    .eq('id', userId);

  if (error) {
    console.error('[sync-subscription] DB update error:', error.message);
    return false;
  }
  return true;
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  if (!supabaseAdmin) {
    return res.status(500).json({ error: 'Server not configured.' });
  }

  // ── 1. Verify JWT ──────────────────────────────────────────────────────────
  const authHeader = req.headers.authorization || '';
  const token = authHeader.replace('Bearer ', '').trim();
  if (!token) return res.status(401).json({ error: 'No token provided.' });

  const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);
  if (authError || !user) {
    return res.status(401).json({ error: 'Invalid or expired token.' });
  }

  const polarToken = process.env.POLAR_ACCESS_TOKEN;
  if (!polarToken) {
    // No Polar token — can't query. Return current profile.
    console.error('[sync-subscription] POLAR_ACCESS_TOKEN not set');
    const { data: profile } = await supabaseAdmin.from('profiles').select('*').eq('id', user.id).maybeSingle();
    return res.status(200).json({ profile, activated: false, planType: null });
  }

  const checkoutId = req.body?.checkoutId || null;
  let planType  = 'weekly';
  let activated = false;

  console.log(`[sync-subscription] Starting — userId=${user.id} email=${user.email} checkoutId=${checkoutId || 'none'}`);

  // ── Path A: Verify checkout directly (most reliable when checkoutId is provided) ──
  if (!activated && checkoutId) {
    const checkout = await polarGet(`/checkouts/${checkoutId}`, polarToken);
    console.log(`[sync-subscription] A checkout status=${checkout?.status}`);
    if (checkout?.status === 'succeeded' || checkout?.status === 'confirmed') {
      planType  = extractPlanType(checkout);
      activated = await activateProInDB(user.id, planType);
      if (activated) console.log(`[sync-subscription] ✅ A activated — plan=${planType}`);
    }
  }

  // ── Path B: subscriptions by external_customer_id ─────────────────────────
  if (!activated) {
    const data = await polarGet(
      `/subscriptions?external_customer_id=${encodeURIComponent(user.id)}&limit=20`,
      polarToken
    );
    const items = data?.items || data?.result?.items || [];
    console.log(`[sync-subscription] B subs by external_customer_id: count=${items.length} statuses=${items.map(s => s.status).join(',') || 'none'}`);
    const hit = items.find(s => s.status === 'active' || s.status === 'trialing');
    if (hit) {
      planType  = extractPlanType(hit);
      activated = await activateProInDB(user.id, planType);
      if (activated) console.log(`[sync-subscription] ✅ B activated — subId=${hit.id} plan=${planType}`);
    }
  }

  // ── Path C: orders by external_customer_id ─────────────────────────────────
  if (!activated) {
    const data = await polarGet(
      `/orders?external_customer_id=${encodeURIComponent(user.id)}&limit=20`,
      polarToken
    );
    const items = data?.items || data?.result?.items || [];
    console.log(`[sync-subscription] C orders by external_customer_id: count=${items.length} statuses=${items.map(o => o.status).join(',') || 'none'}`);
    const hit = items.find(o => o.status === 'paid' || o.billing_reason === 'purchase' || o.billing_reason === 'subscription_create');
    if (hit) {
      planType  = extractPlanType(hit);
      activated = await activateProInDB(user.id, planType);
      if (activated) console.log(`[sync-subscription] ✅ C activated — orderId=${hit.id} plan=${planType}`);
    }
  }

  // ── Path D: customer by external_id → their subscriptions ─────────────────
  if (!activated) {
    const custData = await polarGet(
      `/customers?external_id=${encodeURIComponent(user.id)}&limit=5`,
      polarToken
    );
    const customers = custData?.items || custData?.result?.items || [];
    const cust = customers[0];
    console.log(`[sync-subscription] D customer by external_id: ${cust ? `found id=${cust.id}` : 'not found'}`);

    if (cust?.id) {
      const subData = await polarGet(`/subscriptions?customer_id=${cust.id}&limit=20`, polarToken);
      const subs = subData?.items || subData?.result?.items || [];
      console.log(`[sync-subscription] D subs for customer: count=${subs.length} statuses=${subs.map(s => s.status).join(',') || 'none'}`);
      const hit = subs.find(s => s.status === 'active' || s.status === 'trialing');
      if (hit) {
        planType  = extractPlanType(hit);
        activated = await activateProInDB(user.id, planType);
        if (activated) console.log(`[sync-subscription] ✅ D activated — subId=${hit.id} plan=${planType}`);
      }
    }
  }

  // ── Path E: customer by email → their subscriptions (most reliable fallback) ──
  if (!activated && user.email) {
    const custData = await polarGet(
      `/customers?email=${encodeURIComponent(user.email)}&limit=5`,
      polarToken
    );
    const customers = custData?.items || custData?.result?.items || [];
    const cust = customers[0];
    console.log(`[sync-subscription] E customer by email: ${cust ? `found id=${cust.id}` : 'not found'}`);

    if (cust?.id) {
      const subData = await polarGet(`/subscriptions?customer_id=${cust.id}&limit=20`, polarToken);
      const subs = subData?.items || subData?.result?.items || [];
      console.log(`[sync-subscription] E subs for customer: count=${subs.length} statuses=${subs.map(s => s.status).join(',') || 'none'}`);
      const hit = subs.find(s => s.status === 'active' || s.status === 'trialing');
      if (hit) {
        planType  = extractPlanType(hit);
        activated = await activateProInDB(user.id, planType);
        if (activated) console.log(`[sync-subscription] ✅ E activated — subId=${hit.id} plan=${planType}`);
      }

      // Also check orders by email
      if (!activated) {
        const ordData = await polarGet(`/orders?customer_id=${cust.id}&limit=20`, polarToken);
        const orders = ordData?.items || ordData?.result?.items || [];
        console.log(`[sync-subscription] E orders for customer: count=${orders.length} statuses=${orders.map(o => o.status).join(',') || 'none'}`);
        const ord = orders.find(o => o.status === 'paid' || o.billing_reason === 'subscription_create');
        if (ord) {
          planType  = extractPlanType(ord);
          activated = await activateProInDB(user.id, planType);
          if (activated) console.log(`[sync-subscription] ✅ E-order activated — orderId=${ord.id} plan=${planType}`);
        }
      }
    }
  }

  if (!activated) {
    console.log(`[sync-subscription] No active subscription found for userId=${user.id} email=${user.email}`);
  }

  // Record payment (idempotent)
  if (activated) {
    await supabaseAdmin.from('payments').insert({
      user_id:    user.id,
      user_email: user.email || null,
      provider:   'polar',
      event_type: 'sync_subscription',
      plan_type:  planType,
      status:     'successful',
      created_at: new Date().toISOString(),
    }).then(({ error: e }) => {
      if (e && e.code !== '23505') console.warn('[sync-subscription] Payment insert warn:', e.message);
    });
  }

  // Return fresh profile
  const { data: profile } = await supabaseAdmin
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .maybeSingle();

  return res.status(200).json({
    profile,
    activated,
    planType: activated ? planType : null,
  });
}
