import { Configuration, OpenAIApi } from 'openai';

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY
});

const openai = new OpenAIApi(configuration);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { prompt, maxTokens = 2000, temperature = 0.7 } = req.body;

    const completion = await openai.createChatCompletion({
      model: "gpt-4-turbo-preview",
      messages: [
        { role: "system", content: "You are a master scriptwriter and content creator, skilled in creating viral content and engaging scripts." },
        { role: "user", content: prompt }
      ],
      max_tokens: maxTokens,
      temperature: temperature,
    });

    return res.status(200).json({
      success: true,
      content: completion.data.choices[0].message.content
    });
  } catch (error) {
    console.error('OpenAI API error:', error);
    return res.status(500).json({
      error: 'Failed to generate content',
      details: error.message
    });
  }
} 