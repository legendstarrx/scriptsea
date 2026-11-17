// ─────────────────────────────────────────────────────────────────────────────
// Free script tools (hooks, Reels, Shorts, faceless YouTube).
// One file for each page's settings and SEO content. They share the free video
// prompt tools' Claude client and their 5-a-day limit (lib/freeTools).
// ─────────────────────────────────────────────────────────────────────────────
import { DAILY_LIMIT } from '../freeTools/config';

export const MAX_IDEA_CHARS = 500;

// kind: what the generator writes. lengths are in seconds.
export const SCRIPT_TOOLS = {
  'video-hook-generator': {
    kind: 'hooks',
    navLabel: 'Video Hook Generator',
    title: 'Free Video Hook Generator: 10 Hooks Per Idea | ScriptSea',
    description: 'Free video hook generator. Type your idea and get 10 opening lines that stop the scroll, then turn the best one into a full script. No signup.',
    badge: 'Free · No signup · 10 hooks per idea',
    h1: { before: 'Free ', highlight: 'Video Hook Generator', after: '' },
    intro: 'Type what your video is about. You get 10 opening lines in a few seconds, each one built to stop the scroll. Pick the one you like and turn it into a full script right here.',
    inputLabel: 'What’s your video about?',
    placeholder: 'e.g. I paid off $12,000 of debt in 14 months on a normal salary',
    button: 'Generate 10 hooks',
    lengths: [15, 30, 60],
    defaultLength: 30,
    whatFor: {
      title: 'What a video hook generator is for',
      body: [
        'The first line decides everything. On TikTok, Reels and Shorts, people choose in about a second. If your opening is flat, they never hear the good part.',
        'Writing one strong hook is hard. Writing ten and picking the best is how most good creators do it. This tool gives you the ten, in different styles: a question, a bold claim, a mistake, a number, a story.',
        'Use the hooks as they are, or as a starting point. Then press **Turn into full script** and get the rest of the video built around the hook you picked.',
      ],
    },
    examplesTitle: '3 example openings',
    examples: [
      { label: 'Meal prep · number', text: 'You’re spending $90 a week on lunch. Here’s the $22 version.' },
      { label: 'Learning to code · story', text: 'I wrote my first line of code at 35. Eleven months later I got hired.' },
      { label: 'Phone review · bold claim', text: 'This phone costs $199 and it embarrassed my $1,000 one.' },
    ],
    tipsTitle: 'Tips for hooks that hold attention',
    tips: [
      { title: 'Say the payoff first', body: '“Here’s how I paid off $12,000” beats a slow intro every time. Give people the reason to stay in line one.' },
      { title: 'Use a real number', body: '“$22” and “14 months” feel true. “A lot of money” feels like an ad.' },
      { title: 'Keep it under 12 words', body: 'You’ve got about a second before the thumb moves. Short hooks are easier to say with energy too.' },
      { title: 'Never open with “Hey guys”', body: '“Hey guys” and “In this video” tell people nothing is coming yet. Start on the hook.' },
    ],
    faqs: [
      { q: 'What is a video hook?', a: 'It’s the first line of your video. Its only job is to make people stay for the second line. Good hooks name a result, a problem or a surprise straight away.' },
      { q: 'Is this video hook generator free?', a: 'Yes. You get 5 free tries a day with no signup. Each set of 10 hooks uses one try, and each full script uses one.' },
      { q: 'Do the hooks work for TikTok, Reels and Shorts?', a: 'Yes. They’re written for short vertical video, so they work on all three. For long YouTube videos, use the best one as your first line.' },
      { q: 'How do I pick the best hook?', a: 'Read each one out loud and pick the one you’d stop for yourself. If two feel close, film both and keep the one that holds people longer.' },
    ],
    related: ['tiktok-script-generator', 'ai-script-generator'],
  },

  'instagram-reels-script-generator': {
    kind: 'reels',
    navLabel: 'Instagram Reels Script Generator',
    title: 'Free Instagram Reels Script Generator | ScriptSea',
    description: 'Free Instagram Reels script generator. Get a Reel script with a scroll-stopping hook, natural lines and a ready caption, 15 to 90 seconds. No signup.',
    badge: 'Free · No signup · 15 to 90 seconds',
    h1: { before: 'Free ', highlight: 'Instagram Reels Script Generator', after: '' },
    intro: 'Type your idea and pick a length. You get a Reel script that opens with a hook, sounds like a real person, and comes with a caption ready to post.',
    inputLabel: 'What’s your Reel about?',
    placeholder: 'e.g. 3 stretches for people who sit at a desk all day',
    button: 'Write my Reel script',
    lengths: [15, 30, 60, 90],
    defaultLength: 30,
    whatFor: {
      title: 'What this Reels script generator is for',
      body: [
        'Reels move fast. People decide in the first second, and the ones who stay want the point quickly. A good Reel script gets there in under 30 words.',
        'This tool writes the whole thing: the hook, the lines you say, and a short caption with a few hashtags. It keeps sentences short, so they’re easy to say on camera.',
        '**It doesn’t write like a brand account.** It writes like someone talking to a friend, which is what tends to work on Reels.',
      ],
    },
    examplesTitle: '3 example openings',
    examples: [
      { label: 'Fitness', text: 'If you sit at a desk all day, do this before lunch.' },
      { label: 'Small business', text: 'We made 40 candles last month. We sold 3. Here’s what changed.' },
      { label: 'Travel', text: 'Lisbon on $60 a day. Here’s exactly where it went.' },
    ],
    tipsTitle: 'Tips for Reels people finish',
    tips: [
      { title: 'Put the hook on screen too', body: 'Lots of people watch Reels on mute. Say the first line and show it as text at the same time.' },
      { title: 'One idea per Reel', body: 'Two tips is a list. Five tips is a lecture. Save the rest for the next Reel.' },
      { title: 'Film in short takes', body: 'Read one line, cut, read the next. It keeps your energy up and hides the stumbles.' },
      { title: 'Ask a one-word question', body: 'End with something people can answer fast, like “Which one are you?” It beats “follow for more”.' },
    ],
    faqs: [
      { q: 'How long should an Instagram Reel be?', a: 'Most Reels that do well are 15 to 45 seconds. Pick 15 for a quick tip, 30 for most ideas, and 60 or 90 for a story.' },
      { q: 'Is this Reels script generator free?', a: 'Yes. 5 free tries a day, no signup. If you want AI video prompts for every scene too, ScriptSea gives you 3 free scripts.' },
      { q: 'Does it write the caption too?', a: 'Yes. Each script comes with a short caption and a few hashtags that match the topic.' },
      { q: 'Can I use the same script on TikTok?', a: 'Yes. The format is close enough. You might cut a line for TikTok if your audience there likes it faster.' },
    ],
    related: ['tiktok-script-generator', 'ugc-ad-script-generator'],
  },

  'youtube-shorts-script-generator': {
    kind: 'shorts',
    navLabel: 'YouTube Shorts Script Generator',
    title: 'Free YouTube Shorts Script Generator | ScriptSea',
    description: 'Free YouTube Shorts script generator. Get a tight script with a strong hook, a title idea and a loop-friendly ending, 15 to 90 seconds. No signup.',
    badge: 'Free · No signup · 15 to 90 seconds',
    h1: { before: 'Free ', highlight: 'YouTube Shorts Script Generator', after: '' },
    intro: 'Type your idea and pick a length. You get a Shorts script with the hook in the first line, no filler, an ending that loops back to the start, and a title to post it with.',
    inputLabel: 'What’s your Short about?',
    placeholder: 'e.g. Why you shouldn’t charge your phone to 100%',
    button: 'Write my Shorts script',
    lengths: [15, 30, 60, 90],
    defaultLength: 30,
    whatFor: {
      title: 'What this Shorts script generator is for',
      body: [
        'Shorts live or die on two things: do people swipe away, and do they watch again. A script that starts strong and loops cleanly helps with both.',
        'This tool writes for that. The first line gets to the point. Every line after it earns its place. The last line leads back into the first, so a rewatch feels natural.',
        '**You also get a title idea**, because the title still shows up in YouTube search.',
      ],
    },
    examplesTitle: '3 example openings',
    examples: [
      { label: 'Tech', text: 'Your phone battery hates being at 100%. Here’s why.' },
      { label: 'Cooking', text: 'Restaurants salt pasta water like the sea. You should too.' },
      { label: 'History', text: 'This war lasted 38 minutes. Here’s how it ended.' },
    ],
    tipsTitle: 'Tips for Shorts that get rewatched',
    tips: [
      { title: 'Loop the ending', body: 'Finish on a line that leads into your first line. When the Short restarts, it sounds like one thought.' },
      { title: 'Cut the intro', body: 'No logo, no “welcome back”. The first frame is the hook.' },
      { title: 'Change the picture every few seconds', body: 'A new shot or a quick zoom every 2 to 3 seconds keeps eyes on the screen.' },
      { title: 'Write the title last', body: 'Use the words people would search for, not an inside joke.' },
    ],
    faqs: [
      { q: 'How long can a YouTube Short be?', a: 'Up to 3 minutes. Most Shorts that do well are still under a minute, so the tool lets you pick 15, 30, 60 or 90 seconds.' },
      { q: 'Is this YouTube Shorts script generator free?', a: 'Yes. 5 free tries a day, no signup needed.' },
      { q: 'What does a loop ending mean?', a: 'The last line connects back to the first. When the Short restarts, it sounds like one continuous thought, and people often watch twice without noticing.' },
      { q: 'Can I turn the script into an AI video?', a: 'Yes. Paste it into our free Script to AI Video Prompts tool, or sign up to ScriptSea to get a prompt for every scene.' },
    ],
    related: ['youtube-script-generator', 'tiktok-script-generator'],
  },

  'faceless-youtube-script-generator': {
    kind: 'faceless',
    navLabel: 'Faceless YouTube Script Generator',
    title: 'Free Faceless YouTube Script Generator | ScriptSea',
    description: 'Free faceless YouTube script generator. Voiceover scripts with scene-by-scene visuals, ready to turn into AI video prompts. No signup needed.',
    badge: 'Free · No signup · Voiceover + scenes',
    h1: { before: 'Free ', highlight: 'Faceless YouTube Script Generator', after: '' },
    intro: 'Type a topic and pick a length. You get a voiceover script split into scenes, with what to show in each one. Then send it to our Script to AI Video Prompts tool to make the visuals.',
    inputLabel: 'What’s your video about?',
    placeholder: 'e.g. The mystery of the man who jumped from a plane with $200,000 in 1971',
    button: 'Write my script',
    lengths: [60, 120, 180],
    defaultLength: 60,
    whatFor: {
      title: 'What this faceless YouTube script generator is for',
      body: [
        'A faceless channel lives on two things: the voiceover and the pictures under it. If the words and the visuals don’t match, it feels like a slideshow.',
        'This tool writes both together. Each scene has the line you’ll record and a short note on what to show while you say it. Scenes are kept short, so each one fits a single AI video clip.',
        '**When you’re done, press the button to copy the script and open Script to AI Video Prompts.** Paste it in and you get a ready prompt for each scene.',
      ],
    },
    examplesTitle: '3 example openings',
    examples: [
      { label: 'History', text: 'In 1971, a man jumped out of a plane with $200,000. Nobody ever found him.' },
      { label: 'Money', text: 'Your bank makes money on your money every night while you sleep. Here’s how.' },
      { label: 'Nature', text: 'There’s a lake in Tanzania so salty it preserves the birds that die in it.' },
    ],
    tipsTitle: 'Tips for faceless videos that hold attention',
    tips: [
      { title: 'Write for the ear', body: 'Read every line out loud. If you trip on it, so will your voiceover.' },
      { title: 'One idea per scene', body: 'If a scene needs two different pictures, split it into two scenes.' },
      { title: 'Keep scenes 5 to 10 seconds', body: 'That’s about one AI video clip each, so the visuals line up with the words.' },
      { title: 'Use one style line', body: 'Pick a look like “warm documentary style” and keep it in every scene. The video feels like one piece.' },
    ],
    faqs: [
      { q: 'What is a faceless YouTube script?', a: 'A script made for voiceover, with nobody on camera. Each scene has the narration and a note on what the viewer sees.' },
      { q: 'Is this faceless YouTube script generator free?', a: 'Yes. 5 free tries a day, no signup.' },
      { q: 'How do I turn the script into AI video?', a: 'Press “Copy script and open Script to AI Video Prompts”, paste it in and pick your video model. The first 2 scenes are free there, and ScriptSea does every scene.' },
      { q: 'How long can the script be?', a: 'Up to 3 minutes here. For longer videos, ScriptSea writes scripts up to 60 minutes.' },
    ],
    related: ['script-to-video-prompts', 'youtube-script-generator'],
  },
};

export const SCRIPT_TOOL_SLUGS = Object.keys(SCRIPT_TOOLS);

// Names for the related links at the bottom of each page (existing pages).
const RELATED_NAMES = {
  'ai-script-generator': 'AI Script Generator',
  'tiktok-script-generator': 'TikTok Script Generator',
  'youtube-script-generator': 'YouTube Script Generator',
  'ugc-ad-script-generator': 'UGC Ad Script Generator',
  'script-to-video-prompts': 'Script to AI Video Prompts',
};

/** Everything one page needs, serialisable for getStaticProps. */
export function getScriptToolPageProps(slug) {
  const page = SCRIPT_TOOLS[slug];
  if (!page) throw new Error(`Unknown script tool page: ${slug}`);
  return {
    slug,
    page,
    related: page.related.map((s) => ({ slug: s, label: RELATED_NAMES[s] })),
    maxInput: MAX_IDEA_CHARS,
    dailyLimit: DAILY_LIMIT,
  };
}
