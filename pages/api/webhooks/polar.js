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
  const weeklyId = process.env.POLAR_PRODUCT_WEEKLY_ID;

  const productId =
    payloadData?.product_id ||
    payloadData?.product?.id ||
    payloadData?.price?.product_id ||
    payloadData?.items?.[0]?.product_id ||
    payloadData?.metadata?.productId;

  if (productId && monthlyId && productId === monthlyId) {
    return 'monthly';
  }
  if (productId && weeklyId && productId === weeklyId) {
    return 'weekly';
  }

  const metadataPlan = payloadData?.metadata?.plan || payloadData?.metadata?.plan_type;
  if (metadataPlan === 'monthly' || metadataPlan === 'weekly') {
    return metadataPlan;
  }

  return 'weekly';
};

const getUserIdentifiers = (payloadData) => {
  const metadata = payloadData?.metadata || {};
  const customer = payloadData?.customer || payloadData?.order?.customer || null;

  return {
    userId:
      metadata.userId ||
      metadata.user_id ||
      payloadData?.external_customer_id ||
      payloadData?.external_id ||
      customer?.external_id ||
      payloadData?.customer_external_id ||
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
    const { data, error } = await supabaseAdmin.from('profiles').select('id').eq('id', userId).maybeSingle();
    if (error) throw error;
    return data ? data.id : null;
  }

  if (email) {
    const { data, error } = await supabaseAdmin
      .from('profiles')
      .select('id')
      .ilike('email', email)
      .limit(1)
      .maybeSingle();
    if (error) throw error;
    return data ? data.id : null;
  }

  return null;
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const rawBody = await readRawBody(req);
    let event = null;

    if (process.env.POLAR_WEBHOOK_SECRET) {
      const webhook = new Webhook(process.env.POLAR_WEBHOOK_SECRET);
      const svixId = readHeader(req, 'svix-id') || readHeader(req, 'webhook-id');
      const svixSignature = readHeader(req, 'svix-signature') || readHeader(req, 'webhook-signature');
      const svixTimestamp = readHeader(req, 'svix-timestamp') || readHeader(req, 'webhook-timestamp');

      event = webhook.verify(rawBody, {
        'svix-id': svixId,
        'svix-signature': svixSignature,
        'svix-timestamp': svixTimestamp
      });
    } else {
      event = JSON.parse(rawBody);
    }

    const eventType = event?.type;
    const payloadData = event?.data || {};
    const processableTypes = new Set([
      'order.paid',
      'subscription.active',
      'subscription.created',
      'subscription.canceled',
      'subscription.revoked'
    ]);

    if (!processableTypes.has(eventType)) {
      return res.status(200).json({ received: true, skipped: 'event_not_handled' });
    }

    const planType = getPlanTypeFromPayload(payloadData);
    const scriptsLimit = planType === 'monthly' ? 500 : 100;
    const { userId, email } = getUserIdentifiers(payloadData);
    const profileId = await findUser({ userId, email });

    if (!profileId) {
      console.warn('Polar webhook: user not found', { eventType, userId, email });
      return res.status(200).json({ received: true, skipped: 'user_not_found' });
    }

    if (
      eventType === 'order.paid' ||
      eventType === 'subscription.active' ||
      eventType === 'subscription.created'
    ) {
      const { error: profileUpdateError } = await supabaseAdmin
        .from('profiles')
        .update({
          subscription: 'pro',
          subscription_type: planType,
          scripts_remaining: scriptsLimit,
          scripts_limit: scriptsLimit,
          paid: true,
          subscription_updated_at: new Date().toISOString()
        })
        .eq('id', profileId);
      if (profileUpdateError) throw profileUpdateError;

      await supabaseAdmin.from('payments').insert({
        user_id: profileId,
        user_email: email || null,
        provider: 'polar',
        event_type: eventType,
        plan_type: planType,
        status: 'successful',
        created_at: new Date().toISOString()
      });
    }

    if (eventType === 'subscription.canceled' || eventType === 'subscription.revoked') {
      const periodEnd =
        payloadData?.current_period_end ||
        payloadData?.ends_at ||
        payloadData?.current_period_end_at ||
        payloadData?.subscription?.current_period_end ||
        null;

      // Keep user Pro until period actually expires.
      if (isFutureDate(periodEnd)) {
        return res.status(200).json({ received: true, skipped: 'grace_period_active' });
      }

      const { error: cancelUpdateError } = await supabaseAdmin
        .from('profiles')
        .update({
          subscription: 'starter',
          scripts_remaining: 0,
          scripts_limit: 0,
          paid: false,
          subscription_updated_at: new Date().toISOString()
        })
        .eq('id', profileId);
      if (cancelUpdateError) throw cancelUpdateError;
    }

    return res.status(200).json({ received: true });
  } catch (error) {
    console.error('Polar webhook error:', error);
    return res.status(400).json({ error: 'Invalid webhook payload' });
  }
}
