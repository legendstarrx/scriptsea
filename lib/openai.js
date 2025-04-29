import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true
});

export async function generateWithOpenAI(prompt, maxTokens = 2000, temperature = 0.7) {
  try {
    const response = await fetch('/api/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt,
        maxTokens,
        temperature
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.details || data.error || 'Failed to generate content');
    }

    if (!data.success || !data.content) {
      throw new Error('Invalid response format');
    }

    return data.content;
  } catch (error) {
    console.error('Generation error:', error);
    throw error;
  }
} 