import OpenAI from 'openai';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { prompt, maxTokens = 2000, temperature = 0.7 } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    const completion = await openai.chat.completions.create({
      model: "gpt-4-turbo-preview",
      messages: [
        { role: "system", content: "You are a master scriptwriter and content creator, skilled in creating viral content and engaging scripts." },
        { role: "user", content: prompt }
      ],
      max_tokens: maxTokens,
      temperature: temperature,
    });

    // Check if we have a valid response
    if (!completion.choices?.[0]?.message?.content) {
      throw new Error('Invalid response from OpenAI');
    }

    return res.status(200).json({
      success: true,
      content: completion.choices[0].message.content
    });
  } catch (error) {
    console.error('OpenAI API error:', error);
    
    // Handle specific OpenAI errors
    if (error.status === 429) {
      return res.status(429).json({
        error: 'Rate limit exceeded',
        details: 'Too many requests. Please try again later.'
      });
    }
    
    if (error.status === 401) {
      return res.status(401).json({
        error: 'Authentication error',
        details: 'Invalid API key'
      });
    }

    return res.status(500).json({
      error: 'Failed to generate content',
      details: error.message
    });
  }
}