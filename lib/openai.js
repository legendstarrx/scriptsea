import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true
});

export async function generateWithOpenAI(prompt, maxTokens = 2000, temperature = 0.7) {
  try {
    // First check if we have all required parameters
    if (!prompt) {
      throw new Error('Prompt is required');
    }

    // Make the API request
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
    });

    // Always try to parse the JSON response, even if it's an error
    let data;
    try {
      data = await response.json();
    } catch (parseError) {
      console.error('Failed to parse response:', parseError);
      throw new Error('Invalid response from server');
    }

    // Handle non-200 responses
    if (!response.ok) {
      throw new Error(data.message || data.error || 'Failed to generate content');
    }

    // Validate the response format
    if (!data.success || typeof data.content !== 'string') {
      console.error('Invalid response format:', data);
      throw new Error('Invalid response format from server');
    }

    return data.content;
  } catch (error) {
    // Log the full error for debugging
    console.error('Generation error:', error);

    // Throw a user-friendly error
    if (error.message) {
      throw error;
    } else {
      throw new Error('Failed to generate content. Please try again.');
    }
  }
} 