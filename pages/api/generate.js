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

// Initialize OpenAI client with timeout
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  timeout: 60000, // 60 second timeout
  maxRetries: 2, // Retry failed requests twice
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
  try {
    // Run the CORS middleware
    await runMiddleware(req, res, cors);

    // Set response headers
    res.setHeader('Content-Type', 'application/json');

    if (req.method !== 'POST') {
      res.setHeader('Allow', ['POST']);
      return res.status(405).json({
        error: 'Method not allowed',
        message: `HTTP method ${req.method} is not supported.`
      });
    }

    const { prompt, maxTokens = 2000, temperature = 0.7 } = req.body;

    if (!prompt) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Prompt is required'
      });
    }

    // Set a timeout for the OpenAI request
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Request timeout')), 90000) // 90 second timeout
    );

    // Make the OpenAI request
    const openaiPromise = openai.chat.completions.create({
      model: "gpt-4-turbo-preview",
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
    });

    // Race between timeout and OpenAI request
    const completion = await Promise.race([openaiPromise, timeoutPromise]);

    if (!completion?.choices?.[0]?.message?.content) {
      throw new Error('No content received from OpenAI');
    }

    return res.status(200).json({
      success: true,
      content: completion.choices[0].message.content
    });

  } catch (error) {
    console.error('OpenAI API error:', error);

    // Handle timeout errors
    if (error.message === 'Request timeout') {
      return res.status(504).json({
        error: 'Gateway Timeout',
        message: 'Request took too long to process. Please try again.'
      });
    }

    // Handle rate limiting
    if (error.status === 429) {
      return res.status(429).json({
        error: 'Rate Limit Exceeded',
        message: 'Too many requests. Please try again later.'
      });
    }

    // Handle authentication errors
    if (error.status === 401) {
      return res.status(401).json({
        error: 'Authentication Error',
        message: 'Invalid API key or unauthorized access.'
      });
    }

    // Handle validation errors
    if (error.status === 400) {
      return res.status(400).json({
        error: 'Bad Request',
        message: error.message
      });
    }

    // Handle all other errors
    return res.status(500).json({
      error: 'Internal Server Error',
      message: 'An error occurred while generating content.'
    });
  }
}