import { supabase } from '../supabaseClient';

export async function getAccessToken() {
  try {
    const { data } = await supabase.auth.getSession();
    return data?.session?.access_token || null;
  } catch {
    return null;
  }
}

/** Throws an Error with `.code` ('limit_reached', ...) and the server's message. */
async function post(url, body) {
  const token = await getAccessToken();
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
    body: JSON.stringify(body),
  });
  const raw = await res.text();
  let payload = null;
  try { payload = raw ? JSON.parse(raw) : null; } catch { payload = null; }
  if (!res.ok) {
    const err = new Error(payload?.message || payload?.error || 'Generation failed. Please try again.');
    err.code = payload?.error;
    err.status = res.status;
    throw err;
  }
  return payload?.text || '';
}

/** Script or ad script. The server builds the prompt from these settings and checks the allowance. */
export const generateScript = (settings) => post('/api/ai/script', settings);

/** Scene-by-scene video prompts (Pro). */
export const generateVideoPrompts = (settings) => post('/api/ai/video-prompt', settings);
