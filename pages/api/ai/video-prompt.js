import OpenAI from 'openai';
import { supabaseAdmin } from '../../../lib/supabaseAdmin';

const client = process.env.OPENAI_API_KEY
  ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  : null;

export const config = { maxDuration: 300 };

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  if (!client) return res.status(500).json({ error: 'OPENAI_API_KEY not configured' });
  if (!supabaseAdmin) return res.status(500).json({ error: 'Server not configured' });

  const token = (req.headers.authorization || '').replace('Bearer ', '').trim();
  if (!token) return res.status(401).json({ error: 'Authentication required.' });

  const { data: authData, error: authErr } = await supabaseAdmin.auth.getUser(token);
  if (authErr || !authData?.user) return res.status(401).json({ error: 'Invalid or expired session.' });

  const { input, duration = '10 sec', style = 'ugc', withVoiceover = false } = req.body || {};
  if (!input?.trim()) return res.status(400).json({ error: 'Please describe your product or paste your script.' });

  const clipSec = parseInt(duration) || 10;
  const inputWords = input.trim().split(/\s+/).filter(Boolean).length;
  const numScenes = inputWords > 15 ? Math.max(2, Math.ceil((inputWords / 2.5) / clipSec)) : 3;
  const wordsPerScene = Math.round(clipSec * 2.5);
  const totalVideoSec = numScenes * clipSec;

  const styleLabel = { ugc: 'UGC / Viral', broll: 'B-Roll', animation: 'Animation' }[style] || 'UGC / Viral';

  const systemPrompt = `You are a world-class AI video prompt engineer. You write prompts that produce stunning, hyper-realistic results when pasted into Veo, Kling, SeedDance, Hailuo, Runway, or Pika.

YOUR #1 RULE: ANALYZE BEFORE YOU WRITE.
Before generating a single word of output, you MUST deeply analyze the user's input:
- What is this about? (product, service, idea, religion, education, entertainment, etc.)
- Who is the target audience? (age, culture, interests, values)
- What is the tone and mood? (serious, fun, luxury, spiritual, educational, hype, etc.)
- Is there cultural, religious, or community context? (Islamic, Christian, African, Asian, Western, Latin, etc.)
- What kind of person would realistically appear in this video? (Do NOT default to any gender, ethnicity, or look — derive it 100% from the content)
- What settings and environments fit this specific content? (Do NOT use generic settings)

EVERY detail in your prompts — the character, their clothing, their skin tone, their hair, the setting, the lighting, the mood — must come directly from your analysis of the input. NEVER use defaults. NEVER use templates. A video about Islamic content must have characters in full hijab and modest clothing. A video about gaming must look completely different from a video about cooking. A video about YouTube growth should not default to any specific gender or ethnicity.

STRICT RULES:
- If the input has religious/cultural context (Islam, Christianity, Hinduism, Judaism, any faith or culture): characters MUST be dressed and styled appropriately for that specific religion/culture. Islamic = full hijab, modest dress, no exposed hair. Do not get this wrong.
- NEVER default all characters to one ethnicity. Read the input and choose what fits.
- NEVER reuse the same character description template across different inputs. Every prompt must be uniquely crafted for THIS specific input.
- Each prompt must be vivid, cinematic, and specific enough that someone who has never seen the product/script can picture the exact video frame.

VOICEOVER SCRIPT RULE:
If the user's input reads like a voiceover or script (spoken words, narration, dialogue), use their EXACT words. Do NOT change, rephrase, add to, or shorten a single word. Just split their text across scenes chronologically.`;

  const styleRules = {
    ugc: `STYLE: UGC / Viral
- Each scene features a real person on camera. WHO this person is must be derived from the script content (their appearance, clothing, setting, energy — all must match the topic).
- Camera: handheld smartphone feel, slight natural shake, close-up on face and any product.
- Lighting: natural (window, outdoor, ring light) — never studio.
- Setting: real environment that matches the content (NOT a generic bedroom for every video).
${withVoiceover ? '- The person is speaking directly to camera — mouth moving, expressive, delivering the voiceover naturally.' : '- The person reacts with expressive body language — no dialogue.'}
- End every prompt with: photorealistic, ultra HD, no watermark, no text, no subtitles, no distortion.`,
    broll: `STYLE: B-Roll
- ZERO people in any frame. Only the product, environment, or abstract visuals.
- Camera: smooth cinematic movement — slow push-in, orbit, macro, slider, product rotation.
- Lighting: premium — golden hour, rim light, dramatic shadows, soft diffusion.
- Setting and mood must match the content's theme and cultural context.
- End every prompt with: photorealistic, ultra HD, no watermark, no text, no subtitles, no distortion.`,
    animation: `STYLE: Animation
- Specify the exact animation style that fits THIS content (3D Pixar, 2D flat, motion graphics, hand-drawn, etc.).
- Characters and worlds must reflect the content's cultural/thematic context.
- Each scene advances a clear story beat.
- End every prompt with: high quality render, smooth animation, no watermark, no text, no subtitles.`,
  };

  const voiceoverBlock = withVoiceover ? `
VOICEOVER:
This is ONE video across ${numScenes} clips (each ${duration}), stitched into ~${totalVideoSec}s total.
The voiceover is ONE continuous script split into ${numScenes} parts — NOT ${numScenes} separate scripts.

If the user's input IS a script/voiceover: use their EXACT words. Split into ${numScenes} equal parts (~${wordsPerScene} words each). Do not change a single word.
If the user's input is a description/idea: write ONE continuous voiceover (~${numScenes * wordsPerScene} words total), then split it. Part 1 = hook, middle = body, Part ${numScenes} = CTA. Each part continues from the previous — no restarts.
Write conversationally. Zero filler ("Hey guys", "So basically").

After each scene prompt, add on its own line:
🎙️ VOICEOVER — PART [N] OF ${numScenes}
[script text for this part only]` : '';

  const sceneFormat = Array.from({ length: numScenes }, (_, i) => {
    const n = i + 1;
    const vo = withVoiceover ? `\n🎙️ VOICEOVER — PART ${n} OF ${numScenes}\n[text]` : '';
    return `SCENE ${n} — [name]\n[prompt]${vo}`;
  }).join('\n\n');

  const userPrompt = `ANALYZE THIS INPUT CAREFULLY BEFORE WRITING ANYTHING:
"${input.trim()}"

Style: ${styleLabel}
Clip duration: ${duration} (${numScenes} clips = ~${totalVideoSec}s total)
${styleRules[style] || styleRules.ugc}
${voiceoverBlock}

---

First, internally analyze: What is this about? Who is the audience? What cultural/religious context exists? What kind of person and setting fits THIS specific content? Then generate:

❌ NEGATIVE PROMPT
[comma-separated, 15-20 items: universal issues + things specifically wrong for THIS content]

${sceneFormat}

RULES FOR EACH SCENE PROMPT:
- One flowing paragraph, 70-120 words. No labels like "Character:" or "Setting:" — write it as natural vivid prose.
- Every visual detail must come from your analysis of the input — not from a template.
- Each scene should show a different moment/angle but tell one coherent story across all ${numScenes} scenes.
- Be specific: exact clothing items, exact colors, exact materials, exact facial expressions, exact gestures, exact lighting quality, exact camera movement.
- Camera movement goes near the END of the prompt (works best across all AI video tools).`;

  const maxTok = Math.min(1200 + numScenes * 400, 8000);

  try {
    const response = await client.responses.create({
      model: process.env.OPENAI_MODEL || 'gpt-4.1-mini',
      input: `${systemPrompt}\n\n${userPrompt}`,
      temperature: 0.82,
      max_output_tokens: maxTok,
    });
    const responseText = response.output_text?.trim() || '';

    if (!responseText) return res.status(502).json({ error: 'No response from AI' });
    return res.status(200).json({ text: responseText });
  } catch (err) {
    console.error('[video-prompt]', err?.message);
    return res.status(500).json({ error: 'Generation failed. Please try again.' });
  }
}
