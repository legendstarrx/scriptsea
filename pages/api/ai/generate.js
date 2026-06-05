import OpenAI from 'openai';
import { supabaseAdmin } from '../../../lib/supabaseAdmin';

const client = process.env.OPENAI_API_KEY
  ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  : null;

export const config = { maxDuration: 60 };

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  if (!client) return res.status(500).json({ error: 'OPENAI_API_KEY is not configured' });
  if (!supabaseAdmin) return res.status(500).json({ error: 'Server not configured' });

  const { prompt, temperature = 0.9, maxTokens: requestedTokens = 2048 } = req.body || {};
  if (!prompt || typeof prompt !== 'string') return res.status(400).json({ error: 'A valid prompt is required' });

  // ── 1. Verify token — hard requirement ────────────────────────────────────
  const token = (req.headers.authorization || '').replace('Bearer ', '').trim();
  if (!token) return res.status(401).json({ error: 'Authentication required.' });

  const { data: authData, error: authErr } = await supabaseAdmin.auth.getUser(token);
  if (authErr || !authData?.user) {
    return res.status(401).json({ error: 'Invalid or expired session. Please sign in again.' });
  }
  const user = authData.user;

  // ── 2. Fetch profile ──────────────────────────────────────────────────────
  let { data: profile } = await supabaseAdmin
    .from('profiles')
    .select('subscription, subscription_status, paid, scripts_remaining, scripts_generated, scripts_limit')
    .eq('id', user.id)
    .maybeSingle();

  // Create profile on-the-fly if it doesn't exist yet
  if (!profile) {
    const { data: created } = await supabaseAdmin
      .from('profiles')
      .insert({ id: user.id, email: user.email, scripts_generated: 0, scripts_remaining: 0 })
      .select()
      .maybeSingle();
    profile = created || { scripts_generated: 0, scripts_remaining: 0, subscription: 'starter', paid: false };
  }

  // ── 3. Check limits ───────────────────────────────────────────────────────
  const sub = String(profile.subscription || '').toLowerCase();
  const isPro = sub === 'pro' || profile.paid === true || profile.subscription_status === 'active';
  const scriptsGenerated = Number(profile.scripts_generated ?? 0);
  const scriptsRemaining = Number(profile.scripts_remaining ?? 0);

  if (isPro) {
    if (scriptsRemaining <= 0) {
      return res.status(403).json({
        error: 'limit_reached',
        message: "You've used all your scripts for this period.",
      });
    }
  } else {
    // Starter: 1 free script only
    if (scriptsGenerated >= 1) {
      return res.status(403).json({
        error: 'limit_reached',
        message: "You've used your free script. Upgrade to Pro to keep generating.",
      });
    }
  }

  // ── 4. Generate ───────────────────────────────────────────────────────────
  const maxTokens = Math.min(Number(requestedTokens) || 2048, 3500);
  const preferredModel = process.env.OPENAI_MODEL || 'gpt-4.1-mini';
  const fallbackModel = 'gpt-4o-mini';

  let response;
  try {
    response = await client.responses.create({ model: preferredModel, input: prompt, temperature, max_output_tokens: maxTokens });
  } catch (modelErr) {
    const msg = String(modelErr?.message || '');
    if (preferredModel !== fallbackModel && (msg.includes('model') || msg.includes('not found'))) {
      response = await client.responses.create({ model: fallbackModel, input: prompt, temperature, max_output_tokens: maxTokens });
    } else {
      throw modelErr;
    }
  }

  const text = response.output_text?.trim();
  if (!text) return res.status(502).json({ error: 'No text returned from OpenAI' });

  // ── 5. Decrement usage — direct update, no RPC needed ────────────────────
  if (isPro) {
    await supabaseAdmin
      .from('profiles')
      .update({
        scripts_remaining: Math.max(scriptsRemaining - 1, 0),
        scripts_generated: scriptsGenerated + 1,
      })
      .eq('id', user.id);
  } else {
    // Mark free script as used
    await supabaseAdmin
      .from('profiles')
      .update({ scripts_generated: 1 })
      .eq('id', user.id);
  }

  return res.status(200).json({ text });
}
