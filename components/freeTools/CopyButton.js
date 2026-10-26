import { useState } from 'react';

export async function copyText(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    // Older browsers / insecure context fallback
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.setAttribute('readonly', '');
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    let ok = false;
    try { ok = document.execCommand('copy'); } catch { ok = false; }
    ta.remove();
    return ok;
  }
}

/** Copies the clean prompt only, never any branding. */
export default function CopyButton({ text, label = 'Copy', className = '' }) {
  const [state, setState] = useState('idle');
  return (
    <button
      type="button"
      onClick={async () => {
        const ok = await copyText(text);
        setState(ok ? 'done' : 'fail');
        setTimeout(() => setState('idle'), 1800);
      }}
      className={`rounded-lg px-3 py-1.5 text-sm font-semibold transition ${state === 'done' ? 'bg-emerald-50 text-emerald-700' : 'bg-brand-50 text-brand-700 hover:bg-brand-100'} ${className}`}
    >
      {state === 'done' ? 'Copied' : state === 'fail' ? 'Press Ctrl+C' : label}
    </button>
  );
}
