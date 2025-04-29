import OpenAI from 'openai';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

export const config = {
  runtime: 'edge'
};

export default async function handler(req) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      {
        status: 405,
        headers: {
          'Content-Type': 'application/json',
          'Allow': 'POST'
        }
      }
    );
  }

  try {
    const body = await req.json();
    const { prompt, maxTokens = 2000, temperature = 0.7 } = body;

    if (!prompt) {
      return new Response(
        JSON.stringify({ error: 'Prompt is required' }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "You are a master scriptwriter and content creator, skilled in creating viral content and engaging scripts."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      max_tokens: maxTokens,
      temperature: temperature,
      presence_penalty: 0.1,
      frequency_penalty: 0.1,
      top_p: 0.9
    });

    if (!completion?.choices?.[0]?.message?.content) {
      throw new Error('No content received from OpenAI');
    }

    return new Response(
      JSON.stringify({
        success: true,
        content: completion.choices[0].message.content
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('OpenAI API error:', error);

    // Handle rate limiting
    if (error.status === 429 || (error.error?.type === 'rate_limit_exceeded')) {
      return new Response(
        JSON.stringify({
          error: 'Rate limit exceeded',
          message: 'Too many requests. Please try again in a few moments.'
        }),
        {
          status: 429,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    // Handle authentication errors
    if (error.status === 401 || error.error?.type === 'invalid_request_error') {
      return new Response(
        JSON.stringify({
          error: 'Authentication error',
          message: 'API key error. Please contact support.'
        }),
        {
          status: 401,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    // Extract the most relevant error message
    const errorMessage = error.error?.message || error.message || 'Failed to generate content';

    return new Response(
      JSON.stringify({
        error: 'Generation failed',
        message: errorMessage
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}