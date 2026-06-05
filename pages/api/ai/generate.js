import OpenAI from 'openai';
import { supabaseAdmin } from '../../../lib/supabaseAdmin';

const client = process.env.OPENAI_API_KEY
  ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  : null;

// Vercel Hobby plan max is 60 seconds
export const config = {
  maxDuration: 60,
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  if (!client) {
    return res.status(500).json({ error: 'OPENAI_API_KEY is not configured' });
  }

  const { prompt, temperature = 0.9, maxTokens: requestedTokens = 2048 } = req.body || {};

  if (!prompt || typeof prompt !== 'string') {
    return res.status(400).json({ error: 'A valid prompt is required' });
  }

  // ── Auth + limit check ────────────────────────────────────────────────────
  const token = (req.headers.authorization || '').replace('Bearer ', '').trim();
  let userId = null;
  let isPro = false;
  let isFreeTrialUser = false;

  if (token && supabaseAdmin) {
    try {
      const { data: { user } } = await supabaseAdmin.auth.getUser(token);
      if (user) {
        userId = user.id;
        const { data: profile } = await supabaseAdmin
          .from('profiles')
          .select('subscription, subscription_status, paid, scripts_remaining, scripts_generated, scripts_limit')
          .eq('id', userId)
          .maybeSingle();

        if (profile) {
          const sub = String(profile.subscription || '').toLowerCase();
          isPro = sub === 'pro' || profile.paid || profile.subscription_status === 'active';

          if (isPro) {
            // Pro user — check they have scripts remaining
            const remaining = Number(profile.scripts_remaining ?? 0);
            if (remaining <= 0) {
              return res.status(403).json({
                error: 'limit_reached',
                message: 'You\'ve used all your scripts for this period. Upgrade or wait for renewal.',
              });
            }
          } else {
            // Starter user — allow exactly 1 free script
            const generated = Number(profile.scripts_generated ?? 0);
            if (generated >= 1) {
              return res.status(403).json({
                error: 'limit_reached',
                message: 'You\'ve used your free script. Upgrade to Pro to keep generating.',
              });
            }
            isFreeTrialUser = true;
          }
        }
      }
    } catch (e) {
      console.error('[generate] Auth check error:', e?.message);
      // Don't block — fall through and generate (graceful degradation)
    }
  }

  // ── Generate ──────────────────────────────────────────────────────────────
  const maxTokens = Math.min(Number(requestedTokens) || 2048, 3500);
  const preferredModel = process.env.OPENAI_MODEL || 'gpt-4.1-mini';
  const fallbackModel = 'gpt-4o-mini';

  let response;
  try {
    response = await client.responses.create({
      model: preferredModel,
      input: prompt,
      temperature,
      max_output_tokens: maxTokens,
    });
  } catch (modelError) {
    const msg = String(modelError?.message || '');
    const shouldFallback =
      preferredModel !== fallbackModel &&
      (msg.toLowerCase().includes('model') || msg.toLowerCase().includes('not found'));

    if (!shouldFallback) throw modelError;

    response = await client.responses.create({
      model: fallbackModel,
      input: prompt,
      temperature,
      max_output_tokens: maxTokens,
    });
  }

  const text = response.output_text?.trim();
  if (!text) {
    return res.status(502).json({ error: 'No text returned from OpenAI' });
  }

  // ── Decrement / record usage ──────────────────────────────────────────────
  if (userId && supabaseAdmin) {
    try {
      if (isPro) {
        await supabaseAdmin.rpc('decrement_scripts_remaining', { user_id: userId });
      } else if (isFreeTrialUser) {
        // Mark the free script as used
        await supabaseAdmin
          .from('profiles')
          .update({ scripts_generated: 1 })
          .eq('id', userId);
      }
    } catch (e) {
      // Non-fatal — script was generated, just log
      console.error('[generate] Usage update error:', e?.message);
    }
  }

  return res.status(200).json({ text });
}
