import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true
});

export async function generateWithOpenAI(prompt, maxTokens = 2000, temperature = 0.7) {
  const MAX_RETRIES = 2;
  const TIMEOUT = 8000; // 8 seconds

  async function makeRequest(retryCount = 0) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), TIMEOUT);

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
        signal: controller.signal
      });

      clearTimeout(timeout);

      let data;
      try {
        data = await response.json();
      } catch (error) {
        console.error('Failed to parse response:', error);
        throw new Error('Failed to parse server response');
      }

      // Handle non-200 responses
      if (!response.ok) {
        const errorMessage = data?.message || data?.error || response.statusText || 'Failed to generate content';
        
        // If rate limited and we haven't exceeded retries, try again
        if (response.status === 429 && retryCount < MAX_RETRIES) {
          const delay = Math.pow(2, retryCount) * 1000; // Exponential backoff
          await new Promise(resolve => setTimeout(resolve, delay));
          return makeRequest(retryCount + 1);
        }
        
        throw new Error(errorMessage);
      }

      // Validate response format
      if (!data?.success || typeof data?.content !== 'string') {
        console.error('Invalid response format:', data);
        throw new Error('Invalid response format from server');
      }

      return data.content;
    } catch (error) {
      clearTimeout(timeout);

      // Handle abort/timeout
      if (error.name === 'AbortError') {
        if (retryCount < MAX_RETRIES) {
          const delay = Math.pow(2, retryCount) * 1000;
          await new Promise(resolve => setTimeout(resolve, delay));
          return makeRequest(retryCount + 1);
        }
        throw new Error('Request timed out after multiple attempts');
      }

      // Handle network errors with retry
      if (error.message === 'Failed to fetch' && retryCount < MAX_RETRIES) {
        const delay = Math.pow(2, retryCount) * 1000;
        await new Promise(resolve => setTimeout(resolve, delay));
        return makeRequest(retryCount + 1);
      }

      throw error;
    }
  }

  try {
    if (!prompt) {
      throw new Error('Prompt is required');
    }

    return await makeRequest();
  } catch (error) {
    // Log the error for debugging
    console.error('Generation error:', {
      message: error.message,
      status: error.status,
      stack: error.stack
    });

    // Pass through the error message
    throw error;
  }
} 