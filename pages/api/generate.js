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
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Run the CORS middleware
    await runMiddleware(req, res, cors);

    // Set response headers
    res.setHeader('Content-Type', 'application/json');

    const { prompt, maxTokens = 2000, temperature = 0.7 } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    // Set a timeout using Promise.race
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Request timed out')), 60000);
    });

    const generatePromise = openai.chat.completions.create({
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

    // Race between the OpenAI request and the timeout
    const completion = await Promise.race([generatePromise, timeoutPromise]);

    if (!completion?.choices?.[0]?.message?.content) {
      throw new Error('No content received from OpenAI');
    }

    return res.status(200).json({
      success: true,
      content: completion.choices[0].message.content
    });

  } catch (error) {
    console.error('OpenAI API error:', error);

    // Handle specific error cases
    if (error.message === 'Request timed out') {
      return res.status(504).json({
        error: 'Request timed out',
        message: 'The request took too long to complete. Please try again.'
      });
    }

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