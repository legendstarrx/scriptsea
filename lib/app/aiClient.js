import { supabase } from '../supabaseClient';

export async function getAccessToken() {
  try {
    const { data } = await supabase.auth.getSession();
    return data?.session?.access_token || null;
  } catch {
    return null;
  }
}

async function readJson(response) {
  const raw = await response.text();
  try { return { raw, payload: raw ? JSON.parse(raw) : null }; } catch { return { raw, payload: null }; }
}

/** Script generation — the server checks and decrements the user's allowance. */
export async function generateText(prompt, { temperature = 0.9, maxTokens = 2048 } = {}) {
  const token = await getAccessToken();
  const response = await fetch('/api/ai/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
    body: JSON.stringify({ prompt, temperature, maxTokens }),
  });
  const { raw, payload } = await readJson(response);
  if (!response.ok) {
    // Keep the server's error string so callers can match on "limit_reached".
    throw new Error(payload?.error || payload?.detail || (raw && raw.trim()) || 'Failed to generate content');
  }
  return payload?.text || '';
}

/** Video prompt generation. Returns { text } or throws; error.code === 'limit_reached' when out of credits. */
export async function generateVideoPrompts(body) {
  const token = await getAccessToken();
  const res = await fetch('/api/ai/video-prompt', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
    body: JSON.stringify(body),
  });
  const { payload } = await readJson(res);
  if (!res.ok) {
    const err = new Error(payload?.message || payload?.error || 'Generation failed');
    err.code = payload?.error;
    throw err;
  }
  return payload?.text || '';
}
