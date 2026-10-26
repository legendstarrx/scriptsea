// ─────────────────────────────────────────────────────────────────────────────
// Free AI video prompt tools: the ONE config file.
//
// Everything about the free tools lives here: which Claude model they use, the
// daily limit, every video model's prompting rules, and each page's SEO content.
// To add a model: add an entry to MODELS and a page to PAGES. To update a
// version: change `version` (URLs never contain versions).
//
// Server code reads the rules; pages read their content through getStaticProps,
// so this file is never bundled whole into the browser.
// ─────────────────────────────────────────────────────────────────────────────

/** Tested with a real API call before use. Cheapest current Claude model. */
export const FREE_TOOL_MODEL_ID = 'claude-haiku-5-5';
export const DAILY_LIMIT = 5;
export const MAX_INPUT_CHARS = 6000;
export const UNLOCKED_SCENES = 2;

export const STYLE_OPTIONS = [
  { id: 'auto', label: 'Auto' },
  { id: 'realistic', label: 'Realistic' },
  { id: 'cinematic', label: 'Cinematic' },
  { id: 'ugc', label: 'UGC / phone-style' },
  { id: 'anime', label: 'Anime' },
  { id: '3d', label: '3D' },
  { id: 'cartoon', label: 'Cartoon' },
];
export const SOUND_OPTIONS = [
  { id: 'auto', label: 'Auto' },
  { id: 'dialogue', label: 'Dialogue' },
  { id: 'sfx', label: 'Sound effects only' },
  { id: 'none', label: 'No audio' },
];

// ── Video models ─────────────────────────────────────────────────────────────
// rules: what the prompt writer must do for this model (fed to the system prompt).
// lengths: clip lengths the model can generate (for the optional length setting).
export const MODELS = {
  any: {
    label: 'Any model',
    name: 'AI video',
    version: 'any text-to-video model',
    maker: '',
    audio: true,
    lengths: [4, 5, 6, 8, 10, 15],
    rules: [
      'Write a universal prompt that works in any modern text-to-video model.',
      'Order: shot size and camera move, subject, action, setting, lighting, mood and style, then sound.',
      'Use one camera move per shot at most and describe motion concretely.',
      'Describe the sound in a short final sentence (dialogue in quotes, named sound effects, or "no dialogue"), since most current models generate audio.',
    ],
  },
  seedance: {
    label: 'Seedance 2.5',
    name: 'Seedance',
    version: 'Seedance 2.5',
    maker: 'ByteDance',
    audio: true,
    lengths: [4, 5, 6, 8, 10, 12, 15, 20, 30],
    rules: [
      'Seedance 2.5 (ByteDance) follows shot-by-shot prompts with clear cuts. For more than one shot, label each with a time range like "Shot 1 (0-3s):" and describe exactly what changes at each cut.',
      'Lead each shot with the subject and a strong, physical motion description: what moves, in what direction, how fast. Seedance is best at concrete motion.',
      'Then camera (one move per shot), then lighting and style, then any constraints.',
      'Seedance generates native audio: write dialogue in quotes with who says it, and name sound effects and ambience.',
      'Keep the subject’s look identical in every shot by repeating the same key details. Mention that a reference image can be attached as @Image1 only if the user talks about a reference.',
      'Aim for roughly 80-250 words per prompt. Seedance 2.5 handles up to 30 seconds in one generation; Seedance 2.0 up to 15.',
    ],
  },
  veo: {
    label: 'Veo 3.1',
    name: 'Veo',
    version: 'Veo 3.1',
    maker: 'Google',
    audio: true,
    lengths: [4, 6, 8],
    rules: [
      'Follow Google’s Veo structure: cinematography (shot size, angle, camera move) + subject + action + context (setting, time of day) + style and ambiance (lighting, mood, colour).',
      'Veo generates audio with the video, so always direct it: dialogue in quotation marks after the speaker ("A woman says, “We have to leave now.”"), sound effects labelled "SFX: ...", background "Ambient noise: ...", or say "no dialogue". Add "no subtitles" when there is dialogue.',
      'Put any on-screen text in quotes and say where it appears.',
      'For several beats in one clip, use timestamps like "[00:00-00:02] ... [00:02-00:05] ...". Veo clips are 4, 6 or 8 seconds.',
      'Describe what you want instead of what you don’t ("an empty street at dawn", not "no people").',
      'Never name cameras, phones or devices, and never write an aspect ratio; those are set in the app and named gear tends to appear in the video.',
    ],
  },
  omni: {
    label: 'Omni Flash',
    name: 'Omni Flash',
    version: 'Gemini Omni Flash 1.1',
    maker: 'Google',
    audio: true,
    lengths: [4, 6, 8, 10],
    rules: [
      'Gemini Omni Flash builds multi-shot sequences by default. If the idea is one take, write "Single continuous shot, no scene cuts." near the start. If it should cut, say exactly where each cut happens with timing like "[0-3s] ..., [3-6s] ...".',
      'Describe the full shot in plain sentences: subject, action, setting, lighting and camera framing/move. Short phrases get generic results.',
      'Audio is generated with the video, so always direct it: exact dialogue in quotes with who says it and in what language, named sound effects, music or "no music", or "no dialogue".',
      'Put any on-screen text in quotes, say its language and where it appears on screen.',
      'Never name cameras, phones, tripods or devices and never write aspect ratios or durations; those are set in the app, and named gear tends to appear in the video. Describe only what the viewer sees (e.g. "static shot at eye level", "selfie angle at arm’s length").',
      'When someone holds or uses objects, say which hand holds what and keep it consistent, so nothing appears or vanishes.',
    ],
  },
  flow: {
    label: 'Google Flow',
    name: 'Google Flow',
    version: 'Veo 3.1 or Omni Flash',
    maker: 'Google',
    audio: true,
    lengths: [4, 6, 8, 10],
    variants: [
      { id: 'veo', label: 'Veo 3.1' },
      { id: 'omni', label: 'Omni Flash' },
    ],
    rules: [
      'Google Flow is Google’s filmmaking app. It runs Veo 3.1 and Gemini Omni Flash, and lets people reuse characters and objects as "ingredients", start from frames, and extend clips.',
      'Write the prompt for the model the user picked inside Flow (rules follow).',
      'Keep each prompt to one shot or one clearly timed sequence so it can be extended or stitched in Flow’s scene builder.',
      'If the user mentions a recurring character or product, describe it with the same exact details so it matches an ingredient image.',
    ],
  },
  kling: {
    label: 'Kling 4.0',
    name: 'Kling',
    version: 'Kling 4.0',
    maker: 'Kuaishou',
    audio: true,
    lengths: [5, 10, 15, 20, 30],
    rules: [
      'Use precise camera movement terms: dolly in/out, truck left/right, pedestal up/down, crane up, orbit left/right, tilt up/down, whip pan, handheld follow, static. Exactly one main camera move per shot; stacking moves destabilises Kling.',
      'Spell out body motion in order and at what speed ("she lifts the cup, pauses, then sets it down slowly"). Kling renders human motion best when it is precise.',
      'For several shots, use Kling’s multi-shot style: "Shot 1 (0-4s): ...; Shot 2 (4-8s): ..." with each shot naming its framing and camera move, and shot times adding up to the clip length.',
      'Kling 4.0 generates stereo audio and lip-sync: put dialogue in quotes and name sounds.',
      'Keep any negative-prompt advice short and about motion failures (morphing hands, warped faces, flicker).',
    ],
  },
  runway: {
    label: 'Runway Gen-4.5',
    name: 'Runway',
    version: 'Runway Gen-4.5',
    maker: 'Runway',
    audio: false,
    lengths: [5, 10],
    rules: [
      'Runway Gen-4.5 likes shot-first prompts: start with the camera move and framing, then the subject and action, then the setting, lighting and mood.',
      'Keep each clip to one clear beat, and spell out cause and effect in order ("the glass tips, falls, then shatters on the tiles"), because sequencing is a known weak spot.',
      'Describe motion and camera concretely instead of vague style words like "cinematic" or "epic".',
      'Runway has no negative-prompt field, so phrase everything positively.',
      'Keep the prompt under about 900 characters (Runway caps prompts at 1,000). Clips run 2-10 seconds.',
      'Gen-4.5 doesn’t generate synced dialogue, so describe sound only briefly if at all and focus on visuals.',
    ],
  },
  higgsfield: {
    label: 'Higgsfield',
    name: 'Higgsfield',
    version: 'All Higgsfield models',
    maker: 'Higgsfield',
    audio: true,
    lengths: [5, 8, 10, 15],
    rules: [
      'Higgsfield is a platform that runs many models (Seedance 2.5, Kling, Veo 3.1, Wan 3.0, Omni Flash, MiniMax) plus its own Cinema Studio and DoP camera presets. Write a prompt that works well across them.',
      'Prompt like a shot: composition + subject + camera move + mood. One clear camera move looks more cinematic than stacked moves.',
      'If a camera preset is likely, the prompt still has to supply the speed of the move, the start and end framing, and exactly what the subject does.',
      'Add a short sound line (dialogue in quotes or named sounds), since most models on Higgsfield generate audio.',
    ],
  },
  pika: {
    label: 'Pika 2.5',
    name: 'Pika',
    version: 'Pika 2.5',
    maker: 'Pika',
    audio: false,
    lengths: [5, 10],
    rules: [
      'Pika works best with short, specific, action-first prompts: subject + action, then lighting, camera angle and style.',
      'Use one or two camera moves at most; contradictory motion instructions make Pika’s motion fail.',
      'Pika is strong at playful physics and stylised effects; describe interactions between objects clearly ("the cake squishes flat under the hand").',
      'If the user wants consistency across shots, suggest Pika Ingredients (character/object images) in a note, but keep the prompt itself clean.',
      'End with a short list of things to avoid only if the user asks, since Pika has a separate negative-prompt field.',
    ],
  },
  sora: {
    label: 'Sora 2',
    name: 'Sora',
    version: 'Sora 2',
    maker: 'OpenAI',
    audio: true,
    lengths: [4, 8, 12],
    rules: [
      'Follow OpenAI’s storyboard format on separate lines: a plain-language scene description (subjects, wardrobe, setting, weather, details); "Camera:" framing, angle and at most one move; "Lighting & palette:" light sources and 3-5 named colours; "Action:" one to three short beats written as counts ("takes two steps, pauses, turns"); "Sound:" background sound plus any short dialogue in quotes.',
      'Keep beats short. Shorter clips are followed more reliably; one camera move and one subject action per shot.',
      'Use concrete visible details instead of vague words ("a rain-slick cobblestone street", not "a beautiful street").',
      'Keep dialogue to one or two short lines per clip so it syncs.',
    ],
  },
  hailuo: {
    label: 'Hailuo (MiniMax H3)',
    name: 'Hailuo',
    version: 'Hailuo 3.0 (MiniMax H3)',
    maker: 'MiniMax',
    audio: true,
    lengths: [6, 10],
    rules: [
      'Use the structure: subject + specific action + camera + lighting/style. Keep it under about 200 words with one main subject and one main movement.',
      'Hailuo understands camera instructions in square brackets. Add the camera move as a bracketed command at the end of the relevant sentence, e.g. [Dolly in], [Pan right], [Tracking shot], [Pedestal up], [Static shot].',
      'Name specific moves; vague prompts default to simple zooms.',
      'MiniMax H3 can generate sound: add a short line with dialogue in quotes or named sound effects when useful.',
    ],
  },
  wan: {
    label: 'Wan 3.0',
    name: 'Wan',
    version: 'Wan 3.0',
    maker: 'Alibaba',
    audio: true,
    lengths: [5, 10, 15, 30],
    rules: [
      'Wan 3.0 (Alibaba) handles up to 30 seconds with native audio and keeps characters and products consistent across shots. For multi-shot ideas, describe each shot in order with what changes between them.',
      'Structure: subject, scene, motion, camera, lighting, style, then sound.',
      'Wan is weaker at rendering on-screen text, so avoid relying on text inside the video; suggest adding text in editing instead.',
      'Dialogue goes in quotes with who says it; name sound effects and music.',
      'Use one camera move per shot and describe motion concretely.',
    ],
  },
  luma: {
    label: 'Luma Ray3',
    name: 'Luma',
    version: 'Luma Ray3.2',
    maker: 'Luma AI',
    audio: false,
    lengths: [5, 10],
    rules: [
      'Luma Ray3 is strongest with cinematic camera and lighting language. Describe the shot in natural sentences: subject, action, setting, then light (direction, quality, colour) and camera framing/move.',
      'Luma’s own guide warns that filler words like "vibrant", "whimsical" and "hyper-realistic" can hurt output; use concrete visual descriptions instead.',
      'One clear action and one camera move per clip. Ray3.2 supports start/end keyframes; mention the start and end frame only if the user wants a transition.',
      'Luma doesn’t generate synced dialogue, so focus on visuals.',
    ],
  },
  grok: {
    label: 'Grok Imagine',
    name: 'Grok Imagine',
    version: 'Grok Imagine',
    maker: 'xAI',
    audio: true,
    lengths: [6, 10, 15],
    rules: [
      'Lead with subject + action: put who is doing what in the first sentence, then camera, then atmosphere and lighting, then audio.',
      'Use one camera move per clip; stacking moves gives poor results.',
      'Grok Imagine generates synced audio: name concrete sounds ("footsteps on gravel", "cloth rustling") rather than vague moods like "cinematic sound", and put dialogue in quotes.',
      'Be specific about lighting, style, subject and mood. Clips run about 6-10 seconds and can be extended.',
    ],
  },
  happyhorse: {
    label: 'HappyHorse 1.0',
    name: 'HappyHorse',
    version: 'HappyHorse 1.0',
    maker: 'Alibaba',
    audio: true,
    lengths: [5, 8, 10, 15],
    rules: [
      'HappyHorse 1.0 works best with this order: character description, exact dialogue in quotes, setting, ambient sound and Foley, then style and mood.',
      'Focus each prompt on one main character; the model is strongest at single-character coherence.',
      'Name the spoken language explicitly for better lip-sync ("she says in Spanish, “...”").',
      'Describe ambient sounds and Foley directly, since they drive the audio. Keep scenes short and dialogue-driven.',
      'Keep prompts under about 2,000 characters.',
    ],
  },
};

/** Picker list for the browser (no rules or page content). */
export const MODEL_PICKER = Object.entries(MODELS).map(([id, m]) => ({
  id, label: m.label, variants: m.variants || null, lengths: m.lengths,
}));

// ── Shared content ───────────────────────────────────────────────────────────
const SCRIPTSEA_LINE = 'ScriptSea turns one idea into a full video script with a scroll-stopping hook and a ready prompt for every scene.';
export const BRAND = {
  name: 'ScriptSea',
  line: SCRIPTSEA_LINE,
  url: 'https://www.scriptsea.com',
};

// ── Pages ────────────────────────────────────────────────────────────────────
// kind: 'hub' | 'model' | 'enhancer' | 'script'
// For model pages the H1 is "Free [h1Name] Prompt Generator".
export const PAGES = {
  // ── HUB ────────────────────────────────────────────────────────────────────
  'ai-video-prompt-generator': {
    kind: 'hub',
    model: 'any',
    h1Name: 'AI Video',
    navLabel: 'AI Video Prompt Generator',
    title: 'Free AI Video Prompt Generator for Every Model | ScriptSea',
    description: 'Free AI video prompt generator for Seedance, Veo, Omni Flash, Kling, Runway, Sora and more. Text to video prompts in seconds. No signup.',
    intro: [
      'Type an idea, a scene or a whole script, pick your video model, and get a prompt you can paste straight in. It’s free, it takes a few seconds, and you don’t need an account.',
      'Every model reads prompts differently. Veo wants its audio directed, Kling wants exact camera moves, Seedance likes shot-by-shot timing. This tool writes the prompt the way your model likes it, so you waste fewer credits on clips that miss.',
    ],
    tipsTitle: 'How to write AI video prompts that work',
    tips: [
      { title: 'Describe one shot, completely', body: 'Who is in it, what they do, where, what the light is like, how the camera sees it, and what we hear. A prompt that skips one of these leaves the model guessing, and guesses look generic.' },
      { title: 'Concrete beats pretty', body: '"A woman in a mustard raincoat waits under a flickering bus-stop light" beats "a beautiful moody street scene". Name objects, colours, materials and light sources.' },
      { title: 'One camera move per shot', body: 'A slow push-in or a static shot reads as real footage. A push-in plus a pan plus a tilt in four seconds reads as AI. Pick the one move that serves the moment.' },
      { title: 'Direct the sound', body: 'Most new models (Veo, Omni Flash, Seedance, Kling 4.0, Sora, Grok) make audio too. Put dialogue in quotes, name the sound effects, or say "no dialogue". If you don’t, the model picks for you.' },
      { title: 'Put the best moment first', body: 'You’ll usually trim a clip to its best two to five seconds. Write the prompt so the key action happens early, not after a slow build.' },
      { title: 'Match the prompt to the model', body: 'Pick your model in the menu above. The tool switches to that model’s format, from Kling’s shot labels to Sora’s storyboard lines to Hailuo’s bracketed camera moves.' },
    ],
    examplesTitle: 'AI video prompt examples',
    examples: [
      { title: 'Product hook (any model)', prompt: 'Extreme close-up, static. A single drop of clear serum falls from a glass dropper and lands on the back of a hand, spreading into a thin sheen. Soft morning window light from the left, white bathroom counter, shallow depth of field. Calm, clean, premium. Sound: a soft drip, quiet room tone, no dialogue.' },
      { title: 'Street food (Veo-style audio)', prompt: 'Medium shot, slow push-in. A street cook in a stained white apron flips noodles in a blazing wok, flames licking up the sides, at a night market in Bangkok. Neon signs in pink and green, steam rising through the light. SFX: oil sizzling, metal spatula scraping the wok. Ambient noise: crowd chatter, distant scooter horns. No dialogue.' },
      { title: 'Talking-head UGC', prompt: 'Single continuous shot, no scene cuts. Medium close-up at eye level. A 30-year-old woman with curly dark hair in a grey hoodie sits on her bed, looks straight at the viewer and says, "I tried every serum on TikTok. This is the only one I finished." Warm lamp light, slightly messy bedroom behind her. Natural, unpolished feel. No music.' },
      { title: 'Cinematic establishing shot', prompt: 'Aerial wide shot, slow forward drift. A lone red pickup truck drives along a dirt road through endless golden wheat fields at sunset, a long dust trail behind it. Low sun backlights the dust, deep blue sky fading to orange at the horizon. Quiet and nostalgic. Sound: wind over the fields, distant engine hum.' },
      { title: 'Two-shot sequence', prompt: 'Shot 1 (0-3s): Close-up, static. A man’s hands tie the laces of worn running shoes on a wet doorstep at dawn. Shot 2 (3-8s): Wide tracking shot following him from behind as he starts running down an empty suburban street, breath visible in the cold air. Blue-grey dawn light, wet asphalt reflections. Sound: laces pulled tight, then steady footsteps and breathing. No music.' },
    ],
    mistakesTitle: 'Common mistakes that waste credits',
    mistakes: [
      { title: 'Writing a vibe, not a shot', body: '"Epic cinematic video of a city" gives the model nothing to film. Say what is in frame and what moves.' },
      { title: 'Stacking camera moves', body: 'Pan, zoom and orbit in one short clip almost always warps the scene. One move, or a static shot.' },
      { title: 'Forgetting the sound', body: 'On models that generate audio, a silent prompt can come back with random music or mumbled words. Say what we should hear.' },
      { title: 'Naming the camera gear', body: '"Filmed on an iPhone on a tripod" can put a phone or tripod in your shot. Describe the viewpoint instead: "static shot at eye level".' },
      { title: 'Cramming a whole story into one clip', body: 'A 10-second clip holds one or two beats. Split longer ideas into scenes, which is exactly what the script mode does.' },
    ],
    faqs: [
      { q: 'Is this AI video prompt generator really free?', a: 'Yes. You get 5 free prompts a day with no signup and no card. If you want a full script with a prompt for every scene, ScriptSea gives you 3 free scripts.' },
      { q: 'Which AI video models does it support?', a: 'Seedance 2.5, Veo 3.1, Gemini Omni Flash, Google Flow, Kling 4.0, Runway Gen-4.5, Higgsfield, Pika 2.5, Sora 2, Hailuo (MiniMax H3), Wan 3.0, Luma Ray3, Grok Imagine and HappyHorse 1.0. Pick "Any model" for a universal prompt.' },
      { q: 'What is a text to video prompt?', a: 'It’s the written description you give a text-to-video model. A good one describes one shot: subject, action, setting, lighting, camera and sound, in plain, specific words.' },
      { q: 'Can I paste a whole script?', a: 'Yes. Paste it and the tool finds the scenes, writes full prompts for the first two, and shows how many more there are. ScriptSea unlocks every scene with the same character in each one.' },
      { q: 'Can it fix a prompt that gave me a bad video?', a: 'Yes. Switch to Improve, paste the prompt, and you’ll get a stronger version plus a short list of what changed and why.' },
      { q: 'Do I need to write in English?', a: 'No. Write in any language. The prompt comes back in English, which video models follow most reliably, and any dialogue you wrote stays in your language.' },
      { q: 'How is this different from ChatGPT?', a: 'It’s built only for video prompts and knows each model’s format, from Veo’s audio directions to Kling’s camera terms. You don’t have to explain what a good prompt looks like.' },
    ],
  },

  // ── ENHANCER ───────────────────────────────────────────────────────────────
  'video-prompt-enhancer': {
    kind: 'enhancer',
    model: 'any',
    defaultMode: 'improve',
    h1Name: 'Video Prompt Enhancer',
    h1: 'Free AI Video Prompt Enhancer',
    navLabel: 'Video Prompt Enhancer',
    title: 'Free AI Video Prompt Enhancer: Fix Bad Prompts | ScriptSea',
    description: 'Free video prompt enhancer. Paste a prompt that gave you a bad result and get a stronger version for your model, plus what changed. No signup.',
    intro: [
      'Got a clip that came back wrong? Warped hands, the wrong mood, random music, a camera that won’t stop moving? Paste the prompt here. You’ll get a fixed, stronger version and a short list of exactly what changed.',
      'It’s free, no signup, and it rewrites for the model you actually use, so the fix fits how that model reads prompts.',
    ],
    tipsTitle: 'Why AI video prompts fail (and how the enhancer fixes them)',
    tips: [
      { title: 'Vague words get vague footage', body: 'Words like "beautiful", "epic" and "stunning" don’t tell the model what to draw. The enhancer swaps them for concrete details: materials, colours, light sources, actions.' },
      { title: 'Missing pieces get guessed', body: 'If the prompt never says where the light comes from or how the camera moves, the model guesses. The enhancer fills in subject, action, setting, lighting, camera and sound.' },
      { title: 'Too many moves in one shot', body: 'Three camera moves in five seconds is the fastest way to a wobbly, melted clip. The enhancer keeps one move per shot.' },
      { title: 'Silent prompts on audio models', body: 'Veo, Omni Flash, Seedance and Kling 4.0 make sound. A prompt without sound directions often comes back with random music. The enhancer adds dialogue, sound effects or "no dialogue".' },
      { title: 'Things that pop in and out', body: 'Objects vanish when the prompt never says who holds what. The enhancer pins down hands and objects so they stay put.' },
      { title: 'Wrong format for the model', body: 'Kling wants shot labels and camera terms, Sora wants storyboard lines, Hailuo wants bracketed camera commands. Pick your model and the enhancer rewrites in its format.' },
    ],
    examplesTitle: 'Before and after: enhanced video prompts',
    examples: [
      { title: 'Vague product shot', before: 'cinematic video of a perfume bottle, luxury, beautiful lighting', prompt: 'Close-up, slow orbit right. A square glass perfume bottle with a gold cap stands on wet black marble. A thin ribbon of light slides across the glass as the camera circles, catching tiny water droplets. Single warm spotlight from above, deep black background. Quiet and expensive. Sound: a soft low hum, a single water drop, no dialogue.' },
      { title: 'Shaky multi-move shot', before: 'man walking in city, camera pans zooms and spins around him, rainy, neon', prompt: 'Medium tracking shot, camera moving backward at walking pace. A man in a dark wool coat walks toward the viewer down a rain-soaked alley at night, hands in pockets. Pink and teal neon signs reflect in the puddles. Steady, moody, slow. Sound: rain pattering, footsteps on wet stone, distant traffic.' },
      { title: 'Talking clip with random music', before: 'girl talking about her skincare routine to camera', prompt: 'Single continuous shot, no scene cuts. Medium close-up at eye level. A 25-year-old woman with a slicked-back bun and a white T-shirt stands at a bright bathroom mirror and says to the viewer, "Three steps. That’s it. My skin has never been calmer." Soft daylight from a window on her left. No music, quiet room tone.' },
      { title: 'Disappearing props', before: 'woman making coffee and checking phone', prompt: 'Medium shot, static at counter height. A woman in a navy sweater holds a white mug in her left hand while her right hand pours hot water from a gooseneck kettle into a pour-over cone. She sets the kettle down on the counter, where it stays. Morning sun across a wooden counter, steam rising. Sound: water pouring, a soft clink of the kettle. No dialogue.' },
      { title: 'Story crammed into one clip', before: 'a dog finds a lost toy, runs home, family celebrates, sunset, emotional', prompt: 'Shot 1 (0-3s): Low close-up, static. A scruffy brown terrier noses a faded blue rubber ball out from under a park bench. Shot 2 (3-6s): Low tracking shot as the dog runs across the grass with the ball in its mouth, ears flapping. Golden late-afternoon light, long shadows. Sound: a squeak of the ball, paws thudding on grass, birds. No music.' },
    ],
    mistakesTitle: 'Common prompt mistakes the enhancer catches',
    mistakes: [
      { title: 'Style words instead of instructions', body: '"Cinematic, 8K, masterpiece" doesn’t describe a shot. Most modern models ignore it or overcook the look.' },
      { title: 'Negations everywhere', body: '"No people, no cars, no text" can make models add exactly those things. Describe what you want: "an empty street at dawn".' },
      { title: 'Gear in the prompt', body: 'Naming phones, tripods or lenses can put them in the shot. Describe the viewpoint instead.' },
      { title: 'Dialogue without quotes', body: 'If the exact words aren’t in quotes, audio models improvise or put the words on screen as text.' },
      { title: 'One prompt for every model', body: 'A prompt that works in Veo can flop in Kling. Pick the model before you enhance.' },
    ],
    faqs: [
      { q: 'What does the video prompt enhancer do?', a: 'It rewrites a prompt that gave you a bad result into a clearer, stronger one for your model, and lists what it changed, so you learn what went wrong.' },
      { q: 'Is it free?', a: 'Yes. 5 free enhancements a day, no signup, no card.' },
      { q: 'Will it keep my idea?', a: 'Yes. It keeps your subject, story and any dialogue. It only fixes how the prompt is written: missing details, vague words, camera moves, sound and format.' },
      { q: 'Which models can I enhance prompts for?', a: 'Seedance, Veo, Omni Flash, Google Flow, Kling, Runway, Higgsfield, Pika, Sora, Hailuo, Wan, Luma, Grok Imagine and HappyHorse, or "Any model" for a universal version.' },
      { q: 'Why did my clip have random music?', a: 'Models that generate audio pick their own soundtrack when the prompt says nothing. The enhancer adds clear sound directions, like "no music" or exact dialogue in quotes.' },
      { q: 'Why do objects disappear in my AI videos?', a: 'Usually because the prompt never says who holds what. The enhancer names which hand holds each object and keeps it consistent through the shot.' },
    ],
  },

  // ── SCRIPT TO PROMPTS ──────────────────────────────────────────────────────
  'script-to-video-prompts': {
    kind: 'script',
    model: 'any',
    h1Name: 'Script to Video Prompts',
    h1: 'Free Script to AI Video Prompts Converter',
    navLabel: 'Script to Video Prompts',
    placeholder: 'Paste your script here. Scene headings, dialogue, voiceover, or just paragraphs all work.',
    title: 'Free Script to AI Video Prompts Converter | ScriptSea',
    description: 'Convert a script into AI video prompts for free. Paste your script, we split it into scenes and write ready-to-paste prompts. No signup needed.',
    intro: [
      'Paste a script and this free tool splits it into scenes, then writes full, ready-to-paste video prompts for the first two. You’ll see how many scenes your script has, so you know exactly what it takes to make the whole video.',
      'It works with any format: proper scene headings, a voiceover script, a list of lines, or plain paragraphs. Pick your video model and the prompts come out in that model’s style.',
    ],
    tipsTitle: 'How to turn a script into AI video prompts',
    tips: [
      { title: 'One scene, one prompt', body: 'Video models make one shot or one short sequence at a time. Each scene in your script becomes its own prompt, timed to what is said in it.' },
      { title: 'Show what the words mean', body: 'If the line is "I was broke", don’t show a person thinking. Show the empty wallet, the overdue bill. Good scene prompts turn words into pictures.' },
      { title: 'Keep the character identical', body: 'Video models forget your character between clips. Describe them with the same exact details in every scene: age, hair, clothes, one distinguishing detail.' },
      { title: 'Fast cuts in the hook', body: 'The first three seconds decide if people stay. Give the opening scene two or three quick, striking shots before the story settles.' },
      { title: 'Time scenes to the voice', body: 'About 150 spoken words is a minute of video. A scene with 25 words of voiceover needs about 10 seconds of footage, so pick clip lengths to match.' },
      { title: 'Direct the audio per scene', body: 'If your model makes sound, each scene prompt should say what we hear: the line being spoken, ambience, or "no dialogue" for B-roll.' },
    ],
    examplesTitle: 'Script to video prompt examples',
    examples: [
      { title: 'Voiceover line → scene', before: 'VO: "Month two is where most side hustles die."', prompt: 'Shot 1 (0-1.5s): Extreme close-up, static. A hand tears a page off a wall calendar, revealing the next month. Shot 2 (1.5-4s): Medium shot, slow push-in. A 27-year-old man in a grey hoodie sits at a cluttered desk, staring at a laptop showing a flat sales chart. Warm desk lamp against cool laptop glow. Sound: paper tearing, then quiet room tone.' },
      { title: 'Dialogue scene', before: 'MAYA: "You kept it?" / LEO: "Every single one."', prompt: 'Single continuous shot, no scene cuts. Medium two-shot at eye level. A woman in a yellow raincoat holds up a shoebox of old letters in a dim attic and says, "You kept it?" The man beside her, in a flannel shirt, smiles and says, "Every single one." Dusty afternoon light through a round window. No music.' },
      { title: 'B-roll for a product line', before: '"It charges your phone four times on one trip."', prompt: 'Close-up, slow orbit left. A matte black power bank lies on a wooden café table beside a passport and a paper coffee cup, a phone charging from it, the screen lighting up as the battery fills. Soft daylight, warm wood tones. Sound: café murmur, a short charging chime. No dialogue.' },
      { title: 'Opening hook scene', before: '"Your expensive serum is mostly water."', prompt: 'Shot 1 (0-1s): Macro, static. A drop of serum falls into a glass of water and disappears. Shot 2 (1-3s): Close-up, handheld. A woman turns a small serum bottle in her fingers, squinting at the ingredient label. Bright bathroom light, white tiles. Sound: a soft drip, then a quiet scoff. No music.' },
      { title: 'Closing scene', before: '"Keep going. There’s room for you tomorrow."', prompt: 'Wide shot, slow crane up. A young woman stands on a rooftop at sunrise, laptop bag on her shoulder, looking out over a waking city. Soft pink and gold light, long shadows across the rooftop gravel. Hopeful, still. Sound: distant traffic starting up, a light wind, no dialogue.' },
    ],
    mistakesTitle: 'Common mistakes when turning scripts into video',
    mistakes: [
      { title: 'One prompt for the whole script', body: 'A model can’t fit a minute of story into one clip. Split it into scenes first.' },
      { title: 'A new face in every scene', body: 'If each prompt describes the character differently, you get a different person every clip.' },
      { title: 'Visuals that ignore the words', body: 'Random pretty footage under a voiceover feels like a slideshow. Each scene should show what is being said at that moment.' },
      { title: 'Clips that don’t match the voice', body: 'A 3-second line in a 10-second clip leaves dead air. Time each scene to its words.' },
      { title: 'Cutaways inside a talking clip', body: 'If someone speaks on camera, cutting away mid-sentence breaks lip-sync. Keep talking clips to one take and put B-roll in separate clips.' },
    ],
    faqs: [
      { q: 'How do I convert a script into AI video prompts?', a: 'Paste the script, pick your video model and press Generate. The tool splits it into scenes and writes a ready-to-paste prompt for each of the first two.' },
      { q: 'Why are only two scenes unlocked?', a: 'The free tool writes the first two scenes so you can see the quality. ScriptSea unlocks every scene, keeps the same character in each one, and can write the script for you too, with 3 free scripts and no card.' },
      { q: 'What script formats work?', a: 'Anything: screenplay format with scene headings, a voiceover script, dialogue lines, or plain paragraphs.' },
      { q: 'How many scenes does a short video need?', a: 'Usually 6 to 10 for a 30 to 60 second video. Each scene is one clip of about 3 to 10 seconds.' },
      { q: 'Will the character look the same in every scene?', a: 'The prompts describe the character with the same details each time. For perfect matching, also use a reference image in your video tool.' },
      { q: 'Does it work for other languages?', a: 'Yes. The prompts come back in English for the best results, and any dialogue stays in your script’s language.' },
    ],
  },

  // ── SEEDANCE ───────────────────────────────────────────────────────────────
  'seedance-prompt-generator': {
    kind: 'model',
    model: 'seedance',
    h1Name: 'Seedance',
    title: 'Free Seedance Prompt Generator (Seedance 2.5) | ScriptSea',
    description: 'Free Seedance prompt generator for Seedance 2.5 and 2.0. Shot-by-shot prompts with motion, camera and native audio, ready to paste. No signup.',
    intro: [
      'Seedance 2.5 from ByteDance can make clips that look shot on a real camera, up to 30 seconds long and with its own sound. But only if the prompt tells it exactly what to show. This free tool writes those prompts for you: shot by shot, with strong motion, one clean camera move per shot, and the audio directed.',
      'Type an idea or paste a script. No signup, no card. Prompts also work on Seedance 2.0 (up to 15 seconds).',
    ],
    tipsTitle: 'How to write Seedance prompts',
    tips: [
      { title: 'Go shot by shot', body: 'Seedance follows clear cuts. Label each shot with its time, like "Shot 1 (0-3s):", and say what changes at the cut. Build longer videos from a few clean shots, not one crowded paragraph.' },
      { title: 'Lead with motion', body: 'Seedance is at its best with physical, concrete movement. Say what moves, which way and how fast: "she spins the bottle slowly in her fingers", not "she shows the product".' },
      { title: 'Name the camera once per shot', body: 'Static, handheld, slow push-in, orbit, overhead. Pick one. Two or three moves in one shot usually turns into a mess.' },
      { title: 'Direct the sound', body: 'Seedance makes native audio. Put dialogue in quotes with who says it, and name the sounds: "keys jangle, a door clicks shut". Otherwise it chooses for you.' },
      { title: 'Use reference images for faces', body: 'Seedance takes reference images. Pair one with the same written description every time to lock your character across clips.' },
      { title: 'Say the light and time of day', body: '"Soft morning window light" or "neon street at night" changes the whole mood and makes clips look filmed, not generated.' },
    ],
    examplesTitle: 'Seedance prompt examples',
    examples: [
      { title: 'Product reveal (2 shots)', prompt: 'Shot 1 (0-2s): Macro, static. A thumb slides open a matte white compact, revealing a pressed blush in soft coral; powder dust lifts into the light. Shot 2 (2-5s): Close-up, slow push-in. A 26-year-old woman with freckles and a low bun sweeps the blush onto her cheek with a fluffy brush, glancing up at the mirror and smiling. Warm vanity bulbs, cream walls. Sound: the compact clicking open, a soft brush swish, quiet room tone.' },
      { title: 'Action sports', prompt: 'Shot 1 (0-3s): Low wide shot, static. A skateboarder in a faded red hoodie rolls fast toward a concrete ledge at an empty skatepark at golden hour. Shot 2 (3-6s): Side tracking shot matching his speed as he pops an ollie onto the ledge, grinds its length and lands clean, arms out for balance. Long orange shadows, dusty concrete. Sound: wheels roaring on concrete, the sharp scrape of the grind, a clack on landing.' },
      { title: 'UGC testimonial', prompt: 'Single shot, medium close-up at eye level, static. A 34-year-old man with a trimmed beard and a navy T-shirt sits in his parked car, holds up a protein shaker in his right hand and says, "I’ve tried six of these. This is the only one that doesn’t taste like chalk." Soft daylight through the windshield. Sound: his voice, faint traffic outside, no music.' },
      { title: 'Food close-up', prompt: 'Shot 1 (0-2s): Overhead, static. A knife slices through a crusty sourdough loaf on a flour-dusted board, steam rising from the soft crumb. Shot 2 (2-5s): Close-up, slow push-in. A hand spreads salted butter that melts into the warm bread. Warm kitchen light from the side, rustic wood. Sound: the crust crackling under the knife, a soft scrape of butter.' },
      { title: 'Calm travel shot', prompt: 'Wide shot, slow forward drift. A wooden fishing boat glides across a glassy lake at dawn, mist curling on the water, pine-covered mountains behind. A fisherman in a green jacket stands at the bow, casting a line in one smooth arc. Pale blue light turning gold at the peaks. Sound: water lapping at the hull, a fishing reel clicking, a distant bird call.' },
    ],
    mistakesTitle: 'Common mistakes that waste credits on Seedance',
    mistakes: [
      { title: 'A whole story in one shot', body: 'Seedance does best with one action per shot. Split a story into labelled shots.' },
      { title: 'Weak motion words', body: '"Shows", "has", "is" give Seedance nothing to animate. Use movement verbs: slides, flips, pours, spins.' },
      { title: 'Silent prompts', body: 'Without sound directions you get random audio. Say what we hear.' },
      { title: 'Changing the character’s description', body: 'If shot 1 says "red jacket" and shot 2 says "jacket", Seedance may change it. Repeat the same details.' },
      { title: 'Stacked camera moves', body: 'Push-in plus orbit plus tilt in a few seconds warps the scene. One move per shot.' },
    ],
    faqs: [
      { q: 'What is Seedance?', a: 'Seedance is ByteDance’s AI video model. Seedance 2.5 makes realistic clips up to 30 seconds with native audio, from text and reference images. It’s available on platforms like Higgsfield, Runway and Dreamina.' },
      { q: 'Do these prompts work on Seedance 2.0?', a: 'Yes. They work on both. Seedance 2.0 is limited to about 15 seconds per clip, so keep shot timings within that.' },
      { q: 'How long should a Seedance prompt be?', a: 'Long enough to describe each shot completely: subject, motion, camera, light and sound. Usually 80 to 250 words. The tool writes them at that length.' },
      { q: 'How do I keep the same person in every Seedance clip?', a: 'Describe them with identical details in every prompt and attach the same reference image. ScriptSea does this for every scene of your video automatically.' },
      { q: 'Does Seedance generate sound?', a: 'Yes. Seedance makes native audio, so prompts should include dialogue in quotes and named sound effects.' },
      { q: 'Is this Seedance prompt generator free?', a: 'Yes. 5 free prompts a day, no signup.' },
    ],
  },

  // ── VEO ────────────────────────────────────────────────────────────────────
  'veo-prompt-generator': {
    kind: 'model',
    model: 'veo',
    h1Name: 'Veo',
    title: 'Free Veo Prompt Generator (Google Veo 3.1) | ScriptSea',
    description: 'Free Veo 3.1 prompt generator. Get Google-style prompts with camera, lighting, dialogue and sound effects directed, ready for Gemini or Flow.',
    intro: [
      'Google Veo 3.1 makes video with sound: dialogue, ambience, sound effects. That means a good Veo prompt has to cover what we see and what we hear. This free tool writes both, in the structure Google recommends, so your clips come out right the first time.',
      'Type an idea or paste a script. No signup. Use the prompts in the Gemini app, Google Flow or any tool that runs Veo.',
    ],
    tipsTitle: 'How to write Veo prompts',
    tips: [
      { title: 'Use Google’s five-part structure', body: 'Cinematography (shot and camera move), subject, action, context (where and when), and style and ambiance (light, mood, colour). In that order, Veo understands you best.' },
      { title: 'Write the sound', body: 'Veo generates audio. Label it: "SFX: thunder cracks in the distance", "Ambient noise: quiet café chatter". If you want silence, say "no dialogue, no music".' },
      { title: 'Put dialogue in quotes', body: 'Write the exact line after the speaker: A woman says, "We have to leave now." Keep it short, one or two sentences per clip, and add "no subtitles".' },
      { title: 'Use timestamps for beats', body: 'Veo clips are 4, 6 or 8 seconds. For more than one beat, write "[00:00-00:02] ... [00:02-00:05] ...". Each timestamp is its own little shot.' },
      { title: 'Describe what you want, not what you don’t', body: 'Google’s own advice: "a desolate landscape with no buildings" works better than "no man-made structures". Positive descriptions win.' },
      { title: 'Leave the gear out', body: 'Don’t name cameras, phones or aspect ratios. Set the ratio in the app. Named gear can end up in your shot.' },
    ],
    examplesTitle: 'Veo 3.1 prompt examples',
    examples: [
      { title: 'Dialogue scene', prompt: 'Medium shot, static. A tired detective in a rumpled trench coat sits behind a cluttered desk in a 1940s office, cigarette smoke drifting through slatted window light. He looks up at the woman in the doorway and says in a weary voice, "Of all the offices in this town, you had to walk into mine." Ambient noise: rain on the window, a ceiling fan ticking. No subtitles.' },
      { title: 'Timed sequence', prompt: '[00:00-00:02] Medium shot from behind a young explorer with a leather satchel as she pushes a thick jungle vine aside. [00:02-00:05] Reverse close-up of her face, eyes widening at moss-covered stone ruins. [00:05-00:08] Wide crane shot rising to reveal the vast temple swallowed by jungle. SFX: leaves rustling, distant exotic birds. A gentle orchestral swell begins at the reveal.' },
      { title: 'Product ad', prompt: 'Close-up, slow orbit left. A glass bottle of cold-brew coffee stands on a stone counter as condensation runs down its sides, ice clinking inside. Morning sunlight cuts across the frame through a kitchen window, warm brown and cream tones. SFX: ice clinking, a cap twisting open with a hiss. No dialogue.' },
      { title: 'Nature', prompt: 'Aerial wide shot, slow drift forward. A herd of wild horses gallops across a misty highland valley at sunrise, manes flying, mist parting around them. Soft golden light on the hills, deep green grass. Ambient noise: thundering hooves, wind across the valley. No music.' },
      { title: 'Comedy beat', prompt: 'Medium close-up, static. A man in a suit carefully balances a tall stack of pancakes on a plate in an office kitchen, then the top pancake slides off and slaps onto the floor. He freezes, looks straight at the viewer and says, "Nobody saw that." Fluorescent office light. SFX: a wet slap. No subtitles.' },
    ],
    mistakesTitle: 'Common mistakes that waste credits on Veo',
    mistakes: [
      { title: 'No sound directions', body: 'Veo will invent audio. If the prompt is silent, you may get music you didn’t want or mumbled words.' },
      { title: 'Dialogue without quotes', body: 'Veo can skip the line or print it as on-screen text. Always use quotes and add "no subtitles".' },
      { title: 'Long speeches', body: 'An 8-second clip fits about 15 to 20 spoken words. Longer lines get cut or rushed.' },
      { title: 'Negative phrasing', body: '"No people" can add people. Describe the empty scene you want instead.' },
      { title: 'Naming the aspect ratio or camera', body: 'Set the ratio in the app. Naming gear can put it in the shot.' },
    ],
    faqs: [
      { q: 'Where can I use Veo?', a: 'Google offers Veo 3.1 in the Gemini app, Google Flow and through its API. Many third-party video tools run it too.' },
      { q: 'How do I add dialogue in Veo?', a: 'Write who speaks and put the exact words in quotes: A woman says, "We have to leave now." Keep each line short and add "no subtitles".' },
      { q: 'How long are Veo clips?', a: 'Veo 3.1 makes 4, 6 or 8 second clips. You can extend them in Flow.' },
      { q: 'Is there a Veo 4?', a: 'As of October 2026, Veo 3.1 is Google’s newest Veo model. Google’s newer Gemini Omni Flash is a separate model, and we have a free Omni Flash prompt generator too.' },
      { q: 'Do these prompts work in other models?', a: 'Mostly yes, but each model has its own style. Pick a different model in the menu and the tool rewrites the prompt for it.' },
      { q: 'Is the Veo prompt generator free?', a: 'Yes. 5 free prompts a day with no signup.' },
    ],
  },

  // ── OMNI FLASH ─────────────────────────────────────────────────────────────
  'omni-flash-prompt-generator': {
    kind: 'model',
    model: 'omni',
    h1Name: 'Omni Flash',
    title: 'Free Omni Flash Prompt Generator (Gemini Omni) | ScriptSea',
    description: 'Free Gemini Omni Flash prompt generator. One-take or multi-shot prompts with dialogue, sound and timing directed, ready to paste. No signup needed.',
    intro: [
      'Gemini Omni Flash is Google’s newest video model, and it doesn’t read prompts like older models do. It cuts between shots on its own, makes its own sound, and draws whatever you name, including the phone or tripod you mention. This free tool writes Omni Flash prompts that account for all of it.',
      'You get a full, ready-to-paste prompt: one continuous take or clearly timed cuts, the exact dialogue in quotes, named sounds, and hands and objects that stay put. No signup, no card.',
    ],
    tipsTitle: 'How to write Omni Flash prompts',
    tips: [
      { title: 'Decide: one take or cuts', body: 'Omni Flash builds multi-shot sequences by default. If you want one take, say "single continuous shot, no scene cuts" near the start. If you want cuts, time them: "[0-3s] ..., [3-6s] ...".' },
      { title: 'Describe the whole shot', body: 'Subject, action, setting, lighting and camera framing, in full sentences. Short phrases get generic clips. Omni Flash rewards detail.' },
      { title: 'Always direct the audio', body: 'It makes sound with every clip. Write the exact dialogue in quotes, who says it and in what language, name the sound effects, and say "no music" if you don’t want any.' },
      { title: 'Never name the gear', body: 'Write "static shot at eye level" or "selfie angle at arm’s length", not "filmed on a phone on a tripod". Omni Flash tends to draw named gear into the scene. Aspect ratio and length go in the app settings, not the prompt.' },
      { title: 'Say which hand holds what', body: 'Objects vanish or multiply when the prompt is vague. "Her left hand holds the mug the whole time; her right hand gestures" keeps the scene physically consistent.' },
      { title: 'Text on screen goes in quotes', body: 'If you want words in the video, quote them, give the language and say where they appear: the words "SALE ENDS FRIDAY" in bold white letters across the top of the frame.' },
    ],
    examplesTitle: 'Omni Flash prompt examples',
    examples: [
      { title: 'One-take talking head', prompt: 'UGC talking-head video, static shot at eye level, single continuous shot, no scene cuts. A 29-year-old Filipina woman with shoulder-length black hair and a sage linen shirt sits at a wooden desk and looks directly at the viewer. She says in English, "I tested five planners this year. This is the only one I still open every morning." Both hands rest on the desk; her right hand taps a closed planner. Soft daylight from a window on her left. Background sound: quiet room tone, no music.' },
      { title: 'Selfie in the car', prompt: 'Selfie angle at arm’s length, single continuous shot, no scene cuts. A 35-year-old man with a short beard and a black cap sits in the driver’s seat of a parked car. The view comes from his extended right arm, so his right hand stays out of frame; his left hand holds a coffee cup the whole time. He says, "Quick one before work. This saved me two hours this week." Morning light through the windshield. Sound: muffled traffic outside, no music.' },
      { title: 'Timed product sequence', prompt: '[0-2s] Macro shot: a drop of honey falls from a wooden dipper onto a stack of pancakes. [2-5s] Close-up, slow push-in: a fork cuts through the stack, butter melting into the layers. [5-8s] Medium shot: a woman in a striped apron takes a bite at a sunny kitchen table and closes her eyes. Warm morning light, cream and gold tones. SFX: honey dripping, fork on plate. No music, no dialogue.' },
      { title: 'On-screen text ad', prompt: 'Single continuous shot, no scene cuts. Close-up, slow orbit right around a pair of white running shoes on wet asphalt at dusk, puddles reflecting orange street lights. The words "RUN IN THE RAIN" appear in bold white English letters across the top of the frame for the last three seconds. Sound: light rain, a distant car passing, no music.' },
      { title: 'Cinematic B-roll', prompt: 'Two shots. [0-4s] Wide shot, static: fog rolls over a quiet harbour at dawn, fishing boats rocking gently. [4-8s] Close-up, handheld: an old fisherman’s weathered hands coil a wet rope on the dock. Cold blue light warming to gold. Sound: gulls, water slapping the dock, rope creaking. No dialogue, no music.' },
    ],
    mistakesTitle: 'Common mistakes that waste credits on Omni Flash',
    mistakes: [
      { title: 'Not saying "single continuous shot"', body: 'You wanted one take and got four cuts. Omni Flash cuts by default unless you tell it not to.' },
      { title: 'Naming the phone or tripod', body: '"Filmed on a phone fixed on a tripod" is a classic way to get a tripod in your shot. Describe the viewpoint instead.' },
      { title: 'Putting the aspect ratio in the prompt', body: 'Set 9:16 or 16:9 and the length in the app. In the prompt it does nothing useful.' },
      { title: 'Leaving the audio to chance', body: 'Without directions you get random music or invented lines. Quote the dialogue and name the sounds.' },
      { title: 'Vague hands and props', body: 'If you don’t say which hand holds what, a laptop can vanish mid-clip or a second phone can appear.' },
    ],
    faqs: [
      { q: 'What is Gemini Omni Flash?', a: 'It’s Google’s newest AI video model (currently Omni 1.1 Flash). It makes clips with sound from text and images, and builds short multi-shot sequences by default. You can use it in Google Flow, the Gemini app and platforms like Higgsfield.' },
      { q: 'How do I stop Omni Flash from cutting between shots?', a: 'Write "single continuous shot, no scene cuts" near the start of the prompt.' },
      { q: 'Why does a tripod or phone appear in my Omni Flash video?', a: 'Because the prompt named it. Describe the viewpoint instead, like "static shot at eye level" or "selfie angle at arm’s length", and set the ratio in the app.' },
      { q: 'How long are Omni Flash clips?', a: 'You pick the length in the app settings, typically 4, 6, 8 or 10 seconds. Don’t put it in the prompt.' },
      { q: 'How do I add dialogue in Omni Flash?', a: 'Put the exact words in quotes, say who speaks and in which language: She says in English, "...". Keep it to what fits the clip length.' },
      { q: 'Is this Omni Flash prompt generator free?', a: 'Yes. 5 free prompts a day, no signup, no card.' },
      { q: 'Can I make a full video with Omni Flash?', a: 'Yes, clip by clip. ScriptSea writes the script and a timed prompt for every clip, with the same character, hands and props kept consistent across all of them.' },
    ],
  },

  // ── GOOGLE FLOW ────────────────────────────────────────────────────────────
  'google-flow-prompt-generator': {
    kind: 'model',
    model: 'flow',
    h1Name: 'Google Flow',
    title: 'Free Google Flow Prompt Generator (Veo & Omni) | ScriptSea',
    description: 'Free Google Flow prompt generator. Pick Veo 3.1 or Omni Flash and get prompts built for Flow scenes, ingredients and extends. No signup needed.',
    intro: [
      'Google Flow is Google’s AI filmmaking app. It runs two video models, Veo 3.1 and Gemini Omni Flash, and each one wants its prompts written differently. Pick which one you’re using in Flow and this free tool writes the prompt for it.',
      'You get a ready-to-paste prompt built for how Flow works: one clean shot or a clearly timed sequence you can extend, with the sound directed and your character described the same way every time.',
    ],
    tipsTitle: 'How to write prompts for Google Flow',
    tips: [
      { title: 'Know which model you’re on', body: 'Veo 3.1 likes Google’s five-part structure and labelled sound ("SFX:", "Ambient noise:"). Omni Flash cuts between shots unless you say "single continuous shot". Pick the right one in the tool.' },
      { title: 'Use ingredients for consistency', body: 'Flow lets you reuse characters and objects as ingredients. Describe them with the same exact words in every prompt so the text and the image agree.' },
      { title: 'One shot per prompt, then extend', body: 'Flow’s scene builder strings clips together. Write each prompt as one shot or one short timed sequence, then use Extend to continue it.' },
      { title: 'Direct the audio', body: 'Both models generate sound. Quote the dialogue, name the sound effects, or say "no music".' },
      { title: 'Frames to video', body: 'If you start from an image, write the prompt about motion and sound. The image already sets the look.' },
      { title: 'Keep gear and ratios out', body: 'Choose the aspect ratio in Flow. Naming cameras or phones in the prompt can put them in the shot.' },
    ],
    examplesTitle: 'Google Flow prompt examples',
    examples: [
      { title: 'Veo 3.1 in Flow: opening shot', prompt: 'Wide shot, slow push-in. A lighthouse keeper in a yellow oilskin climbs a spiral iron staircase inside a stone lighthouse at night, lantern swinging in his hand. Storm light flashes through the narrow windows. Ambient noise: wind howling, waves crashing far below. SFX: boots clanging on iron steps. No dialogue.' },
      { title: 'Omni Flash in Flow: one take', prompt: 'Single continuous shot, no scene cuts. Medium close-up at eye level. A 40-year-old baker with flour on her forearms and a blue headscarf kneads dough on a marble counter and looks up at the viewer, saying, "Twenty years, same recipe. Never changed a thing." Warm early-morning bakery light. Background sound: an oven humming, no music.' },
      { title: 'Ingredient-based character', prompt: 'Medium shot, static. The same red-haired girl in a green raincoat and yellow boots (from the ingredient image) jumps into a puddle on a cobbled street, splashing water in an arc. Overcast afternoon light, wet stone glistening. SFX: a big splash, distant church bells. She laughs. No music.' },
      { title: 'Frames to video', prompt: 'From the starting frame: the steam rises slowly from the cup as the woman lifts it to her lips with her right hand and takes a small sip, eyes closing. The camera holds still. Sound: a quiet sip, café chatter in the background, no music.' },
      { title: 'Extend-ready sequence', prompt: '[00:00-00:03] Close-up: a key turns in the ignition of an old green pickup truck. [00:03-00:08] Wide shot, static: the truck pulls out of a dusty farm driveway at sunset, leaving a trail of dust. SFX: engine coughing to life, gravel crunching. No dialogue.' },
    ],
    mistakesTitle: 'Common mistakes that waste credits in Google Flow',
    mistakes: [
      { title: 'Writing for the wrong model', body: 'An Omni Flash prompt without "single continuous shot" cuts on its own. A Veo prompt without sound labels gets random audio.' },
      { title: 'Different descriptions of the same character', body: 'If your text and your ingredient image disagree, Flow blends them badly.' },
      { title: 'Too much in one clip', body: 'Flow clips are short. Write one beat and extend, rather than cramming a scene.' },
      { title: 'Ratios and gear in the prompt', body: 'Set the ratio in Flow. Gear words can appear on screen.' },
      { title: 'Ignoring the starting frame', body: 'In frames-to-video, re-describing the whole look fights the image. Describe the motion.' },
    ],
    faqs: [
      { q: 'What is Google Flow?', a: 'Flow is Google’s AI filmmaking app. It runs Veo 3.1 and Gemini Omni Flash and adds tools like ingredients, frames-to-video, extend and a scene builder.' },
      { q: 'Should I use Veo or Omni Flash in Flow?', a: 'Veo 3.1 is great for controlled, single shots with directed sound. Omni Flash is newer and builds multi-shot sequences on its own. Try both. The tool writes for either one.' },
      { q: 'How do I keep a character consistent in Flow?', a: 'Add the character as an ingredient and describe them with the same exact words in every prompt.' },
      { q: 'How long are Flow clips?', a: 'Usually 4 to 8 seconds per clip on Veo and up to 10 on Omni Flash. You can extend clips and join them in the scene builder.' },
      { q: 'Is this Google Flow prompt generator free?', a: 'Yes. 5 free prompts a day, no signup.' },
    ],
  },

  // ── KLING ──────────────────────────────────────────────────────────────────
  'kling-prompt-generator': {
    kind: 'model',
    model: 'kling',
    h1Name: 'Kling',
    title: 'Free Kling Prompt Generator (Kling 4.0) | ScriptSea',
    description: 'Free Kling prompt generator for Kling 4.0 and 3.0. Precise camera moves, real human motion and multi-shot prompts, ready to paste. No signup.',
    intro: [
      'Kling is one of the best models for people on screen: hands, faces, walking, talking. Kling 4.0 now makes up to 30 seconds in one go, with stereo sound and keyframes. Your prompt decides whether that motion looks natural or weird.',
      'This free tool writes Kling prompts with precise camera terms, body motion spelled out in order, and Kling’s multi-shot format when you need more than one shot. No signup. Prompts also work on Kling 3.0.',
    ],
    tipsTitle: 'How to write Kling prompts',
    tips: [
      { title: 'Use real camera terms', body: 'Dolly in, truck left, pedestal up, crane up, orbit right, whip pan, handheld follow, static. Kling knows them, and they beat "the camera moves around".' },
      { title: 'One main move per shot', body: 'Stacking push-in, pan, tilt and zoom destabilises Kling. Pick the one move that serves the shot.' },
      { title: 'Describe the movement precisely', body: '"Slowly turns her head toward the window and exhales" beats "she looks around". Kling follows motion detail well, so give it the order and speed.' },
      { title: 'Use the multi-shot format', body: 'For more than one shot: "Shot 1 (0-4s): ...; Shot 2 (4-8s): ...". Name each shot’s framing and move, and make the times add up.' },
      { title: 'Quote the dialogue', body: 'Kling 4.0 does lip-sync and stereo audio. Put the exact words in quotes and name the sounds.' },
      { title: 'Short negative prompt', body: 'Block the usual problems only: extra fingers, warped faces, flicker. A long negative prompt makes motion stiff.' },
    ],
    examplesTitle: 'Kling prompt examples',
    examples: [
      { title: 'Dance move', prompt: 'Medium wide shot, static. A 22-year-old dancer in a loose white T-shirt and black cargo pants stands in an empty warehouse. She rolls her shoulders back, drops into a low squat, spins once on her left foot and freezes with her right arm extended, all in one smooth motion. Hard side light from a tall window, dust in the air. Sound: sneakers squeaking on concrete, her breath.' },
      { title: 'Multi-shot product demo', prompt: 'Shot 1 (0-3s): Close-up, dolly in. A man’s hand presses the button on a matte black blender; the blades spin up. Shot 2 (3-6s): Medium shot, static. He pours a bright green smoothie into a tall glass at a sunny kitchen counter. Shot 3 (6-9s): Close-up, pedestal up from the glass to his face as he takes a sip and nods. Morning light, white tiles. Sound: blender whirring, liquid pouring.' },
      { title: 'Walking shot', prompt: 'Handheld follow shot from behind at shoulder height. A woman in a camel coat walks briskly through a crowded Tokyo crosswalk at night, weaving between people, her bag swinging on her right shoulder. Neon reflections on wet pavement. Sound: crowd footsteps, crossing signal beeping, distant traffic.' },
      { title: 'Emotional close-up', prompt: 'Close-up, very slow dolly in. An elderly man with a white beard and a flat cap reads a handwritten letter at a kitchen table; his eyes fill with tears, he presses his lips together and slowly lowers the letter. Soft afternoon light through lace curtains. Sound: a clock ticking, paper rustling. No music.' },
      { title: 'Sports action', prompt: 'Low angle, truck right matching his run. A basketball player in a red jersey drives toward the hoop on an outdoor court at sunset, takes two long strides and rises for a one-handed dunk, the chain net rattling. Golden backlight, long shadows. Sound: sneakers squeaking, ball bouncing, the net rattling.' },
    ],
    mistakesTitle: 'Common mistakes that waste credits on Kling',
    mistakes: [
      { title: 'Vague movement', body: '"Moves", "does a dance" or "walks around" give Kling nothing to follow. Describe each motion in order.' },
      { title: 'Several camera moves at once', body: 'Kling’s own advice: one main move per shot.' },
      { title: 'Shot times that don’t add up', body: 'In multi-shot mode, shot durations should add up to the clip length.' },
      { title: 'Busy backgrounds behind people', body: 'Crowds and fast camera moves fight with your subject. Let the person be the motion.' },
      { title: 'Long negative prompts', body: 'They make motion stiff. Keep them to a few real failure modes.' },
    ],
    faqs: [
      { q: 'What is the latest Kling version?', a: 'Kling 4.0, released in October 2026. It makes clips up to 30 seconds with keyframes, reference images and stereo audio. Kling 4.0 Flash is a faster, shorter version.' },
      { q: 'Do these prompts work on Kling 3.0?', a: 'Yes. Kling 3.0 makes shorter clips (up to 15 seconds), so keep shot timings within that.' },
      { q: 'How do I use Kling multi-shot?', a: 'Turn on Multi-shot, then label each shot with its time and framing, like "Shot 1 (0-4s): close-up, dolly in...". The tool writes it in that format.' },
      { q: 'Does Kling generate sound?', a: 'Kling 4.0 generates stereo audio and lip-sync. Put dialogue in quotes and name the sounds.' },
      { q: 'Do these prompts work for Kling image-to-video?', a: 'Yes. Use the prompt as the motion description and your image as the start frame.' },
      { q: 'Is this Kling prompt generator free?', a: 'Yes. 5 free prompts a day, no signup.' },
    ],
  },

  // ── RUNWAY ─────────────────────────────────────────────────────────────────
  'runway-prompt-generator': {
    kind: 'model',
    model: 'runway',
    h1Name: 'Runway',
    title: 'Free Runway Prompt Generator (Gen-4.5) | ScriptSea',
    description: 'Free Runway Gen-4.5 prompt generator. Shot-first prompts with clear motion and cause and effect, under Runway’s character limit. No signup needed.',
    intro: [
      'Runway Gen-4.5 is Runway’s flagship video model, and it rewards prompts that read like a shot list: camera first, then the subject and what they do, then the place and the light. This free tool writes Gen-4.5 prompts that way, kept under Runway’s 1,000-character limit.',
      'Type an idea or paste a script and get a prompt you can paste straight into Runway. No signup.',
    ],
    tipsTitle: 'How to write Runway Gen-4.5 prompts',
    tips: [
      { title: 'Camera first', body: 'Start with the move and the framing: "Slow dolly in on a close-up of...". Runway reads the shot better when the camera leads.' },
      { title: 'One beat per clip', body: 'Gen-4.5 clips are 2 to 10 seconds. One clear action reads well. Two actions can blur together.' },
      { title: 'Spell out cause and effect', body: 'Sequencing is a known Gen-4.5 weak spot. Write it in order: "the glass tips, falls, then shatters on the tiles".' },
      { title: 'Concrete over "cinematic"', body: '"Cinematic" and "epic" don’t tell Runway what to do. Describe the light, the lens feel, the motion.' },
      { title: 'Positive phrasing only', body: 'Runway has no negative-prompt field. Describe the scene you want, not what to leave out.' },
      { title: 'Image-to-video: motion only', body: 'If you start from an image, write about the motion. The image already sets the look.' },
    ],
    examplesTitle: 'Runway Gen-4.5 prompt examples',
    examples: [
      { title: 'Product hero', prompt: 'Slow dolly in on a close-up of a steel wristwatch resting on a folded linen napkin. The second hand ticks as a beam of warm sunlight slides across the glass. Shallow depth of field, soft brown and cream tones, quiet morning mood.' },
      { title: 'Cause and effect', prompt: 'Static medium shot. A boy in a striped T-shirt nudges a domino on a wooden floor; the line of dominoes falls in order, curves around a chair leg and knocks a small bell, which rings. Soft afternoon window light.' },
      { title: 'Character moment', prompt: 'Handheld close-up at eye level. A young woman in a rain-soaked denim jacket stands under a bus shelter at night, pulls her hood back and laughs, rain streaking past the neon-lit glass behind her. Teal and magenta reflections.' },
      { title: 'Landscape', prompt: 'Slow aerial push forward over a turquoise river winding through a narrow canyon at dawn, mist hanging low over the water. Soft pink light on the red rock walls, deep shadows in the gorge.' },
      { title: 'Image-to-video motion', prompt: 'The woman slowly turns her head toward the window and smiles as the curtains lift in a breeze. Dust drifts through the sunbeam. The camera holds still.' },
    ],
    mistakesTitle: 'Common mistakes that waste credits on Runway',
    mistakes: [
      { title: 'Two actions in one short clip', body: 'They tend to merge. Split them into two generations.' },
      { title: 'Causes and effects out of order', body: 'Write events in the order they happen, step by step.' },
      { title: 'Going over the character limit', body: 'Runway caps prompts at 1,000 characters. Long prompts get cut.' },
      { title: '"No" lists', body: 'There’s no negative field, and "no X" can add X. Describe what you want.' },
      { title: 'Re-describing the image', body: 'In image-to-video, fighting the start image makes clips drift. Describe the motion.' },
    ],
    faqs: [
      { q: 'What is Runway’s latest video model?', a: 'Gen-4.5 is Runway’s flagship text and image-to-video model as of October 2026.' },
      { q: 'How long can a Runway prompt be?', a: 'Up to 1,000 characters. The tool keeps prompts under that.' },
      { q: 'Does Runway Gen-4.5 have a negative prompt?', a: 'No. Phrase everything positively.' },
      { q: 'How long are Gen-4.5 clips?', a: 'Between 2 and 10 seconds.' },
      { q: 'Is this Runway prompt generator free?', a: 'Yes. 5 free prompts a day, no signup.' },
    ],
  },

  // ── HIGGSFIELD ─────────────────────────────────────────────────────────────
  'higgsfield-prompt-generator': {
    kind: 'model',
    model: 'higgsfield',
    h1Name: 'Higgsfield',
    title: 'Free Higgsfield Prompt Generator | ScriptSea',
    description: 'Free Higgsfield prompt generator. Cinematic shot prompts for Seedance, Kling, Veo, Wan and Omni Flash on Higgsfield, with camera and sound. No signup.',
    intro: [
      'Higgsfield puts the best video models in one place: Seedance 2.5, Kling, Veo 3.1, Wan 3.0, Gemini Omni Flash and MiniMax, plus its own Cinema Studio and camera presets. One good prompt goes a long way there, as long as it’s written like a shot.',
      'This free tool writes Higgsfield-ready prompts: composition, subject, one clear camera move, mood and sound. No signup. If you know which model you’ll pick on Higgsfield, choose it in the menu for a prompt tuned to it.',
    ],
    tipsTitle: 'How to write Higgsfield prompts',
    tips: [
      { title: 'Prompt like a shot', body: 'Composition + subject + camera move + mood. Higgsfield’s own advice, and it works across every model on the platform.' },
      { title: 'One clear camera move', body: 'A single slow push-in looks more cinematic than three stacked moves. Higgsfield’s presets are built around that.' },
      { title: 'Presets still need a prompt', body: 'A camera preset fixes the move, but you still say how fast it goes, the start and end framing, and what the subject does.' },
      { title: 'Pick the model for the job', body: 'Kling for people and motion, Veo or Omni Flash for sound and dialogue, Seedance for realistic product and lifestyle shots, Wan for longer clips.' },
      { title: 'Direct the sound', body: 'Most Higgsfield models generate audio. Quote dialogue and name the sounds.' },
      { title: 'Keep characters consistent', body: 'Describe your character with identical details in every prompt, and use a reference image when the model supports it.' },
    ],
    examplesTitle: 'Higgsfield prompt examples',
    examples: [
      { title: 'Crash zoom reveal', prompt: 'Wide shot that crash-zooms fast into a close-up. A street magician in a black turtleneck flips a playing card in the air on a busy city corner at night; it lands spinning on his fingertip. Neon store signs behind him, crowd blurred. Sound: a sharp whoosh on the zoom, crowd gasps.' },
      { title: 'Slow push-in portrait', prompt: 'Close-up, slow push-in over five seconds, starting at shoulder height and ending on the eyes. A boxer with taped hands sits alone in a dim locker room, breathing hard, then looks up with a steady stare. Single overhead bulb, sweat glistening. Sound: heavy breathing, a distant crowd roar.' },
      { title: 'Orbit product shot', prompt: 'Close-up, slow 180-degree orbit right. A pair of chunky white sneakers sits on a mirrored plinth surrounded by drifting dry-ice fog. Cool blue rim light, black background. Sound: low ambient hum, no dialogue.' },
      { title: 'Lifestyle UGC', prompt: 'Medium shot, static at eye level. A 28-year-old woman with braids and a lilac sweatshirt sits cross-legged on a sofa, opens a small box and pulls out a candle, then smiles at the viewer and says, "Okay, this smells exactly like my grandma’s kitchen." Warm lamp light. No music.' },
      { title: 'Drone establishing', prompt: 'Aerial wide shot, slow forward glide. A tiny red-roofed village sits on a green cliff above a stormy grey sea, waves exploding on the rocks below. Overcast silver light. Sound: wind and crashing surf.' },
    ],
    mistakesTitle: 'Common mistakes that waste credits on Higgsfield',
    mistakes: [
      { title: 'Relying on the preset alone', body: 'The preset moves the camera, but without subject action and framing you get a pretty, empty shot.' },
      { title: 'Stacked moves', body: 'Preset plus extra moves in the prompt fight each other. Pick one.' },
      { title: 'The wrong model for the shot', body: 'A dialogue scene on a silent model, or a long take on a short-clip model, wastes credits.' },
      { title: 'Silent prompts on audio models', body: 'Without sound directions the audio is random.' },
      { title: 'Changing the character between prompts', body: 'Small wording changes change the face. Repeat the exact description.' },
    ],
    faqs: [
      { q: 'What models can I use on Higgsfield?', a: 'As of October 2026, Higgsfield offers Seedance 2.5, Kling, Veo 3.1, Wan 3.0, Gemini Omni Flash and MiniMax, plus its own Cinema Studio and DoP camera tools. The list changes often.' },
      { q: 'Should I pick a specific model in this tool?', a: 'If you know which model you’ll use on Higgsfield, yes. Pick it in the menu for a prompt in that model’s format. Otherwise the Higgsfield setting writes a prompt that works across them.' },
      { q: 'Do Higgsfield camera presets need a prompt?', a: 'Yes. The preset sets the move, but the prompt still needs the subject, the action, the start and end framing and the speed.' },
      { q: 'Is this Higgsfield prompt generator free?', a: 'Yes. 5 free prompts a day, no signup.' },
      { q: 'Can I make a full video on Higgsfield?', a: 'Yes, clip by clip. ScriptSea writes the script and a prompt for every scene, and each one can open straight in Higgsfield.' },
    ],
  },

  // ── PIKA ───────────────────────────────────────────────────────────────────
  'pika-prompt-generator': {
    kind: 'model',
    model: 'pika',
    h1Name: 'Pika',
    title: 'Free Pika Prompt Generator (Pika 2.5) | ScriptSea',
    description: 'Free Pika prompt generator for Pika 2.5. Short, action-first prompts with clear motion and playful physics, ready to paste. No signup needed.',
    intro: [
      'Pika is the fun one: playful physics, stylised effects, things squishing, melting and exploding in ways that grab attention. Pika 2.5 rewards short, clear, action-first prompts, and punishes long lists of conflicting moves.',
      'This free tool writes Pika prompts that are punchy and specific, with one or two camera moves at most. No signup.',
    ],
    tipsTitle: 'How to write Pika prompts',
    tips: [
      { title: 'Action first, short and clear', body: 'Start with what happens: "a cupcake melts into a puddle of frosting". Then add lighting, angle and style.' },
      { title: 'One or two moves max', body: 'Contradictory motion makes Pika’s motion fail. One camera move, one main action.' },
      { title: 'Lean into physics', body: 'Pika shines when objects interact: squish, bounce, shatter, inflate. Describe the interaction clearly.' },
      { title: 'Use Ingredients for consistency', body: 'For the same character or product across clips, upload them as Ingredients and keep the text description matching.' },
      { title: 'Use the negative field', body: 'Put unwanted artifacts in Pika’s negative-prompt field, not in the main prompt.' },
      { title: 'Style words that mean something', body: '"Claymation", "glossy 3D toy", "hand-drawn ink" give Pika a real target. "Cool" doesn’t.' },
    ],
    examplesTitle: 'Pika prompt examples',
    examples: [
      { title: 'Squish effect', prompt: 'A giant hand presses down on a shiny red sports car, which squishes flat like soft dough and then pops back into shape. Bright daylight on an empty parking lot, static camera, glossy toy-like style.' },
      { title: 'Melting dessert', prompt: 'A scoop of mint ice cream on a cone melts in fast-forward, dripping green rivers down onto a picnic blanket. Hot midday sun, close-up, slow push-in, saturated summer colours.' },
      { title: 'Claymation character', prompt: 'Claymation style. A small orange fox made of clay waddles across a mossy log, trips, and tumbles into a pile of autumn leaves that burst into the air. Soft warm light, static camera.' },
      { title: 'Product pop', prompt: 'A can of sparkling lemonade bursts out of a block of ice, sending ice shards flying in slow motion. Studio lighting, white background, close-up, camera tilts up as the can rises.' },
      { title: 'Surreal travel', prompt: 'A paper boat sails down a rainy city street like a river, past glowing shop windows, a tiny frog standing at the bow. Night, neon reflections, low tracking shot.' },
    ],
    mistakesTitle: 'Common mistakes that waste credits on Pika',
    mistakes: [
      { title: 'Long, rambling prompts', body: 'Pika does best with short, focused prompts. Cut every word that doesn’t change the shot.' },
      { title: 'Conflicting motion', body: '"Zoom in while panning left and orbiting" breaks the motion. One move.' },
      { title: 'Negatives in the main prompt', body: 'Use the negative-prompt field instead.' },
      { title: 'No clear interaction', body: 'Pika’s best clips show something happening to something. Say what.' },
      { title: 'Vague style', body: 'Name a real style: claymation, glossy 3D, watercolour.' },
    ],
    faqs: [
      { q: 'What is the latest Pika model?', a: 'Pika 2.5, with improved physics and interactions. Pika’s API may list a different version number, but prompts work the same way.' },
      { q: 'How long should a Pika prompt be?', a: 'Short: one or two sentences with the action, the setting, the light and the style.' },
      { q: 'Does Pika have a negative prompt?', a: 'Yes, as a separate field. Keep unwanted things there.' },
      { q: 'What are Pika Ingredients?', a: 'Images of characters, objects or places you upload so Pika keeps them consistent across scenes.' },
      { q: 'Is this Pika prompt generator free?', a: 'Yes. 5 free prompts a day, no signup.' },
    ],
  },

  // ── SORA ───────────────────────────────────────────────────────────────────
  'sora-prompt-generator': {
    kind: 'model',
    model: 'sora',
    h1Name: 'Sora',
    title: 'Free Sora Prompt Generator (Sora 2) | ScriptSea',
    description: 'Free Sora 2 prompt generator. Storyboard-style prompts with camera, lighting, action beats and sound, written the way OpenAI recommends. No signup.',
    intro: [
      'Sora 2 from OpenAI is good at scenes that feel physical: things fall, splash and move the way they should, with synced sound. OpenAI’s own guide says to write each prompt like a storyboard panel. This free tool does exactly that.',
      'You get the scene description, camera, lighting and palette, short action beats and sound on separate lines, ready to paste. No signup.',
    ],
    tipsTitle: 'How to write Sora prompts',
    tips: [
      { title: 'Write it like a storyboard', body: 'A plain scene description, then "Camera:", "Lighting & palette:", "Action:" and "Sound:" on their own lines. That’s OpenAI’s recommended format.' },
      { title: 'Short beats', body: 'Sora follows shorter clips more reliably. Write actions as counts: "takes two steps, pauses, turns".' },
      { title: 'One move, one action per shot', body: 'One camera move and one subject action keep the shot clean.' },
      { title: 'Name a palette', body: 'Three to five colours ("teal, amber, warm grey") keep the look consistent across clips.' },
      { title: 'Short dialogue', body: 'One or two short lines per clip sync well. Long speeches don’t.' },
      { title: 'Show cause and effect', body: 'Sora is strong at physics. "Coffee spills across the desk and soaks the papers" plays to that.' },
    ],
    examplesTitle: 'Sora 2 prompt examples',
    examples: [
      { title: 'Documentary interview', prompt: 'A 70-year-old fisherman with a weathered face and a knitted cap sits on an upturned crate in a harbour shed.\nCamera: medium close-up, eye level, static.\nLighting & palette: grey daylight through an open door; slate, rust, faded navy.\nAction: he looks out at the water, then turns to the viewer.\nSound: gulls outside; he says, "Fifty years. The sea never gets easier."' },
      { title: 'Physics moment', prompt: 'A child’s birthday party in a sunny backyard, a three-tier cake on a picnic table.\nCamera: medium shot, slow push-in.\nLighting & palette: bright afternoon sun; pastel pink, mint, white.\nAction: a golden retriever jumps up, paws hit the table edge, the cake tilts and slides into the grass.\nSound: kids gasp, a soft thud, then laughter.' },
      { title: 'Moody street', prompt: 'A rain-slick cobblestone street in Lisbon at night, a yellow tram passing.\nCamera: low wide shot, static.\nLighting & palette: warm streetlights and wet reflections; amber, deep blue, black.\nAction: a woman with a red umbrella crosses in front of the tram, steps onto the curb, turns back once.\nSound: rain, tram bell, footsteps.' },
      { title: 'Product in use', prompt: 'A tidy home office with a light oak desk and a single plant.\nCamera: close-up, slow orbit left.\nLighting & palette: soft window light; oak, cream, sage.\nAction: a hand places a matte grey wireless charger on the desk, sets a phone on it, the screen lights up.\nSound: a soft click and a gentle chime.' },
      { title: 'Animation style', prompt: 'Hand-painted watercolour animation. A small lighthouse on a rocky island at dusk.\nCamera: wide shot, static.\nLighting & palette: soft dusk glow; peach, lavender, deep teal.\nAction: the lighthouse beam turns on and sweeps across the waves; a flock of birds lifts off the rocks.\nSound: waves, wind, distant bird calls.' },
    ],
    mistakesTitle: 'Common mistakes that waste credits on Sora',
    mistakes: [
      { title: 'One long paragraph', body: 'Sora follows the structured storyboard format better than a wall of text.' },
      { title: 'Too many beats', body: 'Five actions in a short clip won’t all happen. Keep to one to three.' },
      { title: 'Long dialogue', body: 'Long speeches don’t sync. Keep lines short.' },
      { title: 'Vague visuals', body: '"A beautiful street" gives Sora nothing. Name what’s there.' },
      { title: 'Changing several things at once', body: 'When remixing, change one thing at a time and keep what works.' },
    ],
    faqs: [
      { q: 'What is Sora 2?', a: 'Sora 2 is OpenAI’s video model. It creates short clips with synced sound from text prompts. There have been reports that OpenAI is winding down Sora’s API, so check availability in your account. The same prompts also work well in Veo 3.1 or Omni Flash.' },
      { q: 'What prompt format does Sora prefer?', a: 'OpenAI recommends a storyboard style: scene description, then camera, lighting and palette, action beats and sound on separate lines.' },
      { q: 'How long should Sora clips be?', a: 'Shorter clips follow prompts more reliably. 4 to 12 seconds is typical; stitch shorter clips together for longer videos.' },
      { q: 'Can I use these prompts in other models?', a: 'Yes. Pick another model in the menu and the tool rewrites the prompt in that model’s format.' },
      { q: 'Is this Sora prompt generator free?', a: 'Yes. 5 free prompts a day, no signup.' },
    ],
  },

  // ── HAILUO ─────────────────────────────────────────────────────────────────
  'hailuo-prompt-generator': {
    kind: 'model',
    model: 'hailuo',
    h1Name: 'Hailuo',
    title: 'Free Hailuo Prompt Generator (MiniMax H3) | ScriptSea',
    description: 'Free Hailuo prompt generator for MiniMax H3 (Hailuo 3.0). Prompts with bracketed camera commands and clear motion, ready to paste. No signup.',
    intro: [
      'Hailuo from MiniMax has a trick most models don’t: it understands camera commands in square brackets, like [Dolly in] or [Pan right]. The newest model, MiniMax H3 (Hailuo 3.0), adds reference images and sound.',
      'This free tool writes Hailuo prompts with the subject, action and lighting in plain words and the camera move as a bracketed command, kept short and focused the way Hailuo likes. No signup.',
    ],
    tipsTitle: 'How to write Hailuo prompts',
    tips: [
      { title: 'Subject + action + camera + light', body: 'That’s the structure Hailuo follows best. Keep one main subject and one main movement.' },
      { title: 'Camera moves in brackets', body: 'Add the move as a command: [Dolly in], [Pan right], [Tracking shot], [Pedestal up], [Static shot]. Put it at the end of the sentence it applies to.' },
      { title: 'Name the exact move', body: 'Vague prompts default to a simple zoom. "[Tracking shot]" or "[Pedestal up]" gives you control.' },
      { title: 'Keep it under about 200 words', body: 'Hailuo gets confused by long prompts. Short and specific wins.' },
      { title: 'Add sound on H3', body: 'MiniMax H3 can generate audio. A short line with dialogue in quotes or named sounds helps.' },
      { title: 'Use references for faces', body: 'H3 Reference-to-Video keeps characters consistent. Match your text description to the reference.' },
    ],
    examplesTitle: 'Hailuo prompt examples',
    examples: [
      { title: 'Chef at work', prompt: 'A chef in a black apron tosses vegetables in a flaming wok in a busy restaurant kitchen, flames leaping up [Tracking shot]. Warm orange light from the fire, steam in the air. Sound: sizzling oil, clanging pans.' },
      { title: 'Reveal shot', prompt: 'A hiker in a red jacket reaches the top of a rocky ridge and stops, breathing hard, as a sea of clouds opens below her [Pedestal up]. Golden sunrise light, cold blue shadows.' },
      { title: 'Product turn', prompt: 'A silver wireless earbud case opens slowly on a black marble surface, the earbuds glowing softly inside [Dolly in]. Single cool spotlight, reflections on the marble. Sound: a soft magnetic click.' },
      { title: 'Street scene', prompt: 'A cyclist in a yellow raincoat rides through a narrow Amsterdam street lined with canal houses, splashing through a puddle [Pan right]. Overcast morning, wet brick, soft grey light. Sound: bicycle bell, tyres on wet stone.' },
      { title: 'Calm close-up', prompt: 'An old woman with silver hair threads a needle by a window, squinting, then smiles as the thread goes through [Static shot]. Soft afternoon light, lace curtains. Sound: a clock ticking.' },
    ],
    mistakesTitle: 'Common mistakes that waste credits on Hailuo',
    mistakes: [
      { title: 'No camera command', body: 'Without a bracketed move, Hailuo often picks a plain zoom.' },
      { title: 'Several subjects doing several things', body: 'Hailuo handles one main subject and movement best.' },
      { title: 'Very long prompts', body: 'Past about 200 words, details start getting dropped.' },
      { title: 'Brackets in the wrong place', body: 'Put the camera command at the end of the sentence it belongs to.' },
      { title: 'Text on screen', body: 'Like most models, Hailuo struggles with written words. Add text in editing.' },
    ],
    faqs: [
      { q: 'What is the latest Hailuo model?', a: 'MiniMax H3, also called Hailuo 3.0, released in July 2026. It adds reference-to-video and general multimodal generation.' },
      { q: 'How do Hailuo camera commands work?', a: 'Write the move in square brackets, like [Dolly in] or [Pan right], at the end of the sentence it applies to.' },
      { q: 'Do these prompts work on Hailuo 2.3?', a: 'Yes. The bracket commands and structure work on older Hailuo models too.' },
      { q: 'Does Hailuo make sound?', a: 'MiniMax H3 can generate audio, so prompts include a short sound line when useful.' },
      { q: 'Is this Hailuo prompt generator free?', a: 'Yes. 5 free prompts a day, no signup.' },
    ],
  },

  // ── WAN ────────────────────────────────────────────────────────────────────
  'wan-prompt-generator': {
    kind: 'model',
    model: 'wan',
    h1Name: 'Wan',
    title: 'Free Wan Prompt Generator (Wan 3.0) | ScriptSea',
    description: 'Free Wan 3.0 prompt generator. Prompts for Alibaba’s Wan with multi-shot scenes, motion, camera and native audio, ready to paste. No signup.',
    intro: [
      'Wan 3.0 from Alibaba makes clips up to 30 seconds with native audio, and it’s good at keeping characters and products consistent across shots. That makes it great for longer scenes, if the prompt lays the shots out clearly.',
      'This free tool writes Wan prompts with the subject, scene, motion, camera, lighting, style and sound in order, and multi-shot scenes described step by step. No signup.',
    ],
    tipsTitle: 'How to write Wan prompts',
    tips: [
      { title: 'Follow a clear order', body: 'Subject, scene, motion, camera, lighting, style, then sound. Wan reads structured prompts best.' },
      { title: 'Lay out multi-shot scenes', body: 'For longer clips, describe each shot in order and what changes between them. Wan keeps the character consistent across them.' },
      { title: 'Direct the audio', body: 'Wan 3.0 has native audio. Quote the dialogue and name the sound effects and music.' },
      { title: 'Avoid on-screen text', body: 'Alibaba says text inside Wan videos still needs work. Add titles and captions in editing.' },
      { title: 'One camera move per shot', body: 'Clean moves keep the motion stable, especially in long clips.' },
      { title: 'Let smart duration help', body: 'Wan can choose the length from the prompt. Describe the action fully and it times the scene.' },
    ],
    examplesTitle: 'Wan prompt examples',
    examples: [
      { title: 'Multi-shot story', prompt: 'A young woman with short black hair in a beige trench coat. Shot 1: she steps off a train onto a foggy platform at dawn, wide shot, static. Shot 2: close-up as she reads a paper ticket, frowning. Shot 3: medium tracking shot as she walks toward the station exit and a figure waves from the far end. Cold blue light warming to gold. Sound: train hissing, footsteps on concrete, distant announcement.' },
      { title: 'Product consistency', prompt: 'A matte green water bottle with a bamboo lid. Shot 1: it sits on a gym bench, condensation beading, close-up, static. Shot 2: a hand grabs it and the athlete drinks, medium shot. Shot 3: the bottle is placed back on the bench as she walks off, close-up, slow push-in. Bright gym lighting. Sound: gym ambience, a lid clicking open.' },
      { title: 'Nature', prompt: 'A red fox trots through fresh snow in a silent pine forest, stops, tilts its head, then pounces into a snowdrift. Wide shot, slow tracking alongside. Pale winter light, blue shadows. Sound: soft crunching snow, a muffled thump.' },
      { title: 'Dialogue', prompt: 'An old shopkeeper with round glasses stands behind the counter of a tiny bookshop and hands a wrapped book to a young boy, saying, "Read the last page first. Trust me." Medium shot, static. Warm lamp light, shelves of old books. Sound: a bell over the door, rain outside.' },
      { title: 'City time flow', prompt: 'A busy Shanghai intersection from a high angle as day turns to night: traffic streams, lights flicker on, crowds thicken. Wide shot, static. Golden hour shifting to neon blue and pink. Sound: city hum rising, horns, distant music.' },
    ],
    mistakesTitle: 'Common mistakes that waste credits on Wan',
    mistakes: [
      { title: 'Unclear shot order', body: 'In multi-shot prompts, say what happens in each shot, in order.' },
      { title: 'Relying on on-screen text', body: 'Wan still struggles with written words. Add text in editing.' },
      { title: 'No sound directions', body: 'With native audio, a silent prompt gets random sound.' },
      { title: 'Changing the character mid-prompt', body: 'Describe them once, clearly, and refer back to the same details.' },
      { title: 'Several moves per shot', body: 'Long clips with busy camera work drift. One move per shot.' },
    ],
    faqs: [
      { q: 'What is the latest Wan model?', a: 'Wan 3.0, released by Alibaba in August 2026. It makes clips up to 30 seconds with native audio and better character and product consistency.' },
      { q: 'Does Wan 3.0 generate sound?', a: 'Yes. Prompts include dialogue in quotes and named sound effects.' },
      { q: 'Can Wan put text in the video?', a: 'It can try, but Alibaba says on-screen text still needs improvement. Add text in editing for reliable results.' },
      { q: 'Do these prompts work on Wan 2.6 or 2.7?', a: 'Yes, though older versions make shorter clips, so keep multi-shot scenes shorter.' },
      { q: 'Is this Wan prompt generator free?', a: 'Yes. 5 free prompts a day, no signup.' },
    ],
  },

  // ── LUMA ───────────────────────────────────────────────────────────────────
  'luma-prompt-generator': {
    kind: 'model',
    model: 'luma',
    h1Name: 'Luma',
    title: 'Free Luma Prompt Generator (Ray3) | ScriptSea',
    description: 'Free Luma Ray3 prompt generator. Cinematic prompts with real lighting and camera language for Luma Dream Machine, ready to paste. No signup.',
    intro: [
      'Luma’s Ray3 models (the newest is Ray3.2) are known for cinematic light and camera work, with HDR and keyframe control. Luma’s own guide also warns that some popular prompt words can actually hurt your results.',
      'This free tool writes Luma prompts in plain, concrete language with real lighting and camera direction, and leaves out the filler words. No signup.',
    ],
    tipsTitle: 'How to write Luma Ray3 prompts',
    tips: [
      { title: 'Describe the light', body: 'Direction, quality and colour: "low golden sun from behind, soft rim light on her hair". Light is where Ray3 shines.' },
      { title: 'Use camera language', body: 'Framing and one move: "slow dolly in from a medium to a close-up". Ray3 handles cinematic camera work well.' },
      { title: 'Skip the filler words', body: 'Luma’s guide says words like "vibrant", "whimsical" and "hyper-realistic" may hurt quality. Describe what you see instead.' },
      { title: 'One action per clip', body: 'One clear action and one move keep Ray3 clips coherent.' },
      { title: 'Keyframes for transitions', body: 'Ray3.2 supports start and end keyframes. Describe the start and end only when you want a transition between two looks.' },
      { title: 'Natural sentences', body: 'Luma reads full sentences better than comma-separated tag lists.' },
    ],
    examplesTitle: 'Luma Ray3 prompt examples',
    examples: [
      { title: 'Backlit portrait', prompt: 'A young man with curly hair stands in a wheat field at sunset and turns toward the viewer. The low sun sits behind him, putting a warm rim of light on his hair and shoulders while his face stays in soft shadow. Slow dolly in from a medium shot to a close-up.' },
      { title: 'Neon night', prompt: 'A woman in a silver jacket leans against a wet brick wall in a narrow alley at night, lit by a buzzing pink neon sign on her left and cool blue light spilling from a doorway on her right. She looks up as a train passes overhead. Static medium shot.' },
      { title: 'Interior mood', prompt: 'Morning light falls through tall factory windows onto an empty ceramics studio, dust floating in the beams. A potter in a clay-stained apron walks into frame and sits at the wheel. Wide shot, slow push-in.' },
      { title: 'Macro', prompt: 'Macro shot of a single raindrop sliding down a green leaf, gathering smaller drops as it goes, then falling. Soft overcast light, the background a deep green blur. Static camera.' },
      { title: 'Keyframe transition', prompt: 'Start: a bare winter oak tree on a hill under grey skies. End: the same oak in full summer leaf under a warm evening sun. The camera stays fixed as the seasons change smoothly from start to end.' },
    ],
    mistakesTitle: 'Common mistakes that waste credits on Luma',
    mistakes: [
      { title: 'Filler adjectives', body: '"Vibrant, whimsical, hyper-realistic" can make results worse, per Luma’s own guide.' },
      { title: 'Ignoring the light', body: 'Flat, unspecified light wastes Ray3’s biggest strength.' },
      { title: 'Tag-list prompts', body: 'Comma-separated keywords read worse than natural sentences.' },
      { title: 'Several actions in one clip', body: 'Keep one clear action per clip.' },
      { title: 'Expecting dialogue', body: 'Luma focuses on visuals. Add voice and sound in editing.' },
    ],
    faqs: [
      { q: 'What is the latest Luma model?', a: 'Ray3.2, which adds more keyframe control and longer video-to-video. Ray3.14 was the earlier fast default.' },
      { q: 'What words should I avoid in Luma prompts?', a: 'Luma’s guide flags filler words like "vibrant", "whimsical" and "hyper-realistic". Describe concrete visuals instead.' },
      { q: 'Does Luma generate sound?', a: 'Luma Ray3 focuses on video. Add voice and sound in editing.' },
      { q: 'What are Luma keyframes?', a: 'Start and end frames that the clip moves between. Describe both when you want a transition.' },
      { q: 'Is this Luma prompt generator free?', a: 'Yes. 5 free prompts a day, no signup.' },
    ],
  },

  // ── GROK IMAGINE ───────────────────────────────────────────────────────────
  'grok-imagine-prompt-generator': {
    kind: 'model',
    model: 'grok',
    h1Name: 'Grok Imagine',
    title: 'Free Grok Imagine Prompt Generator | ScriptSea',
    description: 'Free Grok Imagine prompt generator. Video prompts for xAI’s Grok with subject and action first, one camera move and concrete sound. No signup.',
    intro: [
      'Grok Imagine from xAI makes short video clips with synced sound, and it follows prompts best when the first sentence says who is doing what. After that: camera, atmosphere and light, then the sounds.',
      'This free tool writes Grok Imagine prompts in that order, with one camera move and concrete sound cues instead of vague moods. No signup.',
    ],
    tipsTitle: 'How to write Grok Imagine prompts',
    tips: [
      { title: 'Subject and action first', body: 'Put who is doing what in the first sentence. Then camera, then atmosphere and lighting, then audio.' },
      { title: 'One camera move', body: 'Grok understands cinematography terms, but stacked moves give poor results. Pick one.' },
      { title: 'Name real sounds', body: '"Footsteps on gravel" and "cloth rustling" beat "cinematic sound". Concrete cues give precise audio.' },
      { title: 'Be specific about light and mood', body: 'The more specific you are about lighting, style, subject and mood, the better the clip.' },
      { title: 'Quote the dialogue', body: 'Put the exact words in quotes with who says them.' },
      { title: 'Extend for longer clips', body: 'Clips run about 6 to 10 seconds. Use Extend from Frame to push longer.' },
    ],
    examplesTitle: 'Grok Imagine prompt examples',
    examples: [
      { title: 'Dramatic arrival', prompt: 'A horse rider in a long dark coat gallops across a desert plain toward the viewer at dusk. Low tracking shot. Dust clouds glowing orange in the setting sun, deep purple sky. Sound: thundering hooves, wind, the coat snapping in the air.' },
      { title: 'Cosy café', prompt: 'A barista with a green apron pours latte art into a white cup, forming a perfect heart. Close-up, static. Warm morning café light, wooden counter. Sound: milk steaming, a spoon clinking, soft chatter.' },
      { title: 'Sci-fi corridor', prompt: 'An astronaut in a scuffed white suit floats slowly down a dim space station corridor, pulling herself along a handrail. Medium shot, slow push-in. Red emergency lights pulsing. Sound: her breathing in the helmet, a low mechanical hum, a distant alarm.' },
      { title: 'Comedy pet', prompt: 'A fluffy white cat sitting on a kitchen counter slowly pushes a glass of water toward the edge while staring at the viewer. Close-up, static. Bright kitchen light. Sound: the glass sliding on stone, then a crash. The cat doesn’t blink.' },
      { title: 'Talking moment', prompt: 'A street vendor in a red cap hands a paper cone of roasted chestnuts to a customer and says, "Hot, careful, best in the city." Medium shot, static. Snowy evening market, string lights. Sound: chestnuts crackling, light crowd chatter.' },
    ],
    mistakesTitle: 'Common mistakes that waste credits on Grok Imagine',
    mistakes: [
      { title: 'Burying the subject', body: 'Starting with mood or camera instead of who does what gives weaker results.' },
      { title: 'Stacked camera moves', body: 'One move per clip.' },
      { title: 'Vague audio', body: '"Epic music" is weak. Name concrete sounds.' },
      { title: 'Too much for a short clip', body: 'A 6 to 10 second clip holds one or two beats.' },
      { title: 'Flat lighting', body: 'Say where the light comes from and its colour.' },
    ],
    faqs: [
      { q: 'What is Grok Imagine?', a: 'It’s xAI’s image and video generator inside Grok. It makes short clips with synced audio from text or images.' },
      { q: 'What version of Grok Imagine is current?', a: 'Grok Imagine 1.0 is widely available, and xAI has been testing a 1.5 preview. These prompts work on both.' },
      { q: 'How long are Grok Imagine videos?', a: 'About 6 to 10 seconds per clip, and you can extend them.' },
      { q: 'Does Grok Imagine generate sound?', a: 'Yes. Name concrete sounds and quote any dialogue.' },
      { q: 'Is this Grok Imagine prompt generator free?', a: 'Yes. 5 free prompts a day, no signup.' },
    ],
  },

  // ── HAPPYHORSE ─────────────────────────────────────────────────────────────
  'happyhorse-prompt-generator': {
    kind: 'model',
    model: 'happyhorse',
    h1Name: 'HappyHorse',
    title: 'Free HappyHorse 1.0 Prompt Generator | ScriptSea',
    description: 'Free HappyHorse 1.0 prompt generator. Character-driven video prompts with exact dialogue, language and sound for Alibaba’s top model. No signup.',
    intro: [
      'HappyHorse 1.0 from Alibaba has ranked at or near the top of blind-vote video arenas this year. It’s especially good at a single character talking, with lip-sync in many languages, if the prompt gives it the character, the exact words and the sound.',
      'This free tool writes HappyHorse prompts in the order that works best: character, dialogue, setting, ambient sound, then style. No signup.',
    ],
    tipsTitle: 'How to write HappyHorse prompts',
    tips: [
      { title: 'Character first', body: 'Start with who: age, look, clothes, one distinguishing detail. HappyHorse is strongest with one main character.' },
      { title: 'Exact dialogue in quotes', body: 'Write the precise words. HappyHorse is built for dialogue-driven scenes.' },
      { title: 'Name the language', body: '"She says in Spanish, “...”" improves lip-sync, especially for non-English lines.' },
      { title: 'Describe ambient sound and Foley', body: 'Those details drive the audio: "kettle whistling, rain on the window".' },
      { title: 'Keep scenes short', body: 'Short, focused, dialogue-led scenes give the best quality.' },
      { title: 'Clean reference for image-to-video', body: 'Use a clear, single-character photo and put the dialogue in the text prompt.' },
    ],
    examplesTitle: 'HappyHorse prompt examples',
    examples: [
      { title: 'Spanish testimonial', prompt: 'A 45-year-old Mexican woman with grey-streaked hair in a neat bun and a burgundy cardigan sits at her kitchen table. She looks at the viewer and says in Spanish, "Llevo veinte años cocinando. Esta sartén es la mejor que he tenido." Warm morning kitchen. Ambient sound: a pot simmering, birds outside. Natural, warm style.' },
      { title: 'Founder story', prompt: 'A 32-year-old Nigerian man with a short fade and round glasses stands in a small workshop holding a wooden phone stand. He says in English, "I built the first one for my mum. Now ten thousand people use it." Soft daylight, sawdust in the air. Ambient sound: a distant drill, quiet room tone.' },
      { title: 'Comedy line', prompt: 'A teenage girl with braces and a messy ponytail leans into frame in her bedroom and whispers to the viewer, "My brother thinks I didn’t eat his cake. I definitely ate his cake." Bright afternoon light. Foley: a fork clinking on a plate behind her back.' },
      { title: 'French café', prompt: 'An elderly French waiter with a white moustache and a black waistcoat places an espresso on a marble table and says in French, "Votre café, mademoiselle. Comme toujours." Paris café terrace, late morning. Ambient sound: street chatter, a scooter passing, cups clinking.' },
      { title: 'Calm explainer', prompt: 'A 28-year-old Korean woman with a long black bob and a cream turtleneck sits on a sofa and says in Korean, "오늘은 아침 루틴 세 가지만 알려드릴게요." Soft window light, plants behind her. Ambient sound: quiet room tone, no music.' },
    ],
    mistakesTitle: 'Common mistakes that waste credits on HappyHorse',
    mistakes: [
      { title: 'Several characters talking', body: 'HappyHorse is strongest with one main character. Keep group scenes simple.' },
      { title: 'Not naming the language', body: 'Lip-sync is better when the spoken language is stated.' },
      { title: 'Paraphrased dialogue', body: 'Write the exact words in quotes, or the model improvises.' },
      { title: 'No ambient sound', body: 'Without sound cues, the audio feels empty or random.' },
      { title: 'Long scenes', body: 'Short, focused scenes look best.' },
    ],
    faqs: [
      { q: 'What is HappyHorse 1.0?', a: 'An AI video model from Alibaba’s ATH team, released in 2026. It has ranked at or near the top of blind human-vote video leaderboards, and is especially strong at single-character dialogue.' },
      { q: 'Where can I use HappyHorse?', a: 'It’s available through platforms like fal, OpenRouter, Hedra and Artlist. Availability varies by platform.' },
      { q: 'Does HappyHorse support other languages?', a: 'Yes. Name the language in the prompt for better lip-sync.' },
      { q: 'How long are HappyHorse clips?', a: 'Typically 3 to 15 seconds.' },
      { q: 'Is this HappyHorse prompt generator free?', a: 'Yes. 5 free prompts a day, no signup.' },
    ],
  },
};

export const FREE_TOOL_SLUGS = Object.keys(PAGES);

/** Pages listed in the "other models" section, in a sensible order. */
export const MODEL_PAGE_ORDER = [
  'omni-flash-prompt-generator', 'seedance-prompt-generator', 'veo-prompt-generator', 'kling-prompt-generator',
  'google-flow-prompt-generator', 'happyhorse-prompt-generator', 'runway-prompt-generator', 'higgsfield-prompt-generator',
  'wan-prompt-generator', 'hailuo-prompt-generator', 'sora-prompt-generator', 'luma-prompt-generator',
  'pika-prompt-generator', 'grok-imagine-prompt-generator',
];
export const SPECIAL_PAGE_ORDER = ['ai-video-prompt-generator', 'video-prompt-enhancer', 'script-to-video-prompts'];

export function pageH1(page) {
  return page.h1 || `Free ${page.h1Name} Prompt Generator`;
}

/** Everything one page needs, serialisable for getStaticProps. */
export function getFreeToolPageProps(slug) {
  const page = PAGES[slug];
  if (!page) throw new Error(`Unknown free tool page: ${slug}`);
  const links = [...SPECIAL_PAGE_ORDER, ...MODEL_PAGE_ORDER]
    .filter((s) => s !== slug)
    .map((s) => ({ slug: s, label: PAGES[s].navLabel || `${PAGES[s].h1Name} Prompt Generator`, kind: PAGES[s].kind }));
  return {
    slug,
    page: { ...page, h1: pageH1(page) },
    modelLabel: MODELS[page.model]?.version || '',
    picker: MODEL_PICKER,
    styleOptions: STYLE_OPTIONS,
    soundOptions: SOUND_OPTIONS,
    maxInput: MAX_INPUT_CHARS,
    dailyLimit: DAILY_LIMIT,
    links,
    brandLine: BRAND.line,
  };
}
