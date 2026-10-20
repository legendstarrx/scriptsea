import { claudeConfigured, generate, GenerationError } from '../../../lib/server/claude';
import { refundCredit, requireUser, reserveCredit, sendUsageError } from '../../../lib/server/usage';
import { buildScriptRequest } from '../../../lib/server/prompts/script';

export const config = { maxDuration: 300 };

const FREE_DURATIONS = ['15 sec', '30 sec'];

/**
 * POST /api/ai/script
 * Body: { mode: 'viral' | 'ad', duration, platform, tone, ...mode fields }
 * The prompt is built here from validated settings, never taken from the client.
 */
export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  if (!claudeConfigured) return res.status(500).json({ error: 'AI is not configured.' });

  let request;
  try {
    request = buildScriptRequest(req.body || {});
  } catch (message) {
    return res.status(400).json({ error: typeof message === 'string' ? message : 'Invalid request.' });
  }

  let ticket = null;
  try {
    const user = await requireUser(req);
    ticket = await reserveCredit(user, {
      freeAllowed: FREE_DURATIONS.includes(req.body?.duration),
      proMessage: 'The free plan covers 15 and 30 second scripts. Go Pro for every length.',
    });

    const text = await generate({
      system: request.system,
      user: request.user,
      tools: request.tools,
      // Long scripts are mostly output; medium keeps 60-minute scripts well inside the time limit.
      effort: request.longForm ? 'medium' : 'high',
      maxTokens: request.longForm ? 48000 : 16000,
    });
    if (/^\s*SITE_UNREADABLE\s*$/.test(text)) {
      await refundCredit(ticket);
      ticket = null;
      return res.status(422).json({
        error: 'We couldn’t read that page (some sites block automatic reading). Add a short description of your product and try again. This one didn’t use a credit.',
      });
    }
    return res.status(200).json({ text });
  } catch (err) {
    if (ticket) await refundCredit(ticket);
    if (err instanceof GenerationError) {
      console.error('[script]', err.code, err.message);
      return res.status(err.code === 'refusal' ? 422 : 502).json({ error: err.message });
    }
    if (err?.status && err?.body) return sendUsageError(res, err);
    console.error('[script] Claude API error:', err?.status, err?.message);
    return res.status(500).json({ error: 'Generation failed. Please try again.' });
  }
}
