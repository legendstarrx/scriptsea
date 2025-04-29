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
      timeout: 60000 // 60 second timeout
    });

    if (!completion?.choices?.[0]?.message?.content) {
      throw new Error('No content received from OpenAI');
    }

    return res.status(200).json({
      success: true,
      content: completion.choices[0].message.content
    });

  } catch (error) {
    console.error('OpenAI API error:', error);

    // Handle specific error types
    if (error.code === 'ETIMEDOUT' || error.code === 'ESOCKETTIMEDOUT') {
      return res.status(504).json({
        error: 'Request timed out',
        message: 'The request took too long to complete. Please try again.'
      });
    }

    if (error.status === 429) {
      return res.status(429).json({
        error: 'Rate limit exceeded',
        message: 'Too many requests. Please try again in a few moments.'
      });
    }

    if (error.status === 401) {
      return res.status(401).json({
        error: 'Authentication error',
        message: 'API key error. Please contact support.'
      });
    }

    return res.status(500).json({
      error: 'Generation failed',
      message: error.message || 'Failed to generate content. Please try again.'
    });
  }
}