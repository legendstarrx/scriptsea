// Builds the script-writing prompt. Moved verbatim from the old pages/generate.js
// so the AI output stays exactly the same — edit the wording here, not in the UI.
import { creatorStyles } from './creatorStyles';

export function buildScriptPrompt({ topic, duration, selectedPlatform, selectedTone, videoReference, selectedCreator, scriptType = 'viral' }) {
  // Exact word count targets (at ~130 wpm speaking pace)
  const wordCountTargets = {
    '15 sec':  '30–40',
    '30 sec':  '60–75',
    '45 sec':  '95–110',
    '60 sec':  '125–150',
    '90 sec':  '190–220',
    '2 min':   '255–300',
    '3 min':   '380–440',
    '5 min':   '635–720',
    '10 min':  '1250–1450',
    '15 min':  '1900–2150',
    '20 min':  '2550–2900',
    '30 min':  '3800–4300',
    '45 min':  '5700–6400',
    '60 min':  '7600–8500',
  };
  const targetWords = wordCountTargets[duration] || '125–150';

  // Platform-specific direction
  const platformGuide = {
    youtube:   'YouTube: Hook can be 5–8 seconds. Build a clear story arc. Pacing is dynamic but not frantic. Use chapter-like structure for longer videos.',
    tiktok:    'TikTok: The very FIRST sentence must be the hook — zero warm-up. Ultra-short sentences. High energy. Trending language.',
    instagram: 'Instagram Reels: Visual storytelling. Hook lands in 2 seconds. Aesthetic and relatable. Community-driven CTA.',
    facebook:  'Facebook: Slightly slower pace is fine. Emotion and shareability drive performance. Lead with a relatable pain point.',
  };
  const platformDir = platformGuide[selectedPlatform] || platformGuide.youtube;

  // Tone direction
  const toneGuide = {
    casual:        'Talk like you\'re texting your best friend — relaxed, real, no corporate words.',
    funny:         'Dry wit, unexpected comparisons, self-aware humor. Funny because it\'s TRUE, not because it\'s trying.',
    informative:   'Teach confidently. Use specifics. Make complex things feel simple and surprising.',
    inspirational: 'Emotionally resonant. Personal truth. Build to a genuine moment of belief.',
    creative:      'Break expectations. Unusual angles. Use metaphor and vivid imagery.',
  };
  const toneDir = toneGuide[selectedTone] || toneGuide.casual;

  // Reference video section — use actual title if we fetched it
  let refVideoSection = '';
  if (videoReference) {
    if (videoReference.title) {
      refVideoSection = `
REFERENCE VIDEO (your structural blueprint — do NOT copy the topic):
Title: "${videoReference.title}"${videoReference.author ? `\nCreator: ${videoReference.author}` : ''}
Platform: ${videoReference.platform}

Study this title carefully. Reverse-engineer WHY it works:
- What emotion or curiosity gap does the title create?
- What hook structure is implied by that title?
- What pacing and energy does a video with that title use?
- What kind of payoff does the viewer expect?

Now apply THAT same hook structure, pacing, and emotional logic to the topic "${topic}".
Your script should feel like a spiritual cousin of that video — same energy, completely different content.`;
    } else {
      refVideoSection = `
REFERENCE VIDEO (your structural blueprint):
Platform: ${videoReference.platform}
URL: ${videoReference.url}

Apply the viral structure, hook style, and pacing typical of high-performing ${videoReference.platform} videos to the topic "${topic}".`;
    }
  }

  // Creator style section
  let creatorSection = '';
  if (selectedCreator) {
    const creatorInfo = creatorStyles[selectedPlatform]?.find(c => c.name === selectedCreator);
    if (creatorInfo) {
      creatorSection = `
CREATOR STYLE — write in the voice of ${selectedCreator}:
${creatorInfo.description}
Match their energy level, sentence rhythm, signature transitions, and natural catchphrases.`;
    }
  }

  const prompt = `You are a professional scriptwriter who has written viral content that has generated over 500 million views. You write scripts that sound FULLY HUMAN — no AI tells, no filler openers, no generic structure.

HARD RULES — violating any of these is a failure:
1. NEVER start with "yo", "hey", "alright", "okay so", "so today", "in this video", "welcome back", or any warm-up phrase. Start COLD — the very first words ARE the hook.
2. NEVER use generic AI phrases like "picture this", "imagine a world", "but here's the thing", "let's dive in", "buckle up", "here's the kicker", "the truth is".
3. WORD COUNT: The entire script must be EXACTLY ${targetWords} words. Count carefully. A ${duration} script at normal speaking pace = ${targetWords} words.
4. No filler. Every single sentence must earn its place. If removing a sentence doesn't hurt the script, it shouldn't be there.
5. Write in spoken English. Not written English. Short sentences. Real contractions. How a human actually talks out loud. Simple language that anyone in the world — even a 5-year-old — can understand. No big words. No academic language. No corporate speak.
6. NO CALL TO ACTION. Do NOT end with "follow", "subscribe", "like", "comment", "share", "check the link", "hit the button" or any CTA. The script ends at the payoff — the last line should leave impact, not beg for engagement.
7. Do NOT label sections as "Hook" or "Body" in the output. Just write the script as one continuous flow of spoken words.

THE HOOK (first 1-2 sentences):
This is the most important part. The hook must be so strong that it is physically impossible to scroll past. Study what works on viral videos:
- A shocking fact or counterintuitive statement ("If a shark circles you, don't swim away.")
- A bold claim that creates instant curiosity
- A pattern interrupt — something unexpected that breaks the viewer's autopilot scrolling
- NOT a question. Statements hook harder than questions.
- The hook alone should make someone think "wait, what?" or "I need to hear this"

THE BODY (everything after the hook):
- Every 10-15 seconds, introduce NEW information, a twist, or a shift. Never let the viewer feel like they know what's coming next.
- Build tension and curiosity. Each sentence should make the NEXT sentence feel necessary.
- Use specific details, numbers, and examples — not vague generalities.
- Make complex things feel simple. Explain like you're talking to a friend who's smart but knows nothing about this topic.
- The body should feel like a story unfolding, not a lecture. Even educational content should have narrative tension.
- End with a powerful final line that delivers the payoff — the "oh damn" moment. This is the last thing they hear. Make it land.

ASSIGNMENT:
Topic: "${topic}"
Duration: ${duration} → TARGET WORD COUNT: ${targetWords} words
Platform: ${selectedPlatform}
Tone: ${selectedTone}
Type: ${scriptType === 'ad' ? 'Advertisement' : 'Viral Content'}
Format: Voiceover/spoken script only — no camera directions or visual cues.

PLATFORM DIRECTION:
${platformDir}

TONE DIRECTION:
${toneDir}
${refVideoSection}
${creatorSection}
${scriptType === 'ad' ? `
AD STRUCTURE (do NOT label these sections in the output — just flow naturally):
- Stop the scroll with the problem or a shocking result (not a question).
- Make them feel understood in 1–2 sentences.
- Introduce the solution through demonstration, not description.
- One specific, believable result or detail as proof.
- End with impact — NOT a call to action.` : `
VIRAL STRUCTURE (do NOT label these sections in the output — just flow naturally):
- Open with a hook that makes stopping impossible. Statement, not question.
- Layer in intrigue, tension, or new information every 10–15 seconds.
- Build to the peak — the moment everything clicks.
- Deliver the payoff. The last line should hit hard and stick in their mind.
- Do NOT add a CTA at the end.`}

OUTPUT FORMAT:

# Title
<one viral title for this video>

## Script
[The entire script as one continuous flow of spoken words. No section labels like "Hook" or "Body". Just the script from first word to last. Start with the hook, flow into the body, end with the payoff. No CTA.]
`;

  return prompt;
}
