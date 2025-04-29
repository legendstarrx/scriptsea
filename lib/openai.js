import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true
});

export async function generateWithOpenAI(prompt, maxTokens = 2048, temperature = 0.9) {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4-turbo-preview",
      messages: [
        {
          role: "system",
          content: `You are an expert viral content creator and master storyteller, specializing in creating highly engaging social media scripts that drive views and engagement. You excel at:
- Creating attention-grabbing hooks
- Writing viral-worthy content
- Crafting emotional storytelling
- Generating trending topics
- Understanding platform-specific content strategies
Always write in a natural, conversational tone that feels human and authentic.`
        },
        {
          role: "user",
          content: prompt
        }
      ],
      max_tokens: maxTokens,
      temperature: temperature,
      presence_penalty: 0.1, // Slightly encourage new topics
      frequency_penalty: 0.2, // Reduce repetition
      top_p: 0.9, // High-quality output while maintaining creativity
    });

    return response.choices[0].message.content;
  } catch (error) {
    // Check for specific API errors
    if (error.response?.status === 429) {
      throw new Error('Rate limit exceeded. Please try again in a few moments.');
    } else if (error.response?.status === 401) {
      throw new Error('API key error. Please check your OpenAI API key.');
    } else if (error.response?.status === 500) {
      throw new Error('OpenAI service error. Please try again.');
    }
    
    console.error('OpenAI API error:', error);
    throw error;
  }
} 