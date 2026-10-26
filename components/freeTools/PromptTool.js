import { useEffect, useRef, useState } from 'react';
import CopyButton from './CopyButton';
import { signupHref } from './links';

const TURNSTILE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;

const LOCKED_FILLER = 'Medium close-up, slow push-in. The same character from scene one turns toward the light as the room behind them shifts. Warm side light, soft shadows, a quiet hum in the background. She says a short line and holds the moment.';

function downloadTxt(filename, text) {
  const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function promptPack({ scenes, modelLabel, totalScenes, brandLine }) {
  const line = '='.repeat(56);
  const parts = [
    line,
    'SCRIPTSEA | AI video prompt pack',
    `Model: ${modelLabel}`,
    line,
    '',
  ];
  scenes.forEach((s) => {
    parts.push(scenes.length > 1 || totalScenes > 1 ? `SCENE ${s.number}${s.title ? `: ${s.title}` : ''}` : (s.title || 'Prompt'), '', s.prompt, '', '-'.repeat(56), '');
  });
  if (totalScenes > scenes.length) {
    parts.push(`${totalScenes - scenes.length} more scene${totalScenes - scenes.length === 1 ? '' : 's'} in this script. Unlock every scene free at https://www.scriptsea.com/register`, '');
  }
  parts.push(line, `Made with ScriptSea. ${brandLine}`, '3 free scripts, no card: https://www.scriptsea.com', line, '');
  return parts.join('\n');
}

function slugify(s) {
  return (s || 'prompt').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 40) || 'prompt';
}

// Lazy-load Turnstile on first interaction so pages stay light.
function useTurnstile() {
  const holder = useRef(null);
  const widget = useRef(null);
  const token = useRef(null);
  const started = useRef(false);

  const start = () => {
    if (!TURNSTILE_KEY || started.current || typeof window === 'undefined') return;
    started.current = true;
    const render = () => {
      if (!holder.current || !window.turnstile) return;
      widget.current = window.turnstile.render(holder.current, {
        sitekey: TURNSTILE_KEY,
        appearance: 'interaction-only',
        callback: (t) => { token.current = t; },
        'expired-callback': () => { token.current = null; },
        'error-callback': () => { token.current = null; },
      });
    };
    if (window.turnstile) { render(); return; }
    const s = document.createElement('script');
    s.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';
    s.async = true;
    s.onload = render;
    document.head.appendChild(s);
  };

  const getToken = async () => {
    if (!TURNSTILE_KEY) return null;
    start();
    for (let i = 0; i < 40 && !token.current; i += 1) {
      // eslint-disable-next-line no-await-in-loop
      await new Promise((r) => setTimeout(r, 250));
    }
    return token.current;
  };

  const reset = () => {
    token.current = null;
    if (window.turnstile && widget.current !== null) {
      try { window.turnstile.reset(widget.current); } catch { /* ignore */ }
    }
  };

  return { holder, start, getToken, reset };
}

function Spinner() {
  return <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" aria-hidden />;
}

export default function PromptTool({
  slug, picker, defaultModel, defaultMode = 'generate', pickerOpen = false, placeholder,
  styleOptions, soundOptions, maxInput, dailyLimit, brandLine,
}) {
  const [model, setModel] = useState(defaultModel);
  const current = picker.find((m) => m.id === model) || picker[0];
  const [variant, setVariant] = useState(current.variants ? current.variants[0].id : null);
  const [mode, setMode] = useState(defaultMode);
  const [input, setInput] = useState('');
  const [style, setStyle] = useState('auto');
  const [seconds, setSeconds] = useState('');
  const [sound, setSound] = useState('auto');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [limitHit, setLimitHit] = useState(false);
  const [result, setResult] = useState(null);
  const [remaining, setRemaining] = useState(null);
  const turnstile = useTurnstile();
  const resultRef = useRef(null);

  useEffect(() => {
    const m = picker.find((x) => x.id === model);
    setVariant(m?.variants ? m.variants[0].id : null);
    if (seconds && m && !m.lengths.includes(Number(seconds))) setSeconds('');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [model]);

  const modelLabel = current.variants
    ? `${current.variants.find((v) => v.id === variant)?.label || ''} in ${current.label}`
    : current.label;

  async function submit(e) {
    e.preventDefault();
    if (loading) return;
    const text = input.trim();
    if (text.length < 3) {
      setError(mode === 'improve' ? 'Paste the prompt you want to fix first.' : 'Describe your idea first. A sentence is enough.');
      return;
    }
    setLoading(true);
    setError('');
    setLimitHit(false);
    try {
      const turnstileToken = await turnstile.getToken();
      const res = await fetch('/api/free-tools/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ model, variant, mode, input: text, style, seconds, sound, page: slug, turnstileToken }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        if (data.code === 'limit') { setLimitHit(true); setRemaining(0); }
        setError(data.error || 'Something went wrong. Please try again.');
        return;
      }
      setResult({ ...data, modelLabel });
      setRemaining(typeof data.remaining === 'number' ? data.remaining : null);
      setTimeout(() => resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 50);
    } catch {
      setError('We couldn’t reach the server. Check your connection and try again.');
    } finally {
      turnstile.reset();
      setLoading(false);
    }
  }

  const count = input.length;
  const label = mode === 'improve' ? 'Paste a prompt that gave you a bad result' : 'Describe your idea, a scene, or paste your script';
  const ph = mode === 'improve'
    ? 'e.g. cinematic video of a woman drinking coffee, beautiful lighting, camera moves around her'
    : (placeholder || 'e.g. A barista pours latte art in a cosy café at sunrise, then smiles at the viewer');

  const tabBtn = (id, text) => (
    <button
      type="button"
      role="tab"
      aria-selected={mode === id}
      onClick={() => { setMode(id); setError(''); }}
      className={`flex-1 rounded-xl px-4 py-2.5 text-sm font-semibold transition ${mode === id ? 'bg-white text-zinc-950 shadow-sm' : 'text-zinc-500 hover:text-zinc-800'}`}
    >
      {text}
    </button>
  );

  return (
    <div>
      <form onSubmit={submit} onFocus={turnstile.start} className="rounded-3xl bg-white p-4 shadow-[0_10px_40px_rgba(15,15,20,0.08)] ring-1 ring-zinc-200 sm:p-6">
        {/* Model picker */}
        <div className="mb-4">
          <label htmlFor="ft-model" className="mb-1.5 block text-sm font-semibold text-zinc-800">Video model</label>
          {pickerOpen ? (
            <div id="ft-model" role="radiogroup" aria-label="Video model" className="flex flex-wrap gap-2">
              {picker.map((m) => (
                <button
                  key={m.id}
                  type="button"
                  role="radio"
                  aria-checked={model === m.id}
                  onClick={() => setModel(m.id)}
                  className={`rounded-full px-3.5 py-1.5 text-sm font-medium ring-1 transition ${model === m.id ? 'bg-brand-500 text-white ring-brand-500' : 'bg-white text-zinc-700 ring-zinc-200 hover:ring-brand-300'}`}
                >
                  {m.label}
                </button>
              ))}
            </div>
          ) : (
            <select
              id="ft-model"
              value={model}
              onChange={(e) => setModel(e.target.value)}
              className="w-full rounded-xl border-0 bg-zinc-50 px-3 py-2.5 text-[15px] font-medium text-zinc-900 ring-1 ring-zinc-200 focus:ring-2 focus:ring-brand-500"
            >
              {picker.map((m) => <option key={m.id} value={m.id}>{m.label}</option>)}
            </select>
          )}
          {current.variants && (
            <div className="mt-3">
              <p className="mb-1.5 text-sm font-semibold text-zinc-800">Which model in {current.label}?</p>
              <div role="radiogroup" className="inline-flex rounded-xl bg-zinc-100 p-1">
                {current.variants.map((v) => (
                  <button
                    key={v.id}
                    type="button"
                    role="radio"
                    aria-checked={variant === v.id}
                    onClick={() => setVariant(v.id)}
                    className={`rounded-lg px-4 py-1.5 text-sm font-semibold transition ${variant === v.id ? 'bg-white text-zinc-950 shadow-sm' : 'text-zinc-500'}`}
                  >
                    {v.label}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Mode tabs */}
        <div role="tablist" aria-label="Mode" className="mb-4 flex gap-1 rounded-2xl bg-zinc-100 p-1">
          {tabBtn('generate', 'Generate')}
          {tabBtn('improve', 'Improve')}
        </div>

        <label htmlFor="ft-input" className="mb-1.5 block text-sm font-semibold text-zinc-800">{label}</label>
        <textarea
          id="ft-input"
          value={input}
          onChange={(e) => setInput(e.target.value.slice(0, maxInput))}
          maxLength={maxInput}
          rows={mode === 'improve' ? 5 : 6}
          placeholder={ph}
          className="block w-full resize-y rounded-2xl border-0 bg-zinc-50 px-4 py-3 text-[15px] leading-relaxed text-zinc-900 ring-1 ring-zinc-200 placeholder:text-zinc-400 focus:ring-2 focus:ring-brand-500"
        />
        <div className="mt-1.5 flex justify-between text-xs text-zinc-500">
          <span>{mode === 'generate' ? 'Paste a full script and we split it into scenes.' : 'We keep your idea and fix how it’s written.'}</span>
          <span className={count > maxInput * 0.95 ? 'font-semibold text-brand-600' : ''}>{count.toLocaleString()} / {maxInput.toLocaleString()}</span>
        </div>

        {/* Optional settings */}
        <details className="group mt-4 rounded-2xl bg-zinc-50 ring-1 ring-zinc-200">
          <summary className="flex cursor-pointer list-none items-center justify-between px-4 py-3 text-sm font-semibold text-zinc-700">
            Optional settings
            <span className="text-zinc-400 transition group-open:rotate-180" aria-hidden>▾</span>
          </summary>
          <div className="grid gap-3 px-4 pb-4 sm:grid-cols-3">
            <label className="block text-sm">
              <span className="mb-1 block font-medium text-zinc-600">Style</span>
              <select value={style} onChange={(e) => setStyle(e.target.value)} className="w-full rounded-xl border-0 bg-white px-3 py-2 ring-1 ring-zinc-200 focus:ring-2 focus:ring-brand-500">
                {styleOptions.map((o) => <option key={o.id} value={o.id}>{o.label}</option>)}
              </select>
            </label>
            <label className="block text-sm">
              <span className="mb-1 block font-medium text-zinc-600">Clip length</span>
              <select value={seconds} onChange={(e) => setSeconds(e.target.value)} className="w-full rounded-xl border-0 bg-white px-3 py-2 ring-1 ring-zinc-200 focus:ring-2 focus:ring-brand-500">
                <option value="">Auto</option>
                {current.lengths.map((l) => <option key={l} value={l}>{l} seconds</option>)}
              </select>
            </label>
            <label className="block text-sm">
              <span className="mb-1 block font-medium text-zinc-600">Sound</span>
              <select value={sound} onChange={(e) => setSound(e.target.value)} className="w-full rounded-xl border-0 bg-white px-3 py-2 ring-1 ring-zinc-200 focus:ring-2 focus:ring-brand-500">
                {soundOptions.map((o) => <option key={o.id} value={o.id}>{o.label}</option>)}
              </select>
            </label>
          </div>
        </details>

        <div ref={turnstile.holder} className="mt-3 empty:hidden" />

        <button
          type="submit"
          disabled={loading}
          className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl bg-brand-500 px-6 py-3.5 text-base font-bold text-white shadow-[0_8px_24px_rgba(255,51,102,0.3)] transition hover:bg-brand-600 disabled:opacity-70"
        >
          {loading ? <><Spinner /> {mode === 'improve' ? 'Fixing your prompt…' : 'Writing your prompt…'}</> : (mode === 'improve' ? 'Improve my prompt' : 'Generate prompt')}
        </button>
        <p className="mt-2 text-center text-xs text-zinc-500">
          Free, no signup. {remaining === null ? `${dailyLimit} prompts a day.` : `${remaining} of ${dailyLimit} free prompts left today.`}
        </p>

        {error && !limitHit && (
          <p role="alert" className="mt-3 rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-700 ring-1 ring-red-100">{error}</p>
        )}
        {limitHit && (
          <div role="alert" className="mt-4 rounded-2xl bg-brand-50 p-5 text-center ring-1 ring-brand-200">
            <p className="text-[15px] font-semibold text-zinc-900">{error}</p>
            <a href={signupHref(slug, 'daily-limit')} className="mt-3 inline-flex rounded-xl bg-brand-500 px-5 py-2.5 text-sm font-bold text-white hover:bg-brand-600">
              Sign up free
            </a>
          </div>
        )}
      </form>

      {result && (
        <div ref={resultRef} className="mt-6 scroll-mt-24 space-y-4" aria-live="polite">
          {result.totalScenes > 1 && (
            <p className="text-center text-[15px] font-semibold text-zinc-800">
              {result.totalScenes} scenes found. {result.unlocked.length} unlocked.
            </p>
          )}

          {result.unlocked.map((s) => (
            <div key={s.number} className="rounded-3xl bg-white p-5 ring-1 ring-zinc-200 sm:p-6">
              <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                <p className="text-xs font-bold uppercase tracking-wider text-brand-600">
                  {result.totalScenes > 1 ? `Scene ${s.number}` : `${result.modelLabel} prompt`}
                  {s.title ? <span className="ml-2 font-semibold normal-case tracking-normal text-zinc-500">{s.title}</span> : null}
                </p>
                <div className="flex gap-2">
                  <CopyButton text={s.prompt} />
                  <button
                    type="button"
                    onClick={() => downloadTxt(`scriptsea-${slugify(s.title)}.txt`, promptPack({ scenes: [s], modelLabel: result.modelLabel, totalScenes: 1, brandLine }))}
                    className="rounded-lg bg-zinc-100 px-3 py-1.5 text-sm font-semibold text-zinc-700 hover:bg-zinc-200"
                  >
                    Export
                  </button>
                </div>
              </div>
              <p className="whitespace-pre-wrap text-[15px] leading-relaxed text-zinc-800">{s.prompt}</p>
            </div>
          ))}

          {result.changes?.length > 0 && (
            <div className="rounded-3xl bg-zinc-50 p-5 ring-1 ring-zinc-200 sm:p-6">
              <p className="mb-2 text-sm font-bold text-zinc-900">What changed</p>
              <ul className="list-disc space-y-1.5 pl-5 text-[15px] text-zinc-700">
                {result.changes.map((c, i) => <li key={i}>{c}</li>)}
              </ul>
            </div>
          )}

          {result.locked.map((s) => (
            <div key={s.number} className="relative overflow-hidden rounded-3xl bg-white p-5 ring-1 ring-zinc-200 sm:p-6">
              <p className="mb-3 text-xs font-bold uppercase tracking-wider text-zinc-400">
                Scene {s.number}<span className="ml-2 font-semibold normal-case tracking-normal">{s.title}</span>
              </p>
              <p aria-hidden className="select-none text-[15px] leading-relaxed text-zinc-800 blur-[6px]">{LOCKED_FILLER}</p>
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-white/40 p-4 text-center">
                <span className="text-2xl" aria-hidden>🔒</span>
                <a href={signupHref(slug, 'locked-scene')} className="rounded-xl bg-zinc-950 px-5 py-2.5 text-sm font-bold text-white hover:bg-zinc-800">
                  Unlock all scenes free on ScriptSea
                </a>
              </div>
            </div>
          ))}

          {result.unlocked.length > 1 && (
            <div className="flex flex-wrap justify-center gap-2">
              <CopyButton
                label="Copy all"
                text={result.unlocked.map((s) => `Scene ${s.number}: ${s.prompt}`).join('\n\n')}
                className="rounded-xl px-4 py-2"
              />
              <button
                type="button"
                onClick={() => downloadTxt('scriptsea-prompt-pack.txt', promptPack({ scenes: result.unlocked, modelLabel: result.modelLabel, totalScenes: result.totalScenes, brandLine }))}
                className="rounded-xl bg-zinc-100 px-4 py-2 text-sm font-semibold text-zinc-700 hover:bg-zinc-200"
              >
                Export prompt pack
              </button>
            </div>
          )}

          <div className="rounded-3xl bg-zinc-950 p-6 text-white sm:p-7">
            <p className="text-[15px] leading-relaxed text-zinc-200">
              {result.totalScenes > 1
                ? `That's ${result.unlocked.length} of ${result.totalScenes} scenes. ScriptSea writes every scene with the same character in every shot, and can write the script for you too, with a scroll-stopping hook. 3 free scripts, no card.`
                : 'That’s one scene. A real video needs 6–10 scenes with the same character in every shot. ScriptSea turns one idea into a full script with a scroll-stopping hook and a ready prompt for every scene. 3 free scripts, no card.'}
            </p>
            <a href={signupHref(slug, 'under-result')} className="mt-4 inline-flex rounded-xl bg-brand-500 px-5 py-3 text-sm font-bold text-white hover:bg-brand-600">
              Try ScriptSea free
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
