import OpenAI from 'openai';
import { supabaseAdmin } from '../../../lib/supabaseAdmin';

const client = process.env.OPENAI_API_KEY
  ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  : null;

export const config = { maxDuration: 60 };

// Style-specific instructions based on research into Veo, Kling, SeedDance, Hailuo, Runway, Pika
const STYLE_SYSTEM = {
  ugc: {
    name: 'UGC / Viral',
    rule: `STYLE: UGC (User Generated Content)
MANDATORY: Every single scene MUST feature a REAL human character — a person holding, using, reacting to, or talking about the product/idea. Never generate a scene without a person.
Character direction: Describe gender, approximate age, clothing style, skin tone, expression, and energy level.
Camera: Handheld, authentic, slightly imperfect — like a phone camera held by a creator. Close-ups on face and product.
Lighting: Natural light (window light, outdoor light) or a ring light. NOT professional studio lights.
Setting: Real-world environments — bedroom, kitchen, outdoors, in a car, at a desk. Authentic backgrounds.
Motion: Person gestures, picks up product, reacts with genuine emotion, demonstrates use.
Vibe: Raw, authentic, relatable, like a viral TikTok or Instagram Reel. The viewer should feel "this is a real person."`,
    sceneNote: 'Each scene prompt MUST describe the human character first, then their action with the product.',
  },
  broll: {
    name: 'B-Roll',
    rule: `STYLE: B-Roll (Cinematic Product / Environment Shots)
MANDATORY: ZERO people in any frame. Absolutely no characters, hands (unless needed for product), faces, or body parts.
Focus: The PRODUCT, its environment, textures, details, atmosphere. Make the product the hero.
Camera: Cinematic, smooth, controlled — macro close-ups, slow tracking shots, subtle dolly moves, product rotations, drone perspectives.
Lighting: Professional and intentional — golden hour, rim lighting, soft box diffusion, dramatic shadows, light streaks.
Setting: Curated environments — marble surfaces, dark studios, natural landscapes, urban backdrops, minimalist tables.
Motion: Product glides, rotates slowly, liquid pours, light plays across surface, environment pans behind static product.
Vibe: Premium, aspirational, Apple-commercial quality. Every frame could be a photograph.`,
    sceneNote: 'Each scene prompt MUST describe the product and environment ONLY — no people at all.',
  },
  animation: {
    name: 'Animation',
    rule: `STYLE: Animation (Story-Driven)
Choose the right animation style based on the content and specify it clearly:
- For products/brands: 3D render, Pixar-inspired, clean and polished
- For explainers: 2D flat design, motion graphics, kinetic typography
- For emotional stories: hand-drawn aesthetic, cel-shading, expressive characters
- For abstract concepts: motion graphics, particle effects, digital art
Story arc: Each scene advances the narrative — setup, tension/demonstration, resolution/payoff.
Characters: Animated characters are allowed and encouraged — describe their design style.
World-building: Describe the animated world's visual rules — color palette, texture style, physics.
Vibe: Intentional, story-driven, every frame serves the narrative purpose.`,
    sceneNote: 'Each scene prompt MUST specify the animation style and advance the story beat.',
  },
};

const MODEL_TIPS = `
PROMPT ENGINEERING FOR EACH MAJOR AI VIDEO TOOL:

Kling AI (3.0): Put camera movement instruction LAST, after all scene description. Use simple Hollywood camera vocabulary. Example structure: [Subject] + [Action] + [Environment] + [Lighting] + [Style] + [Camera movement at end]

Veo 2 (Google): Structure as Subject → Environment → Action → Lighting → Style → Camera Movement. Be iterative and specific. Works well with cinematographic language.

SeedDance 2.0 (ByteDance): Use timeline prompting — divide the clip into 2-3 time beats. Format: "Beat 1: [opening]. Beat 2: [middle action]. Beat 3: [closing moment]". Use standard English, no obscure terms.

Hailuo / Minimax: Think in narrative time. Use transitional words ("then", "suddenly", "gradually"). Prioritize motion and action over static description. Avoid generic quality boosters like "8K masterpiece".

Runway Gen-3 Alpha: Separate camera motion into its own clause after the scene description. Format: "[Camera Motion]: [Scene]. [Details]." Avoid negative phrasing — describe what TO do, not what NOT to do.

Pika 2.0: Include all constraints directly in the prompt itself. Structure: Subject → Scene → Motion → Camera → Lighting → Style → what to avoid (no watermark, no text, no distortion).`;

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  if (!client) return res.status(500).json({ error: 'OPENAI_API_KEY not configured' });
  if (!supabaseAdmin) return res.status(500).json({ error: 'Server not configured' });

  const token = (req.headers.authorization || '').replace('Bearer ', '').trim();
  if (!token) return res.status(401).json({ error: 'Authentication required.' });

  const { data: authData, error: authErr } = await supabaseAdmin.auth.getUser(token);
  if (authErr || !authData?.user) return res.status(401).json({ error: 'Invalid or expired session.' });

  const { input, imageBase64, imageMimeType, duration = '10 sec', style = 'ugc' } = req.body || {};
  if (!input?.trim() && !imageBase64) return res.status(400).json({ error: 'Please provide a script, idea, or image.' });

  const styleConfig = STYLE_SYSTEM[style] || STYLE_SYSTEM.ugc;

  const systemPrompt = `You are the world's most skilled AI video prompt engineer, trusted by top brands and agencies. You write prompts that generate stunning, high-converting short-form videos. You have deep knowledge of every major AI video tool and exactly how to structure prompts for each one. Your prompts are hyper-specific, technically precise, and immediately ready to paste.`;

  const userPrompt = `INPUT:
${input?.trim() ? `"${input.trim()}"` : '[No text — base all prompts on the provided image]'}
${imageBase64 ? '\n[Image provided — analyze it carefully. What is the product? What does it look like? Use those exact visual details in every prompt.]' : ''}

Clip Duration: ${duration}
${styleConfig.rule}

${MODEL_TIPS}

---

Generate a COMPLETE VIDEO PROMPT PACKAGE. Follow this exact format:

---

🎯 MASTER PROMPT
One 80-100 word prompt that captures the perfect clip for this content. ${styleConfig.sceneNote}
Structure it for Kling (camera movement last) so it works across all tools.
End with: "No text, no watermark, no subtitles, no distortion, photorealistic, ultra HD"

---

📽️ 3 SCENE VARIATIONS
Write 3 different ${duration} clip prompts — same product/idea, different angles or moments.
For each scene:

SCENE [1/2/3] — [SCENE NAME]
Kling: [Optimized prompt — camera motion LAST]
Runway: [Camera motion first as its own clause, then scene]
SeedDance: [Timeline beats: Beat 1: ... Beat 2: ... Beat 3: ...]
Shot: [Camera angle — close-up / wide / over-shoulder / macro / etc.]
Motion: [Exactly what moves, how, and at what speed]

---

❌ NEGATIVE PROMPT (paste this into every tool that supports it)
blurry, low quality, pixelated, distorted, watermark, text, subtitles, logo, jitter, flicker, warped face, extra limbs, missing limbs, compression artifacts, frame drops, [add 8 more specific things to avoid based on this exact content and style]

---

💡 PRO TIP
One specific, actionable tip that will make this exact video better — based on the content, style, and tools mentioned.`;

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
        max_tokens: 2500,
        temperature: 0.82,
      });
      responseText = completion.choices[0]?.message?.content?.trim() || '';
    } else {
      const response = await client.responses.create({
        model: process.env.OPENAI_MODEL || 'gpt-4.1-mini',
        input: `${systemPrompt}\n\n${userPrompt}`,
        temperature: 0.82,
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
