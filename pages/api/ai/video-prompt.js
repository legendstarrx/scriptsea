import OpenAI from 'openai';
import { supabaseAdmin } from '../../../lib/supabaseAdmin';

const client = process.env.OPENAI_API_KEY
  ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  : null;

export const config = {
  maxDuration: 300,
  api: { bodyParser: { sizeLimit: '10mb' } },
};

// Style-specific rules — based on research into Veo, Kling, SeedDance, Hailuo, Runway, Pika prompting patterns
const STYLE_SYSTEM = {
  ugc: {
    name: 'UGC / Viral',
    rule: (withVoiceover) => `STYLE: UGC / Viral
- The video MUST feature ONE real human character on camera — a UGC-style creator. Never generate a scene without this person.
- Describe the character specifically: approximate age, gender, ethnicity/skin tone, hairstyle, clothing, facial expression, and energy.
- The character is holding, using, demonstrating, or reacting to the product/idea — describe exactly what they do with their hands and body.
${withVoiceover
    ? '- The character appears to be SPEAKING directly to camera — mouth moving naturally, engaged expression, as if delivering that part of the voiceover live.'
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

// Roughly 2.5 spoken words per second for natural pacing.
// The 3 scenes are sequential clips of ONE video, stitched together — totals reflect all 3 clips combined.
const TOTAL_DURATION = { '8 sec': '24 sec', '10 sec': '30 sec', '15 sec': '45 sec' };
const WORD_BUDGET = {
  '8 sec':  { total: '55-65',   perScene: '18-22' },
  '10 sec': { total: '70-85',   perScene: '23-28' },
  '15 sec': { total: '105-125', perScene: '35-42' },
};

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
  const clipSec = parseInt(duration) || 10;

  // Calculate how many clips are needed based on the script length
  const inputWords = (input?.trim() || '').split(/\s+/).filter(Boolean).length;
  let numScenes;
  if (withVoiceover && inputWords > 15) {
    const totalReadSec = inputWords / 2.5; // ~2.5 spoken words per second
    numScenes = Math.max(2, Math.ceil(totalReadSec / clipSec));
  } else {
    numScenes = 3;
  }
  const wordsPerScene = Math.round(clipSec * 2.5);
  const totalVideoSec = numScenes * clipSec;

  const systemPrompt = `You are two world-class experts in one: (1) the best AI video prompt engineer alive, who writes single, hyper-detailed prompts that produce stunning, realistic results on Veo, Kling, SeedDance, Hailuo, Runway and Pika; and (2) a direct-response copywriter who has written hooks for videos with hundreds of millions of views. You write prompts and scripts that are immediately ready to use — no placeholders, no fluff.

CRITICAL RULES:

1. RESPECT THE USER'S SCRIPT:
If the user's input already contains a voiceover, script, or spoken words (i.e. dialogue, narration, or any text clearly meant to be read aloud), you MUST use their EXACT words as the voiceover. Do NOT rewrite, rephrase, add to, or shorten their script. Your job is ONLY to (1) generate video prompts for each scene and (2) split their existing script into ${numScenes} chronological parts matching the scenes. Preserve every single word — do not change, add, or remove anything.

2. RESPECT CULTURAL AND RELIGIOUS CONTEXT:
Read the user's script carefully for cultural, religious, or thematic context. If the script is Islamic, faith-based, or references any specific culture, religion, or community — EVERY character description MUST reflect that context accurately (e.g., hijab, modest clothing, appropriate settings like mosques, prayer rooms, halal products). If the script mentions specific cultural dress, traditions, or settings, describe them precisely in every scene. Never generate characters or settings that contradict the cultural context of the script.`;

  const voiceoverInstructions = withVoiceover ? `
VOICEOVER REQUIREMENTS — READ CAREFULLY:
This is ONE video told across ${numScenes} sequential clips (Scene 1 → Scene ${numScenes}), each ${duration} long, stitched together into one ~${totalVideoSec} second video. The voiceover is ONE continuous script — NOT ${numScenes} separate scripts.

- If the user's input IS a script/voiceover (it reads like spoken words): use their EXACT text. Do NOT rewrite, rephrase, or add words. Just split it into ${numScenes} roughly equal chronological parts (~${wordsPerScene} words per part to fill each ${duration} clip).
- If the user's input is a product description or idea (NOT a script): write ONE continuous voiceover for the full ~${totalVideoSec}s video, then split it into ${numScenes} parts.
  - Part 1 = HOOK (scroll-stopping first words)
  - Middle parts = BODY (continue naturally, deliver value/proof/story)
  - Part ${numScenes} = PAYOFF + CTA (continue from previous part, end with call to action)
- Each part ~${wordsPerScene} words to match its ${duration} clip when spoken aloud.
- All parts must form ONE seamless, continuous script — Part 2 continues where Part 1 left off, etc. No repeated hooks, no restarts.
- Write conversationally — zero filler ("Hey guys", "So basically").

After each scene's video prompt, add:
🎙️ VOICEOVER — PART [N] OF ${numScenes}
[the script text for this part only]` : '';

  // Build the scene list for the output format dynamically
  const sceneInstructions = Array.from({ length: numScenes }, (_, i) => {
    const n = i + 1;
    const sceneName = n === 1 ? '[short punchy scene name]' : '[different angle or moment, continuing the story]';
    const voLabel = n === 1 ? 'hook' : n === numScenes ? 'payoff + CTA' : 'continuation';
    return `SCENE ${n} — ${sceneName}
[ONE single, complete, ready-to-paste AI video generation prompt as one flowing paragraph, 70-110 words. Character/subject → setting → lighting → action/motion → camera movement near end. Natural prose, no labels.]${withVoiceover ? `\n🎙️ VOICEOVER — PART ${n} OF ${numScenes}\n[${voLabel} text]` : ''}`;
  }).join('\n\n');

  const userPrompt = `INPUT:
${input?.trim() ? `"${input.trim()}"` : '[No text provided — base everything on the uploaded image]'}
${imageBase64 ? `
[PRODUCT IMAGE ATTACHED — this is the most important input. Before writing any prompts, study this image and identify:
- What the product IS (type, category)
- Its exact colors, shape, size, materials, textures
- Any branding, logos, labels, packaging details
- How it looks when held, placed on a surface, or in use
Then EVERY scene prompt you write must describe THIS SPECIFIC product with those exact visual details — not a generic version of the product. The reader of your prompt has never seen the image, so your words must paint an exact picture of it.]` : ''}

DURATION PER CLIP: ${duration}${withVoiceover ? ` (${numScenes} clips × ${duration} = ~${totalVideoSec}s total video)` : ''}
${styleConfig.rule(withVoiceover)}
${voiceoverInstructions}

---

OUTPUT FORMAT — follow this EXACTLY. Generate exactly ${numScenes} scenes. No extra commentary, no headers besides these:

❌ NEGATIVE PROMPT
[One line, comma-separated: 15-20 specific things to avoid — universal issues + content-specific issues]

${sceneInstructions}`;

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
        max_tokens: Math.min(1200 + numScenes * 400, 8000),
        temperature: 0.85,
      });
      responseText = completion.choices[0]?.message?.content?.trim() || '';
    } else {
      const response = await client.responses.create({
        model: process.env.OPENAI_MODEL || 'gpt-4.1-mini',
        input: `${systemPrompt}\n\n${userPrompt}`,
        temperature: 0.85,
        max_output_tokens: Math.min(1200 + numScenes * 400, 8000),
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
