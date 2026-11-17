import { useRef } from 'react';

const TURNSTILE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;

// Cloudflare Turnstile, loaded on first interaction so pages stay light.
// Does nothing when NEXT_PUBLIC_TURNSTILE_SITE_KEY isn't set.
export default function useTurnstile() {
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
