// POST /api/free-tools/generate: the free AI video prompt tools.
// Separate from /api/ai/* (the paid generator). No login; daily limit per visitor.
import { MODELS, MAX_INPUT_CHARS, DAILY_LIMIT, STYLE_OPTIONS, SOUND_OPTIONS } from '../../../lib/freeTools/config';
import { buildRequest, shapeResult } from '../../../lib/freeTools/promptBuilder';
import { generateJson } from '../../../lib/freeTools/claudeFree';
import { takeUse, writeCookieCount, verifyTurnstile } from '../../../lib/freeTools/limit';

export const config = { api: { bodyParser: { sizeLimit: '64kb' } }, maxDuration: 60 };

const ERRORS = {
  busy: 'The AI is busy right now. Give it a few seconds and try again.',
  refusal: 'We couldn’t write a prompt for that idea. Try describing it a different way.',
  too_long: 'That one came out too long. Try a shorter idea or paste fewer scenes.',
  default: 'Something went wrong on our side. Please try again in a moment.',
};

const LIMIT_MESSAGE = 'You’ve used today’s 5 free prompts. Sign up to ScriptSea free for 3 full scripts with every scene prompt.';

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const body = req.body || {};
  const input = typeof body.input === 'string' ? body.input.trim() : '';
  const modelId = MODELS[body.model] ? body.model : 'any';
  const variant = typeof body.variant === 'string' ? body.variant : undefined;
  const mode = body.mode === 'improve' ? 'improve' : 'generate';
  const style = STYLE_OPTIONS.some((o) => o.id === body.style) && body.style !== 'auto' ? body.style : null;
  const sound = SOUND_OPTIONS.some((o) => o.id === body.sound) && body.sound !== 'auto' ? body.sound : null;
  const secs = parseInt(body.seconds, 10);
  const seconds = Number.isFinite(secs) && secs >= 2 && secs <= 60 ? secs : null;

  if (input.length < 3) {
    return res.status(400).json({ error: mode === 'improve' ? 'Paste the prompt you want to fix first.' : 'Describe your idea first. A sentence is enough.' });
  }
  if (input.length > MAX_INPUT_CHARS) {
    return res.status(400).json({ error: `That’s over ${MAX_INPUT_CHARS.toLocaleString()} characters. Trim it down and try again.` });
  }

  if (!(await verifyTurnstile(body.turnstileToken, req))) {
    return res.status(403).json({ error: 'Please complete the quick check above the button and try again.', code: 'turnstile' });
  }

  const use = await takeUse(req);
  if (!use.ok) {
    return res.status(429).json({ error: LIMIT_MESSAGE, code: 'limit', remaining: 0 });
  }

  try {
    const request = buildRequest({ modelId, variant, mode, input, style, seconds, sound });
    const data = await generateJson(request);
    const result = shapeResult(request.kind, data);
    if (!result) throw Object.assign(new Error('empty'), { code: 'default' });

    writeCookieCount(res, use.used);
    return res.status(200).json({ ...result, remaining: Math.max(0, DAILY_LIMIT - use.used) });
  } catch (err) {
    await use.release();
    if (err?.code === 'config') console.error('[free-tools] missing FREE_TOOLS_ANTHROPIC_API_KEY');
    else console.error('[free-tools] generation failed:', err?.code || '', err?.message || err);
    const status = err?.code === 'busy' ? 503 : err?.code === 'refusal' || err?.code === 'too_long' ? 422 : 500;
    return res.status(status).json({ error: ERRORS[err?.code] || ERRORS.default });
  }
}
