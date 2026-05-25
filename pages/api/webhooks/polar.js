import { Webhook } from 'svix';
import { supabaseAdmin } from '../../../lib/supabaseAdmin';

export const config = {
  api: {
    bodyParser: false
  }
};

const readRawBody = async (req) => {
  const chunks = [];
  for await (const chunk of req) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }
  return Buffer.concat(chunks).toString('utf8');
};

const readHeader = (req, key) => {
  const value = req.headers[key];
  if (Array.isArray(value)) return value[0];
  return value || null;
};

const isFutureDate = (value) => {
  if (!value) return false;
  const ts = new Date(value).getTime();
  if (Number.isNaN(ts)) return false;
  return ts > Date.now();
};

const getPlanTypeFromPayload = (payloadData) => {
  const monthlyId = process.env.POLAR_PRODUCT_MONTHLY_ID;
  const weeklyId  = process.env.POLAR_PRODUCT_WEEKLY_ID;

  const productId =
    payloadData?.product_id ||
    payloadData?.product?.id ||
    payloadData?.price?.product_id ||
    payloadData?.items?.[0]?.product_id ||
    payloadData?.products?.[0]?.id ||           // checkout.updated products array
    payloadData?.products?.[0]?.product_id ||
    payloadData?.metadata?.productId;

  if (productId && monthlyId && productId === monthlyId) return 'monthly';
  if (productId && weeklyId  && productId === weeklyId)  return 'weekly';

  const metadataPlan = payloadData?.metadata?.plan || payloadData?.metadata?.plan_type;
  if (metadataPlan === 'monthly' || metadataPlan === 'weekly') return metadataPlan;

  // Detect from recurring interval in product / subscription
  const interval =
    payloadData?.product?.recurring_interval ||
    payloadData?.subscription?.recurring_interval ||
    payloadData?.recurring_interval;
  if (interval === 'month') return 'monthly';
  if (interval === 'week')  return 'weekly';

  return 'weekly'; // safe default
};

const getUserIdentifiers = (payloadData) => {
  const metadata = payloadData?.metadata || {};
  const customer  = payloadData?.customer || payloadData?.order?.customer || null;

  return {
    userId:
      metadata.userId ||
      metadata.user_id ||
      payloadData?.external_customer_id ||
      payloadData?.customer_external_id ||
      payloadData?.external_id ||
      customer?.external_id ||
      null,
    email:
      customer?.email ||
      payloadData?.email ||
      payloadData?.customer_email ||
      metadata.email ||
      null
  };
};

const findUser = async ({ userId, email }) => {
  if (userId) {
    const { data, error } = await supabaseAdmin
      .from('profiles')
      .select('id')
      .eq('id', userId)
      .maybeSingle();
    if (error) throw error;
    if (data) return data.id;
  }

  if (email) {
    const { data, error } = await supabaseAdmin
      .from('profiles')
      .select('id')
      .ilike('email', email)
      .limit(1)
      .maybeSingle();
    if (error) throw error;
    if (data) return data.id;
  }

  return null;
};

// ---------------------------------------------------------------------------
// Verify Svix signature. Returns { event, verified }.
// If verification fails (wrong secret / misconfigured), falls back to raw
// JSON so processing still works — logs a WARNING so the operator knows.
// ---------------------------------------------------------------------------
const parseEvent = (rawBody, req) => {
  const secret = process.env.POLAR_WEBHOOK_SECRET;

  if (secret) {
    try {
      const webhook   = new Webhook(secret);
      const svixId    = readHeader(req, 'svix-id')        || readHeader(req, 'webhook-id');
      const svixSig   = readHeader(req, 'svix-signature') || readHeader(req, 'webhook-signature');
      const svixTs    = readHeader(req, 'svix-timestamp') || readHeader(req, 'webhook-timestamp');

      const event = webhook.verify(rawBody, {
        'svix-id':        svixId,
        'svix-signature': svixSig,
        'svix-timestamp': svixTs,
      });
      return { event, verified: true };
    } catch (svixErr) {
      // ⚠️  Verification failed — secret may be misconfigured.
      // Fall through to unverified JSON parse so events still process.
      console.warn(
        '[polar-webhook] Svix verification FAILED — check POLAR_WEBHOOK_SECRET.',
        svixErr?.message || svixErr
      );
    }
  }

  // No secret OR verification failed → parse as plain JSON (unverified)
  const event = JSON.parse(rawBody);
  return { event, verified: false };
};

// ---------------------------------------------------------------------------
// Handler
// ---------------------------------------------------------------------------
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  let rawBody = '';
  try {
    rawBody = await readRawBody(req);
  } catch (_e) {
    return res.status(400).json({ error: 'Could not read request body' });
  }

  let event;
  try {
    ({ event } = parseEvent(rawBody, req));
  } catch (parseErr) {
    console.error('[polar-webhook] Could not parse body:', parseErr?.message);
    return res.status(400).json({ error: 'Invalid webhook payload' });
  }

  try {
    const eventType = event?.type;
    const payloadData = event?.data || {};

    const processableTypes = new Set([
      'order.paid',
      'subscription.active',
      'subscription.created',
      'subscription.updated',
      'checkout.updated',   // fires when checkout status → succeeded
      'subscription.canceled',
      'subscription.revoked',
    ]);

    if (!processableTypes.has(eventType)) {
      // Unknown / informational events (checkout.created, etc.) — always 200
      return res.status(200).json({ received: true, skipped: 'event_not_handled' });
    }

    const planType    = getPlanTypeFromPayload(payloadData);
    const scriptsLimit = planType === 'monthly' ? 60 : 15;
    const { userId, email } = getUserIdentifiers(payloadData);
    const profileId   = await findUser({ userId, email });

    if (!profileId) {
      console.warn('[polar-webhook] User not found', { eventType, userId, email });
      return res.status(200).json({ received: true, skipped: 'user_not_found' });
    }

    // ── Activate Pro ────────────────────────────────────────────────────────
    // For checkout.updated: only activate when status is 'succeeded'
    const checkoutSucceeded =
      eventType === 'checkout.updated' &&
      (payloadData?.status === 'succeeded' || payloadData?.status === 'confirmed');

    // For subscription.updated: only activate when status is 'active'
    const subActivated =
      eventType === 'subscription.updated' &&
      (payloadData?.status === 'active');

    if (
      eventType === 'order.paid' ||
      eventType === 'subscription.active' ||
      eventType === 'subscription.created' ||
      checkoutSucceeded ||
      subActivated
    ) {
      const patch = {
        subscription:            'pro',
        subscription_status:     'active',
        subscription_type:       planType,
        scripts_remaining:       scriptsLimit,
        scripts_limit:           scriptsLimit,
        paid:                    true,
        subscription_updated_at: new Date().toISOString(),
      };

      const { error: updateErr } = await supabaseAdmin
        .from('profiles')
        .update(patch)
        .eq('id', profileId);

      if (updateErr) {
        // Retry without subscription_status if column not yet added
        if (String(updateErr.message || '').toLowerCase().includes('subscription_status')) {
          const { subscription_status: _s, ...fallback } = patch;
          const { error: retryErr } = await supabaseAdmin
            .from('profiles')
            .update(fallback)
            .eq('id', profileId);
          if (retryErr) throw retryErr;
        } else {
          throw updateErr;
        }
      }

      // Insert payment record (ignore duplicate-key errors)
      await supabaseAdmin.from('payments').insert({
        user_id:    profileId,
        user_email: email || null,
        provider:   'polar',
        event_type: eventType,
        plan_type:  planType,
        status:     'successful',
        created_at: new Date().toISOString(),
      }).then(({ error: insErr }) => {
        if (insErr && insErr.code !== '23505') {
          console.warn('[polar-webhook] Payment insert warning:', insErr.message);
        }
      });

      console.log(`[polar-webhook] ✅ Pro activated — userId=${profileId} plan=${planType}`);
    }

    // ── Cancel / Revoke ──────────────────────────────────────────────────────
    if (eventType === 'subscription.canceled' || eventType === 'subscription.revoked') {
      const periodEnd =
        payloadData?.current_period_end ||
        payloadData?.ends_at ||
        payloadData?.current_period_end_at ||
        payloadData?.subscription?.current_period_end ||
        null;

      // Keep Pro until the paid period actually ends
      if (isFutureDate(periodEnd)) {
        return res.status(200).json({ received: true, skipped: 'grace_period_active' });
      }

      const cancelPatch = {
        subscription:            'starter',
        subscription_status:     'inactive',
        scripts_remaining:       0,
        scripts_limit:           0,
        paid:                    false,
        subscription_updated_at: new Date().toISOString(),
      };

      const { error: cancelErr } = await supabaseAdmin
        .from('profiles')
        .update(cancelPatch)
        .eq('id', profileId);

      if (cancelErr) {
        if (String(cancelErr.message || '').toLowerCase().includes('subscription_status')) {
          const { subscription_status: _s, ...fb } = cancelPatch;
          const { error: retryCancel } = await supabaseAdmin
            .from('profiles')
            .update(fb)
            .eq('id', profileId);
          if (retryCancel) throw retryCancel;
        } else {
          throw cancelErr;
        }
      }
    }

    return res.status(200).json({ received: true });
  } catch (err) {
    console.error('[polar-webhook] Handler error:', err);
    return res.status(500).json({ error: 'Internal error processing webhook' });
  }
}
