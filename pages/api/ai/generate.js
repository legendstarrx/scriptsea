import Anthropic from '@anthropic-ai/sdk';
import { supabaseAdmin } from '../../../lib/supabaseAdmin';

const client = process.env.ANTHROPIC_API_KEY
  ? new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
  : null;

export const config = { maxDuration: 300 };

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  if (!client) return res.status(500).json({ error: 'ANTHROPIC_API_KEY is not configured' });
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
    if (scriptsGenerated >= 1) {
      return res.status(403).json({
        error: 'limit_reached',
        message: "You've used your free script. Upgrade to Pro to keep generating.",
      });
    }
  }

  // ── 4. Generate ───────────────────────────────────────────────────────────
  const maxTokens = Math.min(Number(requestedTokens) || 2048, 8000);

  try {
    const response = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: maxTokens,
      temperature: Math.min(temperature, 1.0),
      messages: [{ role: 'user', content: prompt }],
    });

    const text = response.content?.[0]?.text?.trim();
    if (!text) return res.status(502).json({ error: 'No text returned from AI' });

    // ── 5. Decrement usage ──────────────────────────────────────────────────
    if (isPro) {
      await supabaseAdmin
        .from('profiles')
        .update({
          scripts_remaining: Math.max(scriptsRemaining - 1, 0),
          scripts_generated: scriptsGenerated + 1,
        })
        .eq('id', user.id);
    } else {
      await supabaseAdmin
        .from('profiles')
        .update({ scripts_generated: 1 })
        .eq('id', user.id);
    }

    return res.status(200).json({ text });
  } catch (err) {
    console.error('[generate] Claude API error:', err?.status, err?.message);
    return res.status(500).json({ error: err?.message || 'Generation failed. Please try again.' });
  }
}
