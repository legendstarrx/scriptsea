import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true
});

export async function generateWithOpenAI(prompt, maxTokens = 2000, temperature = 0.7) {
  try {
    if (!prompt) {
      throw new Error('Prompt is required');
    }

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

    let data;
    try {
      data = await response.json();
    } catch (error) {
      throw new Error('Failed to parse server response');
    }

    if (!response.ok) {
      // If we have a structured error response, use it
      if (data?.error && data?.message) {
        throw new Error(data.message);
      }
      // Otherwise, use status text
      throw new Error(response.statusText || 'Failed to generate content');
    }

    if (!data?.success || !data?.content) {
      throw new Error('Invalid response format from server');
    }

    return data.content;
  } catch (error) {
    // Log the full error for debugging
    console.error('Generation error:', {
      message: error.message,
      status: error.status,
      stack: error.stack
    });

    // Return a user-friendly error message
    if (error.message === 'Failed to fetch') {
      throw new Error('Network error. Please check your connection and try again.');
    }

    throw error;
  }
} 