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
  const { input, duration = '10 sec', style = 'ugc', withVoiceover = false } = req.body || {};
  if (!input?.trim()) return res.status(400).json({ error: 'Please describe your product or paste your script.' });

  const clipSec = parseInt(duration) || 10;
  const inputWords = input.trim().split(/\s+/).filter(Boolean).length;
  const numScenes = inputWords > 15 ? Math.max(2, Math.ceil((inputWords / 2.5) / clipSec)) : 3;
  const wordsPerScene = Math.round(clipSec * 2.5);
  const totalVideoSec = numScenes * clipSec;

  // ── Build prompt ─────────────────────────────────────────────────────────
  const systemPrompt = `You are a world-class AI video prompt engineer. You write prompts for AI video tools (Veo, Kling, SeedDance, Hailuo, Runway, Pika) that produce stunning, realistic clips.

YOUR PROCESS — follow this every time:

STEP 1: READ the user's script/input deeply. Understand what it's about, who the audience is, what the tone is, and what cultural or religious context exists.

STEP 2: DECIDE on ONE single character for the entire video. Write a character description sentence — for example: "a 25-year-old Black woman with long braids, wearing a white oversized hoodie and gold hoop earrings" — based on what fits the script's content, audience, and cultural context.

STEP 3: DECIDE on the visual world — what environments, lighting, and energy match this script. Each scene can be a different location or angle, but the overall mood and style stay consistent.

STEP 4: Write each scene prompt. CRITICAL: copy-paste the EXACT character description from Step 2 into EVERY scene prompt word-for-word. AI video generators process each prompt independently — they have no memory of previous scenes. If you don't repeat the full description, the tool will generate a completely different person. This is called "consistent character" prompting.

ABSOLUTE RULES:
- ONE CHARACTER across ALL scenes. The character description sentence MUST appear word-for-word in every scene prompt. Do not shorten it, do not paraphrase it, do not say "the same woman" — repeat the full description every time.
- Every character detail must come from the script's content. Islamic script = character in full hijab and modest dress. Tech/gaming script = different look entirely. You derive it from the input, never from a template.
- If the input has any religious context: get the dress code RIGHT. Islamic = full hijab covering all hair, loose modest clothing, no exposed skin beyond face and hands. Do not approximate this. Do not write "half hijab" or "loosely draped scarf."
- Each scene is a different MOMENT in time (different action, different angle, different setting if needed) but the SAME character continuing the SAME story.
- Write each prompt as one vivid, flowing paragraph — no labels like "Character:" or "Setting:". Just describe the frame as a director would.
- Camera movement goes near the end of each prompt.
- End every prompt with: photorealistic, ultra HD, no watermark, no text, no subtitles, no distortion.`;

  const styleNote = {
    ugc: withVoiceover
      ? 'UGC style: the character is talking directly to camera in every scene — mouth moving, expressive face, delivering the voiceover naturally. Handheld phone camera feel, natural lighting.'
      : 'UGC style: the character is NOT talking (user will add their own voiceover). Instead, the character performs strong visual actions — demonstrating, reacting, showing, gesturing, using the product. Focus on making the visuals tell the story on their own. Handheld phone camera feel, natural lighting.',
    broll: 'B-Roll style: ZERO people in frame. Only product, environment, textures, surfaces, and atmosphere. Smooth cinematic camera movements. Premium lighting.',
    animation: 'Animation style: specify the exact animation type (3D Pixar / 2D flat / motion graphics / hand-drawn). Characters and world must match the content theme. Story-driven.',
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
    return `SCENE ${n} — [name]\n[70-120 word prompt — repeat full character description, different moment/action]${vo}`;
  }).join('\n\n');

  const userPrompt = `READ THIS SCRIPT/INPUT CAREFULLY:
"${input.trim()}"

${styleNote}
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
