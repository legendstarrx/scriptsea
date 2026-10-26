// Claude client for the free tools only. Separate from lib/server/claude.js
// (the paid generator) so nothing here can affect it.
import Anthropic from '@anthropic-ai/sdk';
import { FREE_TOOL_MODEL_ID } from './config';

let client = null;
function getClient() {
  const apiKey = process.env.FREE_TOOLS_ANTHROPIC_API_KEY || process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return null;
  if (!client) client = new Anthropic({ apiKey, maxRetries: 1, timeout: 55_000 });
  return client;
}

export class FreeToolError extends Error {
  constructor(code, message) {
    super(message);
    this.code = code;
  }
}

/**
 * One structured call. Returns the parsed JSON object that matches `schema`.
 * Throws FreeToolError with a code the API route maps to a friendly message.
 */
export async function generateJson({ system, user, schema, maxTokens = 4000 }) {
  const anthropic = getClient();
  if (!anthropic) throw new FreeToolError('config', 'Missing API key');

  let res;
  try {
    res = await anthropic.messages.create({
      model: FREE_TOOL_MODEL_ID,
      max_tokens: maxTokens,
      system,
      messages: [{ role: 'user', content: user }],
      output_config: { effort: 'medium', format: { type: 'json_schema', schema } },
    });
  } catch (err) {
    const status = err?.status;
    if (status === 429 || status === 529) throw new FreeToolError('busy', 'Model busy');
    throw new FreeToolError('upstream', err?.message || 'Upstream error');
  }

  if (res.stop_reason === 'refusal') throw new FreeToolError('refusal', 'Refused');
  if (res.stop_reason === 'max_tokens') throw new FreeToolError('too_long', 'Output too long');

  const text = res.content.filter((b) => b.type === 'text').map((b) => b.text).join('');
  try {
    return JSON.parse(text);
  } catch {
    throw new FreeToolError('parse', 'Bad JSON');
  }
}
