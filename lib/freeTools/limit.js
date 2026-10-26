// Daily limit for the free tools: 5 generations per visitor per UTC day, no login.
// Primary counter: Supabase table free_tool_usage keyed by a salted SHA-256 of the
// IP (raw IPs are never stored). Backup: an httpOnly cookie. Until the SQL in
// supabase/006_free_tool_usage.sql is run, the cookie alone enforces the limit.
import crypto from 'crypto';
import { supabaseAdmin } from '../supabaseAdmin';
import { DAILY_LIMIT } from './config';

const COOKIE = 'ss_ft';
const today = () => new Date().toISOString().slice(0, 10);

export function clientIp(req) {
  const fwd = req.headers['x-forwarded-for'];
  const first = Array.isArray(fwd) ? fwd[0] : (fwd || '').split(',')[0];
  return (first || req.headers['x-real-ip'] || req.socket?.remoteAddress || 'unknown').trim();
}

function ipHash(req) {
  const salt = process.env.FREE_TOOL_IP_SALT || 'scriptsea-free-tools';
  return crypto.createHash('sha256').update(`${salt}:${clientIp(req)}`).digest('hex');
}

function readCookieCount(req) {
  const raw = (req.headers.cookie || '').split(';').map((c) => c.trim()).find((c) => c.startsWith(`${COOKIE}=`));
  if (!raw) return 0;
  const [day, count] = decodeURIComponent(raw.slice(COOKIE.length + 1)).split(':');
  return day === today() ? Math.max(0, parseInt(count, 10) || 0) : 0;
}

export function writeCookieCount(res, count) {
  const secure = process.env.NODE_ENV === 'production' ? '; Secure' : '';
  res.setHeader('Set-Cookie', `${COOKIE}=${encodeURIComponent(`${today()}:${count}`)}; Path=/; Max-Age=172800; HttpOnly; SameSite=Lax${secure}`);
}

/**
 * Reserve one generation. Returns { ok, used, release } or { ok:false } at the limit.
 * Call release() if the generation fails so the visitor isn't charged for it.
 */
export async function takeUse(req) {
  const cookieUsed = readCookieCount(req);
  if (cookieUsed >= DAILY_LIMIT) return { ok: false, used: cookieUsed };

  const hash = ipHash(req);
  let serverUsed = null;
  if (supabaseAdmin) {
    try {
      const { data, error } = await supabaseAdmin.rpc('free_tool_take', { p_ip_hash: hash, p_limit: DAILY_LIMIT });
      if (!error) {
        if (data === null || data === undefined) return { ok: false, used: DAILY_LIMIT };
        serverUsed = Number(data);
      }
      // error (e.g. table not created yet) → fall back to the cookie
    } catch {
      // network problem → fall back to the cookie
    }
  }

  const used = Math.max(cookieUsed + 1, serverUsed || 0);
  return {
    ok: true,
    used,
    async release() {
      if (serverUsed === null || !supabaseAdmin) return;
      try { await supabaseAdmin.rpc('free_tool_refund', { p_ip_hash: hash }); } catch { /* best effort */ }
    },
  };
}

/** Cloudflare Turnstile. Skipped entirely when TURNSTILE_SECRET_KEY isn't set. */
export async function verifyTurnstile(token, req) {
  const secret = process.env.TURNSTILE_SECRET_KEY;
  if (!secret) return true;
  if (!token) return false;
  try {
    const body = new URLSearchParams({ secret, response: String(token).slice(0, 2048), remoteip: clientIp(req) });
    const r = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', { method: 'POST', body });
    const json = await r.json();
    return Boolean(json.success);
  } catch {
    // Cloudflare unreachable: don't block real people; the daily limit still applies.
    return true;
  }
}
