import OpenAI from 'openai';
import { supabaseAdmin } from '../../../lib/supabaseAdmin';

const client = process.env.OPENAI_API_KEY
  ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  : null;

export const config = { maxDuration: 60 };

// Style-specific rules — based on research into Veo, Kling, SeedDance, Hailuo, Runway, Pika prompting patterns
const STYLE_SYSTEM = {
  ugc: {
    name: 'UGC / Viral',
    rule: (withVoiceover) => `STYLE: UGC / Viral
- The video MUST feature ONE real human character on camera — a UGC-style creator. Never generate a scene without this person.
- Describe the character specifically: approximate age, gender, ethnicity/skin tone, hairstyle, clothing, facial expression, and energy.
- The character is holding, using, demonstrating, or reacting to the product/idea — describe exactly what they do with their hands and body.
${withVoiceover
    ? '- The character appears to be SPEAKING directly to camera — mouth moving naturally, engaged expression, as if delivering the voiceover script live.'
    : '- The character reacts with expressive body language and facial expressions — no dialogue, purely visual storytelling.'}
- Setting: real, relatable environments (bedroom, kitchen, car, desk, outdoors) — never a studio.
- Lighting: natural window light, daylight, or a ring light — never professional studio lighting.
- Camera: handheld smartphone feel, slight natural shake, close-up framing on face and product.
- End the prompt with: photorealistic, ultra HD, no watermark, no text, no subtitles.`,
  },
  broll: {
    name: 'B-Roll',
    rule: (withVoiceover) => `STYLE: B-Roll
- ZERO people, hands, faces, or body parts in frame. The product and its environment are the only subjects.
- Describe the product's exact appearance (shape, color, material, texture, label/branding details) and its setting (surface, background, props).
- Camera: smooth cinematic movement — slow push-in, orbit, macro pan, slider move, or product rotation.
- Lighting: premium and intentional — golden hour, rim light, soft diffusion, dramatic shadow play.
${withVoiceover ? '- This visual will be paired with a narrator voiceover — make it feel like a premium ad backdrop that supports the words without needing a speaker on screen.' : ''}
- End the prompt with: photorealistic, ultra HD, no watermark, no text, no subtitles.`,
  },
  animation: {
    name: 'Animation',
    rule: (withVoiceover) => `STYLE: Animation
- Specify the exact animation style based on what fits the content best (e.g. "3D Pixar-style render", "2D flat motion graphics", "hand-drawn cel-shaded animation").
- Describe the animated character(s) or world with specific visual details — design, color palette, proportions, textures.
- Each scene should advance a clear story beat (setup → demonstration/tension → payoff across the 3 scenes).
${withVoiceover ? '- If a character speaks, describe them as expressive and animated, with mouth/face movement matching dialogue.' : ''}
- End the prompt with: high quality render, smooth animation, no watermark, no text, no subtitles.`,
  },
};

// Roughly 2.5 spoken words per second for natural pacing
const WORD_BUDGET = { '8 sec': '18-22', '10 sec': '22-28', '15 sec': '34-40' };

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  if (!client) return res.status(500).json({ error: 'OPENAI_API_KEY not configured' });
  if (!supabaseAdmin) return res.status(500).json({ error: 'Server not configured' });

  const token = (req.headers.authorization || '').replace('Bearer ', '').trim();
  if (!token) return res.status(401).json({ error: 'Authentication required.' });

  const { data: authData, error: authErr } = await supabaseAdmin.auth.getUser(token);
  if (authErr || !authData?.user) return res.status(401).json({ error: 'Invalid or expired session.' });

  const { input, imageBase64, imageMimeType, duration = '10 sec', style = 'ugc', withVoiceover = false } = req.body || {};
  if (!input?.trim() && !imageBase64) return res.status(400).json({ error: 'Please provide a script, idea, or image.' });

  const styleConfig = STYLE_SYSTEM[style] || STYLE_SYSTEM.ugc;
  const wordBudget = WORD_BUDGET[duration] || WORD_BUDGET['10 sec'];

  const systemPrompt = `You are two world-class experts in one: (1) the best AI video prompt engineer alive, who writes single, hyper-detailed prompts that produce stunning, realistic results on Veo, Kling, SeedDance, Hailuo, Runway and Pika; and (2) a direct-response copywriter who has written hooks for videos with hundreds of millions of views. You write prompts and scripts that are immediately ready to use — no placeholders, no fluff.`;

  const voiceoverInstructions = withVoiceover ? `
VOICEOVER REQUIREMENTS (for each scene):
- Write a voiceover script timed to fit naturally within ${duration} when spoken aloud (~${wordBudget} words total).
- Structure: HOOK (the first 2-4 words must stop the scroll — a bold claim, pattern interrupt, or question), then BODY (1-2 short sentences delivering value, story, or proof), then CTA (a clear, specific next action).
- Write it the way a top-performing creator actually talks — conversational, punchy, zero corporate language, zero filler words like "Hey guys" or "So basically".
- The CTA should point toward scriptsea.com / the product/idea naturally, not like an ad.
After the scene's video prompt, add this block:
🎙️ VOICEOVER
HOOK: [hook line]
BODY: [body lines]
CTA: [call to action]` : '';

  const userPrompt = `INPUT:
${input?.trim() ? `"${input.trim()}"` : '[No text provided — base everything on the uploaded image]'}
${imageBase64 ? '\n[An image is attached — analyze it carefully and use its exact visual details (colors, shapes, branding, materials) in every prompt.]' : ''}

DURATION PER CLIP: ${duration}
${styleConfig.rule(withVoiceover)}
${voiceoverInstructions}

---

OUTPUT FORMAT — follow this EXACTLY, no extra commentary, no headers besides these:

❌ NEGATIVE PROMPT
[One line, comma-separated: 15-20 specific things to avoid in this exact video — mix universal issues (blurry, watermark, text, distorted, extra limbs, flicker) with content-specific issues for this product/style]

SCENE 1 — [short punchy scene name]
[ONE single, complete, ready-to-paste AI video generation prompt as one flowing paragraph, 70-110 words. Cover: character/subject description (per style rules above), setting, lighting, action/motion, and camera movement placed near the end of the prompt. Do not label the parts — write it as natural descriptive prose a video model can read directly.]${withVoiceover ? '\n🎙️ VOICEOVER\nHOOK: ...\nBODY: ...\nCTA: ...' : ''}

SCENE 2 — [different angle or moment, same product/idea]
[same format as above]${withVoiceover ? '\n🎙️ VOICEOVER\nHOOK: ...\nBODY: ...\nCTA: ...' : ''}

SCENE 3 — [different angle or moment, same product/idea]
[same format as above]${withVoiceover ? '\n🎙️ VOICEOVER\nHOOK: ...\nBODY: ...\nCTA: ...' : ''}`;

  try {
    let responseText = '';

    if (imageBase64) {
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
        max_tokens: 2200,
        temperature: 0.85,
      });
      responseText = completion.choices[0]?.message?.content?.trim() || '';
    } else {
      const response = await client.responses.create({
        model: process.env.OPENAI_MODEL || 'gpt-4.1-mini',
        input: `${systemPrompt}\n\n${userPrompt}`,
        temperature: 0.85,
        max_output_tokens: 2200,
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
