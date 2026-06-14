import OpenAI from 'openai';
import { supabaseAdmin } from '../../../lib/supabaseAdmin';

const client = process.env.OPENAI_API_KEY
  ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  : null;

export const config = { maxDuration: 60 };

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  if (!client) return res.status(500).json({ error: 'OPENAI_API_KEY not configured' });
  if (!supabaseAdmin) return res.status(500).json({ error: 'Server not configured' });

  const token = (req.headers.authorization || '').replace('Bearer ', '').trim();
  if (!token) return res.status(401).json({ error: 'Authentication required.' });

  const { data: authData, error: authErr } = await supabaseAdmin.auth.getUser(token);
  if (authErr || !authData?.user) return res.status(401).json({ error: 'Invalid or expired session.' });

  const { input, imageBase64, imageMimeType, platform = 'tiktok', duration = '30 sec', style = 'cinematic' } = req.body || {};
  if (!input?.trim() && !imageBase64) return res.status(400).json({ error: 'Please provide a script, idea, or image.' });

  const systemPrompt = `You are the world's best AI video director and prompt engineer. You create hyper-detailed, cinematic video prompts that generate stunning, realistic AI videos. Every word you write translates directly into stunning visuals. Your prompts are used by top brands, creators, and agencies to generate content with tools like Runway Gen-3 Alpha, Kling 1.6, Sora, and Pika 2.0.`;

  const userPrompt = `${input ? `INPUT (script, product, or idea):\n"${input.trim()}"` : ''}
${imageBase64 ? '\n[An image has been provided — analyze it and base the video prompts on what you see.]' : ''}

Platform: ${platform} | Duration: ${duration} | Style: ${style}

Generate a COMPLETE PROFESSIONAL VIDEO PROMPT PACKAGE. Be hyper-specific. No vague adjectives — only concrete visual details.

---

🎬 MASTER PROMPT
Write one 120-150 word prompt that captures the entire video's aesthetic. Include: exact subject description, environment/setting, camera movement (pan, tracking, dolly, drone, etc.), lighting setup (golden hour / rim light / soft box / etc.), color grade (teal-orange, warm film, desaturated, etc.), mood, texture, lens feel (wide angle / anamorphic / telephoto / macro), and technical quality. This is the single most important prompt — make it extraordinary.

---

📽️ SCENE BREAKDOWN

Write 4-6 scenes depending on duration. For each:

SCENE [n] [timecode] — [SCENE NAME IN CAPS]
Shot: [exact camera angle — close-up / wide / over-shoulder / aerial / etc.]
Subject: [detailed description of person, product, or element in frame]
Action: [precise motion — what moves, how fast, what direction]
Lighting: [source, quality, direction, color temperature in Kelvin]
Color: [color palette, grade reference]
Prompt: "[Complete ready-to-paste prompt for this single scene — 40-60 words, ultra-specific]"

---

🎨 VISUAL IDENTITY
- Color grade: [specific description or LUT reference]
- Lens: [focal length feel, depth of field, bokeh quality]
- Camera motion: [stabilized / handheld / cinematic moves]
- Visual reference: "Feels like [specific film/ad] meets [another reference]"
- Brand feel: [3-5 precise emotional and visual adjectives]

---

❌ NEGATIVE PROMPT (what to tell the AI to AVOID)
blurry, low quality, [list 12+ specific things to avoid based on this content]

---

💡 PRO DIRECTOR TIP
[One specific, actionable advice to make this exact video better — based on the content provided]`;

  try {
    let responseText = '';

    if (imageBase64) {
      // Use GPT-4o with vision
      const completion = await client.chat.completions.create({
        model: 'gpt-4o',
        messages: [
          { role: 'system', content: systemPrompt },
          {
            role: 'user',
            content: [
              { type: 'text', text: userPrompt },
              {
                type: 'image_url',
                image_url: {
                  url: `data:${imageMimeType || 'image/jpeg'};base64,${imageBase64}`,
                  detail: 'high',
                },
              },
            ],
          },
        ],
        max_tokens: 2500,
        temperature: 0.85,
      });
      responseText = completion.choices[0]?.message?.content?.trim() || '';
    } else {
      // Text only — use responses API
      const response = await client.responses.create({
        model: process.env.OPENAI_MODEL || 'gpt-4.1-mini',
        input: `${systemPrompt}\n\n${userPrompt}`,
        temperature: 0.85,
        max_output_tokens: 2500,
      });
      responseText = response.output_text?.trim() || '';
    }

    if (!responseText) return res.status(502).json({ error: 'No response from AI' });
    return res.status(200).json({ text: responseText });
  } catch (err) {
    console.error('[video-prompt]', err?.message);
    return res.status(500).json({ error: 'Generation failed. Please try again.' });
  }
}
