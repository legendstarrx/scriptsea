import { useEffect, useRef, useState } from 'react';
import { toast } from 'react-hot-toast';
import { PageHeader } from './AppShell';
import { Alert, Badge, Button, Card, Chip, Icon, OptionCard, TextArea, Toggle, cx } from '../ui';
import { generateVideoPrompts } from '../../lib/app/aiClient';
import { allPromptsText } from '../../lib/app/videoPrompts';

const STYLES = [
  { id: 'ugc', title: 'UGC / Viral', desc: 'A real-looking person on camera', icon: 'user' },
  { id: 'broll', title: 'B-Roll', desc: 'Visuals that tell the story. Nobody talks to camera', icon: 'image' },
  { id: 'animation', title: 'Animation', desc: 'An animated story', icon: 'palette' },
];
const ANIMATION_TYPES = [
  { id: '3d-pixar', label: '3D Pixar' },
  { id: '2d-flat', label: '2D Flat' },
  { id: '3d-realistic', label: 'Realistic 3D' },
  { id: 'motion-graphics', label: 'Motion Graphics' },
  { id: 'stick-figure', label: 'Stick Figure' },
];
const GENDERS = [{ id: 'auto', label: 'Any' }, { id: 'male', label: 'Male' }, { id: 'female', label: 'Female' }];
const APPEARANCES = [
  { id: 'auto', label: 'Any' }, { id: 'black', label: 'Black' }, { id: 'white', label: 'White' },
  { id: 'asian', label: 'Asian' }, { id: 'latino', label: 'Latino' }, { id: 'middle-eastern', label: 'Middle Eastern' },
  { id: 'south-asian', label: 'South Asian' }, { id: 'mixed', label: 'Mixed' },
];
const MODELS = ['Seedance', 'Kling', 'Veo', 'Sora', 'Wan', 'Hailuo'];
// Clip lengths each model can generate. We time every clip to its script line
// using only these, so there's no length to pick. Must match lib/server/prompts/video.js.
const TARGETS = [
  { id: 'any', label: 'Any model', hint: 'Clips of 4-10 seconds, timed to your script' },
  { id: 'seedance25', label: 'Seedance 2.5', hint: 'Clips up to 30 seconds, timed to your script' },
  { id: 'seedance', label: 'Seedance 2.0', hint: 'Clips of 4-15 seconds, timed to your script' },
  { id: 'kling', label: 'Kling 3.0', hint: 'Multi-shot clips of 3, 5, 8, 10 or 15 seconds' },
  { id: 'omni', label: 'Omni Flash', hint: 'Clips of 4, 6, 8 or 10 seconds' },
  { id: 'veo', label: 'Veo 3.1', hint: 'Clips of 4, 6 or 8 seconds, with sound and dialogue' },
  { id: 'sora', label: 'Sora 2', hint: 'Clips of 4, 8 or 12 seconds, simple shots' },
];
const LOADING_LINES = [
  'Splitting your script into clips at natural breaks…',
  'Timing every clip to the voiceover…',
  'Directing the shots like a real creator video…',
  'Keeping your character the same in every clip…',
];

function SectionTitle({ step, children, hint }) {
  return (
    <div className="mb-3 flex items-center gap-2.5">
      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-zinc-900 text-xs font-bold text-white">{step}</span>
      <span className="text-[15px] font-semibold text-zinc-900">{children}</span>
      {hint && <span className="text-sm text-zinc-400">{hint}</span>}
    </div>
  );
}

function CopyButton({ text, label = 'Copy', variant = 'secondary', size = 'sm' }) {
  const [done, setDone] = useState(false);
  return (
    <Button
      variant={variant}
      size={size}
      icon={done ? 'check' : 'copy'}
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(text);
          setDone(true);
          setTimeout(() => setDone(false), 1800);
        } catch {
          toast.error('Could not copy. Please try again.');
        }
      }}
    >
      {done ? 'Copied' : label}
    </Button>
  );
}

function EmptyOutput({ isProUser, onUpgrade }) {
  return (
    <Card className="flex min-h-[420px] flex-col items-center justify-center p-8 text-center lg:min-h-[640px]">
      <div className="w-full max-w-sm space-y-3">
        {[1, 2, 3].map((n) => (
          <div key={n} className="flex items-center gap-3 rounded-2xl bg-zinc-50 p-3 text-left ring-1 ring-zinc-200/70" style={{ opacity: 1 - (n - 1) * 0.28 }}>
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-white text-sm font-bold text-brand-500 ring-1 ring-zinc-200">{n}</span>
            <div className="flex-1 space-y-1.5">
              <div className="h-2.5 w-4/5 rounded bg-zinc-200" />
              <div className="h-2.5 w-3/5 rounded bg-zinc-200" />
            </div>
          </div>
        ))}
      </div>
      <h2 className="mt-8 text-xl font-bold text-zinc-950">Your scenes show up here</h2>
      <p className="mt-2 max-w-sm text-[15px] leading-relaxed text-zinc-500">
        One ready-to-paste prompt per scene, with the same character in every shot.
      </p>
      <div className="mt-5 flex flex-wrap justify-center gap-2">
        {MODELS.map((m) => <Badge key={m} tone="zinc">{m}</Badge>)}
      </div>
      {!isProUser && (
        <Button className="mt-8" icon="crown" onClick={onUpgrade}>Unlock video prompts</Button>
      )}
    </Card>
  );
}

function LoadingOutput() {
  const [i, setI] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setI((n) => (n + 1) % LOADING_LINES.length), 2400);
    return () => clearInterval(t);
  }, []);
  return (
    <Card className="min-h-[420px] p-6 sm:p-8 lg:min-h-[640px]">
      <div className="flex items-center gap-3 text-sm font-semibold text-brand-600">
        <span className="relative flex h-3 w-3">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-brand-400 opacity-75" />
          <span className="relative inline-flex h-3 w-3 rounded-full bg-brand-500" />
        </span>
        {LOADING_LINES[i]}
      </div>
      <div className="mt-8 space-y-4">
        {[0, 1, 2].map((n) => (
          <div key={n} className="flex gap-4 rounded-2xl p-4 ring-1 ring-zinc-100">
            <div className="h-9 w-9 shrink-0 rounded-xl bg-zinc-100" />
            <div className="flex-1 space-y-2.5">
              {[92, 100, 76].map((w, j) => (
                <div key={j} className="h-3.5 rounded-lg bg-gradient-to-r from-zinc-100 via-zinc-50 to-zinc-100 bg-[length:400px_100%] animate-shimmer" style={{ width: `${w}%` }} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}

function SceneCard({ scene, index, total }) {
  return (
    <div className="relative flex gap-4">
      <div className="flex flex-col items-center">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-ink text-sm font-bold text-white">{scene.number}</span>
        {index < total - 1 && <span className="mt-2 w-px flex-1 bg-zinc-200" />}
      </div>
      <Card className="mb-5 min-w-0 flex-1 p-5 sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="text-[15px] font-semibold text-zinc-900">Clip {scene.number}{scene.name && <span className="font-normal text-zinc-500"> · {scene.name}</span>}</span>
            {scene.time && <Badge tone="zinc"><Icon name="clock" className="h-3 w-3" />{scene.time}</Badge>}
            {scene.length && <Badge>Generate at {scene.length}s</Badge>}
          </div>
          <div className="flex gap-2">
            <CopyButton text={scene.prompt + (scene.voiceover ? `\n\n${(scene.lineLabel || 'Voiceover').toUpperCase()}:\n${scene.voiceover}` : '')} />
            <a
              href={`https://higgsfield.ai/generate?prompt=${encodeURIComponent(scene.prompt)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-9 items-center gap-1.5 rounded-xl bg-ink px-3.5 text-sm font-semibold text-white transition hover:bg-ink-soft"
            >
              <Icon name="rocket" className="h-4 w-4" /> <span className="hidden sm:inline">Generate on</span> Higgsfield
            </a>
          </div>
        </div>
        <p className="mt-4 whitespace-pre-line text-[15px] leading-7 text-zinc-700">{scene.prompt}</p>
        {scene.voiceover && (
          <div className="mt-4 rounded-2xl bg-brand-50/70 p-4 ring-1 ring-brand-100">
            <div className="flex items-center justify-between gap-3">
              <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-brand-600">
                <Icon name="mic" className="h-3.5 w-3.5" /> {scene.lineLabel || 'Voiceover'} · clip {index + 1} of {total}
              </p>
              <CopyButton text={scene.voiceover} label="Copy line" variant="ghost" />
            </div>
            <p className="mt-2 whitespace-pre-line text-[15px] leading-7 text-zinc-800">{scene.voiceover}</p>
          </div>
        )}
        {scene.overlays?.length > 0 && (
          <div className="mt-4 space-y-3">
            <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-zinc-500">
              <Icon name="image" className="h-3.5 w-3.5" /> B-roll to lay over this clip
            </p>
            {scene.overlays.map((ov, i) => (
              <div key={i} className="rounded-2xl bg-zinc-50 p-4 ring-1 ring-zinc-200/70">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge tone="dark">Place at {ov.at}</Badge>
                    <Badge tone="zinc">Generate at {ov.length}s, use {ov.seconds}s</Badge>
                  </div>
                  <div className="flex gap-2">
                    <CopyButton text={ov.prompt} />
                    <a
                      href={`https://higgsfield.ai/generate?prompt=${encodeURIComponent(ov.prompt)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex h-9 items-center gap-1.5 rounded-xl bg-white px-3 text-sm font-semibold text-zinc-800 ring-1 ring-inset ring-zinc-200 transition hover:bg-zinc-100"
                    >
                      <Icon name="rocket" className="h-4 w-4" /> Higgsfield
                    </a>
                  </div>
                </div>
                <p className="mt-3 whitespace-pre-line text-sm leading-6 text-zinc-600">{ov.prompt}</p>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}

export default function PromptStudio({ isProUser, onUpgrade, initialInput, onGenerated }) {
  const [input, setInput] = useState('');
  const [target, setTarget] = useState('any');
  const targetInfo = TARGETS.find((t) => t.id === target) || TARGETS[0];
  const [style, setStyle] = useState('ugc');
  const [charGender, setCharGender] = useState('auto');
  const [charAppearance, setCharAppearance] = useState('auto');
  const [animStyle, setAnimStyle] = useState('3d-pixar');
  const [withVoiceover, setWithVoiceover] = useState(false);
  const [scenes, setScenes] = useState([]);
  const [negativePrompt, setNegativePrompt] = useState('');
  const [tip, setTip] = useState('');
  const [truncated, setTruncated] = useState(false);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState('');
  const outputRef = useRef(null);

  useEffect(() => {
    if (initialInput) setInput(initialInput.replace(/-\d+$/, ''));
  }, [initialInput]);

  const generate = async () => {
    if (!input.trim()) { setErr('Paste your script or describe your video first.'); return; }
    if (!isProUser) { onUpgrade(); return; }
    setErr(''); setScenes([]); setNegativePrompt(''); setLoading(true);
    if (typeof window !== 'undefined' && window.innerWidth < 1024) {
      requestAnimationFrame(() => outputRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }));
    }
    try {
      const result = await generateVideoPrompts({
        input: input.trim(),
        target, style, withVoiceover,
        // 'none' (No people) only means something for B-roll.
        charGender: charGender !== 'auto' && (charGender !== 'none' || style === 'broll') ? charGender : undefined,
        charAppearance: charAppearance !== 'auto' && !(style === 'broll' && charGender === 'none') ? charAppearance : undefined,
        animStyle: style === 'animation' ? animStyle : undefined,
      });
      setScenes(result.scenes || []);
      setNegativePrompt(result.negativePrompt || '');
      setTip(result.tip || '');
      setTruncated(Boolean(result.truncated));
      if (!result.scenes?.length) setErr('We couldn’t build the clips this time. Please try again.');
      onGenerated?.();
    } catch (e) {
      if (e?.code === 'limit_reached') { onUpgrade(); return; }
      setErr(e?.message || 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  const fullVoiceover = scenes.map((s) => s.voiceover).filter(Boolean).join(' ');

  return (
    <div className="mx-auto max-w-[1400px] px-4 py-6 sm:px-6 lg:px-10 lg:py-10">
      <PageHeader
        title="Video Prompts"
        subtitle="Turn a script into scene-by-scene prompts for any AI video model."
        right={!isProUser && <Badge className="!py-1"><Icon name="crown" className="h-3.5 w-3.5" />Pro feature</Badge>}
      />

      <div className="mt-6 grid items-start gap-6 lg:mt-8 lg:grid-cols-[minmax(0,460px)_minmax(0,1fr)] xl:gap-8">
        {/* ── Form ─────────────────────────────────────────────────── */}
        <Card className="p-5 sm:p-6">
          <div className="space-y-7">
            <div>
              <SectionTitle step="1">Your script or idea</SectionTitle>
              <TextArea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                rows={6}
                placeholder={'Paste your script, or describe your product…\n\ne.g. A matte black water bottle that keeps drinks cold for 24 hours. For gym-goers aged 18-35. Bold and modern.'}
              />
            </div>

            <div>
              <SectionTitle step="2">Video style</SectionTitle>
              <div className="grid gap-2">
                {STYLES.map((s) => (
                  <OptionCard key={s.id} active={style === s.id} onClick={() => setStyle(s.id)} icon={s.icon} title={s.title} desc={s.desc} />
                ))}
              </div>
              {style === 'animation' && (
                <div className="mt-4">
                  <p className="mb-2 text-xs font-medium uppercase tracking-wider text-zinc-400">Animation type</p>
                  <div className="flex flex-wrap gap-2">
                    {ANIMATION_TYPES.map((a) => (
                      <Chip key={a.id} active={animStyle === a.id} onClick={() => setAnimStyle(a.id)}>{a.label}</Chip>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div>
              <SectionTitle step="3" hint="optional">{style === 'broll' ? 'People in the shots' : 'Main character'}</SectionTitle>
              <p className="mb-2 text-xs font-medium uppercase tracking-wider text-zinc-400">Gender</p>
              <div className="flex flex-wrap gap-2">
                {(style === 'broll' ? [...GENDERS, { id: 'none', label: 'No people' }] : GENDERS).map((g) => (
                  <Chip key={g.id} active={charGender === g.id} onClick={() => setCharGender(g.id)}>{g.label}</Chip>
                ))}
              </div>
              {!(style === 'broll' && charGender === 'none') && (
                <>
                  <p className="mb-2 mt-4 text-xs font-medium uppercase tracking-wider text-zinc-400">Look</p>
                  <div className="flex flex-wrap gap-2">
                    {APPEARANCES.map((a) => <Chip key={a.id} active={charAppearance === a.id} onClick={() => setCharAppearance(a.id)}>{a.label}</Chip>)}
                  </div>
                </>
              )}
            </div>

            <div>
              <SectionTitle step="4">Video model</SectionTitle>
              <div className="flex flex-wrap gap-2">
                {TARGETS.map((t) => <Chip key={t.id} active={target === t.id} onClick={() => setTarget(t.id)}>{t.label}</Chip>)}
              </div>
              <p className="mt-2 text-[13px] text-zinc-500">
                {targetInfo.hint}. We pick each clip&apos;s length so the video matches your script second for second.
              </p>
            </div>

            <Toggle
              checked={withVoiceover}
              onChange={setWithVoiceover}
              label={style === 'ugc' ? 'Creator talks on camera' : 'Add a voiceover'}
              desc={style === 'ugc' ? 'Off: they act silently and you add your own voice later' : 'The script is read over the visuals'}
            />

            {err && <Alert onClose={() => setErr('')}>{err}</Alert>}

            <Button size="lg" className="w-full" icon={isProUser ? 'sparkles' : 'lock'} loading={loading} onClick={generate}>
              {loading ? 'Writing your prompts…' : isProUser ? 'Generate video prompts' : 'Unlock video prompts'}
            </Button>
          </div>
        </Card>

        {/* ── Output ───────────────────────────────────────────────── */}
        <div ref={outputRef} className="scroll-mt-20">
          {loading ? <LoadingOutput /> : scenes.length === 0 ? <EmptyOutput isProUser={isProUser} onUpgrade={onUpgrade} /> : (
            <div className="animate-fade-up space-y-6">
              <Card className="flex flex-wrap items-center justify-between gap-3 p-4 sm:px-6">
                <div>
                  <p className="text-[15px] font-semibold text-zinc-900">
                    {scenes.length} clip{scenes.length > 1 ? 's' : ''} ready
                    {scenes[scenes.length - 1]?.time && <span className="font-normal text-zinc-500"> · about {Math.round(parseFloat(scenes[scenes.length - 1].time.split('-')[1]))}s of video</span>}
                  </p>
                  <p className="text-sm text-zinc-500">{tip || 'Paste each clip into your video tool and set the length shown.'}</p>
                  {truncated && <p className="mt-1 text-sm text-amber-600">Your script was long, so we made clips for the first part. Paste the rest in for more.</p>}
                </div>
                <div className="flex gap-2">
                  <Button variant="ghost" size="sm" icon="refresh" onClick={generate}>Regenerate</Button>
                  <CopyButton text={allPromptsText(scenes, negativePrompt)} label="Copy all" variant="primary" />
                </div>
              </Card>

              <div>
                {scenes.map((scene, i) => <SceneCard key={i} scene={scene} index={i} total={scenes.length} />)}
              </div>

              {fullVoiceover && (
                <Card className="p-5 sm:p-6">
                  <div className="flex items-center justify-between gap-3">
                    <p className="flex items-center gap-2 text-[15px] font-semibold text-zinc-900"><Icon name="mic" className="h-4 w-4 text-brand-500" /> Full voiceover</p>
                    <CopyButton text={fullVoiceover} />
                  </div>
                  <p className="mt-3 text-[15px] leading-7 text-zinc-700">{fullVoiceover}</p>
                  <p className="mt-3 text-sm text-zinc-400">Record it in one take, then split it across your clips when you edit.</p>
                </Card>
              )}

              {negativePrompt && (
                <Card className="p-5 sm:p-6">
                  <div className="flex items-center justify-between gap-3">
                    <p className="flex items-center gap-2 text-[15px] font-semibold text-zinc-900"><Icon name="ban" className="h-4 w-4 text-zinc-400" /> Negative prompt</p>
                    <CopyButton text={negativePrompt} />
                  </div>
                  <p className="mt-1 text-sm text-zinc-500">Paste this into every tool that has a negative prompt box.</p>
                  <p className="mt-3 text-sm leading-6 text-zinc-600">{negativePrompt}</p>
                </Card>
              )}

              <a
                href="https://higgsfield.ai"
                target="_blank"
                rel="noopener noreferrer"
                className={cx('flex items-center justify-center gap-2 rounded-3xl bg-ink p-5 text-[15px] font-semibold text-white transition hover:bg-ink-soft')}
              >
                <Icon name="rocket" className="h-5 w-5 text-brand-400" /> Open Higgsfield to generate your videos
                <Icon name="externalLink" className="h-4 w-4 text-zinc-500" />
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
