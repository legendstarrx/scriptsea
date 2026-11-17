// POST /api/free-tools/script: free hook and script generators.
// No login. Shares the free tools' Claude client and 5-a-day limit per IP.
// The API key stays on the server (lib/freeTools/claudeFree.js).
import { SCRIPT_TOOLS, MAX_IDEA_CHARS } from '../../../lib/scriptTools/config';
import { buildScriptRequest, shapeScriptResult } from '../../../lib/scriptTools/prompts';
import { generateJson } from '../../../lib/freeTools/claudeFree';
import { takeUse, writeCookieCount, verifyTurnstile } from '../../../lib/freeTools/limit';
import { DAILY_LIMIT } from '../../../lib/freeTools/config';

export const config = { api: { bodyParser: { sizeLimit: '16kb' } }, maxDuration: 60 };

const TRY_AGAIN = 'That didn’t work. Please try again.';
const LIMIT_MESSAGE = 'You’ve used today’s 5 free tries. Sign up to ScriptSea free for 3 full scripts with a ready AI video prompt for every scene.';

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const body = req.body || {};
  const tool = SCRIPT_TOOLS[body.page];
  if (!tool) return res.status(400).json({ error: TRY_AGAIN });

  const idea = typeof body.input === 'string' ? body.input.trim() : '';
  if (idea.length < 3) return res.status(400).json({ error: 'Tell us what your video is about first. A sentence is enough.' });
  if (idea.length > MAX_IDEA_CHARS) return res.status(400).json({ error: `Keep it under ${MAX_IDEA_CHARS} characters.` });

  // The hook page can also turn a chosen hook into a full script.
  let kind = tool.kind;
  let hook = '';
  if (tool.kind === 'hooks' && body.action === 'script') {
    hook = typeof body.hook === 'string' ? body.hook.trim().slice(0, 240) : '';
    if (!hook) return res.status(400).json({ error: 'Pick a hook first.' });
    kind = 'hook-script';
  }
  const secs = parseInt(body.seconds, 10);
  const seconds = tool.lengths.includes(secs) ? secs : tool.defaultLength;

  if (!(await verifyTurnstile(body.turnstileToken, req))) {
    return res.status(403).json({ error: 'Please complete the quick check above the button and try again.' });
  }

  const use = await takeUse(req);
  if (!use.ok) return res.status(429).json({ error: LIMIT_MESSAGE, code: 'limit', remaining: 0 });

  try {
    const request = buildScriptRequest({ kind, idea, hook, seconds });
    const data = await generateJson(request);
    const result = shapeScriptResult(kind, data);
    if (!result) throw new Error('empty result');

    writeCookieCount(res, use.used);
    return res.status(200).json({ ...result, remaining: Math.max(0, DAILY_LIMIT - use.used) });
  } catch (err) {
    await use.release();
    console.error('[free-tools/script] failed:', err?.code || '', err?.message || err);
    return res.status(500).json({ error: TRY_AGAIN });
  }
}
