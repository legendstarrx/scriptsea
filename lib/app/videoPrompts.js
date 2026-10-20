// Parses the video-prompt API output into scene objects (same rules as before,
// plus support for "SCENE 1 (0-3s): prompt" written on a single line).

export function parseVideoPrompts(text = '') {
  const sceneBlocks = text.split(/\n(?=SCENE\s+\d+)/i).filter((b) => b.trim());
  const scenes = [];
  let negativePrompt = '';

  // Negative prompt section (appears before SCENE 1)
  const negMatch = text.match(/❌[^\n]*\n([\s\S]*?)(?=\nSCENE\s+\d+|\n[🎬📽️💡]|$)/iu);
  if (negMatch) negativePrompt = negMatch[1].trim();

  sceneBlocks.forEach((block) => {
    if (!/^SCENE\s+\d+/i.test(block.trim())) return;
    const lines = block.trim().split('\n');
    const head = lines[0].trim().match(/^(SCENE\s+\d+[^:]*?)(?::\s*(.+))?$/i);
    const title = (head?.[1] || lines[0]).trim();
    let prompt = head?.[2]?.trim() || '';
    let voiceover = '';
    let inVoiceover = false;

    lines.slice(1).forEach((line) => {
      const l = line.trim();
      if (!l || /^❌|^💡/u.test(l)) return;
      if (/^🎙️|^VOICEOVER/iu.test(l)) { inVoiceover = true; return; }
      if (inVoiceover) voiceover += (voiceover ? '\n' : '') + l;
      else prompt += (prompt ? ' ' : '') + l;
    });

    if (prompt) {
      const meta = title.match(/SCENE\s+(\d+)\s*(?:\(([^)]*)\))?/i);
      scenes.push({
        title,
        number: meta?.[1] || String(scenes.length + 1),
        time: meta?.[2] || '',
        prompt: prompt.trim(),
        voiceover: voiceover.trim(),
      });
    }
  });

  return { scenes, negativePrompt };
}

export function allPromptsText(scenes, negativePrompt) {
  return scenes
    .map((s, i) => `${s.title}\n${s.prompt}${s.voiceover ? `\n\nVOICEOVER (Part ${i + 1}):\n${s.voiceover}` : ''}`)
    .join('\n\n---\n\n') + (negativePrompt ? `\n\n---\n\nNEGATIVE PROMPT:\n${negativePrompt}` : '');
}
