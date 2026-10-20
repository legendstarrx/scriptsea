import { claudeConfigured, generate, GenerationError } from '../../../lib/server/claude';
import { refundCredit, requireUser, reserveCredit, sendUsageError } from '../../../lib/server/usage';
import { buildVideoRequest } from '../../../lib/server/prompts/video';

export const config = { maxDuration: 300 };

/**
 * POST /api/ai/video-prompt
 * Body: { input, target, duration, style, withVoiceover, charGender, charAppearance, animStyle }
 * Pro only. Every request builds its own prompt from scratch: nothing is shared
 * between requests or users.
 */
export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  if (!claudeConfigured) return res.status(500).json({ error: 'AI is not configured.' });

  let request;
  try {
    request = buildVideoRequest(req.body || {});
  } catch (message) {
    return res.status(400).json({ error: typeof message === 'string' ? message : 'Invalid request.' });
  }

  let ticket = null;
  try {
    const user = await requireUser(req);
    ticket = await reserveCredit(user, { proOnly: true, proMessage: 'Video prompts are part of Pro.' });

    const text = await generate({
      system: request.system,
      user: request.user,
      effort: 'medium',
      maxTokens: Math.min(8000 + request.numScenes * 900, 40000),
    });
    return res.status(200).json({ text });
  } catch (err) {
    if (ticket) await refundCredit(ticket);
    if (err instanceof GenerationError) {
      console.error('[video-prompt]', err.code, err.message);
      return res.status(err.code === 'refusal' ? 422 : 502).json({ error: err.message });
    }
    if (err?.status && err?.body) return sendUsageError(res, err);
    console.error('[video-prompt] Claude API error:', err?.status, err?.message);
    return res.status(500).json({ error: 'Generation failed. Please try again.' });
  }
}
