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
      })
    });

    let data;
    try {
      data = await response.json();
    } catch (error) {
      console.error('Failed to parse response:', error);
      throw new Error('Failed to parse server response');
    }

    if (!response.ok) {
      throw new Error(data?.message || data?.error || 'Failed to generate content');
    }

    if (!data?.success || typeof data?.content !== 'string') {
      throw new Error('Invalid response format from server');
    }

    return data.content;
  } catch (error) {
    console.error('Generation error:', {
      message: error.message,
      status: error.status,
      stack: error.stack
    });
    throw error;
  }
} 