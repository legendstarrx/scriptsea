import OpenAI from 'openai';

const resolvedApiKey = process.env.OPENAI_API_KEY;
const client = resolvedApiKey
  ? new OpenAI({ apiKey: resolvedApiKey })
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
    return res.status(500).json({
      error: 'OPENAI_API_KEY is not configured',
      detail: 'Set OPENAI_API_KEY in your server environment (Vercel Project Settings -> Environment Variables).'
    });
  }

  try {
    const { prompt, temperature = 0.9, maxTokens: requestedTokens = 2048 } = req.body || {};
    // Hobby plan: 60s limit. GPT-4.1-mini ~60 tok/s → safe cap is 3500 tokens
    const maxTokens = Math.min(Number(requestedTokens) || 2048, 3500);

    if (!prompt || typeof prompt !== 'string') {
      return res.status(400).json({ error: 'A valid prompt is required' });
    }

    const preferredModel = process.env.OPENAI_MODEL || 'gpt-4.1-mini';
    const fallbackModel = 'gpt-4o-mini';

    let response;
    try {
      response = await client.responses.create({
        model: preferredModel,
        input: prompt,
        temperature,
        max_output_tokens: maxTokens
      });
    } catch (modelError) {
      const message = String(modelError?.message || '');
      const shouldFallback =
        preferredModel !== fallbackModel &&
        (message.toLowerCase().includes('model') || message.toLowerCase().includes('not found'));

      if (!shouldFallback) throw modelError;

      response = await client.responses.create({
        model: fallbackModel,
        input: prompt,
        temperature,
        max_output_tokens: maxTokens
      });
    }

    const text = response.output_text?.trim();
    if (!text) {
      return res.status(502).json({ error: 'No text returned from OpenAI' });
    }

    return res.status(200).json({ text });
  } catch (error) {
    console.error('OpenAI generation failed:', error);
    return res.status(500).json({
      error: 'Failed to generate content',
      detail: error?.message || 'Unknown error'
    });
  }
}
