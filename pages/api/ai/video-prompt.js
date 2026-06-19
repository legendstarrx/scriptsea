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
  const user = authData.user;

  // ── Check script limits (same pool as script generator) ──────────────────
  let { data: profile } = await supabaseAdmin
    .from('profiles')
    .select('subscription, subscription_status, paid, scripts_remaining, scripts_generated, scripts_limit')
    .eq('id', user.id)
    .maybeSingle();

  if (!profile) {
    const { data: created } = await supabaseAdmin
      .from('profiles')
      .insert({ id: user.id, email: user.email, scripts_generated: 0, scripts_remaining: 0 })
      .select()
      .maybeSingle();
    profile = created || { scripts_generated: 0, scripts_remaining: 0, subscription: 'starter', paid: false };
  }

  const sub = String(profile.subscription || '').toLowerCase();
  const isPro = sub === 'pro' || profile.paid === true || profile.subscription_status === 'active';
  const scriptsGenerated = Number(profile.scripts_generated ?? 0);
  const scriptsRemaining = Number(profile.scripts_remaining ?? 0);

  if (isPro) {
    if (scriptsRemaining <= 0) {
      return res.status(403).json({ error: 'limit_reached', message: "You've used all your scripts for this period." });
    }
  } else {
    if (scriptsGenerated >= 1) {
      return res.status(403).json({ error: 'limit_reached', message: "You've used your free script. Upgrade to Pro to keep generating." });
    }
  }

  // ── Parse request ────────────────────────────────────────────────────────
  const { input, duration = '10 sec', style = 'ugc', withVoiceover = false, charGender, charAppearance, animStyle } = req.body || {};
  if (!input?.trim()) return res.status(400).json({ error: 'Please describe your product or paste your script.' });

  const clipSec = parseInt(duration) || 10;
  const inputWords = input.trim().split(/\s+/).filter(Boolean).length;
  const numScenes = inputWords > 15 ? Math.max(2, Math.ceil((inputWords / 2.5) / clipSec)) : 3;
  const wordsPerScene = Math.round(clipSec * 2.5);
  const totalVideoSec = numScenes * clipSec;

  // ── Build prompt ─────────────────────────────────────────────────────────
  const isAnim = style === 'animation';
  const isBroll = style === 'broll';

  const animStyleDesc = {
    '3d-pixar': '3D Pixar/Disney-style animation — soft rounded characters, expressive oversized eyes, smooth plastic-like skin, rich saturated colors, volumetric lighting, cinematic depth of field. Think Pixar, Dreamworks, Disney quality.',
    '2d-flat': '2D flat illustration animation — clean vector shapes, bold flat colors, minimal shading, simple but highly expressive character designs, smooth tweened motion. Think Kurzgesagt or modern explainer style.',
    '3d-realistic': 'Realistic 3D CGI — high-poly character models with detailed skin textures, realistic fabric physics, cinematic lighting and shadows. Looks like a AAA game cutscene or high-end commercial CGI.',
    'motion-graphics': 'Motion graphics — kinetic typography, animated icons, data visualizations, abstract geometric shapes, smooth transitions. Clean, professional, modern. Characters are simplified or iconic, not detailed.',
    'stick-figure': 'Stick figure animation — simple black line-drawn stick figures on a white or minimal colored background. Exaggerated gestures, big expressive movements. Think xkcd or Cyanide & Happiness. The simplicity IS the style.',
  }[animStyle] || '3D Pixar-style animation.';

  let systemSteps;
  if (isBroll) {
    systemSteps = `STEP 2: PLAN the visual world — what products, environments, textures, surfaces, and lighting match this script. Think about what objects, settings, and atmospheres visually represent the script's message WITHOUT any people.

STEP 3: PLAN the visual story for retention:
- Scene 1 = a striking opening frame — unexpected angle, dramatic lighting, or intriguing product shot. Movement from frame one.
- Middle scenes = build visual richness — different angles, macro details, texture close-ups.
- Final scene = the money shot — the most beautiful, aspirational frame.
- Every scene needs MOTION — camera orbiting, light sweeping, product spinning, environment panning.

STEP 4: Write each scene prompt. ABSOLUTE RULE: ZERO people. No humans, no hands, no fingers, no body parts, no silhouettes. Only products, objects, environments, surfaces, textures, and atmosphere.

PROMPT QUALITY RULES:
- ZERO PEOPLE. If you include any person or body part, you have failed.
- Each prompt is one vivid paragraph. No labels.
- Be hyper-specific about textures, materials, colors, and lighting.
- Camera movement near the END of each prompt.
- End every prompt with: photorealistic, ultra HD, shallow depth of field, no watermark, no text, no subtitles, no distortion.`;
  } else if (isAnim) {
    systemSteps = `THE ANIMATION STYLE FOR THIS VIDEO IS: ${animStyleDesc}

EVERY prompt you write MUST describe an ANIMATED scene in this exact style. You are NOT writing live-action/photorealistic prompts. You are writing animation prompts.

STEP 2: DESIGN one animated character that fits this script. Describe them IN the animation style:
${animStyle === 'stick-figure' ? '- A stick figure character with specific distinguishing features (hat, glasses, hair shape, clothing outline). Keep it simple — stick figures should LOOK like stick figures.' : animStyle === 'motion-graphics' ? '- A simplified iconic character or avatar that fits motion graphics style. Not detailed — clean, geometric, professional.' : `- Describe the character's design in ${animStyle === '3d-pixar' ? 'Pixar style (rounded features, oversized expressive eyes, stylized proportions)' : animStyle === '2d-flat' ? '2D flat style (clean shapes, bold outlines, flat colors, simple features)' : 'realistic 3D CGI style (detailed model, realistic proportions, high-poly)'}.`}
- Include: what they look like, what they wear, their expression, any cultural/religious context from the script (Islamic = animated character still wears hijab and modest dress).
- This character description must be REPEATED in every scene prompt for consistency.

STEP 3: PLAN the animated visual story for retention:
- Scene 1 = animated visual hook — something visually striking in the animation style that stops scrolling.
- Middle scenes = build the story with animated action and expression.
- Final scene = payoff moment with emotional impact.
- Every scene needs ANIMATED MOTION — character gestures, objects moving, camera panning through the animated world.

STEP 4: Write each scene prompt. CRITICAL: repeat the full animated character description in EVERY prompt. Start or include the animation style name in each prompt so the AI tool knows to render animation, not live-action.

PROMPT QUALITY RULES:
- ONE ANIMATED CHARACTER across all scenes. Same design, same style, same outfit in every prompt.
- Cultural/religious context still applies to animated characters.
- Each prompt is one vivid paragraph describing an ANIMATED scene.
- Describe the animation world: colors, lighting style, background design, atmosphere — all in the chosen animation style.
${animStyle === 'stick-figure' ? '- End every prompt with: stick figure animation, white background, clean black lines, hand-drawn style, smooth animation, no watermark, no text.' : animStyle === 'motion-graphics' ? '- End every prompt with: motion graphics, clean vector design, smooth transitions, professional animation, no watermark, no text.' : animStyle === '2d-flat' ? '- End every prompt with: 2D flat illustration, bold colors, clean vector art, smooth animation, no watermark, no text, no distortion.' : animStyle === '3d-realistic' ? '- End every prompt with: realistic 3D CGI render, cinematic lighting, high-poly, detailed textures, no watermark, no text, no distortion.' : '- End every prompt with: 3D Pixar-style animation, soft lighting, vibrant colors, cinematic render, no watermark, no text, no distortion.'}`;
  } else {
    systemSteps = `STEP 2: CREATE one character description sentence that fits this specific script — for example: "a confident 26-year-old Black man with a short fade, wearing a fitted navy crewneck and silver chain, sharp jawline, relaxed but focused expression." Make it specific enough that two different AI tools would generate nearly the same person. Include: age, ethnicity/skin tone, hair (style + color), clothing (exact items + colors), one distinguishing accessory or feature, and their default expression/energy.

STEP 3: PLAN the visual story for retention:
- Scene 1 must be a VISUAL HOOK — stops the scroll. Movement in the first frame. Never start static.
- Middle scenes build curiosity or demonstrate value — show action, transformation, or proof.
- Final scene delivers the payoff — satisfaction, reveal, or call to action moment.
- Every scene needs MOTION — hands moving, objects being picked up, camera pushing in, head turning.

STEP 4: Write each scene prompt. CRITICAL: copy-paste the EXACT character description from Step 2 into EVERY scene prompt word-for-word. AI video generators have no memory between scenes.

PROMPT QUALITY RULES:
- ONE CHARACTER across ALL scenes. The character description sentence MUST appear identically in every prompt.
- Every detail comes from the script. Islamic = full hijab covering all hair, loose modest clothing, no exposed skin beyond face and hands.
- Each prompt is one vivid, flowing paragraph. No labels.
- Be hyper-specific: not "holding a phone" but "gripping a matte black iPhone, thumb hovering over the screen, ring light reflected in the glass."
- Describe micro-expressions, textures, materials.
- Camera movement near the END of each prompt.
- End every prompt with: photorealistic, ultra HD, shallow depth of field, no watermark, no text, no subtitles, no distortion.`;
  }

  const systemPrompt = `You are the world's best AI video prompt engineer. You study viral short-form content obsessively — you know what makes people stop scrolling, what keeps them watching, and what makes them share. You write prompts for AI video tools (Veo, Kling, SeedDance, Hailuo, Runway, Pika).

YOUR PROCESS:

STEP 1: DEEPLY STUDY the user's script/input. Ask yourself:
- What is this REALLY about? The emotional core.
- What visual moments would stop scrolling?
${isBroll ? '' : '- What cultural, religious, or community context exists?'}

${systemSteps}`;

  // Build character preference instruction
  const isMixed = charGender === 'mixed' || charAppearance === 'mixed';
  let charPref = '';
  if (isMixed) {
    const genderNote = charGender === 'mixed' ? 'Use a mix of male and female characters' : charGender ? `All characters should be ${charGender}` : '';
    const appearNote = charAppearance === 'mixed' ? 'Use a diverse mix of ethnicities' : charAppearance ? `All characters should be ${charAppearance}` : '';
    charPref = `\nCHARACTER PREFERENCE (user selected MIXED): Use DIFFERENT characters in different scenes — a diverse cast. ${genderNote}${genderNote && appearNote ? '. ' : ''}${appearNote}. Each scene still needs a full, detailed character description (since AI video tools process each prompt independently), but the characters can be different people. Derive clothing, style, and energy from the script content.`;
  } else if (charGender || charAppearance) {
    charPref = `\nCHARACTER PREFERENCE (user selected): The character must be ${charGender ? `${charGender}` : 'any gender'}${charAppearance ? `, ${charAppearance}` : ''}. Respect this choice in your character description — but still derive clothing, style, and energy from the script content.`;
  }

  const styleNote = {
    ugc: withVoiceover
      ? `UGC style WITH voiceover: the character is speaking directly to camera — mouth open and moving naturally mid-sentence, animated facial expressions matching the energy of what they're saying, direct eye contact with the lens. Choose the camera style and lighting that best fits the script's tone and setting — derive it from the content, not a default.`
      : `UGC style WITHOUT voiceover (user will record their own voice over this footage):
STRICT NO-TALKING RULE: The character's mouth MUST be CLOSED in every single scene. No speaking, no mouthing words, no open mouth, no talking gestures. The character is SILENT — they perform visual actions only.
Instead of talking, the character: demonstrates the product with their hands, reacts with facial expressions (surprise, satisfaction, focus, excitement), scrolls a phone screen, types on a laptop, picks up and examines objects, gestures toward something, walks into frame, turns to reveal something. Every scene must have strong physical ACTION and MOVEMENT that tells the story visually — the user's voice narration will be layered on top later. Choose camera style and lighting based on what the script calls for — not a default.`,
    broll: 'B-Roll: ZERO people. Product, environment, textures only.',
    animation: `THIS IS ANIMATION — NOT LIVE ACTION. NOT PHOTOREALISTIC. Every prompt MUST describe an ANIMATED scene in ${animStyleDesc.split(' — ')[0]} style. Do NOT describe real people or real environments. Describe ANIMATED characters in an ANIMATED world. Name the animation style explicitly in every single prompt.`,
  }[style] || '';

  const voiceoverBlock = withVoiceover ? `
VOICEOVER:
One continuous script split across ${numScenes} parts (one per scene). NOT ${numScenes} separate scripts.
- If the user's input IS already a script/voiceover: use their EXACT words, split into ${numScenes} equal parts (~${wordsPerScene} words each). Do not change a single word.
- If the user's input is a description/idea: write one continuous voiceover (~${numScenes * wordsPerScene} words total). Part 1 = hook, middle = body, Part ${numScenes} = CTA. Each part continues from the previous.
- Zero filler. Conversational. Punchy.

After each scene prompt, on its own line:
🎙️ VOICEOVER — PART [N] OF ${numScenes}
[text for this part only]` : '';

  const sceneFormat = Array.from({ length: numScenes }, (_, i) => {
    const n = i + 1;
    const vo = withVoiceover ? `\n🎙️ VOICEOVER — PART ${n} OF ${numScenes}\n[text]` : '';
    return `SCENE ${n} — [name]\n[80-130 word prompt: repeat FULL character description, specific action/motion, environment details, lighting, micro-expressions, textures, camera move at end]${vo}`;
  }).join('\n\n');

  const userPrompt = `READ THIS SCRIPT/INPUT CAREFULLY:
"${input.trim()}"

${styleNote}${charPref}
Clip duration: ${duration} | ${numScenes} clips = ~${totalVideoSec}s total video
${voiceoverBlock}

---

OUTPUT (exactly this format, nothing else):

❌ NEGATIVE PROMPT
[comma-separated, 15-20 items specific to this content]

${sceneFormat}`;

  // ── Generate ─────────────────────────────────────────────────────────────
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

    // ── Deduct usage ───────────────────────────────────────────────────────
    if (isPro) {
      await supabaseAdmin
        .from('profiles')
        .update({ scripts_remaining: Math.max(scriptsRemaining - 1, 0), scripts_generated: scriptsGenerated + 1 })
        .eq('id', user.id);
    } else {
      await supabaseAdmin
        .from('profiles')
        .update({ scripts_generated: 1 })
        .eq('id', user.id);
    }

    return res.status(200).json({ text: responseText });
  } catch (err) {
    console.error('[video-prompt]', err?.message);
    return res.status(500).json({ error: 'Generation failed. Please try again.' });
  }
}
