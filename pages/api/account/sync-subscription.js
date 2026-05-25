/**
 * POST /api/account/sync-subscription
 *
 * Pull-based Pro activation. Called after payment redirect when the async
 * Polar webhook hasn't updated the DB yet (or when the webhook is delayed).
 *
 * Steps:
 *  1. Verify the user's Supabase JWT
 *  2. Query Polar API for this user's active subscriptions/orders
 *  3. If an active record is found → upgrade profile to Pro immediately
 *  4. Return the fresh profile
 *
 * Safe to call multiple times — idempotent.
 */

import { supabaseAdmin } from '../../../lib/supabaseAdmin';

const POLAR_API = 'https://api.polar.sh/v1';

// Determine plan type from a Polar subscription / order object
function extractPlanType(obj) {
  const monthlyId = process.env.POLAR_PRODUCT_MONTHLY_ID;
  const weeklyId  = process.env.POLAR_PRODUCT_WEEKLY_ID;

  const productId =
    obj?.product_id ||
    obj?.product?.id ||
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

  // Check product name
  const name = (obj?.product?.name || '').toLowerCase();
  if (name.includes('month')) return 'monthly';

  return 'weekly';
}

async function polarGet(path, token) {
  const res = await fetch(`${POLAR_API}${path}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });
  if (!res.ok) return null;
  return res.json();
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  if (!supabaseAdmin) {
    return res.status(500).json({ error: 'Server not configured.' });
  }

  // ── 1. Verify JWT ──────────────────────────────────────────────────────────
  const token = (req.headers.authorization || '').replace('Bearer ', '').trim();
  if (!token) return res.status(401).json({ error: 'No token provided.' });

  const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);
  if (authError || !user) {
    return res.status(401).json({ error: 'Invalid or expired token.' });
  }

  const polarToken = process.env.POLAR_ACCESS_TOKEN;
  if (!polarToken) {
    return res.status(500).json({ error: 'Payment provider not configured.' });
  }

  let planType = 'weekly';
  let activated = false;

  try {
    // ── 2a. Try subscriptions by external_customer_id ──────────────────────
    const subsData = await polarGet(
      `/subscriptions?external_customer_id=${encodeURIComponent(user.id)}&limit=10`,
      polarToken
    );
    const subs = subsData?.items || subsData?.result?.items || [];
    const activeSub = subs.find(
      (s) => s.status === 'active' || s.status === 'trialing'
    );

    if (activeSub) {
      planType  = extractPlanType(activeSub);
      activated = true;
    }

    // ── 2b. Fallback: try orders (both param names — Polar API uses external_customer_id) ─
    if (!activated) {
      // Try external_customer_id first (matches checkout creation param name)
      let ordersData = await polarGet(
        `/orders?external_customer_id=${encodeURIComponent(user.id)}&limit=10`,
        polarToken
      );
      // Also try customer_external_id as alternative param name
      if (!ordersData?.items?.length && !ordersData?.result?.items?.length) {
        ordersData = await polarGet(
          `/orders?customer_external_id=${encodeURIComponent(user.id)}&limit=10`,
          polarToken
        ) || ordersData;
      }
      const orders = ordersData?.items || ordersData?.result?.items || [];
      const paidOrder = orders.find(
        (o) => o.status === 'paid' || o.billing_reason === 'purchase' || o.billing_reason === 'subscription_create'
      );

      if (paidOrder) {
        planType  = extractPlanType(paidOrder);
        activated = true;
        console.log(`[sync-subscription] Found paid order — orderId=${paidOrder.id}`);
      }
    }

    // ── 2c. Fallback: look up Polar customer first, then subscriptions ──────
    if (!activated) {
      const customerData = await polarGet(
        `/customers?external_id=${encodeURIComponent(user.id)}&limit=5`,
        polarToken
      );
      const customers = customerData?.items || customerData?.result?.items || [];
      const polarCustomer = customers[0];

      if (polarCustomer?.id) {
        const subsData2 = await polarGet(
          `/subscriptions?customer_id=${polarCustomer.id}&limit=10`,
          polarToken
        );
        const subs2 = subsData2?.items || subsData2?.result?.items || [];
        const activeSub2 = subs2.find(
          (s) => s.status === 'active' || s.status === 'trialing'
        );
        if (activeSub2) {
          planType  = extractPlanType(activeSub2);
          activated = true;
        }
      }
    }

    // ── 3. Activate Pro if confirmed ──────────────────────────────────────
    if (activated) {
      const scriptsLimit = planType === 'monthly' ? 60 : 15;

      const { error: updateErr } = await supabaseAdmin
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
        .eq('id', user.id);

      if (updateErr) throw updateErr;

      // Record in payments table (idempotent — ignore duplicate-key)
      await supabaseAdmin.from('payments').insert({
        user_id:    user.id,
        user_email: user.email || null,
        provider:   'polar',
        event_type: 'sync_subscription',
        plan_type:  planType,
        status:     'successful',
        created_at: new Date().toISOString(),
      }).then(({ error: insErr }) => {
        if (insErr && insErr.code !== '23505') {
          console.warn('[sync-subscription] Payment insert warning:', insErr.message);
        }
      });

      console.log(`[sync-subscription] ✅ Pro activated — userId=${user.id} plan=${planType}`);
    }

  } catch (syncErr) {
    // Non-fatal — we'll still return the current profile below
    console.error('[sync-subscription] Polar API error:', syncErr?.message || syncErr);
  }

  // ── 4. Return fresh profile ──────────────────────────────────────────────
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
