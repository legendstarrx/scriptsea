import Anthropic from '@anthropic-ai/sdk';

// One Claude client for every AI route. Server-side only.
export const MODEL = 'claude-opus-5-5';
// If Opus 5.5's safety classifiers decline a (harmless) request, the API re-runs
// it on this model inside the same call instead of failing the user's generation.
const FALLBACK_MODEL = 'claude-opus-4-8';

const client = process.env.ANTHROPIC_API_KEY
  ? new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
  : null;

export const claudeConfigured = Boolean(client);

export class GenerationError extends Error {
  constructor(message, code = 'generation_failed') {
    super(message);
    this.code = code;
  }
}

/**
 * Runs one generation and returns the final text.
 * - Streams under the hood so long outputs (60-min scripts) never hit HTTP timeouts.
 * - Opus 5.5 always thinks; `effort` controls how much (and therefore latency + cost).
 * - The system prompt is cached: it's identical across users, so repeat calls are cheaper.
 */
export async function generate({ system, user, effort = 'high', maxTokens = 32000 }) {
  if (!client) throw new GenerationError('AI is not configured.', 'not_configured');

  const stream = client.beta.messages.stream({
    model: MODEL,
    max_tokens: maxTokens,
    betas: ['server-side-fallback-2026-06-01'],
    fallbacks: [{ model: FALLBACK_MODEL }],
    output_config: { effort },
    system: [{ type: 'text', text: system, cache_control: { type: 'ephemeral' } }],
    messages: [{ role: 'user', content: user }],
  });

  const message = await stream.finalMessage();

  if (message.stop_reason === 'refusal') {
    throw new GenerationError('This request couldn’t be completed. Try rephrasing your topic.', 'refusal');
  }

  // Read text blocks by type — the response starts with thinking blocks.
  const text = message.content
    .filter((block) => block.type === 'text')
    .map((block) => block.text)
    .join('')
    .trim();

  if (!text) throw new GenerationError('No response from AI. Please try again.');
  if (message.stop_reason === 'max_tokens') {
    console.warn('[claude] hit max_tokens', { maxTokens, effort });
  }
  return text;
}
