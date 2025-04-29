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
      console.error('Failed to parse response:', error);
      throw new Error('Failed to parse server response');
    }

    // Handle non-200 responses with proper error messages
    if (!response.ok) {
      const errorMessage = data?.message || data?.error || response.statusText || 'Failed to generate content';
      throw new Error(errorMessage);
    }

    // Validate the response format
    if (!data?.success || typeof data?.content !== 'string') {
      console.error('Invalid response format:', data);
      throw new Error('Invalid response format from server');
    }

    return data.content;
  } catch (error) {
    // Log the error for debugging
    console.error('Generation error:', {
      message: error.message,
      status: error.status,
      stack: error.stack
    });

    // Handle network errors
    if (error.message === 'Failed to fetch') {
      throw new Error('Network error. Please check your connection and try again.');
    }

    // Pass through the error message
    throw error;
  }
} 