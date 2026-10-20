import { claudeConfigured, generate, GenerationError } from '../../../lib/server/claude';
import { refundCredit, requireUser, reserveCredit, sendUsageError } from '../../../lib/server/usage';
import { assembleScenes, buildVideoRequest } from '../../../lib/server/prompts/video';

export const config = { maxDuration: 300 };

/**
 * POST /api/ai/video-prompt
 * Body: { input, target, duration (max clip length), style, withVoiceover, charGender, charAppearance, animStyle }
 * Returns { scenes, negativePrompt, tip, truncated }. Pro only.
 * Every request builds its own prompt from scratch: nothing is shared between users.
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

    const data = await generate({
      system: request.system,
      user: request.user,
      schema: request.schema,
      effort: 'medium',
      maxTokens: Math.min(10000 + request.plan.clips.length * 1500, 60000),
    });

    const result = assembleScenes({ data, plan: request.plan, ctx: request.ctx });
    if (!result.scenes.length) throw new GenerationError('We couldn’t build the scenes this time. Please try again.');
    return res.status(200).json(result);
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
