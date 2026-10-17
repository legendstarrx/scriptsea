// Content for the keyword landing pages rendered by pages/[tool].js.
// Each page targets one search intent and must stay genuinely different —
// near-duplicate pages get ignored by Google. Keep the language plain.

const SCRIPT_EXAMPLE = {
  inputLabel: 'What you type',
  input: 'Vitamin C serum for dark spots. 30 second TikTok. Casual tone.',
  outputLabel: 'What you get',
  output: `I stopped paying $80 for serum after I read the label

Your expensive serum is mostly water.
I checked mine. Vitamin C was the fifth ingredient.
So I switched to one with 15% vitamin C and nothing else fancy.
Two weeks in, the dark spot on my cheek is lighter.
My skin looks awake, even with no makeup.
And it costs less than my lunch.
Check the label on yours tonight. You might be shocked.`,
};

const PROMPT_EXAMPLE = {
  inputLabel: 'Script line',
  input: '"Your expensive serum is mostly water."',
  outputLabel: 'Scene prompt you paste into your video model',
  output: `Scene 1 (0-2s): Extreme close-up of a frosted glass serum bottle on a white bathroom counter, a single drop of clear liquid falling from the dropper in slow motion and splashing into a shallow pool of water, soft morning window light from the left, tiny bubbles catching the light, static camera, clean and clinical mood. Photorealistic, ultra HD, shallow depth of field, no watermark, no text, no subtitles, no distortion.

Scene 2 (2-4s): A 28-year-old Black woman with short natural curls, gold hoop earrings and an oversized cream knit sweater squints at the back label of a small serum bottle, holding it close to her face in a bright bathroom, her eyebrows slowly rising in disbelief, handheld camera at chest height, natural daylight. Photorealistic, ultra HD, shallow depth of field, no watermark, no text, no subtitles, no distortion.`,
};

export const TOOL_PAGES = {
  'ai-script-generator': {
    navLabel: 'AI Script Generator',
    title: 'AI Script Generator & AI Script Writer (Free) | ScriptSea',
    description:
      'Free AI script generator for TikTok, Reels, Shorts and YouTube. Type your idea and get a hook-first script timed to your video length in seconds. 3 free scripts.',
    badge: 'AI Script Writer',
    h1: { before: 'The AI Script Generator That Writes ', highlight: 'Scripts People Finish', after: '' },
    intro:
      'Type your idea. Get a script with a hook that stops the scroll and lines that keep people watching. Timed to your video length, written the way people actually talk. No blank page. No guessing.',
    steps: [
      { title: 'Tell it your idea', desc: 'A product, a story, a tip, a rant. One line is enough. Or paste a YouTube or TikTok link and it matches that style.' },
      { title: 'Pick length and platform', desc: '15 seconds to 60 minutes. TikTok, Reels, Shorts, YouTube or Facebook. Choose a tone that sounds like you.' },
      { title: 'Get your script', desc: 'Hook first, no filler, the right word count for your time. Export to PDF or Word, or turn it into video prompts in one click.' },
    ],
    features: [
      'Hooks written to stop the scroll in the first line',
      'Exact word counts, so a 30 second script is actually 30 seconds',
      'Paste a reference video link and match its style',
      'Short-form and long-form: 15 sec up to 60 min',
      'Sounds human. Short sentences, plain words, no robot voice',
      'One click to turn the script into AI video prompts',
    ],
    example: SCRIPT_EXAMPLE,
    tipsTitle: 'What makes a video script work',
    tips: [
      { title: 'The first line is everything', desc: 'Most viewers decide in under two seconds. Open with the most surprising or useful thing you have. Never open with "Hey guys".' },
      { title: 'One idea per video', desc: 'Scripts that try to say three things get remembered for none. Pick one point and make it land.' },
      { title: 'Write for the ear', desc: 'Read it out loud. If you run out of breath, the sentence is too long. If it sounds like an essay, rewrite it.' },
      { title: 'Match words to time', desc: 'People speak about 150 words a minute. A 30 second video is roughly 70 words. ScriptSea counts for you.' },
    ],
    faqs: [
      { q: 'Is this AI script generator free?', a: 'Yes. You get 3 free scripts when you sign up, no card needed. After that, Pro is $4.99 a week for 15 scripts or $19.99 a month for 60.' },
      { q: 'What kind of scripts can it write?', a: 'Short videos for TikTok, Instagram Reels, YouTube Shorts and Facebook, plus long YouTube videos up to 60 minutes. Product videos, storytelling, tutorials, faceless channels, personal brand content.' },
      { q: 'How is this better than ChatGPT for scripts?', a: 'ChatGPT writes like an essay unless you fight it. ScriptSea is built only for video. It writes hook-first, hits the right word count for your length, and sounds like a person talking. You do not need to write a prompt.' },
      { q: 'Can it copy the style of a video I like?', a: 'Yes. Paste a YouTube or TikTok link and ScriptSea uses it as a style reference for your script.' },
      { q: 'Can I turn the script into an AI video?', a: 'Yes. One click turns your script into scene-by-scene prompts you can paste straight into Seedance, Kling, Veo, Sora and other AI video models.' },
    ],
    related: ['ai-video-prompt-generator', 'youtube-script-generator', 'tiktok-script-generator', 'ugc-ad-script-generator'],
  },

  'ai-video-prompt-generator': {
    navLabel: 'AI Video Prompt Generator',
    title: 'AI Video Prompt Generator: Seedance, Kling, Veo & Sora | ScriptSea',
    description:
      'Turn any idea or script into scene-by-scene AI video prompts. Same character in every clip. Paste into Seedance, Kling, Veo, Sora, Wan or Hailuo and generate.',
    badge: 'AI Prompt Writer for Video',
    h1: { before: 'Stop Writing Prompts. Get ', highlight: 'Ready-to-Paste Video Prompts', after: ' in Seconds.' },
    intro:
      'Paste your script or describe your video. ScriptSea breaks it into scenes and writes a detailed prompt for each one, with the same character, the right camera, the right light. Paste into Seedance, Kling, Veo or Sora. Done.',
    steps: [
      { title: 'Paste a script or an idea', desc: 'Use a script from ScriptSea, your own script, or just describe the product or story.' },
      { title: 'Pick a style', desc: 'UGC with a person on camera, B-Roll with no people, or animation: 3D Pixar, Realistic 3D, 2D, motion graphics or stick figure.' },
      { title: 'Copy, paste, generate', desc: 'Every scene comes as its own prompt. Copy one or copy all, then paste into your video model or open it on Higgsfield.' },
    ],
    features: [
      'Scene-by-scene prompts that follow your script, line by line',
      'Same character described in full in every scene, so they do not change face',
      'Fast cuts in the hook, where retention is won or lost',
      'UGC, B-Roll and 5 animation styles',
      'Choose your character’s gender and look',
      'Optional voiceover split into hook, body and close',
    ],
    example: PROMPT_EXAMPLE,
    tipsTitle: 'Why most AI video prompts fail',
    tips: [
      { title: 'Video models have no memory', desc: 'Writing "the same woman" in scene 4 means nothing to the model. You have to describe her again in full. ScriptSea does this every time.' },
      { title: 'Vague in, vague out', desc: '"A person using a phone" gets you stock footage. "Gripping a matte black phone, ring light in the glass" gets you a shot.' },
      { title: 'Not every shot needs a zoom', desc: 'Stacking camera moves makes clips look fake. Use static shots most of the time and move only when the moment needs it.' },
      { title: 'Put the best moment first', desc: 'You will trim each clip to 2-5 seconds. Prompts should make the key action happen early, not after a slow build.' },
    ],
    faqs: [
      { q: 'Which AI video models do the prompts work with?', a: 'Seedance 2.0, Kling 3.0, Veo 3.1, Sora 2, Wan, Hailuo, and tools built on them like Higgsfield. The prompts are plain, detailed visual descriptions, so they work in any text-to-video model.' },
      { q: 'How do you keep the same character across scenes?', a: 'Every scene that shows the character includes their full description: age, look, hair, clothes, accessories. Video models treat each prompt separately, so this is the only reliable way.' },
      { q: 'Do I need to know prompt engineering?', a: 'No. That is the whole point. You give it the script or idea, and it handles the camera, lighting, pacing and character details.' },
      { q: 'Can I make animated videos?', a: 'Yes. Choose Animation and pick 3D Pixar, Realistic 3D, 2D Flat, Motion Graphics or Stick Figure.' },
      { q: 'Is it free to try?', a: 'Yes. Your first 3 generations are free. Scripts and video prompts share the same allowance.' },
    ],
    related: ['seedance-prompt-generator', 'kling-prompt-generator', 'veo-prompt-generator', 'sora-prompt-generator'],
  },

  'seedance-prompt-generator': {
    navLabel: 'Seedance Prompt Generator',
    title: 'Seedance 2.0 Prompt Generator: Free Scene Prompts | ScriptSea',
    description:
      'Write Seedance 2.0 prompts in seconds. Turn your idea or script into detailed scene prompts with consistent characters, ready to paste into Seedance or Higgsfield.',
    badge: 'Seedance 2.0 Prompts',
    h1: { before: 'Seedance Prompts That ', highlight: 'Look Like Real Footage', after: '' },
    intro:
      'Seedance 2.0 from ByteDance can make clips that look shot on a real camera. But only if the prompt tells it exactly what to show. ScriptSea writes those prompts for you, scene by scene, straight from your script.',
    steps: [
      { title: 'Drop in your script or idea', desc: 'Write a script with ScriptSea first, or paste your own.' },
      { title: 'Choose the look', desc: 'UGC, B-Roll or animation. Pick the character’s gender and look if you want one on screen.' },
      { title: 'Paste into Seedance', desc: 'Each scene is its own prompt. Paste into Seedance, or hit "Generate on Higgsfield" to open it there.' },
    ],
    features: [
      'One clear subject and action per scene, the way Seedance likes it',
      'Full character description in every scene for consistency',
      'Camera and light written in plain film language',
      'Rapid cuts in the hook, calmer pacing in the body',
      'One click to open any scene on Higgsfield',
      'Works for ads, faceless channels, stories and UGC',
    ],
    example: PROMPT_EXAMPLE,
    tipsTitle: 'How to write a good Seedance prompt',
    tips: [
      { title: 'One shot per prompt', desc: 'Describe a single shot: who, doing what, where. Build longer videos from several prompts instead of cramming a story into one.' },
      { title: 'Use reference images for faces', desc: 'Seedance 2.0 accepts reference images. Pair one with a full written description to keep your character locked across clips.' },
      { title: 'Name the camera once', desc: 'Static, handheld, slow pan, overhead. Pick one. Two or three moves in one prompt usually turns into a mess.' },
      { title: 'Say the light and time of day', desc: '"Soft morning window light" or "neon street at night" changes the whole mood and makes clips look filmed, not generated.' },
    ],
    faqs: [
      { q: 'What is Seedance?', a: 'Seedance is ByteDance’s AI video model. Seedance 2.0 turns text and reference images into short, realistic video clips, and is available on platforms like Higgsfield.' },
      { q: 'Are these prompts made only for Seedance?', a: 'They are written to work well in Seedance, and they also work in Kling, Veo, Sora and other models. You can use the same scenes anywhere.' },
      { q: 'How long should a Seedance prompt be?', a: 'Long enough to describe one shot completely: subject, action, setting, camera and light. Usually one solid paragraph. ScriptSea writes them at that length.' },
      { q: 'Can I keep the same person in every Seedance clip?', a: 'Yes. ScriptSea writes the full character description in every scene. For the tightest match, also use the same reference image in Seedance.' },
    ],
    related: ['ai-video-prompt-generator', 'kling-prompt-generator', 'veo-prompt-generator', 'ugc-ad-script-generator'],
  },

  'kling-prompt-generator': {
    navLabel: 'Kling Prompt Generator',
    title: 'Kling AI Prompt Generator: Kling 3.0 Video Prompts | ScriptSea',
    description:
      'Generate Kling 3.0 video prompts from any idea or script. Detailed scene prompts with natural human motion, consistent characters and clean camera direction.',
    badge: 'Kling 3.0 Prompts',
    h1: { before: 'Kling Prompts With ', highlight: 'Real Human Motion', after: ', Written for You' },
    intro:
      'Kling is one of the best models for people on screen: hands, faces, walking, talking. Your prompt decides whether that motion looks natural or weird. ScriptSea writes the body language, the camera and the setting for every scene.',
    steps: [
      { title: 'Start with a script', desc: 'Generate one with ScriptSea or paste your own. Or just describe the video.' },
      { title: 'Pick UGC, B-Roll or animation', desc: 'UGC puts a person on camera. B-Roll keeps people out. Animation gives you five styles.' },
      { title: 'Paste into Kling', desc: 'Copy each scene into Kling text-to-video, or use the prompt alongside a reference image for image-to-video.' },
    ],
    features: [
      'Specific body movement, not "a person moves"',
      'Micro-expressions and hand detail written out',
      'Same character fully described in every scene',
      'Camera kept simple so motion stays clean',
      'Key action placed early so clips trim well',
      'Negative prompt included',
    ],
    example: PROMPT_EXAMPLE,
    tipsTitle: 'How to get better results from Kling',
    tips: [
      { title: 'Describe the movement precisely', desc: '"Slowly turns her head toward the window and exhales" beats "she looks around". Kling follows motion detail well.' },
      { title: 'Use image-to-video for faces', desc: 'Generate or pick a still of your character, then animate it with the scene prompt. Faces stay far more stable.' },
      { title: 'Keep backgrounds calm', desc: 'Busy crowds and fast camera moves fight with your subject. Let the person be the motion.' },
      { title: 'Use the negative prompt', desc: 'Block the usual problems: extra fingers, warped faces, text on screen. ScriptSea gives you one with every set.' },
    ],
    faqs: [
      { q: 'Is Kling still one of the top AI video models?', a: 'Yes. Kling 3.0 from Kuaishou is consistently near the top of blind-vote leaderboards, especially for realistic people and motion.' },
      { q: 'Do these prompts work for Kling image-to-video?', a: 'Yes. Use the scene prompt as the motion description and your character image as the start frame.' },
      { q: 'Can I use the same prompts in other models?', a: 'Yes. They are plain visual descriptions, so they also work in Seedance, Veo, Sora, Wan and Hailuo.' },
      { q: 'How many scenes do I get?', a: 'It depends on your script and clip length. The hook gets more, shorter scenes. The body gets fewer, longer ones.' },
    ],
    related: ['ai-video-prompt-generator', 'seedance-prompt-generator', 'sora-prompt-generator', 'ugc-ad-script-generator'],
  },

  'veo-prompt-generator': {
    navLabel: 'Veo Prompt Generator',
    title: 'Veo 3 Prompt Generator: Google Veo 3.1 Video Prompts | ScriptSea',
    description:
      'Create Google Veo 3.1 prompts from any script. Scene-by-scene visuals plus optional voiceover lines, ready for Gemini, Flow or any Veo-powered tool.',
    badge: 'Veo 3.1 Prompts',
    h1: { before: 'Veo Prompts That ', highlight: 'Look and Sound Right', after: '' },
    intro:
      'Google Veo 3.1 makes video with sound: dialogue, ambience, music. That means your prompt has to cover what we see and what we hear. ScriptSea writes the scenes from your script and can add the voiceover lines too.',
    steps: [
      { title: 'Paste your script', desc: 'Or describe the video. ScriptSea maps each part of the script to a scene.' },
      { title: 'Turn on voiceover if you want it', desc: 'Get spoken lines split into hook, body and close to match the scenes.' },
      { title: 'Paste into Veo', desc: 'Use the prompts in Gemini, Google Flow or any tool running Veo.' },
    ],
    features: [
      'Scenes that follow your script line by line',
      'Optional voiceover written to match each scene',
      'Clear setting and light for cinematic shots',
      'Consistent character across every clip',
      'Prompts that put the strongest moment first',
      'Works with Veo 3.1 and Veo 3.1 Fast',
    ],
    example: PROMPT_EXAMPLE,
    tipsTitle: 'How to write a good Veo prompt',
    tips: [
      { title: 'Write the sound, too', desc: 'Veo can generate audio. Mention the ambient sound or music you want, like "quiet café chatter" or "soft piano".' },
      { title: 'Put dialogue in quotes', desc: 'If a character speaks, write the exact line in quotes and keep it short. One or two sentences per clip.' },
      { title: 'Be cinematic on purpose', desc: 'Veo is strong at film-style shots. Name the lens feel, the light, the time of day.' },
      { title: 'Or ask for silence', desc: 'If you will add your own voiceover later, say "no dialogue, no music" so you get clean footage.' },
    ],
    faqs: [
      { q: 'Where can I use Veo?', a: 'Google offers Veo 3.1 in the Gemini app, Google Flow and through its API. Many third-party video tools run it too.' },
      { q: 'Does ScriptSea write the audio part of the prompt?', a: 'It writes the visuals for every scene and, if you switch on voiceover, the spoken lines. You can add those lines to your Veo prompt in quotes.' },
      { q: 'Do the prompts work in other models?', a: 'Yes. The same scenes work in Seedance, Kling, Sora, Wan and Hailuo.' },
      { q: 'Is it free?', a: 'Your first 3 generations are free. After that, Pro starts at $4.99 a week.' },
    ],
    related: ['ai-video-prompt-generator', 'sora-prompt-generator', 'seedance-prompt-generator', 'youtube-script-generator'],
  },

  'sora-prompt-generator': {
    navLabel: 'Sora Prompt Generator',
    title: 'Sora 2 Prompt Generator: Turn Scripts Into Sora Prompts | ScriptSea',
    description:
      'Turn any idea or script into OpenAI Sora 2 prompts. Detailed scenes with consistent characters and clear camera direction, ready to paste and generate.',
    badge: 'Sora 2 Prompts',
    h1: { before: 'Sora Prompts That ', highlight: 'Tell a Real Story', after: '' },
    intro:
      'Sora 2 from OpenAI is good at scenes that feel physical: things fall, splash and move the way they should. ScriptSea turns your script into a run of scenes that tell the story shot by shot, so your clips cut together into one video.',
    steps: [
      { title: 'Write or paste a script', desc: 'Start from a ScriptSea script or bring your own.' },
      { title: 'Choose your style', desc: 'UGC, B-Roll or animation, with character options if you want a person on screen.' },
      { title: 'Paste into Sora', desc: 'Generate each scene in Sora, then cut the clips together.' },
    ],
    features: [
      'Scenes mapped to each part of your script',
      'Physical, specific action Sora handles well',
      'Same character fully described every time',
      'Varied shots so the edit never feels repetitive',
      'Optional voiceover lines',
      'Copy one scene or copy them all',
    ],
    example: PROMPT_EXAMPLE,
    tipsTitle: 'How to write a good Sora prompt',
    tips: [
      { title: 'Show cause and effect', desc: 'Sora is strong at physics. "Coffee spills across the desk and soaks the papers" plays to that.' },
      { title: 'Keep each clip to one beat', desc: 'One action per clip. Tell the story across several clips, not inside one.' },
      { title: 'Describe the subject fully, every time', desc: 'Each generation starts fresh. Repeat the full description for any recurring character.' },
      { title: 'Vary your shots', desc: 'Mix wide, medium and close. The same framing five times in a row kills retention.' },
    ],
    faqs: [
      { q: 'What is Sora 2?', a: 'Sora 2 is OpenAI’s video model. It creates short clips with synced sound from text prompts, in the Sora app and through OpenAI’s API.' },
      { q: 'Can I use ScriptSea prompts in Sora directly?', a: 'Yes. Copy a scene prompt and paste it into Sora as-is.' },
      { q: 'Do they work in other models too?', a: 'Yes. Seedance, Kling, Veo, Wan and Hailuo all accept the same prompts.' },
      { q: 'Do I need prompt skills?', a: 'No. ScriptSea handles the camera, light, pacing and character details.' },
    ],
    related: ['ai-video-prompt-generator', 'veo-prompt-generator', 'kling-prompt-generator', 'ai-script-generator'],
  },

  'youtube-script-generator': {
    navLabel: 'YouTube Script Generator',
    title: 'YouTube Script Generator: Shorts & Long Videos With AI | ScriptSea',
    description:
      'AI YouTube script generator for Shorts and long videos up to 60 minutes. Strong hooks, clear structure and the right word count for your length.',
    badge: 'YouTube Scripts',
    h1: { before: 'YouTube Scripts That ', highlight: 'Hold Viewers to the End', after: '' },
    intro:
      'Watch time is what YouTube pushes. ScriptSea writes scripts with a hook that earns the click, a structure that keeps people watching, and the right length for Shorts or long videos up to an hour.',
    steps: [
      { title: 'Give it your topic', desc: 'A title idea, a question, a product. Or paste a YouTube link to match a style you like.' },
      { title: 'Pick the length', desc: '15, 30 or 60 seconds for Shorts. 5 to 60 minutes for long videos.' },
      { title: 'Record or animate', desc: 'Read it on camera, hand it to a voiceover, or turn it into AI video prompts for a faceless channel.' },
    ],
    features: [
      'Hooks built for the first 5 seconds',
      'Clear story arc with chapter-style structure for long videos',
      'Exact word counts for your target length',
      'Match the style of any YouTube video',
      'Great for faceless channels with AI visuals',
      'Export to PDF or Word',
    ],
    example: SCRIPT_EXAMPLE,
    tipsTitle: 'How to write a YouTube script people finish',
    tips: [
      { title: 'Pay off the title fast', desc: 'People clicked for a reason. Confirm it in the first few seconds or they leave.' },
      { title: 'Open loops', desc: 'Tease what is coming later ("the third one surprised me"). It gives people a reason to stay.' },
      { title: 'Cut the intro', desc: 'No logo, no "welcome back". Start with the content. Introduce yourself later, if at all.' },
      { title: 'Shorts are a different game', desc: 'Shorts need the hook in the first sentence and no warm-up. ScriptSea writes them differently from long videos.' },
    ],
    faqs: [
      { q: 'Can it write long YouTube videos?', a: 'Yes. Pro users can generate scripts from 5 up to 60 minutes. Free scripts are 15 or 30 seconds.' },
      { q: 'Does it work for YouTube Shorts?', a: 'Yes. Choose 15, 30 or 60 seconds and YouTube. Shorts scripts open with the hook in the first line.' },
      { q: 'Can I use it for a faceless channel?', a: 'Yes. Write the script, then turn it into AI video prompts and generate the visuals with Seedance, Kling, Veo or Sora.' },
      { q: 'Can it copy a YouTuber’s style?', a: 'Paste a YouTube link and ScriptSea uses it as a style reference. It writes an original script, not a copy.' },
    ],
    related: ['ai-script-generator', 'tiktok-script-generator', 'ai-video-prompt-generator', 'veo-prompt-generator'],
  },

  'tiktok-script-generator': {
    navLabel: 'TikTok Script Generator',
    title: 'TikTok Script Generator: Viral Hooks & Scripts With AI | ScriptSea',
    description:
      'AI TikTok script generator. Get scroll-stopping hooks and 15, 30 or 60 second scripts that sound like a real person, not a robot. Also works for Reels.',
    badge: 'TikTok & Reels Scripts',
    h1: { before: 'TikTok Scripts With Hooks That ', highlight: 'Stop the Scroll', after: '' },
    intro:
      'On TikTok you get about one second. ScriptSea writes scripts that open with the hook, cut every wasted word, and sound like you are talking to a friend. Works for Instagram Reels too.',
    steps: [
      { title: 'Type the idea', desc: 'What are you selling, teaching or telling? Or paste a TikTok link to match its style.' },
      { title: 'Pick 15, 30 or 60 seconds', desc: 'Choose TikTok or Instagram and a tone: casual, funny, bold, and more.' },
      { title: 'Film it or generate it', desc: 'Read it on camera or turn it into AI video prompts for a full AI-made TikTok.' },
    ],
    features: [
      'The hook is the first sentence. No warm-up',
      'Short lines that are easy to say on camera',
      'Word count that fits 15, 30 or 60 seconds',
      'Paste a TikTok link to match a trend or style',
      'Works for Reels and Facebook too',
      'Turn it into AI video in one click',
    ],
    example: SCRIPT_EXAMPLE,
    tipsTitle: 'How to write a TikTok script that gets watched',
    tips: [
      { title: 'Lead with the payoff', desc: 'Say the most interesting thing first. "Your serum is mostly water" beats "Let me tell you about my skincare".' },
      { title: 'Make it a little uncomfortable', desc: 'A bold claim, a mistake, a surprise. Safe openings get skipped.' },
      { title: 'One breath per line', desc: 'Short lines are easier to say and easier to caption. They also feel faster.' },
      { title: 'End on something to do', desc: 'Give people a reason to comment, save or check something. Not "follow for more".' },
    ],
    faqs: [
      { q: 'Is the TikTok script generator free?', a: 'Yes. Your first 3 scripts are free, no card needed.' },
      { q: 'Does it work for Instagram Reels?', a: 'Yes. Choose Instagram and it adjusts the pacing and style for Reels.' },
      { q: 'Will it sound like AI?', a: 'It is built not to. Short sentences, everyday words, no corporate phrases. Read it out loud and it sounds like a person.' },
      { q: 'Can I make the whole TikTok with AI?', a: 'Yes. Turn your script into scene prompts and generate the clips in Seedance, Kling, Veo or Sora.' },
    ],
    related: ['ai-script-generator', 'ugc-ad-script-generator', 'youtube-script-generator', 'seedance-prompt-generator'],
  },

  'ugc-ad-script-generator': {
    navLabel: 'UGC Ad Script Generator',
    title: 'UGC Ad Script Generator: AI Ad Scripts & Prompts | ScriptSea',
    description:
      'Write UGC ad scripts that sell, then turn them into AI video prompts with a realistic creator on camera. For TikTok ads, Reels ads and product videos.',
    badge: 'UGC Ads',
    h1: { before: 'UGC Ads That ', highlight: 'Sell Without Sounding Like Ads', after: '' },
    intro:
      'The best ads look like a real person talking about something they love. ScriptSea writes that kind of script for your product, then turns it into prompts for a realistic AI creator on camera. No creators to hire. No reshoots.',
    steps: [
      { title: 'Describe your product', desc: 'What it is, who it is for, the one thing it fixes.' },
      { title: 'Get the ad script', desc: 'Hook, problem, proof, and a natural reason to buy. In the voice of a real customer.' },
      { title: 'Make the video', desc: 'Pick UGC style, choose your creator’s look, and get scene prompts for Seedance, Kling, Veo or Sora.' },
    ],
    features: [
      'Scripts in a real customer voice, not brand speak',
      'Hooks built for paid social',
      'UGC prompts with a realistic creator on camera',
      'Choose the creator’s gender and look',
      'B-Roll product shots with no people, when you need them',
      'Test many hooks fast without paying creators',
    ],
    example: SCRIPT_EXAMPLE,
    tipsTitle: 'What makes a UGC ad convert',
    tips: [
      { title: 'Problem first, product second', desc: 'People do not care about your product until they feel the problem. Open with the pain.' },
      { title: 'Show, then claim', desc: 'A quick visual result beats a list of features. Let the footage make the claim.' },
      { title: 'Test hooks, not whole ads', desc: 'Keep the body the same and swap the first line. The hook decides most of your results.' },
      { title: 'Keep it real', desc: 'Handheld, natural light, normal rooms. Polished studio shots read as ads and get skipped.' },
    ],
    faqs: [
      { q: 'Can AI make UGC ads that look real?', a: 'Yes. Models like Seedance 2.0, Kling 3.0 and Veo 3.1 can produce very realistic people. The prompt makes the difference, and that is what ScriptSea writes.' },
      { q: 'Do I need to hire creators?', a: 'No. You can generate the creator footage with AI. Many brands also use ScriptSea scripts with real creators.' },
      { q: 'Can I show my actual product?', a: 'Yes. Describe your product in detail and it appears in the prompts. For an exact match, use a product photo as a reference image in your video model.' },
      { q: 'How many ad variations can I make?', a: 'Each generation counts as one. Pro Monthly gives you 60 a month, enough to test lots of hooks.' },
    ],
    related: ['ai-script-generator', 'ai-video-prompt-generator', 'tiktok-script-generator', 'seedance-prompt-generator'],
  },
};

export const TOOL_SLUGS = Object.keys(TOOL_PAGES);
