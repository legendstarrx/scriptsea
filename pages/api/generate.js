import OpenAI from 'openai';
import Cors from 'cors';

// Initialize CORS middleware
const cors = Cors({
  methods: ['POST', 'HEAD'],
});

// Helper method to run middleware
function runMiddleware(req, res, fn) {
  return new Promise((resolve, reject) => {
    fn(req, res, (result) => {
      if (result instanceof Error) {
        return reject(result);
      }
      return resolve(result);
    });
  });
}

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '1mb',
    },
    responseLimit: '8mb',
  },
  runtime: 'edge', // This enables Edge Runtime
};

export default async function handler(req, res) {
  try {
    // Run the CORS middleware
    await runMiddleware(req, res, cors);

    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Method not allowed' });
    }

    const { prompt, maxTokens = 2000, temperature = 0.7 } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    // Create an AbortController for the OpenAI request
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000); // 8 second timeout

    try {
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
        top_p: 0.9,
        signal: controller.signal
      });

      clearTimeout(timeout);

      if (!completion?.choices?.[0]?.message?.content) {
        throw new Error('No content received from OpenAI');
      }

      return res.status(200).json({
        success: true,
        content: completion.choices[0].message.content
      });
    } catch (error) {
      if (error.name === 'AbortError') {
        return res.status(504).json({
          error: 'Request timeout',
          message: 'The request took too long to complete. Please try with a shorter prompt or try again later.'
        });
      }
      throw error; // Re-throw other errors to be caught by the outer catch block
    } finally {
      clearTimeout(timeout);
    }

  } catch (error) {
    console.error('OpenAI API error:', error);

    if (error.status === 429 || (error.error?.type === 'rate_limit_exceeded')) {
      return res.status(429).json({
        error: 'Rate limit exceeded',
        message: 'Too many requests. Please try again in a few moments.'
      });
    }

    if (error.status === 401 || error.error?.type === 'invalid_request_error') {
      return res.status(401).json({
        error: 'Authentication error',
        message: 'API key error. Please contact support.'
      });
    }

    // Extract the most relevant error message
    const errorMessage = error.error?.message || error.message || 'Failed to generate content';

    return res.status(500).json({
      error: 'Generation failed',
      message: errorMessage
    });
  }
}