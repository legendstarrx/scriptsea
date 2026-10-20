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
export async function generate({ system, user, effort = 'high', maxTokens = 32000, schema = null, tools = null }) {
  if (!client) throw new GenerationError('AI is not configured.', 'not_configured');

  const messages = [{ role: 'user', content: user }];
  let message;
  // Server tools (web fetch) can pause a long turn with stop_reason "pause_turn";
  // resume by sending the paused assistant turn back, a few times at most.
  for (let attempt = 0; attempt < 4; attempt += 1) {
    const stream = client.beta.messages.stream({
      model: MODEL,
      max_tokens: maxTokens,
      betas: ['server-side-fallback-2026-06-01'],
      fallbacks: [{ model: FALLBACK_MODEL }],
      // With a schema the reply is guaranteed to be JSON matching it.
      output_config: schema ? { effort, format: { type: 'json_schema', schema } } : { effort },
      system: [{ type: 'text', text: system, cache_control: { type: 'ephemeral' } }],
      ...(tools ? { tools } : {}),
      messages,
    });
    message = await stream.finalMessage();
    if (message.stop_reason !== 'pause_turn') break;
    messages.push({ role: 'assistant', content: message.content });
  }

  if (message.stop_reason === 'refusal') {
    throw new GenerationError('This request couldn’t be completed. Try rephrasing your topic.', 'refusal');
  }
  if (message.stop_reason === 'pause_turn') {
    throw new GenerationError('Reading that page took too long. Please try again.');
  }

  // Read text blocks by type — the response starts with thinking blocks, and with
  // tools the model may write a short note before reading a page, so keep only
  // the text written after the last tool result.
  const lastTool = message.content.reduce(
    (idx, block, i) => (/tool_use|tool_result/.test(block.type) ? i : idx), -1,
  );
  const text = message.content
    .slice(lastTool + 1)
    .filter((block) => block.type === 'text')
    .map((block) => block.text)
    .join('')
    .trim();

  if (!text) throw new GenerationError('No response from AI. Please try again.');
  if (message.stop_reason === 'max_tokens') {
    console.warn('[claude] hit max_tokens', { maxTokens, effort });
    if (schema) throw new GenerationError('That script was too long to finish in one go. Try a shorter part of it.');
  }
  if (!schema) return text;
  try {
    return JSON.parse(text);
  } catch {
    throw new GenerationError('The AI returned an unreadable answer. Please try again.');
  }
}
