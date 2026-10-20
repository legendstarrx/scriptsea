import { useEffect, useMemo, useRef, useState } from 'react';
import { toast } from 'react-hot-toast';
import { PageHeader } from './AppShell';
import { Alert, Badge, Button, Card, Chip, FieldLabel, Icon, OptionCard, TextArea, TextInput, cx } from '../ui';
import { creatorStyles } from '../../lib/app/creatorStyles';
import { generateScript } from '../../lib/app/aiClient';
import { looksLikeVideoLink, resolveVideoLink } from '../../lib/app/videoLink';
import { countWords, exportScriptPDF, exportScriptWord, parseScript, readTime, scriptToPlainText } from '../../lib/app/scriptText';
import { useSpeechInput } from '../../lib/app/useSpeechInput';

const SHORT_LENGTHS = [{ val: '15 sec', label: '15s' }, { val: '30 sec', label: '30s' }, { val: '60 sec', label: '60s' }];
// UGC story ads often run 90s-2min on Facebook and YouTube.
const AD_LENGTHS = [...SHORT_LENGTHS, { val: '90 sec', label: '90s' }, { val: '2 min', label: '2 min' }];
const LONG_LENGTHS = ['5 min', '10 min', '15 min', '20 min', '30 min', '45 min', '60 min'];
const FREE_LENGTHS = ['15 sec', '30 sec'];
const PLATFORMS = [
  { id: 'youtube', label: 'YouTube', icon: 'youtube' },
  { id: 'tiktok', label: 'TikTok', icon: 'tiktok' },
  { id: 'instagram', label: 'Instagram', icon: 'instagram' },
  { id: 'facebook', label: 'Facebook', icon: 'facebook' },
];
const TONES = [
  { id: 'auto', label: 'Auto' }, { id: 'casual', label: 'Casual' }, { id: 'funny', label: 'Funny' }, { id: 'informative', label: 'Informative' },
  { id: 'inspirational', label: 'Inspirational' }, { id: 'bold', label: 'Bold' }, { id: 'creative', label: 'Creative' },
];
const FORMATS = [
  { id: 'auto', label: 'Best for my topic' }, { id: 'story', label: 'Story' }, { id: 'list', label: 'Numbered list' },
  { id: 'explainer', label: 'Explainer' }, { id: 'myth', label: 'Myth-busting' }, { id: 'opinion', label: 'Hot take' },
  { id: 'personal', label: 'My experience' },
];
const AD_ANGLES = [
  { id: 'auto', label: 'Best for my product' }, { id: 'problem', label: 'Problem → solution' },
  { id: 'testimonial', label: 'Customer story' }, { id: 'before_after', label: 'Before & after' },
  { id: 'comparison', label: 'Us vs the usual way' }, { id: 'demo', label: 'Show it working' },
  { id: 'founder', label: 'Founder story' }, { id: 'myth', label: 'Myth-busting' },
];
const AWARENESS = [
  { id: 'cold', title: 'Cold', desc: 'Never heard of you', icon: 'user' },
  { id: 'warm', title: 'Warm', desc: 'Knows the problem', icon: 'zap' },
  { id: 'hot', title: 'Hot', desc: 'Knows your brand', icon: 'crown' },
];
const EXAMPLES = [
  'Why most people quit their side hustle in month 2',
  'The real reason you wake up tired',
  '3 things nobody tells you before moving abroad',
];
const MODE = {
  viral: {
    title: 'Script Writer',
    subtitle: 'Turn any idea into a script people watch to the end.',
    cta: 'Write my script',
    empty: 'Tell us what the video is about, pick a length, and hit write. It takes about 30 seconds.',
    loading: [
      'Finding a hook that stops the scroll…',
      'Opening a loop they need closed…',
      'Cutting every word that doesn’t earn its place…',
      'Matching the length to the second…',
      'Making it sound like a real person…',
    ],
  },
  ad: {
    title: 'Ad Scripts',
    subtitle: 'UGC and video ads that sound like a real customer, built to sell.',
    cta: 'Write my ad',
    empty: 'Paste your product link (or describe it) and pick a length. You’ll get the ad, three hooks to test, and the on-screen text.',
    loading: [
      'Reading your product and its reviews…',
      'Finding the pain that makes people stop…',
      'Matching the hook to how warm your audience is…',
      'Turning features into reasons to buy…',
      'Answering the biggest objection…',
      'Writing a call to action that feels natural…',
    ],
  },
};

function useRotatingLine(active, lines) {
  const [i, setI] = useState(0);
  useEffect(() => {
    if (!active) { setI(0); return undefined; }
    const t = setInterval(() => setI((n) => (n + 1) % lines.length), 2600);
    return () => clearInterval(t);
  }, [active, lines.length]);
  return lines[i];
}

function SectionTitle({ step, children, hint }) {
  return (
    <div className="mb-3 flex items-center gap-2.5">
      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-zinc-900 text-xs font-bold text-white">{step}</span>
      <span className="text-[15px] font-semibold text-zinc-900">{children}</span>
      {hint && <span className="text-sm text-zinc-400">{hint}</span>}
    </div>
  );
}

// ── Output states ─────────────────────────────────────────────────────────────
function EmptyOutput({ mode }) {
  const pills = mode === 'ad'
    ? [['zap', 'Scroll-stopping hook'], ['shield', 'Real proof only'], ['arrowRight', 'Natural call to action']]
    : [['zap', 'Hook first'], ['clock', 'Exact length'], ['user', 'Sounds human']];
  return (
    <Card className="flex min-h-[420px] flex-col items-center justify-center p-8 text-center lg:min-h-[640px]">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white text-brand-500 shadow-lift ring-1 ring-zinc-100">
        <Icon name={mode === 'ad' ? 'megaphone' : 'script'} className="h-8 w-8" />
      </div>
      <h2 className="mt-6 text-xl font-bold text-zinc-950">{mode === 'ad' ? 'Your ad shows up here' : 'Your script shows up here'}</h2>
      <p className="mt-2 max-w-sm text-[15px] leading-relaxed text-zinc-500">{MODE[mode].empty}</p>
      <div className="mt-8 flex flex-wrap justify-center gap-2.5">
        {pills.map(([icon, label]) => (
          <div key={label} className="flex items-center gap-2 whitespace-nowrap rounded-full bg-zinc-50 px-3.5 py-2 text-sm font-medium text-zinc-600 ring-1 ring-zinc-200/70">
            <Icon name={icon} className="h-4 w-4 text-brand-500" /> {label}
          </div>
        ))}
      </div>
    </Card>
  );
}

function LoadingOutput({ mode }) {
  const line = useRotatingLine(true, MODE[mode].loading);
  return (
    <Card className="min-h-[420px] p-6 sm:p-8 lg:min-h-[640px]">
      <div className="flex items-center gap-3 text-sm font-semibold text-brand-600">
        <span className="relative flex h-3 w-3">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-brand-400 opacity-75" />
          <span className="relative inline-flex h-3 w-3 rounded-full bg-brand-500" />
        </span>
        {line}
      </div>
      <div className="mt-8 space-y-4">
        <div className="h-7 w-3/4 rounded-xl bg-zinc-100" />
        <div className="space-y-3 pt-4">
          {[100, 95, 88, 97, 70, 92, 84, 60].map((w, i) => (
            <div key={i} className="h-4 animate-shimmer rounded-lg bg-gradient-to-r from-zinc-100 via-zinc-50 to-zinc-100 bg-[length:400px_100%]" style={{ width: `${w}%` }} />
          ))}
        </div>
      </div>
    </Card>
  );
}

function ScriptBody({ body }) {
  // Highlight the first sentence: that's the hook.
  const paragraphs = body.split(/\n+/).filter(Boolean);
  const first = paragraphs[0] || '';
  const m = first.match(/^(.+?[.!?])(\s|$)([\s\S]*)$/);
  const hook = m ? m[1] : first;
  const rest = m ? m[3] : '';
  return (
    <div className="space-y-4 text-[17px] leading-8 text-zinc-800">
      <p>
        <span className="rounded-md bg-brand-50 px-1 py-0.5 font-medium text-zinc-950 ring-1 ring-brand-100">{hook}</span>
        {rest && ` ${rest}`}
      </p>
      {paragraphs.slice(1).map((p, i) => <p key={i}>{p}</p>)}
    </div>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────
export default function ScriptStudio({ mode = 'viral', isProUser, onUpgrade, onSendToPrompts, refreshUserProfile }) {
  const isAd = mode === 'ad';
  const copy = MODE[mode];

  // viral fields
  const [videoTopic, setVideoTopic] = useState('');
  const [viralReference, setViralReference] = useState('');
  const [format, setFormat] = useState('auto');
  const [selectedCreator, setSelectedCreator] = useState('');
  const [videoInfo, setVideoInfo] = useState(null);
  const [isProcessingVideo, setIsProcessingVideo] = useState(false);
  // ad fields
  const [productUrl, setProductUrl] = useState('');
  const [product, setProduct] = useState('');
  const [audience, setAudience] = useState('');
  const [proof, setProof] = useState('');
  const [angle, setAngle] = useState('auto');
  const [awareness, setAwareness] = useState('cold');
  // shared
  const [selectedTone, setSelectedTone] = useState('auto');
  const [showMore, setShowMore] = useState(false);
  const [selectedPlatform, setSelectedPlatform] = useState(isAd ? 'tiktok' : 'youtube');
  const [duration, setDurationState] = useState(isProUser && !isAd ? '60 sec' : '30 sec');
  const durationTouched = useRef(false);
  const setDuration = (val) => { durationTouched.current = true; setDurationState(val); };

  const [rawScript, setRawScript] = useState('');
  const [usedSettings, setUsedSettings] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(null);
  const [exportOpen, setExportOpen] = useState(false);
  const outputRef = useRef(null);
  const exportRef = useRef(null);

  const speech = useSpeechInput({
    onResult: (text) => { (isAd ? setProduct : setVideoTopic)(text); setError(''); },
    onError: (msg) => setError(msg),
  });

  // Plan status can arrive after mount; give Pro users the 60s default unless they picked one.
  useEffect(() => {
    if (isProUser && !isAd && !durationTouched.current) setDurationState('60 sec');
  }, [isProUser, isAd]);

  const script = useMemo(() => (rawScript ? parseScript(rawScript) : null), [rawScript]);
  const words = script ? countWords(script.body) : 0;
  const lengthLocked = !isProUser && !FREE_LENGTHS.includes(duration);

  useEffect(() => {
    if (!exportOpen) return undefined;
    const close = (e) => { if (!exportRef.current?.contains(e.target)) setExportOpen(false); };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, [exportOpen]);

  const processVideoLink = async (link) => {
    if (!link) return null;
    try {
      setIsProcessingVideo(true);
      const video = await resolveVideoLink(link);
      if (video) {
        setVideoInfo(video);
        // Auto-fill the topic from the video title only when the user hasn't typed one
        if (video.title && !videoTopic.trim()) setVideoTopic(video.title);
      }
      return video;
    } catch (err) {
      console.error('Error processing video link:', err);
      return null;
    } finally {
      setIsProcessingVideo(false);
    }
  };

  const scrollToOutput = () => {
    if (typeof window !== 'undefined' && window.innerWidth < 1024) {
      requestAnimationFrame(() => outputRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }));
    }
  };

  const handleGenerate = async () => {
    let settings;
    if (isAd) {
      if (!product.trim() && !productUrl.trim()) { setError('Paste your product link or tell us what you’re selling.'); return; }
      settings = { mode: 'ad', url: productUrl.trim(), product, audience, proof, angle, awareness };
    } else {
      // Use what the user typed, or fall back to the reference video's title
      let topic = videoTopic.trim();
      let reference = videoInfo;
      if (viralReference.trim() && (!reference || reference.url !== viralReference.trim())) {
        reference = await processVideoLink(viralReference.trim());
      }
      if (!topic && reference?.title) { topic = reference.title; setVideoTopic(reference.title); }
      if (!topic) {
        setError('Tell us what your video is about (or paste a YouTube/TikTok link to use its title).');
        return;
      }
      const creator = selectedCreator
        ? (creatorStyles[selectedPlatform] || []).find((c) => c.name === selectedCreator) || null
        : null;
      settings = {
        mode: 'viral', topic, format, creator,
        reference: reference ? { title: reference.title, author: reference.author, platform: reference.platform, url: reference.url } : null,
      };
    }
    // Free users: 15s and 30s only
    if (lengthLocked) { onUpgrade(); return; }

    try {
      setIsGenerating(true);
      setError('');
      scrollToOutput();
      const text = await generateScript({ ...settings, duration, platform: selectedPlatform, tone: selectedTone });
      setRawScript(text);
      setUsedSettings({ platform: selectedPlatform, duration, tone: selectedTone });
      setCopied(null);
      refreshUserProfile?.().catch(() => {});
    } catch (err) {
      console.error('Generation error:', err);
      if (err?.code === 'limit_reached') onUpgrade();
      else setError(err?.message || 'Something went wrong. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const copyText = async (text, key, label = 'Copied') => {
    // Free users must upgrade to copy and use their scripts
    if (!isProUser) {
      onUpgrade();
      toast('Upgrade to Pro to copy and use your scripts.', { icon: '🔒' });
      return;
    }
    try {
      await navigator.clipboard.writeText(text);
      setCopied(key);
      toast.success(label);
      setTimeout(() => setCopied(null), 2000);
    } catch {
      toast.error('Could not copy. Please try again.');
    }
  };

  const handleExport = async (kind) => {
    setExportOpen(false);
    const meta = { ...script, ...(usedSettings || { platform: selectedPlatform, duration, tone: selectedTone }) };
    try {
      if (kind === 'pdf') await exportScriptPDF(meta);
      else await exportScriptWord(meta);
    } catch (err) {
      console.error('Export error:', err);
      toast.error('Export failed. Please try again.');
    }
  };

  const handleNew = () => {
    setVideoTopic(''); setViralReference(''); setVideoInfo(null);
    setProductUrl(''); setProduct(''); setAudience(''); setProof('');
    setRawScript(''); setUsedSettings(null); setError('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const micButton = speech.supported && (
    <button
      type="button"
      onClick={speech.toggle}
      title={speech.isRecording ? 'Stop recording' : 'Speak instead of typing'}
      className={cx(
        'absolute bottom-3 right-3 flex h-9 items-center gap-1.5 rounded-xl px-3 text-sm font-semibold transition',
        speech.isRecording ? 'bg-brand-500 text-white' : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'
      )}
    >
      <Icon name="mic" className="h-4 w-4" />
      {speech.isRecording ? 'Listening…' : 'Speak'}
    </button>
  );

  let step = 0;
  const next = () => String(++step);

  return (
    <div className="mx-auto max-w-[1400px] px-4 py-6 sm:px-6 lg:px-10 lg:py-10">
      <PageHeader
        title={copy.title}
        subtitle={copy.subtitle}
        right={script && !isGenerating && <Button variant="secondary" icon="plus" onClick={handleNew}>{isAd ? 'New ad' : 'New script'}</Button>}
      />

      <div className="mt-6 grid items-start gap-6 lg:mt-8 lg:grid-cols-[minmax(0,460px)_minmax(0,1fr)] xl:gap-8">
        {/* ── Form ─────────────────────────────────────────────────── */}
        <Card className="p-5 sm:p-6">
          <div className="space-y-7">
            {isAd ? (
              <div>
                <SectionTitle step={next()}>Your product</SectionTitle>
                <div className="relative">
                  <Icon name="link" className="pointer-events-none absolute left-4 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-zinc-400" />
                  <TextInput
                    value={productUrl}
                    onChange={(e) => setProductUrl(e.target.value)}
                    placeholder="Paste your product page link"
                    className="pl-11"
                    inputMode="url"
                  />
                </div>
                <p className="mt-2 text-[13px] text-zinc-500">We read your page for the product, price, offer and real reviews.</p>
                <div className="relative mt-3">
                  <TextArea
                    value={product}
                    onChange={(e) => setProduct(e.target.value)}
                    rows={3}
                    placeholder={productUrl.trim()
                      ? 'Anything to add? (optional)'
                      : 'No link? Describe it: what it is, what it does, the price.\ne.g. GlowDrop vitamin C serum. Fades dark spots in about 2 weeks. $24.'}
                    className="pb-12"
                  />
                  {micButton}
                </div>
              </div>
            ) : (
              <div>
                <SectionTitle step={next()}>What&apos;s your video about?</SectionTitle>
                <div className="relative">
                  <TextArea
                    value={videoTopic}
                    onChange={(e) => setVideoTopic(e.target.value)}
                    rows={4}
                    placeholder="A product, a story, a tip… one line is enough."
                    className="pb-12"
                  />
                  {micButton}
                </div>
                {!videoTopic && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {EXAMPLES.map((ex) => (
                      <button key={ex} type="button" onClick={() => setVideoTopic(ex)}
                        className="rounded-full bg-zinc-50 px-3 py-1.5 text-left text-[13px] text-zinc-600 ring-1 ring-zinc-200 transition hover:bg-white hover:text-zinc-900">
                        {ex}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            <div>
              <SectionTitle step={next()}>How long?</SectionTitle>
              {!isAd && <p className="mb-2 text-xs font-medium uppercase tracking-wider text-zinc-400">Short video</p>}
              <div className="flex flex-wrap gap-2">
                {(isAd ? AD_LENGTHS : SHORT_LENGTHS).map(({ val, label }) => (
                  <Chip key={val} active={duration === val} locked={!isProUser && !FREE_LENGTHS.includes(val)} onClick={() => setDuration(val)}>{label}</Chip>
                ))}
              </div>
              {!isAd && (
                <>
                  <p className="mb-2 mt-4 text-xs font-medium uppercase tracking-wider text-zinc-400">Long video</p>
                  <div className="flex flex-wrap gap-2">
                    {LONG_LENGTHS.map((val) => (
                      <Chip key={val} active={duration === val} locked={!isProUser} onClick={() => setDuration(val)}>{val}</Chip>
                    ))}
                  </div>
                </>
              )}
              {lengthLocked && (
                <button type="button" onClick={onUpgrade}
                  className="mt-3 flex w-full items-center gap-2 rounded-2xl bg-brand-50 px-4 py-3 text-left text-sm text-brand-700 ring-1 ring-brand-100">
                  <Icon name="lock" className="h-4 w-4 shrink-0" />
                  <span>The free plan covers 15s and 30s. <strong className="underline">Go Pro</strong> for every length.</span>
                </button>
              )}
            </div>

            <div>
              <SectionTitle step={next()}>Where will it run?</SectionTitle>
              <div className="grid grid-cols-2 gap-2">
                {PLATFORMS.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => { setSelectedPlatform(p.id); setSelectedCreator(''); }}
                    aria-pressed={selectedPlatform === p.id}
                    className={cx(
                      'flex h-12 items-center gap-2.5 rounded-xl px-3.5 text-sm font-semibold transition',
                      selectedPlatform === p.id ? 'bg-ink text-white' : 'bg-white text-zinc-700 ring-1 ring-inset ring-zinc-200 hover:bg-zinc-50'
                    )}
                  >
                    <Icon name={p.icon} className="h-[18px] w-[18px]" /> {p.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Optional settings: everything here defaults to Auto. */}
            <div className="rounded-2xl ring-1 ring-zinc-200">
              <button type="button" onClick={() => setShowMore((v) => !v)} aria-expanded={showMore}
                className="flex w-full items-center justify-between gap-3 px-4 py-3.5 text-left">
                <span>
                  <span className="block text-sm font-semibold text-zinc-900">More options</span>
                  <span className="block text-[13px] text-zinc-500">
                    {isAd ? 'Audience, proof, angle. All on Auto.' : 'Format, tone, a video to copy, creator style. All on Auto.'}
                  </span>
                </span>
                <Icon name="chevronDown" className={cx('h-5 w-5 shrink-0 text-zinc-400 transition', showMore && 'rotate-180')} />
              </button>

              {showMore && (
                <div className="space-y-6 border-t border-zinc-100 px-4 pb-5 pt-5">
                  {isAd ? (
                    <>
                      <div>
                        <FieldLabel>Who is it for?</FieldLabel>
                        <TextInput value={audience} onChange={(e) => setAudience(e.target.value)} placeholder="Auto: we work it out from your product" />
                      </div>
                      <div>
                        <FieldLabel>Proof or offer</FieldLabel>
                        <TextInput value={proof} onChange={(e) => setProof(e.target.value)} placeholder="e.g. 4.8 stars from 2,100 reviews, 20% off this week" />
                        <p className="mt-2 text-[13px] text-zinc-400">We only use proof from you or your page. We never make up reviews or discounts.</p>
                      </div>
                      <div>
                        <FieldLabel>Ad angle</FieldLabel>
                        <div className="flex flex-wrap gap-2">
                          {AD_ANGLES.map((a) => <Chip key={a.id} active={angle === a.id} onClick={() => setAngle(a.id)}>{a.label}</Chip>)}
                        </div>
                      </div>
                      <div>
                        <FieldLabel>Who&apos;s watching?</FieldLabel>
                        <div className="grid grid-cols-3 gap-2">
                          {AWARENESS.map((a) => (
                            <button key={a.id} type="button" onClick={() => setAwareness(a.id)} aria-pressed={awareness === a.id}
                              className={cx('rounded-2xl p-3 text-left transition',
                                awareness === a.id ? 'bg-brand-50 ring-2 ring-brand-500' : 'bg-white ring-1 ring-zinc-200 hover:ring-zinc-300')}>
                              <span className="block text-sm font-semibold text-zinc-900">{a.title}</span>
                              <span className="mt-0.5 block text-[12px] leading-snug text-zinc-500">{a.desc}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    </>
                  ) : (
                    <>
                      <div>
                        <FieldLabel>Format</FieldLabel>
                        <div className="flex flex-wrap gap-2">
                          {FORMATS.map((f) => <Chip key={f.id} active={format === f.id} onClick={() => setFormat(f.id)}>{f.label}</Chip>)}
                        </div>
                      </div>
                      <div>
                        <FieldLabel>Tone</FieldLabel>
                        <div className="flex flex-wrap gap-2">
                          {TONES.map((t) => <Chip key={t.id} active={selectedTone === t.id} onClick={() => setSelectedTone(t.id)}>{t.label}</Chip>)}
                        </div>
                      </div>
                      <div>
                        <FieldLabel>Copy the style of a video</FieldLabel>
                        <div className="relative">
                          <Icon name="link" className="pointer-events-none absolute left-4 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-zinc-400" />
                          <TextInput
                            value={viralReference}
                            onChange={(e) => { setViralReference(e.target.value); if (!e.target.value) setVideoInfo(null); }}
                            onBlur={(e) => { const v = e.target.value.trim(); if (looksLikeVideoLink(v)) processVideoLink(v); }}
                            placeholder="Paste a YouTube or TikTok link"
                            className="pl-11"
                          />
                        </div>
                        {isProcessingVideo && (
                          <p className="mt-2 flex items-center gap-2 text-sm text-zinc-500"><Icon name="refresh" className="h-4 w-4 animate-spin" /> Reading the video…</p>
                        )}
                        {videoInfo && !isProcessingVideo && (
                          <div className="mt-3 flex items-center gap-3 rounded-2xl bg-zinc-50 p-3 ring-1 ring-zinc-200/70">
                            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white text-zinc-700 ring-1 ring-zinc-200">
                              <Icon name={videoInfo.platform === 'YouTube' ? 'youtube' : videoInfo.platform === 'TikTok' ? 'tiktok' : 'instagram'} className="h-4 w-4" />
                            </span>
                            <div className="min-w-0 flex-1">
                              <p className="truncate text-sm font-semibold text-zinc-900">{videoInfo.title || `${videoInfo.platform} video`}</p>
                              <p className="truncate text-xs text-zinc-500">{videoInfo.author ? `${videoInfo.author} · ` : ''}We&apos;ll match its hook and pacing</p>
                            </div>
                            <button type="button" onClick={() => { setViralReference(''); setVideoInfo(null); }}
                              className="rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-200 hover:text-zinc-700" aria-label="Remove video">
                              <Icon name="x" className="h-4 w-4" />
                            </button>
                          </div>
                        )}
                      </div>
                      <div>
                        <FieldLabel right={!isProUser && <Badge><Icon name="crown" className="h-3 w-3" />PRO</Badge>}>Write like a creator</FieldLabel>
                        <div className="relative">
                          <select
                            value={selectedCreator}
                            onChange={(e) => isProUser && setSelectedCreator(e.target.value)}
                            disabled={!isProUser}
                            className={cx(
                              'h-12 w-full appearance-none rounded-2xl border-0 bg-white pl-4 pr-10 text-base text-zinc-900 ring-1 ring-inset transition focus:outline-none focus:ring-2 focus:ring-brand-400',
                              selectedCreator ? 'ring-brand-400' : 'ring-zinc-200',
                              !isProUser && 'cursor-not-allowed bg-zinc-50 text-zinc-400'
                            )}
                          >
                            <option value="">No creator style</option>
                            {(creatorStyles[selectedPlatform] || []).map((c) => (
                              <option key={c.name} value={c.name}>{c.name} · {c.description}</option>
                            ))}
                          </select>
                          <Icon name="chevronDown" className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
                          {!isProUser && (
                            <button type="button" onClick={onUpgrade} aria-label="Unlock creator styles"
                              className="absolute inset-0 flex items-center justify-end rounded-2xl pr-11 text-sm font-semibold text-brand-600">
                              Unlock
                            </button>
                          )}
                        </div>
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>

            {error && <Alert onClose={() => setError('')}>{error}</Alert>}

            <div className="space-y-2.5">
              <Button size="lg" className="w-full" icon="sparkles" loading={isGenerating} onClick={handleGenerate}>
                {isGenerating ? 'Writing…' : script ? 'Write it again' : copy.cta}
              </Button>
              {!isProUser && <p className="text-center text-[13px] text-zinc-400">Free plan: 15 and 30 second scripts</p>}
            </div>
          </div>
        </Card>

        {/* ── Output ───────────────────────────────────────────────── */}
        <div ref={outputRef} className="scroll-mt-20 space-y-6">
          {isGenerating ? <LoadingOutput mode={mode} /> : !script ? <EmptyOutput mode={mode} /> : (
            <>
              <Card className="animate-fade-up overflow-hidden">
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-100 px-6 py-4 sm:px-8">
                  <div className="flex flex-wrap items-center gap-2">
                    {isAd && <Badge>Ad</Badge>}
                    {usedSettings && (
                      <>
                        <Badge tone="zinc">{PLATFORMS.find((p) => p.id === usedSettings.platform)?.label || usedSettings.platform}</Badge>
                        <Badge tone="zinc">{usedSettings.duration}</Badge>
                        <Badge tone="zinc">{TONES.find((t) => t.id === usedSettings.tone)?.label || usedSettings.tone}</Badge>
                      </>
                    )}
                  </div>
                  <span className="text-sm text-zinc-500">{words} words · {readTime(words)} read</span>
                </div>

                <div className="px-6 py-7 sm:px-8 sm:py-8">
                  {script.title && (
                    <h2 className="text-2xl font-bold leading-snug tracking-tight text-zinc-950 sm:text-[26px]">{script.title}</h2>
                  )}
                  <p className="mb-5 mt-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-brand-500">
                    <Icon name="zap" className="h-3.5 w-3.5" /> Hook highlighted
                  </p>
                  <ScriptBody body={script.body} />
                </div>

                <div className="flex flex-wrap items-center gap-2 border-t border-zinc-100 bg-zinc-50/60 px-6 py-4 sm:px-8">
                  <Button icon={copied === 'script' ? 'check' : isProUser ? 'copy' : 'lock'}
                    onClick={() => copyText(scriptToPlainText(script), 'script', 'Script copied')}>
                    {copied === 'script' ? 'Copied' : 'Copy script'}
                  </Button>
                  <div className="relative" ref={exportRef}>
                    <Button variant="secondary" icon={isProUser ? 'download' : 'lock'} iconRight="chevronDown"
                      onClick={() => (isProUser ? setExportOpen((o) => !o) : onUpgrade())}>
                      Export
                    </Button>
                    {exportOpen && (
                      <div className="absolute bottom-full left-0 z-20 mb-2 w-48 overflow-hidden rounded-2xl bg-white p-1.5 shadow-lift ring-1 ring-zinc-200 sm:bottom-auto sm:top-full sm:mb-0 sm:mt-2">
                        <button type="button" onClick={() => handleExport('pdf')} className="flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-medium text-zinc-700 hover:bg-zinc-100">
                          <Icon name="script" className="h-4 w-4" /> PDF document
                        </button>
                        <button type="button" onClick={() => handleExport('word')} className="flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-medium text-zinc-700 hover:bg-zinc-100">
                          <Icon name="script" className="h-4 w-4" /> Word document
                        </button>
                      </div>
                    )}
                  </div>
                  <Button variant="ghost" icon="refresh" onClick={handleGenerate}>Regenerate</Button>
                </div>
              </Card>

              {/* Ad extras: hooks to A/B test + on-screen text */}
              {(script.hooks.length > 0 || script.overlay) && (
                <Card className="animate-fade-up p-6 sm:p-8">
                  {script.hooks.length > 0 && (
                    <>
                      <h3 className="flex items-center gap-2 text-[15px] font-semibold text-zinc-900">
                        <Icon name="zap" className="h-4 w-4 text-brand-500" /> 3 more hooks to test
                      </h3>
                      <p className="mt-1 text-sm text-zinc-500">Keep the same ad, swap the first line. The hook decides most of your results.</p>
                      <div className="mt-4 space-y-2.5">
                        {script.hooks.map((hook, i) => (
                          <div key={i} className="flex items-start gap-3 rounded-2xl bg-zinc-50 p-4 ring-1 ring-zinc-200/70">
                            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white text-xs font-bold text-brand-500 ring-1 ring-zinc-200">{i + 1}</span>
                            <p className="flex-1 text-[15px] leading-relaxed text-zinc-800">{hook}</p>
                            <button type="button" onClick={() => copyText(hook, `hook-${i}`, 'Hook copied')}
                              className="rounded-lg p-1.5 text-zinc-400 transition hover:bg-zinc-200 hover:text-zinc-700" aria-label="Copy hook">
                              <Icon name={copied === `hook-${i}` ? 'check' : isProUser ? 'copy' : 'lock'} className="h-4 w-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                  {script.overlay && (
                    <div className={cx(script.hooks.length > 0 && 'mt-6 border-t border-zinc-100 pt-6')}>
                      <h3 className="text-[15px] font-semibold text-zinc-900">On-screen text</h3>
                      <p className="mt-1 text-sm text-zinc-500">For the first two seconds. Most people watch on mute.</p>
                      <p className="mt-3 inline-block rounded-xl bg-ink px-4 py-2.5 text-lg font-bold text-white">{script.overlay}</p>
                    </div>
                  )}
                </Card>
              )}

              {script.facts?.length > 0 && (
                <Card className="animate-fade-up p-6 sm:p-8">
                  <h3 className="flex items-center gap-2 text-[15px] font-semibold text-zinc-900">
                    <Icon name="shield" className="h-4 w-4 text-brand-500" /> What we used from your site
                  </h3>
                  <p className="mt-1 text-sm text-zinc-500">Check these before you run the ad. We only use facts from your page.</p>
                  <ul className="mt-4 space-y-2">
                    {script.facts.map((f, i) => (
                      <li key={i} className="flex items-start gap-2.5 text-[15px] text-zinc-700">
                        <Icon name="check" className="mt-1 h-4 w-4 shrink-0 text-emerald-500" /> {f}
                      </li>
                    ))}
                  </ul>
                </Card>
              )}

              {/* Hand-off to video prompts */}
              <div className="relative overflow-hidden rounded-3xl bg-ink p-6 text-white sm:p-8">
                <div className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-brand-500/30 blur-3xl" />
                <div className="relative flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="flex items-center gap-2 text-sm font-semibold text-brand-300"><Icon name="clapper" className="h-4 w-4" /> Next step</p>
                    <h3 className="mt-1.5 text-xl font-bold">{isAd ? 'Turn this ad into an AI video' : 'Turn this script into an AI video'}</h3>
                    <p className="mt-1 text-[15px] text-zinc-400">Scene-by-scene prompts for Seedance, Kling, Veo and Sora.</p>
                  </div>
                  <Button size="lg" iconRight="arrowRight" className="shrink-0" onClick={() => onSendToPrompts(script.body)}>
                    Make video prompts
                  </Button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
