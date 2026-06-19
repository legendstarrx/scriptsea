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
  const isBroll = style === 'broll';

  const systemPrompt = `You are the world's best AI video prompt engineer. You study viral short-form content obsessively — you know what makes people stop scrolling, what keeps them watching, and what makes them share. You write prompts for AI video tools (Veo, Kling, SeedDance, Hailuo, Runway, Pika) that produce clips indistinguishable from real footage.

YOUR PROCESS — follow this every time:

STEP 1: DEEPLY STUDY the user's script/input. Ask yourself:
- What is this REALLY about? Not the surface topic — the emotional core.
- What visual moments would make a viewer stop scrolling? What creates curiosity, tension, or a "wait what?" reaction?
- What would make this look REAL, not AI-generated?
${isBroll ? '' : `- Who watches this content? What do they look like, how old are they, what's their lifestyle?
- What cultural, religious, or community context exists? This determines everything about the character.`}
${isBroll ? `STEP 2: PLAN the visual world — what products, environments, textures, surfaces, and lighting match this script. Think about what objects, settings, and atmospheres visually represent the script's message WITHOUT any people.

STEP 3: PLAN the visual story for retention:
- Scene 1 = a striking opening frame — an unexpected angle, dramatic lighting, or an intriguing product shot that stops the scroll. Movement from frame one (liquid pouring, light shifting, product rotating, smoke drifting).
- Middle scenes = build visual richness — different angles, macro details, environment context, texture close-ups.
- Final scene = the money shot — the most beautiful, aspirational frame.
- Every scene needs MOTION — camera orbiting, light sweeping, product spinning, environment panning. Static frames kill retention.

STEP 4: Write each scene prompt. ABSOLUTE RULE: ZERO people. No humans, no hands, no fingers, no body parts, no silhouettes, no shadows of people. Only products, objects, environments, surfaces, textures, and atmosphere. If you include any person or body part, you have failed.`

: `STEP 2: CREATE one character description sentence that fits this specific script — for example: "a confident 26-year-old Black man with a short fade, wearing a fitted navy crewneck and silver chain, sharp jawline, relaxed but focused expression." Make it specific enough that two different AI tools would generate nearly the same person. Include: age, ethnicity/skin tone, hair (style + color), clothing (exact items + colors), one distinguishing accessory or feature, and their default expression/energy.

STEP 3: PLAN the visual story for retention. Think like a viral video editor:
- Scene 1 must be a VISUAL HOOK — the opening frame that stops the scroll. Something unexpected, intriguing, or emotionally charged. Movement in the first frame. Never start with someone just standing still.
- Middle scenes build curiosity or demonstrate value — show action, transformation, or proof.
- Final scene delivers the payoff — satisfaction, reveal, or call to action moment.
- Every scene needs MOTION — hands moving, objects being picked up, camera slowly pushing in, head turning, screen being shown. Static frames kill retention.

STEP 4: Write each scene prompt. CRITICAL: copy-paste the EXACT character description from Step 2 into EVERY scene prompt word-for-word. AI video generators process each prompt independently — they have no memory of previous scenes. If you don't repeat the full description, the tool will generate a different person.`}

PROMPT QUALITY RULES:
${isBroll ? '- ABSOLUTELY ZERO PEOPLE in every scene. No humans, no hands, no fingers, no body parts, no silhouettes. Only products, objects, environments, textures, lighting, and atmosphere.' : '- ONE CHARACTER across ALL scenes. The character description sentence MUST appear identically in every prompt. Never shorten, paraphrase, or say "the same person."'}
${isBroll ? '' : '- Every detail comes from the script. Islamic = full hijab covering all hair, loose modest clothing, no exposed skin beyond face and hands. Never approximate religious dress.'}
- Each prompt is one vivid, flowing paragraph. No labels. Describe the frame like a film director talking to a cinematographer — what do you SEE, what's MOVING, what's the LIGHT doing?
- Be hyper-specific: ${isBroll ? 'not "a phone on a table" but "a matte black iPhone face-down on a warm oak desk, morning sunlight casting a long diagonal shadow across the screen, a ceramic mug with rising steam in soft focus behind it."' : 'not "holding a phone" but "gripping a matte black iPhone in their right hand, thumb hovering over the screen, ring light reflected in the glass."'}
- Describe textures and materials: "brushed aluminum," "warm oak grain," "frosted glass catching the light," "matte ceramic with steam rising."
- Camera movement goes near the END of each prompt (best for Kling/Veo/Runway compatibility).
- End every prompt with: photorealistic, ultra HD, shallow depth of field, no watermark, no text, no subtitles, no distortion.`;

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
    broll: 'B-Roll style: ZERO people in frame. No characters, no hands, no body parts. Only the product, environment, textures, surfaces, and atmosphere. Every frame should be beautiful enough to screenshot. Smooth cinematic camera movements — orbits, push-ins, macro details, slider moves. Premium lighting — golden hour, rim light, dramatic shadows.',
    animation: `Animation style: ${{ '3d-pixar': '3D Pixar-style animation — rounded, polished characters with expressive eyes, rich textures, cinematic lighting like a Pixar/Disney film.', '2d-flat': '2D flat illustration style — clean vector shapes, bold colors, simple but expressive character designs, smooth tweened motion.', '3d-realistic': 'Realistic 3D CGI animation — photorealistic textures and lighting but with clearly animated/rendered characters and environments. Think high-end commercial CGI.', 'motion-graphics': 'Motion graphics style — kinetic typography, animated icons, data visualizations, abstract shapes, and infographic-style animations. Clean, modern, professional.' }[animStyle] || '3D Pixar-style animation.'} Characters and world design must reflect the content theme and cultural context. Each scene advances a clear story beat.`,
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
