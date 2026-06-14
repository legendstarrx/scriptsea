import { useState } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '../lib/supabaseClient';
import Navigation from '../components/Navigation';

const STYLES = [
  { id: 'cinematic', label: '🎬 Cinematic', desc: 'Hollywood-level realism' },
  { id: 'documentary', label: '📹 Documentary', desc: 'Raw, authentic footage' },
  { id: 'commercial', label: '✨ Commercial', desc: 'Polished product ads' },
  { id: 'ugc', label: '📱 UGC / Viral', desc: 'Creator-style, authentic' },
  { id: 'animation', label: '🎨 Animation', desc: '3D or 2D animated' },
  { id: 'luxury', label: '💎 Luxury', desc: 'Premium, high-end feel' },
];

export default function VideoPromptPage() {
  const router = useRouter();
  const [description, setDescription] = useState('');
  const [style, setStyle] = useState('cinematic');
  const [platform, setPlatform] = useState('tiktok');
  const [duration, setDuration] = useState('30 sec');
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  const generate = async () => {
    if (!description.trim()) { setError('Please describe your product or video idea.'); return; }
    setError('');
    setLoading(true);
    setResult('');

    try {
      let token = null;
      if (supabase) {
        const { data } = await supabase.auth.getSession();
        token = data?.session?.access_token || null;
      }

      const styleInfo = STYLES.find(s => s.id === style);
      const prompt = `You are the world's best AI video prompt engineer. Create the most detailed, cinematic, and effective AI video generation prompts ever written.

BRIEF:
Product/Idea: "${description}"
Visual Style: ${styleInfo?.label} — ${styleInfo?.desc}
Platform: ${platform}
Duration: ${duration}

Generate a MASTER PROMPT PACKAGE with:

1. HERO PROMPT (the single best prompt to generate the main video — use for Runway Gen-3, Kling, Sora, or Pika):
Write the most detailed, vivid, specific visual prompt. Include: subject description, action, camera movement, lighting, color grade, mood, texture, time of day, visual style reference, technical specs (4K, 24fps, etc.). Make it 100-150 words of pure visual description.

2. OPENING SHOT (0-3 seconds):
Ultra-detailed prompt for the first frame that stops the scroll. One sentence, maximum visual impact.

3. KEY SCENES (3-4 scene prompts):
Each scene prompt should be 2-3 sentences. Describe exactly what the AI should generate — subject, motion, camera, lighting, mood.

4. CLOSING SHOT:
Final memorable frame prompt that drives action.

5. STYLE REFERENCE:
"Shot in the style of [specific reference] meets [another reference], [color grade], [lens type], [era/aesthetic]"

6. NEGATIVE PROMPT (what to avoid):
List 10 specific things the AI should NOT generate.

Rules:
- Be hyper-specific about visuals, never vague
- Use cinematic language: "shallow depth of field", "golden hour", "anamorphic lens flare", "film grain", etc.
- Every word must add visual value — no filler
- Make these prompts BETTER than anything a human would write without AI assistance`;

      const res = await fetch('/api/ai/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ prompt, temperature: 0.85, maxTokens: 2500 }),
      });

      const data = await res.json();
      if (!res.ok) {
        if (data?.error === 'limit_reached') {
          router.push('/generate?open_upgrade=1');
          return;
        }
        throw new Error(data?.error || 'Generation failed');
      }
      setResult(data.text || '');
    } catch (e) {
      setError(e?.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const copy = () => {
    navigator.clipboard.writeText(result);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const sections = result
    ? result.split(/\n(?=\d+\.|[A-Z\s]+:)/).filter(s => s.trim())
    : [];

  return (
    <>
      <Navigation />
      <div style={{ minHeight: '100vh', background: '#fafafa', paddingTop: '90px', paddingBottom: '60px' }}>
        <div style={{ maxWidth: '760px', margin: '0 auto', padding: '0 20px' }}>

          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: '40px' }}>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: '8px',
              background: '#fff0f3', border: '1px solid #ffd6e0',
              borderRadius: '50px', padding: '6px 16px', marginBottom: '16px',
              fontSize: '0.82rem', fontWeight: 600, color: '#FF3366',
            }}>
              ✦ AI Video Prompt Studio
            </div>
            <h1 style={{ fontSize: 'clamp(1.6rem, 4vw, 2.4rem)', fontWeight: 800, color: '#111', margin: '0 0 12px', lineHeight: 1.2 }}>
              Turn any idea into the perfect<br />AI video generation prompt
            </h1>
            <p style={{ color: '#888', fontSize: '1rem', margin: 0 }}>
              Optimized for Runway, Kling, Sora, Pika and every major AI video tool
            </p>
          </div>

          {/* Main card */}
          <div style={{ background: 'white', borderRadius: '20px', padding: '32px', boxShadow: '0 4px 24px rgba(0,0,0,0.06)', marginBottom: '24px' }}>

            {/* Description */}
            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', fontWeight: 600, color: '#333', marginBottom: '8px', fontSize: '0.9rem' }}>
                Describe your product, brand or video idea
              </label>
              <textarea
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder="e.g. A sleek black smartwatch that tracks fitness and sends notifications. I want to show it being worn during a morning run in the city at sunrise..."
                rows={4}
                style={{
                  width: '100%', padding: '14px 16px', borderRadius: '12px',
                  border: '2px solid #e8e8e8', fontSize: '0.95rem', color: '#222',
                  resize: 'vertical', outline: 'none', boxSizing: 'border-box',
                  fontFamily: 'inherit', lineHeight: 1.6,
                  transition: 'border-color 0.2s',
                }}
                onFocus={e => e.target.style.borderColor = '#FF3366'}
                onBlur={e => e.target.style.borderColor = '#e8e8e8'}
              />
            </div>

            {/* Style */}
            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', fontWeight: 600, color: '#333', marginBottom: '10px', fontSize: '0.9rem' }}>
                Visual style
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '10px' }}>
                {STYLES.map(s => (
                  <button
                    key={s.id}
                    onClick={() => setStyle(s.id)}
                    style={{
                      padding: '12px 14px', borderRadius: '12px', border: 'none',
                      textAlign: 'left', cursor: 'pointer', transition: 'all 0.15s',
                      background: style === s.id ? '#fff0f3' : '#f7f7f7',
                      outline: style === s.id ? '2px solid #FF3366' : '2px solid transparent',
                    }}
                  >
                    <div style={{ fontWeight: 600, color: '#222', fontSize: '0.88rem', marginBottom: '2px' }}>{s.label}</div>
                    <div style={{ fontSize: '0.75rem', color: '#888' }}>{s.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Platform + Duration row */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '28px' }}>
              <div>
                <label style={{ display: 'block', fontWeight: 600, color: '#333', marginBottom: '8px', fontSize: '0.9rem' }}>Platform</label>
                <div style={{ position: 'relative' }}>
                  <select
                    value={platform}
                    onChange={e => setPlatform(e.target.value)}
                    style={{
                      width: '100%', padding: '11px 36px 11px 14px', borderRadius: '10px',
                      border: '2px solid #e8e8e8', fontSize: '0.9rem', color: '#222',
                      appearance: 'none', outline: 'none', cursor: 'pointer', background: 'white',
                    }}
                  >
                    <option value="tiktok">TikTok</option>
                    <option value="instagram">Instagram Reels</option>
                    <option value="youtube">YouTube</option>
                    <option value="youtube_shorts">YouTube Shorts</option>
                    <option value="facebook">Facebook</option>
                    <option value="ads">Paid Ads</option>
                  </select>
                  <div style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: '#999' }}>▾</div>
                </div>
              </div>
              <div>
                <label style={{ display: 'block', fontWeight: 600, color: '#333', marginBottom: '8px', fontSize: '0.9rem' }}>Duration</label>
                <div style={{ position: 'relative' }}>
                  <select
                    value={duration}
                    onChange={e => setDuration(e.target.value)}
                    style={{
                      width: '100%', padding: '11px 36px 11px 14px', borderRadius: '10px',
                      border: '2px solid #e8e8e8', fontSize: '0.9rem', color: '#222',
                      appearance: 'none', outline: 'none', cursor: 'pointer', background: 'white',
                    }}
                  >
                    <option value="15 sec">15 seconds</option>
                    <option value="30 sec">30 seconds</option>
                    <option value="60 sec">1 minute</option>
                    <option value="90 sec">1.5 minutes</option>
                    <option value="2 min">2 minutes</option>
                    <option value="3 min">3 minutes</option>
                    <option value="5 min">5 minutes</option>
                  </select>
                  <div style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: '#999' }}>▾</div>
                </div>
              </div>
            </div>

            {error && (
              <div style={{ padding: '12px 16px', background: '#fff0f3', border: '1px solid #ffd6e0', borderRadius: '10px', color: '#FF3366', fontSize: '0.88rem', marginBottom: '20px' }}>
                {error}
              </div>
            )}

            <button
              onClick={generate}
              disabled={loading}
              style={{
                width: '100%', padding: '16px',
                background: loading ? '#FFE5EC' : 'linear-gradient(135deg, #FF3366 0%, #ff6b8a 100%)',
                color: loading ? '#FF3366' : 'white', border: 'none',
                borderRadius: '14px', fontSize: '1rem', fontWeight: 700,
                cursor: loading ? 'not-allowed' : 'pointer',
                boxShadow: loading ? 'none' : '0 6px 20px rgba(255,51,102,0.35)',
                transition: 'all 0.2s',
              }}
            >
              {loading ? '✦ Generating your prompts…' : '✦ Generate AI Video Prompts'}
            </button>
          </div>

          {/* Result */}
          {result && (
            <div style={{ background: 'white', borderRadius: '20px', padding: '32px', boxShadow: '0 4px 24px rgba(0,0,0,0.06)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <h2 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700, color: '#111' }}>Your AI Video Prompt Package</h2>
                <button
                  onClick={copy}
                  style={{
                    padding: '8px 20px', background: copied ? '#22c55e' : '#FF3366',
                    color: 'white', border: 'none', borderRadius: '20px',
                    fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer', transition: 'background 0.2s',
                  }}
                >
                  {copied ? '✓ Copied!' : 'Copy all'}
                </button>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {result.split('\n').filter(l => l.trim()).map((line, i) => {
                  const isSectionHeader = /^\d+\.|^[A-Z\s]+:/.test(line.trim());
                  return (
                    <div key={i} style={{
                      padding: isSectionHeader ? '12px 16px' : '10px 16px',
                      borderRadius: '10px',
                      background: isSectionHeader ? '#fff5f7' : '#f9f9f9',
                      borderLeft: isSectionHeader ? '3px solid #FF3366' : 'none',
                      fontSize: isSectionHeader ? '0.9rem' : '0.88rem',
                      fontWeight: isSectionHeader ? 700 : 400,
                      color: isSectionHeader ? '#FF3366' : '#333',
                      lineHeight: 1.7,
                    }}>
                      {line.trim()}
                    </div>
                  );
                })}
              </div>
              <div style={{ marginTop: '20px', padding: '14px 16px', background: '#f0fff4', border: '1px solid #bbf7d0', borderRadius: '10px', fontSize: '0.82rem', color: '#166534' }}>
                💡 Paste the HERO PROMPT directly into Runway, Kling, Sora or Pika. Use the scene prompts for multi-clip sequences.
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
