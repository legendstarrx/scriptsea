// Video prompts arrive from /api/ai/video-prompt already split into clips
// ({ number, name, time, length, prompt, voiceover, lineLabel }).

export function allPromptsText(scenes, negativePrompt) {
  return scenes
    .map((s) => {
      const head = `CLIP ${s.number}${s.name ? ` — ${s.name}` : ''}${s.time ? ` (${s.time} in the video, generate at ${s.length}s)` : ''}`;
      const line = s.voiceover ? `\n\n${(s.lineLabel || 'Voiceover').toUpperCase()}:\n${s.voiceover}` : '';
      return `${head}\n${s.prompt}${line}`;
    })
    .join('\n\n---\n\n') + (negativePrompt ? `\n\n---\n\nNEGATIVE PROMPT:\n${negativePrompt}` : '');
}
