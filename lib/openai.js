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

    // Add timeout to the fetch request
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 120000); // 2 minute timeout

    const response = await fetch('/api/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        prompt,
        maxTokens,
        temperature
      }),
      signal: controller.signal
    }).finally(() => clearTimeout(timeoutId));

    // Handle timeout and network errors
    if (!response) {
      throw new Error('Network error occurred. Please try again.');
    }

    // Parse response
    let data;
    try {
      data = await response.json();
    } catch (parseError) {
      if (response.status === 504) {
        throw new Error('Request timed out. Please try again.');
      }
      throw new Error('Failed to parse server response. Please try again.');
    }

    // Handle non-200 responses
    if (!response.ok) {
      const errorMessage = data?.message || data?.error || 'An error occurred while generating content.';
      throw new Error(errorMessage);
    }

    // Validate response format
    if (!data?.success || typeof data?.content !== 'string') {
      throw new Error('Invalid response format from server.');
    }

    return data.content;
  } catch (error) {
    // Handle abort errors
    if (error.name === 'AbortError') {
      throw new Error('Request timed out. Please try again.');
    }

    // Handle network errors
    if (error.name === 'TypeError' && error.message === 'Failed to fetch') {
      throw new Error('Network error occurred. Please check your connection and try again.');
    }

    // Log the error for debugging
    console.error('Generation error:', {
      name: error.name,
      message: error.message,
      stack: error.stack
    });

    // Return user-friendly error message
    throw new Error(error.message || 'Failed to generate content. Please try again.');
  }
} 