import { useRef, useState } from 'react';
import CopyButton, { copyText } from '../freeTools/CopyButton';
import { signupHref } from '../freeTools/links';
import useTurnstile from './useTurnstile';

const lengthLabel = (s) => (s >= 60 && s % 60 === 0 ? `${s / 60} min` : `${s} sec`);

function Spinner({ dark }) {
  return <span className={`inline-block h-4 w-4 animate-spin rounded-full border-2 ${dark ? 'border-zinc-300 border-t-zinc-700' : 'border-white/40 border-t-white'}`} aria-hidden />;
}

function scriptText(r) {
  const parts = [];
  if (r.kind === 'shorts' && r.title) parts.push(`Title: ${r.title}`, '');
  parts.push(r.lines.join('\n'));
  return parts.join('\n');
}

// Plain-text format the Script to AI Video Prompts tool splits into scenes.
function facelessText(r) {
  const parts = [r.title ? `TITLE: ${r.title}` : '', ''];
  r.scenes.forEach((s, i) => parts.push(`SCENE ${i + 1}`, `VISUAL: ${s.visual}`, `VO: "${s.voiceover}"`, ''));
  return parts.join('\n').trim();
}

export default function ScriptTool({ slug, kind, inputLabel, placeholder, button, lengths, defaultLength, maxInput, dailyLimit }) {
  const [input, setInput] = useState('');
  const [seconds, setSeconds] = useState(defaultLength);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [limitHit, setLimitHit] = useState(false);
  const [result, setResult] = useState(null);
  const [hookScript, setHookScript] = useState(null);
  const [scriptingHook, setScriptingHook] = useState(null);
  const [remaining, setRemaining] = useState(null);
  const turnstile = useTurnstile();
  const resultRef = useRef(null);
  const scriptRef = useRef(null);

  async function call(payload) {
    setError('');
    setLimitHit(false);
    try {
      const turnstileToken = await turnstile.getToken();
      const res = await fetch('/api/free-tools/script', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ page: slug, input: input.trim(), seconds, turnstileToken, ...payload }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        if (data.code === 'limit') { setLimitHit(true); setRemaining(0); }
        setError(data.error || 'That didn’t work. Please try again.');
        return null;
      }
      if (typeof data.remaining === 'number') setRemaining(data.remaining);
      return data;
    } catch {
      setError('That didn’t work. Please try again.');
      return null;
    } finally {
      turnstile.reset();
    }
  }

  async function submit(e) {
    e.preventDefault();
    if (loading) return;
    if (input.trim().length < 3) {
      setError('Tell us what your video is about first. A sentence is enough.');
      return;
    }
    setLoading(true);
    const data = await call({});
    setLoading(false);
    if (data) {
      setResult(data);
      setHookScript(null);
      setTimeout(() => resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 50);
    }
  }

  async function turnIntoScript(hook) {
    if (scriptingHook) return;
    setScriptingHook(hook);
    const data = await call({ action: 'script', hook });
    setScriptingHook(null);
    if (data) {
      setHookScript({ ...data, hook });
      setTimeout(() => scriptRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 50);
    }
  }

  const scriptCard = (r) => (
    <div className="rounded-3xl bg-white p-5 text-left ring-1 ring-zinc-200 sm:p-6">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <p className="text-xs font-bold uppercase tracking-wider text-brand-600">
          {r.kind === 'shorts' ? 'Your Shorts script' : r.kind === 'reels' ? 'Your Reel script' : 'Your script'}
        </p>
        <CopyButton text={scriptText(r)} label="Copy script" />
      </div>
      {r.kind === 'shorts' && r.title && (
        <p className="mb-3 text-sm text-zinc-600"><span className="font-semibold text-zinc-800">Title idea:</span> {r.title}</p>
      )}
      <div className="space-y-2.5">
        {r.lines.map((l, i) => <p key={i} className="text-[15px] leading-relaxed text-zinc-800">{l}</p>)}
      </div>
      {r.caption && (
        <div className="mt-4 rounded-2xl bg-zinc-50 p-4 ring-1 ring-zinc-200">
          <div className="mb-1 flex items-center justify-between gap-2">
            <p className="text-sm font-semibold text-zinc-800">Caption</p>
            <CopyButton text={r.caption} label="Copy caption" />
          </div>
          <p className="text-sm leading-relaxed text-zinc-700">{r.caption}</p>
        </div>
      )}
    </div>
  );

  const cta = (
    <div className="rounded-3xl bg-zinc-950 p-6 text-left text-white sm:p-7">
      <p className="text-[15px] leading-relaxed text-zinc-200">
        A script is step one. ScriptSea writes the script and a ready AI video prompt for every scene, with the same character in every shot. 3 free scripts, no card.
      </p>
      <a href={signupHref(slug, 'under-result')} className="mt-4 inline-flex rounded-xl bg-brand-500 px-5 py-3 text-sm font-bold text-white hover:bg-brand-600">
        Try ScriptSea free
      </a>
    </div>
  );

  return (
    <div className="text-left">
      <form onSubmit={submit} onFocus={turnstile.start} className="rounded-3xl bg-white p-4 shadow-[0_10px_40px_rgba(15,15,20,0.08)] ring-1 ring-zinc-200 sm:p-6">
        <label htmlFor="st-input" className="mb-1.5 block text-sm font-semibold text-zinc-800">{inputLabel}</label>
        <textarea
          id="st-input"
          value={input}
          onChange={(e) => setInput(e.target.value.slice(0, maxInput))}
          maxLength={maxInput}
          rows={3}
          placeholder={placeholder}
          className="block w-full resize-y rounded-2xl border-0 bg-zinc-50 px-4 py-3 text-[15px] leading-relaxed text-zinc-900 ring-1 ring-zinc-200 placeholder:text-zinc-400 focus:ring-2 focus:ring-brand-500"
        />
        <div className="mt-1.5 flex justify-end text-xs text-zinc-500">
          <span className={input.length > maxInput * 0.9 ? 'font-semibold text-brand-600' : ''}>{input.length} / {maxInput}</span>
        </div>

        <div className="mt-3">
          <p className="mb-1.5 text-sm font-semibold text-zinc-800">{kind === 'hooks' ? 'Script length (for the full script)' : 'Length'}</p>
          <div role="radiogroup" className="flex flex-wrap gap-2">
            {lengths.map((l) => (
              <button
                key={l}
                type="button"
                role="radio"
                aria-checked={seconds === l}
                onClick={() => setSeconds(l)}
                className={`rounded-full px-4 py-1.5 text-sm font-semibold ring-1 transition ${seconds === l ? 'bg-brand-500 text-white ring-brand-500' : 'bg-white text-zinc-700 ring-zinc-200 hover:ring-brand-300'}`}
              >
                {lengthLabel(l)}
              </button>
            ))}
          </div>
        </div>

        <div ref={turnstile.holder} className="mt-3 empty:hidden" />

        <button
          type="submit"
          disabled={loading}
          className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl bg-brand-500 px-6 py-3.5 text-base font-bold text-white shadow-[0_8px_24px_rgba(255,51,102,0.3)] transition hover:bg-brand-600 disabled:opacity-70"
        >
          {loading ? <><Spinner /> Writing…</> : button}
        </button>
        <p className="mt-2 text-center text-xs text-zinc-500">
          Free, no signup. {remaining === null ? `${dailyLimit} free tries a day.` : `${remaining} of ${dailyLimit} free tries left today.`}
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
        <div ref={resultRef} data-st-result className="mt-6 scroll-mt-24 space-y-4">
          {result.kind === 'hooks' && (
            <div className="rounded-3xl bg-white p-5 ring-1 ring-zinc-200 sm:p-6">
              <p className="mb-1 text-xs font-bold uppercase tracking-wider text-brand-600">Your 10 hooks</p>
              <p className="mb-4 text-sm text-zinc-500">Pick one and turn it into a full script. That uses 1 free try.</p>
              <ol className="space-y-3">
                {result.hooks.map((h, i) => (
                  <li key={i} className="rounded-2xl bg-zinc-50 p-4 ring-1 ring-zinc-200">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">{i + 1} · {h.style}</p>
                    <p className="mt-1 text-[15px] font-semibold leading-snug text-zinc-900">{h.text}</p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <CopyButton text={h.text} />
                      <button
                        type="button"
                        disabled={Boolean(scriptingHook)}
                        onClick={() => turnIntoScript(h.text)}
                        className="inline-flex items-center gap-2 rounded-lg bg-zinc-900 px-3 py-1.5 text-sm font-semibold text-white hover:bg-zinc-700 disabled:opacity-60"
                      >
                        {scriptingHook === h.text ? <><Spinner /> Writing…</> : 'Turn into full script'}
                      </button>
                    </div>
                  </li>
                ))}
              </ol>
            </div>
          )}

          {(result.kind === 'reels' || result.kind === 'shorts') && scriptCard(result)}

          {result.kind === 'faceless' && (
            <div className="rounded-3xl bg-white p-5 ring-1 ring-zinc-200 sm:p-6">
              <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                <p className="text-xs font-bold uppercase tracking-wider text-brand-600">{result.scenes.length} scenes</p>
                <CopyButton text={facelessText(result)} label="Copy script" />
              </div>
              {result.title && <p className="mb-4 text-sm text-zinc-600"><span className="font-semibold text-zinc-800">Title idea:</span> {result.title}</p>}
              <ol className="space-y-3">
                {result.scenes.map((s, i) => (
                  <li key={i} className="rounded-2xl bg-zinc-50 p-4 ring-1 ring-zinc-200">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">Scene {i + 1}</p>
                    <p className="mt-1 text-[15px] leading-relaxed text-zinc-900"><span className="font-semibold">Say:</span> {s.voiceover}</p>
                    <p className="mt-1 text-sm leading-relaxed text-zinc-600"><span className="font-semibold text-zinc-700">Show:</span> {s.visual}</p>
                  </li>
                ))}
              </ol>
              <button
                type="button"
                onClick={async () => { await copyText(facelessText(result)); window.location.href = '/script-to-video-prompts'; }}
                className="mt-5 w-full rounded-2xl bg-zinc-900 px-5 py-3 text-sm font-bold text-white hover:bg-zinc-700"
              >
                Copy script and open Script to AI Video Prompts
              </button>
              <p className="mt-2 text-center text-xs text-zinc-500">Then paste it into the box there and pick your video model.</p>
            </div>
          )}

          {hookScript && (
            <div ref={scriptRef} className="scroll-mt-24 space-y-2">
              <p className="text-sm text-zinc-500">Built on: <span className="font-semibold text-zinc-800">{hookScript.hook}</span></p>
              {scriptCard(hookScript)}
            </div>
          )}

          {cta}
        </div>
      )}
    </div>
  );
}
