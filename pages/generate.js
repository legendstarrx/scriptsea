import { saveAs } from 'file-saver';
import { Document, Packer, Paragraph, TextRun } from 'docx';
import Footer from '../components/Footer';
import ProtectedRoute from '../components/ProtectedRoute';
import { useRouter } from 'next/router';
import { useAuth } from '../context/AuthContext';
import SubscriptionModal from '../components/SubscriptionModal';
import ProfileModal from '../components/ProfileModal';
import { toast, Toaster } from 'react-hot-toast';
import React, { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { supabase } from '../lib/supabaseClient';
import { getPlanLabel, hasProAccess } from '../utils/subscription';

// GeneratePageNav Component
const GeneratePageNav = ({ onOpenUpgrade }) => {
  const router = useRouter();
  const { user, userProfile } = useAuth();
  const [showContactModal, setShowContactModal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);

  return (
    <>
      <header style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(8px)',
        padding: '15px 0',
        boxShadow: '0 2px 10px rgba(0, 0, 0, 0.05)',
        zIndex: 1000
      }}>
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '0 20px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <Link
            href="/"
            style={{
              textDecoration: 'none',
              color: '#FF3366',
              fontSize: '1.5rem',
              fontWeight: 'bold'
            }}
          >
            ScriptSea
          </Link>

          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '20px'
          }}>
            {/* Upgrade Button */}
            <button
              onClick={() => onOpenUpgrade?.()}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 12px',
                backgroundColor: '#FF3366',
                color: 'white',
                border: 'none',
                borderRadius: '16px',
                fontSize: 'clamp(0.75rem, 2vw, 0.85rem)',
                cursor: 'pointer',
                transition: 'all 0.2s',
                boxShadow: '0 2px 8px rgba(255, 51, 102, 0.2)',
                whiteSpace: 'nowrap',
                minWidth: 'fit-content'
              }}
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 2L2 7L12 12L22 7L12 2Z" />
                <path d="M2 17L12 22L22 17" />
                <path d="M2 12L12 17L22 12" />
              </svg>
              Upgrade
            </button>

            {/* Contact Button */}
            <button
              onClick={() => setShowContactModal(true)}
              style={{
                width: '36px',
                height: '36px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: '#f8f9ff',
                border: 'none',
                borderRadius: '50%',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#666" strokeWidth="2">
                <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
              </svg>
            </button>

            {/* Profile Button */}
            <button
              onClick={() => setShowProfileModal(true)}
              style={{
                width: '36px',
                height: '36px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: '#f8f9ff',
                border: 'none',
                borderRadius: '50%',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#666" strokeWidth="2">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
            </button>
          </div>
        </div>
      </header>

      {/* Contact Modal */}
      {showContactModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1001
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '20px',
            padding: '30px',
            maxWidth: '400px',
            width: '90%',
            position: 'relative'
          }}>
            <button
              onClick={() => setShowContactModal(false)}
              style={{
                position: 'absolute',
                top: '15px',
                right: '15px',
                background: 'none',
                border: 'none',
                fontSize: '1.5rem',
                cursor: 'pointer',
                color: '#666'
              }}
            >
              ×
            </button>

            <h2 style={{
              fontSize: '1.5rem',
              marginBottom: '20px',
              color: '#333'
            }}>
              Contact Us
            </h2>

            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '15px'
            }}>
              <a
                href="mailto:support@scriptsea.com"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '12px',
                  backgroundColor: '#f8f9ff',
                  borderRadius: '12px',
                  textDecoration: 'none',
                  color: '#333',
                  transition: 'all 0.2s'
                }}
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#FF3366" strokeWidth="2">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                  <polyline points="22,6 12,13 2,6" />
                </svg>
                support@scriptsea.com
              </a>

              <a
                href="https://wa.me/447474762495"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '12px',
                  backgroundColor: '#f8f9ff',
                  borderRadius: '12px',
                  textDecoration: 'none',
                  color: '#333',
                  transition: 'all 0.2s'
                }}
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="#25D366">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
                Chat on WhatsApp
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Profile Modal */}
      {showProfileModal && (
        <ProfileModal
          onClose={() => setShowProfileModal(false)}
          user={user}
          userProfile={userProfile}
        />
      )}
    </>
  );
};

// Update creator styles data
const creatorStyles = {
  youtube: [
    { name: 'MrBeast', description: 'High-energy, big-budget challenges and philanthropy' },
    { name: 'Ryan Trahan', description: 'Adventure and travel content with storytelling' },
    { name: 'Airrack', description: 'Fast-paced challenges and viral experiments' },
    { name: 'Dream', description: 'Gaming and challenge content with high energy' },
    { name: 'Kai Cenat', description: 'Reaction and gaming content with humor' },
    { name: 'Ishowspeed', description: 'Gaming and reaction content with high energy' },
    { name: 'Kwebbelkop', description: 'Gaming and challenge content with humor' },
    { name: 'Alex Hormozi', description: 'Business and entrepreneurship with direct, high-value advice' },
    { name: 'Andrew Tate', description: 'Controversial business and lifestyle content with strong opinions' },
    { name: 'NDL', description: 'Gaming and challenge content with high energy and humor' },
    { name: 'Sidemen', description: 'Variety content, challenges, and group dynamics with British humor' }
  ],
  tiktok: [
    { name: 'Dylan Mulvaney', description: 'Daily life and transformation content with humor' },
    { name: 'Chris Olsen', description: 'Comedy and lifestyle content with storytelling' },
    { name: 'Brittany Broski', description: 'Comedy and reaction content with personality' },
    { name: 'Drew Afualo', description: 'Comedy and commentary with strong personality' },
    { name: 'Matt Rife', description: 'Stand-up comedy and viral skits' },
    { name: "The D'Amelio Show", description: 'Reality and lifestyle content with voice' },
    { name: 'Bella Hadid', description: 'Fashion and lifestyle with voiceovers' }
  ],
  instagram: [
    { name: 'Alex Cooper', description: 'Podcast and lifestyle content with personality' },
    { name: 'Emma Chamberlain', description: 'Lifestyle and vlog content with humor' },
    { name: 'Alix Earle', description: 'Lifestyle and beauty content with voice' },
    { name: 'Tinx', description: 'Lifestyle and advice content with personality' },
    { name: 'Mikayla Nogueira', description: 'Beauty and lifestyle with voiceovers' },
    { name: 'Gary Vee', description: 'Business and motivation with voice' },
    { name: "Dixie D'Amelio", description: 'Lifestyle and music content with voice' }
  ],
  facebook: [
    { name: 'Nas Daily', description: 'Travel and storytelling content with voice' },
    { name: '5-Minute Crafts', description: 'DIY and life hacks with voiceovers' },
    { name: 'BuzzFeed', description: 'Entertainment and lifestyle content with voice' },
    { name: 'Tasty', description: 'Food and cooking content with voiceovers' },
    { name: 'LadBible', description: 'Entertainment and viral content with voice' },
    { name: 'UNILAD', description: 'Entertainment and viral content with voice' },
    { name: 'ViralNova', description: 'Viral stories and content with voiceovers' }
  ]
};

// Add this to force dynamic behavior
export const dynamic = 'force-dynamic';

const generateWithOpenAI = async (prompt, options = {}) => {
  // Get auth token so the server can check + decrement limits
  let authHeader = {};
  try {
    const { supabase } = await import('../lib/supabaseClient');
    const { data } = await supabase.auth.getSession();
    const token = data?.session?.access_token;
    if (token) authHeader = { Authorization: `Bearer ${token}` };
  } catch { /* no token — server will gracefully skip limit check */ }

  const response = await fetch('/api/ai/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeader },
    body: JSON.stringify({
      prompt,
      temperature: options.temperature ?? 0.9,
      maxTokens: options.maxTokens ?? 2048,
    }),
  });

  const raw = await response.text();
  let payload = null;
  try { payload = raw ? JSON.parse(raw) : null; } catch { payload = null; }

  if (!response.ok) {
    // Throw with the server's error string so handleGenerate can pattern-match on it
    const reason = payload?.error || payload?.detail || (raw && raw.trim()) || 'Failed to generate content';
    throw new Error(reason);
  }

  return payload?.text || '';
};

// ── VideoPromptTab ─────────────────────────────────────────────────────────
function VideoPromptTab({ isProUser, onUpgrade }) {
  const [input, setInput] = useState('');
  const [image, setImage] = useState(null); // { base64, mimeType, name, preview }
  const [platform, setPlatform] = useState('tiktok');
  const [vidDuration, setVidDuration] = useState('30 sec');
  const [style, setStyle] = useState('cinematic');
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState('');
  const [copied, setCopied] = useState(false);

  const STYLES = [
    { id: 'cinematic', label: 'Cinematic' },
    { id: 'commercial', label: 'Commercial' },
    { id: 'ugc', label: 'UGC / Viral' },
    { id: 'documentary', label: 'Documentary' },
    { id: 'luxury', label: 'Luxury' },
    { id: 'animation', label: 'Animation' },
  ];

  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const dataUrl = ev.target.result;
      const base64 = dataUrl.split(',')[1];
      setImage({ base64, mimeType: file.type, name: file.name, preview: dataUrl });
    };
    reader.readAsDataURL(file);
  };

  const generate = async () => {
    if (!input.trim() && !image) { setErr('Paste a script, describe your idea, or upload an image.'); return; }
    if (!isProUser) { onUpgrade(); return; }
    setErr(''); setResult(''); setLoading(true);
    try {
      const { supabase } = await import('../lib/supabaseClient');
      const { data: sd } = await supabase.auth.getSession();
      const token = sd?.session?.access_token;
      const res = await fetch('/api/ai/video-prompt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        body: JSON.stringify({
          input: input.trim(),
          imageBase64: image?.base64 || null,
          imageMimeType: image?.mimeType || null,
          platform, duration: vidDuration, style,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || 'Generation failed');
      setResult(data.text || '');
    } catch (e) {
      setErr(e?.message || 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  const pillStyle = (active) => ({
    padding: '7px 16px', borderRadius: '50px', border: 'none', cursor: 'pointer',
    fontSize: '0.82rem', fontWeight: 600, transition: 'all 0.15s',
    background: active ? '#FF3366' : '#f0f0f0',
    color: active ? '#fff' : '#555',
    boxShadow: active ? '0 3px 10px rgba(255,51,102,0.25)' : 'none',
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* Input card */}
      <div style={{ background: 'white', borderRadius: '20px', padding: '28px', boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
        <label style={{ display: 'block', fontWeight: 700, color: '#222', marginBottom: '10px', fontSize: '0.92rem' }}>
          Your script, product, or idea
        </label>
        <div style={{ position: 'relative' }}>
          <textarea
            value={input}
            onChange={e => setInput(e.target.value)}
            rows={5}
            placeholder="Paste your script, describe your product, or explain your video idea here…&#10;&#10;Example: I want to market ScriptSea — an AI tool that generates viral video scripts. Target audience: content creators. Tone: exciting and modern."
            style={{
              width: '100%', padding: '14px 16px', borderRadius: '12px', border: '2px solid #e8e8e8',
              fontSize: '0.93rem', color: '#222', resize: 'vertical', outline: 'none',
              boxSizing: 'border-box', fontFamily: 'inherit', lineHeight: 1.6,
            }}
            onFocus={e => e.target.style.borderColor = '#FF3366'}
            onBlur={e => e.target.style.borderColor = '#e8e8e8'}
          />
        </div>

        {/* Image upload */}
        <div style={{ marginTop: '12px', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <label style={{
            display: 'inline-flex', alignItems: 'center', gap: '6px',
            padding: '8px 16px', borderRadius: '50px', border: '1.5px dashed #ddd',
            cursor: 'pointer', fontSize: '0.85rem', color: '#666', fontWeight: 500,
            transition: 'border-color 0.2s',
          }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/>
              <polyline points="21 15 16 10 5 21"/>
            </svg>
            {image ? image.name : 'Upload product image (optional)'}
            <input type="file" accept="image/*" onChange={handleImageUpload} style={{ display: 'none' }} />
          </label>
          {image && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <img src={image.preview} alt="preview" style={{ width: 40, height: 40, borderRadius: 8, objectFit: 'cover' }} />
              <button onClick={() => setImage(null)} style={{ background: 'none', border: 'none', color: '#FF3366', cursor: 'pointer', fontSize: '1.1rem' }}>×</button>
            </div>
          )}
        </div>

        {/* Settings row */}
        <div style={{ marginTop: '20px', display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          {/* Platform */}
          <div>
            <p style={{ margin: '0 0 6px', fontSize: '0.72rem', color: '#aaa', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Platform</p>
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
              {['TikTok', 'Instagram', 'YouTube', 'Ads'].map(p => (
                <button key={p} onClick={() => setPlatform(p.toLowerCase())} style={pillStyle(platform === p.toLowerCase())}>{p}</button>
              ))}
            </div>
          </div>
          {/* Duration */}
          <div>
            <p style={{ margin: '0 0 6px', fontSize: '0.72rem', color: '#aaa', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Duration</p>
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
              {['15 sec', '30 sec', '60 sec', '2 min', '5 min'].map(d => (
                <button key={d} onClick={() => setVidDuration(d)} style={pillStyle(vidDuration === d)}>{d}</button>
              ))}
            </div>
          </div>
        </div>

        {/* Style */}
        <div style={{ marginTop: '16px' }}>
          <p style={{ margin: '0 0 6px', fontSize: '0.72rem', color: '#aaa', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Visual style</p>
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
            {STYLES.map(s => (
              <button key={s.id} onClick={() => setStyle(s.id)} style={pillStyle(style === s.id)}>{s.label}</button>
            ))}
          </div>
        </div>

        {err && <div style={{ marginTop: '14px', padding: '10px 14px', background: '#fff0f3', borderRadius: '10px', color: '#FF3366', fontSize: '0.85rem' }}>{err}</div>}

        <button
          onClick={generate}
          disabled={loading}
          style={{
            width: '100%', marginTop: '20px', padding: '15px',
            background: loading ? '#FFE5EC' : 'linear-gradient(135deg,#FF3366,#ff6b8a)',
            color: loading ? '#FF3366' : 'white', border: 'none', borderRadius: '12px',
            fontSize: '1rem', fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer',
            boxShadow: loading ? 'none' : '0 6px 20px rgba(255,51,102,0.3)',
          }}
        >
          {loading ? '✦ Creating your prompts…' : isProUser ? '✦ Generate AI Video Prompts' : '🔒 Pro Feature — Upgrade to Generate'}
        </button>
      </div>

      {/* Result */}
      {result && (
        <div style={{ background: 'white', borderRadius: '20px', padding: '28px', boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h2 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 700, color: '#111' }}>Your AI Video Prompt Package</h2>
            <button onClick={() => { navigator.clipboard.writeText(result); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
              style={{ padding: '7px 18px', background: copied ? '#22c55e' : '#FF3366', color: 'white', border: 'none', borderRadius: '20px', fontSize: '0.82rem', fontWeight: 600, cursor: 'pointer' }}>
              {copied ? '✓ Copied!' : 'Copy all'}
            </button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {result.split('\n').filter(l => l.trim()).map((line, i) => {
              const isHeader = /^[🎬📽️🎨❌💡]|^SCENE\s+\d+|^---/.test(line.trim());
              const isScene = /^SCENE\s+\d+/i.test(line.trim());
              const isDivider = /^---/.test(line.trim());
              if (isDivider) return <hr key={i} style={{ border: 'none', borderTop: '1px solid #f0f0f0', margin: '4px 0' }} />;
              return (
                <div key={i} style={{
                  padding: isHeader ? '10px 14px' : '8px 14px',
                  borderRadius: '10px',
                  background: isScene ? '#fff5f7' : isHeader ? '#f8f8f8' : '#fcfcfc',
                  borderLeft: isScene ? '3px solid #FF3366' : isHeader ? '3px solid #eee' : 'none',
                  fontSize: isHeader ? '0.9rem' : '0.87rem',
                  fontWeight: isHeader ? 700 : 400,
                  color: isScene ? '#FF3366' : '#333',
                  lineHeight: 1.65,
                }}>
                  {line.trim()}
                </div>
              );
            })}
          </div>
          <div style={{ marginTop: '16px', padding: '12px 16px', background: '#f0fff4', border: '1px solid #bbf7d0', borderRadius: '10px', fontSize: '0.8rem', color: '#166534' }}>
            💡 Paste the MASTER PROMPT into Runway Gen-3, Kling, Sora, or Pika. Use SCENE prompts for multi-clip sequences.
          </div>
        </div>
      )}
    </div>
  );
}

export default function Generate() {
  const router = useRouter();
  const { user, userProfile, loading: authLoading, refreshUserProfile } = useAuth();
  const [serverPlan, setServerPlan] = useState(null);
  // Show full-page overlay while activating Pro after payment redirect
  const [activatingPro, setActivatingPro] = useState(false);
  // profileReady = true once auth has resolved (loading=false) OR userProfile arrives.
  // This guarantees the shimmer NEVER persists once the page is visible.
  const profileReady = !authLoading || userProfile !== null;
  const profileIsProUser = hasProAccess(userProfile || {});
  // serverPlan (from /api/auth/me) is the authoritative, DB-backed status.
  // Once it has loaded, BOTH the Pro flag and the label come from it so they
  // can never disagree (which previously showed "Starter" text in Pro-pink).
  // Before it loads, fall back to the context profile to avoid any flicker.
  const isProUser = serverPlan ? Boolean(serverPlan.isPro) : profileIsProUser;
  const currentPlanLabel = serverPlan ? serverPlan.planLabel : getPlanLabel(userProfile || {});
  const [videoTopic, setVideoTopic] = useState('');
  const [viralReference, setViralReference] = useState('');
  const [selectedTone, setSelectedTone] = useState('casual');
  const [selectedPlatform, setSelectedPlatform] = useState('youtube');
  const [duration, setDuration] = useState('60 sec');
  const scriptType = 'viral';
  const [generatedScript, setGeneratedScript] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState('');
  const [isProcessingVideo, setIsProcessingVideo] = useState(false);
  const [videoInfo, setVideoInfo] = useState(null);
  const [videoPrompt, setVideoPrompt] = useState('');
  const [isGeneratingVideoPrompt, setIsGeneratingVideoPrompt] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [keywords, setKeywords] = useState('');
  const [hashtags, setHashtags] = useState('');
  const [seoTips, setSeoTips] = useState('');
  const [isGeneratingAdvanced, setIsGeneratingAdvanced] = useState(false);
  const [selectedCreator, setSelectedCreator] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [recognition, setRecognition] = useState(null);
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);
  const [notification, setNotification] = useState({ show: false, message: '', type: '' });
  const [activeTab, setActiveTab] = useState('script');

  const fetchServerPlan = useCallback(async () => {
    if (!supabase) return null;
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
    if (sessionError) throw sessionError;
    const accessToken = sessionData?.session?.access_token;
    if (!accessToken) return null;

    const response = await fetch('/api/auth/me', {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    });

    const payload = await response.json();
    if (!response.ok) {
      throw new Error(payload?.error || 'Failed to fetch account status.');
    }

    const profile = payload?.profile || {};
    const isPro = hasProAccess(profile);
    return {
      isPro,
      planLabel: getPlanLabel(profile),
      subscription: profile.subscription,
      subscriptionStatus: profile.subscription_status,
      scriptsRemaining: profile.scripts_remaining ?? 0,
      scriptsLimit: profile.scripts_limit ?? 0,
      paid: profile.paid ?? false,
    };
  }, []);

  const syncServerPlan = useCallback(async ({ extendedRetry = false } = {}) => {
    // After a payment redirect extendedRetry=true: poll longer waiting for the async Polar webhook.
    const maxAttempts = extendedRetry ? 25 : 6;
    const delayMs = extendedRetry ? 600 : 400;
    for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
      try {
        const status = await fetchServerPlan();
        if (status) {
          setServerPlan(status);
          // In extended mode keep retrying until isPro is confirmed or attempts exhausted.
          if (!extendedRetry || status.isPro) return status;
        }
      } catch (_error) {
        // retry below
      }
      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }
    return null;
  }, [fetchServerPlan]);

  const ensureProAccess = async () => {
    if (isProUser) return true;
    try {
      const freshStatus = await syncServerPlan();
      if (freshStatus) {
        setServerPlan(freshStatus);
      }
      return Boolean(freshStatus?.isPro);
    } catch (_error) {
      return false;
    }
  };

  useEffect(() => {
    if (!user?.uid) return;
    refreshUserProfile(user.uid).catch(() => {});
    // refreshUserProfile comes from context and is not memoized; keep this stable by uid.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.uid]);

  useEffect(() => {
    if (!user?.uid) return;
    syncServerPlan().catch(() => {});
  }, [user?.uid, syncServerPlan]);

  // Add ref for the response section
  const responseRef = useRef(null);

  // Update exportToPDF function
  const exportToPDF = async (script = null) => {
    try {
      const { jsPDF } = await import('jspdf');
      const doc = new jsPDF();
      
      // Use either the provided script or current form data, with fallbacks
      const title = script?.title || videoTopic || 'Untitled Script';
      const content = script?.script || generatedScript || '';
      const type = script?.type || scriptType || 'viral';
      const platform = script?.platform || selectedPlatform || 'youtube';
      const scriptDuration = script?.duration || duration || '60 sec';
      const tone = script?.tone || selectedTone || 'casual';
      
      // Title
      doc.setFontSize(20);
      doc.setFont(undefined, 'bold');
      doc.text(title || 'Untitled Script', 20, 20);
      
      // Script Type and Platform
      doc.setFontSize(12);
      doc.setFont(undefined, 'normal');
      doc.text(`Type: ${(type || 'viral').charAt(0).toUpperCase() + (type || 'viral').slice(1)} Script`, 20, 30);
      doc.text(`Platform: ${(platform || 'youtube').charAt(0).toUpperCase() + (platform || 'youtube').slice(1)}`, 20, 37);
      doc.text(`Duration: ${scriptDuration || '60 sec'}`, 20, 44);
      doc.text(`Tone: ${(tone || 'casual').charAt(0).toUpperCase() + (tone || 'casual').slice(1)}`, 20, 51);
      
      // Script Content
      doc.setFontSize(14);
      doc.setFont(undefined, 'bold');
      doc.text('Script Content:', 20, 65);
      
      // Clean and format the script content
      const cleanScript = content
        .replace(/<style[^>]*>[\s\S]*?<\/style>/g, '') // Remove style tags
        .replace(/<[^>]+>/g, '') // Remove HTML tags
        .replace(/\s+/g, ' ') // Replace multiple spaces with single space
        .trim();

      // Split into sections
      const sections = cleanScript.split(/(?=Hook|Intro|Body|Conclusion|CTA|Trending)/);
      
      let yPos = 75;
      doc.setFontSize(12);
      doc.setFont(undefined, 'normal');

      sections.forEach(section => {
        if (section.trim()) {
          // Check if we need a new page
          if (yPos > 250) {
            doc.addPage();
            yPos = 20; // Reset Y position for new page
          }

          // Add section title in bold
          const sectionTitle = section.match(/^(Hook|Intro|Body|Conclusion|CTA|Trending)/)?.[0];
          if (sectionTitle) {
            doc.setFont(undefined, 'bold');
            doc.text(sectionTitle, 20, yPos);
            yPos += 10;
            doc.setFont(undefined, 'normal');
          }

          // Add section content
          const content = section.replace(/^(Hook|Intro|Body|Conclusion|CTA|Trending)/, '').trim();
          const splitText = doc.splitTextToSize(content, 170);
          
          // Check if content will fit on current page
          if (yPos + (splitText.length * 7) > 250) {
            doc.addPage();
            yPos = 20;
          }
          
          doc.text(splitText, 20, yPos);
          yPos += (splitText.length * 7) + 10; // Add spacing between sections
        }
      });
      
      // Add page numbers to all pages
      const pageCount = doc.internal.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(10);
        doc.text(`Page ${i} of ${pageCount}`, 20, 280);
      }
      
      doc.save(`${title}.pdf`);
    } catch (err) {
      console.error('Error exporting to PDF:', err);
      setError('Error exporting to PDF. Please try again.');
    }
  };

  // Update exportToWord function to handle saved scripts
  const exportToWord = async (script = null) => {
    try {
      // Use either the provided script or current form data, with fallbacks
      const title = script?.title || videoTopic || 'Untitled Script';
      const content = (script?.script || generatedScript || '').toString();
      const type = script?.type || scriptType || 'viral';
      const platform = script?.platform || selectedPlatform || 'youtube';
      const scriptDuration = script?.duration || duration || '60 sec';
      const tone = script?.tone || selectedTone || 'casual';

      // Clean and format the script content
      const cleanScript = content
        .replace(/<style[^>]*>[\s\S]*?<\/style>/g, '') // Remove style tags
        .replace(/<[^>]+>/g, '') // Remove HTML tags
        .replace(/\s+/g, ' ') // Replace multiple spaces with single space
        .trim();

      // Split into sections, with fallback for empty content
      const sections = cleanScript ? cleanScript.split(/(?=Hook|Intro|Body|Conclusion|CTA|Trending)/) : [];

      const doc = new Document({
        sections: [{
          properties: {
            page: {
              margin: {
                top: 1440, // 1 inch
                right: 1440,
                bottom: 1440,
                left: 1440
              }
            }
          },
          children: [
            // Title
            new Paragraph({
              children: [
                new TextRun({
                  text: title,
                  bold: true,
                  size: 32 // 16pt
                })
              ],
              spacing: { after: 400 }
            }),
            // Metadata
            new Paragraph({
              children: [
                new TextRun({
                  text: `Type: ${type.charAt(0).toUpperCase() + type.slice(1)} Script\n`,
                  bold: true,
                  size: 24 // 12pt
                }),
                new TextRun({
                  text: `Platform: ${platform.charAt(0).toUpperCase() + platform.slice(1)}\n`,
                  bold: true,
                  size: 24
                }),
                new TextRun({
                  text: `Duration: ${scriptDuration}\n`,
                  bold: true,
                  size: 24
                }),
                new TextRun({
                  text: `Tone: ${tone.charAt(0).toUpperCase() + tone.slice(1)}`,
                  bold: true,
                  size: 24
                })
              ],
              spacing: { after: 400 }
            }),
            // Script Content Header
            new Paragraph({
              children: [
                new TextRun({
                  text: 'Script Content:',
                  bold: true,
                  size: 28 // 14pt
                })
              ],
              spacing: { after: 300, before: 300 }
            }),
            // Add each section with proper formatting
            ...sections.map(section => {
              if (!section?.trim()) return null;
              
              const sectionTitle = section.match(/^(Hook|Intro|Body|Conclusion|CTA|Trending)/)?.[0] || '';
              const sectionContent = section.replace(/^(Hook|Intro|Body|Conclusion|CTA|Trending)/, '').trim();
              
              if (!sectionContent) return null;

              return new Paragraph({
                children: [
                  new TextRun({
                    text: sectionTitle + '\n',
                    bold: true,
                    size: 28 // 14pt
                  }),
                  new TextRun({
                    text: sectionContent,
                    size: 24 // 12pt
                  })
                ],
                spacing: { after: 300, before: 300 },
                pageBreakBefore: sectionTitle === 'Body' // Add page break before main content
              });
            }).filter(Boolean)
          ]
        }]
      });

      const buffer = await Packer.toBlob(doc);
      saveAs(buffer, `${title}.docx`);
    } catch (err) {
      console.error('Error exporting to Word:', err);
      setError('Error exporting to Word. Please try again.');
    }
  };

  // Generate SEO tips and hashtags
  const generateAdvancedContent = async () => {
    try {
      setIsGeneratingAdvanced(true);
      setError('');

      const prompt = `Based on this video topic: "${videoTopic}", provide:
      1. 5 relevant keywords for SEO
      2. 10 trending hashtags for ${selectedPlatform}
      3. 3 SEO optimization tips
      
      Format the response in a clear, concise way without markdown symbols.`;

      const content = await generateWithOpenAI(prompt, {
        maxTokens: 1024,
        temperature: 0.9
      });
      
      // Parse the response into sections
      const sections = content.split('\n\n');
      setKeywords(sections[0]);
      setHashtags(sections[1]);
      setSeoTips(sections[2]);
    } catch (err) {
      console.error('Error generating advanced content:', err);
      setError('Error generating advanced content. Please try again.');
    } finally {
      setIsGeneratingAdvanced(false);
    }
  };

  const processVideoLink = async (link) => {
    if (!link) return null;

    try {
      setIsProcessingVideo(true);
      let videoData = null;

      if (link.includes('youtube.com') || link.includes('youtu.be')) {
        // Handle all YouTube URL formats: watch?v=, youtu.be/, /shorts/, /live/
        let videoId = null;
        if (link.includes('youtu.be/')) {
          videoId = link.split('youtu.be/')[1]?.split('?')[0];
        } else if (link.includes('/shorts/')) {
          videoId = link.split('/shorts/')[1]?.split('?')[0];
        } else if (link.includes('/live/')) {
          videoId = link.split('/live/')[1]?.split('?')[0];
        } else if (link.includes('v=')) {
          videoId = link.split('v=')[1]?.split('&')[0];
        }

        if (videoId) {
          videoData = {
            platform: 'YouTube',
            id: videoId,
            url: `https://www.youtube.com/watch?v=${videoId}`,
            embedUrl: `https://www.youtube.com/embed/${videoId}`,
            title: null,
            author: null,
          };
          // Fetch title via our server endpoint (avoids CSP restrictions)
          try {
            const info = await fetch(
              `/api/video-info?url=${encodeURIComponent(videoData.url)}`
            ).then(r => r.ok ? r.json() : null);
            if (info?.title) {
              videoData.title  = info.title;
              videoData.author = info.author || null;
            }
          } catch { /* ignore — title is optional */ }
        }
      } else if (link.includes('tiktok.com') || link.includes('vm.tiktok.com') || link.includes('vt.tiktok.com')) {
        // Handle standard URLs (/@user/video/ID) and short links (vm.tiktok.com/XXX)
        const videoId = link.includes('/video/')
          ? link.split('/video/')[1]?.split('?')[0]
          : link.split('tiktok.com/')[1]?.split('?')[0] || 'short';

        videoData = {
          platform: 'TikTok',
          id: videoId,
          url: link,
          embedUrl: videoId !== 'short' ? `https://www.tiktok.com/embed/${videoId}` : link,
          title: null,
          author: null,
        };
        // Fetch title via our server endpoint
        try {
          const info = await fetch(
            `/api/video-info?url=${encodeURIComponent(link)}`
          ).then(r => r.ok ? r.json() : null);
          if (info?.title) {
            videoData.title  = info.title;
            videoData.author = info.author || null;
          }
        } catch { /* ignore */ }

      } else if (link.includes('instagram.com/reel') || link.includes('instagram.com/p/')) {
        // Instagram Reels / posts
        const reelId = link.includes('/reel/')
          ? link.split('/reel/')[1]?.split('/')[0]?.split('?')[0]
          : link.split('/p/')[1]?.split('/')[0]?.split('?')[0];

        if (reelId) {
          videoData = {
            platform: 'Instagram',
            id: reelId,
            url: link,
            embedUrl: null,
            title: null,
            author: null,
          };
          // Instagram oEmbed requires auth token — skip title fetch, still useful as style reference
        }
      }

      if (videoData) {
        setVideoInfo(videoData);
        // Auto-fill the topic from the video title only when the user hasn't typed one
        if (videoData.title && !videoTopic.trim()) {
          setVideoTopic(videoData.title);
        }
        return videoData;
      }

      return null;
    } catch (err) {
      console.error('Error processing video link:', err);
      return null;
    } finally {
      setIsProcessingVideo(false);
    }
  };

  const normalizeTitleSection = (rawText = '') => {
    const sectionRegex = /(#{1,2}\s*(?:Viral|Advertisement)\s+Title\s+Options[\s\S]*?)(?=\n#{1,2}\s*(?:Hook|Intro|Body|Conclusion|CTA|Visual Elements|Audio Elements)\b|$)/i;
    const match = rawText.match(sectionRegex);
    if (!match) return rawText;

    const section = match[0];
    const titleLines = [];

    // Try strict "Title n:" format first.
    const strictMatches = [...section.matchAll(/(?:^|\n)\s*Title\s*([1-3])\s*:\s*(.+?)(?=\n(?:Title\s*[1-3]\s*:|#{1,2}\s|$)|$)/gims)];
    if (strictMatches.length > 0) {
      strictMatches.forEach((m) => titleLines.push(`Title ${m[1]}: ${m[2].trim().replace(/^["'“”]+|["'“”]+$/g, '')}`));
    } else {
      // Fallback: handle 1. / 1) / merged one-line title options.
      const merged = section
        .replace(/\r/g, '')
        .replace(/\s+(?=(?:Title\s*[1-3]\s*:|[1-3][\.\)]\s+))/g, '\n');
      const numberedMatches = [...merged.matchAll(/(?:^|\n)\s*(?:Title\s*([1-3])\s*:|([1-3])[\.\)]\s+)\s*([^\n]+)/gim)];
      numberedMatches.forEach((m, index) => {
        const n = m[1] || m[2] || String(index + 1);
        const clean = (m[3] || '').trim().replace(/^["'“”]+|["'“”]+$/g, '');
        if (clean) titleLines.push(`Title ${n}: ${clean}`);
      });
    }

    const uniqueLines = [...new Set(titleLines)].slice(0, 3);
    if (uniqueLines.length === 0) return rawText;

    const normalizedLines = [section.split('\n')[0], ...uniqueLines].join('\n');
    return rawText.replace(sectionRegex, normalizedLines);
  };

  const formatScript = (text) => {
    // First clean up the titles section and fix title numbering
    let cleanedText = normalizeTitleSection(text)
      .replace(/\*\s*Title\s*(\d+):/g, (_match, num) => `\nTitle ${num}:`) // Fix title numbering
      .replace(/\[Top 3 Viral Title Options\]/g, '# Viral Title Options\n')
      .replace(/\*/g, '')
      .replace(/\n{3,}/g, '\n\n')
      // Remove any visual/audio directions if they're not in their dedicated sections
      .replace(/\((.*?camera.*?)\)/gi, '')
      .replace(/\((.*?visual.*?)\)/gi, '')
      .replace(/\((.*?music.*?)\)/gi, '')
      .replace(/\((.*?sound.*?)\)/gi, '');

    // Convert markdown to HTML with better formatting
    const htmlContent = cleanedText
      .replace(/^# (.*$)/gm, '<h1 class="script-title">$1</h1>')
      .replace(/^## (.*$)/gm, '<h2 class="script-section">$1</h2>')
      .replace(/Title\s*(\d+)\s*:\s*([\s\S]*?)(?=\nTitle\s*\d+\s*:|\n##\s|\n#\s|$)/g, (_match, num, content) => {
        return `<div class="title-option">
          <span class="title-number">Title ${num}</span>
          <div class="title-content">${content.trim().replace(/^["'“”]+|["'“”]+$/g, '')}</div>
        </div>`;
      })
      // Add paragraph tags for better spacing
      .split('\n\n')
      .map(paragraph => {
        // Don't wrap headers or title options in <p> tags
        if (paragraph.startsWith('<h1') || 
            paragraph.startsWith('<h2') || 
            paragraph.startsWith('<div class="title-option"')) {
          return paragraph;
        }
        return `<p class="script-paragraph">${paragraph.replace(/\n/g, '<br />')}</p>`;
      })
      .join('\n');

    return `
      <div class="script-content">
        <style>
          .script-content {
            font-family: system-ui, -apple-system, sans-serif;
            line-height: 1.6;
            color: #333;
          }
          .script-content h1 {
            font-size: 1.5rem;
            color: #333;
            margin: 2rem 0 1.5rem;
            font-weight: 700;
            border-bottom: 2px solid #FF3366;
            padding-bottom: 0.5rem;
          }
          .script-content h2 {
            font-size: 1.2rem;
            color: #FF3366;
            margin: 1.5rem 0 1rem;
            font-weight: 600;
          }
          .script-content .title-option {
            background: #f8f9ff;
            padding: 1.5rem;
            margin: 1rem 0;
            border-radius: 8px;
            border-left: 4px solid #FF3366;
          }
          .script-content .title-number {
            display: inline-block;
            font-weight: 600;
            color: #FF3366;
            margin-bottom: 0.5rem;
          }
          .script-content .title-content {
            font-size: 1.1rem;
            font-weight: 500;
            color: #333;
            line-height: 1.4;
          }
          .script-content p {
            margin-bottom: 1rem;
            line-height: 1.8;
            color: #444;
          }
          .script-content strong {
            color: #333;
            font-weight: 600;
            background: #FFE5EC;
            padding: 0.1em 0.3em;
            border-radius: 3px;
          }
          .script-content ul, .script-content ol {
            margin: 1rem 0;
            padding-left: 1.5rem;
          }
          .script-content li {
            margin-bottom: 0.5rem;
            color: #444;
          }
          .script-content blockquote {
            border-left: 4px solid #FF3366;
            margin: 1.5rem 0;
            padding: 1rem;
            background: #f8f9ff;
            font-style: italic;
            color: #555;
          }
        </style>
        ${htmlContent}
      </div>
    `;
  };

  const generatePrompt = async (topicOverride) => {
    const videoReference = viralReference ? await processVideoLink(viralReference) : null;
    // topicOverride is used when the topic was resolved from the reference video title
    // in the same render cycle (React state hasn't updated yet)
    const effectiveTopic = topicOverride || videoTopic;

    // Exact word count targets (at ~130 wpm speaking pace)
    const wordCountTargets = {
      '15 sec':  '30–40',
      '30 sec':  '60–75',
      '45 sec':  '95–110',
      '60 sec':  '125–150',
      '90 sec':  '190–220',
      '2 min':   '255–300',
      '3 min':   '380–440',
      '5 min':   '635–720',
      '10 min':  '1250–1450',
      '15 min':  '1900–2150',
      '20 min':  '2550–2900',
      '30 min':  '3800–4300',
      '45 min':  '5700–6400',
      '60 min':  '7600–8500',
    };
    const targetWords = wordCountTargets[duration] || '125–150';

    // Platform-specific direction
    const platformGuide = {
      youtube:   'YouTube: Hook can be 5–8 seconds. Build a clear story arc. Pacing is dynamic but not frantic. Use chapter-like structure for longer videos.',
      tiktok:    'TikTok: The very FIRST sentence must be the hook — zero warm-up. Ultra-short sentences. High energy. Trending language.',
      instagram: 'Instagram Reels: Visual storytelling. Hook lands in 2 seconds. Aesthetic and relatable. Community-driven CTA.',
      facebook:  'Facebook: Slightly slower pace is fine. Emotion and shareability drive performance. Lead with a relatable pain point.',
    };
    const platformDir = platformGuide[selectedPlatform] || platformGuide.youtube;

    // Tone direction
    const toneGuide = {
      casual:        'Talk like you\'re texting your best friend — relaxed, real, no corporate words.',
      funny:         'Dry wit, unexpected comparisons, self-aware humor. Funny because it\'s TRUE, not because it\'s trying.',
      informative:   'Teach confidently. Use specifics. Make complex things feel simple and surprising.',
      inspirational: 'Emotionally resonant. Personal truth. Build to a genuine moment of belief.',
      creative:      'Break expectations. Unusual angles. Use metaphor and vivid imagery.',
    };
    const toneDir = toneGuide[selectedTone] || toneGuide.casual;

    // Reference video section — use actual title if we fetched it
    let refVideoSection = '';
    if (videoReference) {
      if (videoReference.title) {
        refVideoSection = `
REFERENCE VIDEO (your structural blueprint — do NOT copy the topic):
Title: "${videoReference.title}"${videoReference.author ? `\nCreator: ${videoReference.author}` : ''}
Platform: ${videoReference.platform}

Study this title carefully. Reverse-engineer WHY it works:
- What emotion or curiosity gap does the title create?
- What hook structure is implied by that title?
- What pacing and energy does a video with that title use?
- What kind of payoff does the viewer expect?

Now apply THAT same hook structure, pacing, and emotional logic to the topic "${effectiveTopic}".
Your script should feel like a spiritual cousin of that video — same energy, completely different content.`;
      } else {
        refVideoSection = `
REFERENCE VIDEO (your structural blueprint):
Platform: ${videoReference.platform}
URL: ${videoReference.url}

Apply the viral structure, hook style, and pacing typical of high-performing ${videoReference.platform} videos to the topic "${effectiveTopic}".`;
      }
    }

    // Creator style section
    let creatorSection = '';
    if (selectedCreator) {
      const creatorInfo = creatorStyles[selectedPlatform]?.find(c => c.name === selectedCreator);
      if (creatorInfo) {
        creatorSection = `
CREATOR STYLE — write in the voice of ${selectedCreator}:
${creatorInfo.description}
Match their energy level, sentence rhythm, signature transitions, and natural catchphrases.`;
      }
    }

    const prompt = `You are a professional scriptwriter who has written viral content that has generated over 500 million views. You write scripts that sound FULLY HUMAN — no AI tells, no filler openers, no generic structure.

HARD RULES — violating any of these is a failure:
1. NEVER start with "yo", "hey", "alright", "okay so", "so today", "in this video", "welcome back", or any warm-up phrase. Start COLD with the hook itself.
2. NEVER use generic AI phrases like "picture this", "imagine a world", "but here's the thing", "let's dive in", "buckle up".
3. WORD COUNT: The script (Hook + Body + CTA combined) must be EXACTLY ${targetWords} words. Count carefully. A ${duration} script at normal speaking pace = ${targetWords} words.
4. No filler. Every single sentence must earn its place. If a sentence doesn't hook, inform, or advance — cut it.
5. Write in first person, active voice, spoken English. Not written English. Short sentences. Real contractions. How a human actually talks.

ASSIGNMENT:
Topic: "${effectiveTopic}"
Duration: ${duration} → TARGET WORD COUNT: ${targetWords} words
Platform: ${selectedPlatform}
Tone: ${selectedTone}
Type: ${scriptType === 'ad' ? 'Advertisement' : 'Viral Content'}
Format: Voiceover/spoken script only — no camera directions or visual cues.

PLATFORM DIRECTION:
${platformDir}

TONE DIRECTION:
${toneDir}
${refVideoSection}
${creatorSection}
${scriptType === 'ad' ? `
AD STRUCTURE:
Hook → Stop the scroll with the problem or a shocking result (not a question).
Problem → Make them feel understood in 1–2 sentences.
Solution → Introduce it through demonstration, not description.
Proof → One specific, believable result or detail.
Urgency → Create genuine FOMO without fake scarcity.
CTA → One clear action. Make it feel like the obvious next step.` : `
VIRAL STRUCTURE:
Hook → The first sentence must make stopping feel impossible. Use a statement, not a question.
Build → Layer in intrigue, tension, or new information every 10–15 seconds.
Peak → The moment everything clicks. The "oh damn" point.
Payoff → Deliver exactly what the hook promised. Don't undersell it.
CTA → One natural ask that feels like a continuation of the story.`}

OUTPUT FORMAT — use these exact section headers, nothing else:

# ${scriptType === 'ad' ? 'Advertisement Title Options' : 'Viral Title Options'}
Title 1: <title>
Title 2: <title>
Title 3: <title>

## Hook
[First spoken words — no warm-up, maximum impact]

## Body
[Main content — this is the bulk of the script. Keep the word count target in mind for the TOTAL script]

## CTA
[One natural call to action that feels like a continuation of the story, not an interruption]
`;

    return prompt;
  };

  const handleGenerate = async () => {
    // Resolve topic: use what the user typed, or fall back to the reference video title
    let resolvedTopic = videoTopic.trim();

    if (!resolvedTopic && viralReference.trim()) {
      const ref = await processVideoLink(viralReference.trim());
      if (ref?.title) {
        resolvedTopic = ref.title;
        setVideoTopic(ref.title); // update the UI field too
      }
    }

    if (!resolvedTopic) {
      setError('Please enter a video topic (or paste a YouTube/TikTok link to use its title)');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    // Free users: block durations longer than 30 seconds
    if (!isProUser && duration !== '15 sec' && duration !== '30 sec') {
      setShowSubscriptionModal(true);
      return;
    }

    try {
      setIsGenerating(true);
      setError('');

      const prompt = await generatePrompt(resolvedTopic);
      const tokensByDuration = {
        '15 sec': 512, '30 sec': 768, '45 sec': 1024, '60 sec': 1536,
        '90 sec': 2048, '2 min': 2560, '3 min': 3500, '5 min': 3500,
        '10 min': 3500, '15 min': 3500, '20 min': 3500,
        '30 min': 3500, '45 min': 3500, '60 min': 3500,
      };
      const maxTokens = tokensByDuration[duration] || 2048;
      const generatedText = await generateWithOpenAI(prompt, { maxTokens, temperature: 0.9 });
      const formattedScript = formatScript(generatedText);
      setGeneratedScript(formattedScript);
      // Refresh profile so scripts_remaining updates in the UI
      refreshUserProfile().catch(() => {});

    } catch (err) {
      console.error('Generation error:', err);
      if (err?.message === 'limit_reached' || String(err?.message).includes('limit_reached')) {
        // Open upgrade modal directly — no error toast, just the hard sell
        setShowSubscriptionModal(true);
      } else {
        setError('Error generating script. Please try again.');
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    } finally {
      setIsGenerating(false);
    }
  };

  const buildVideoPromptRequest = (script) => {
    return `You are an expert AI video director. Convert this script into a series of detailed AI video generation prompts optimized for tools like Runway, Kling, Sora, and Pika.

SCRIPT:
${script}

Break the script into SCENES. For each scene write ONE AI video generation prompt.

Rules:
- Each prompt is 2-3 sentences maximum
- Include: subject, action, camera angle, lighting, mood, visual style
- Style: cinematic, ultra-realistic, 4K, photorealistic unless the content calls for animation
- Do NOT mention the script text verbatim — describe what the CAMERA should show
- Format each scene as: SCENE [number] ([duration estimate]): [prompt]

Example format:
SCENE 1 (0-3s): Close-up of hands typing on a glowing keyboard in a dark room, blue neon light casting sharp shadows, cinematic 4K, tense atmosphere.
SCENE 2 (3-8s): Wide shot of a young creator sitting at a desk surrounded by multiple monitors showing analytics charts, warm afternoon light through blinds, documentary style.`;
  };

  const handleGenerateVideoPrompt = async () => {
    if (!generatedScript) return;
    if (!isProUser) { setShowSubscriptionModal(true); return; }

    try {
      setIsGeneratingVideoPrompt(true);
      setError('');
      const cleanScript = generatedScript.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
      const prompt = buildVideoPromptRequest(cleanScript);
      const generatedText = await generateWithOpenAI(prompt, { maxTokens: 2000, temperature: 0.8 });
      setVideoPrompt(generatedText);
    } catch (err) {
      if (err?.message === 'limit_reached' || String(err?.message).includes('limit_reached')) {
        setShowSubscriptionModal(true);
      } else {
        setError('Error generating video prompts. Please try again.');
      }
    } finally {
      setIsGeneratingVideoPrompt(false);
    }
  };

  const handleGenerateAnother = () => {
    // Reset all form fields
    setVideoTopic('');
    setViralReference('');
    setSelectedTone('casual');
    setSelectedPlatform('youtube');
    setDuration('60 sec');

    setGeneratedScript('');
    setVideoPrompt('');
    setVideoInfo(null);
    setError('');

    // Use requestAnimationFrame to ensure scroll happens after state updates
    requestAnimationFrame(() => {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    });
  };

  // Update voice recognition setup
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Check for secure context
      const isSecureContext = window.isSecureContext;
      const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
      
      // Check for browser support
      if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
        console.log('Speech recognition not supported');
        return;
      }

      try {
        const SpeechRecognition = window.webkitSpeechRecognition || window.SpeechRecognition;
        const newRecognition = new SpeechRecognition();
        
        newRecognition.continuous = false;
        newRecognition.interimResults = false;
        newRecognition.lang = 'en-US';

        newRecognition.onstart = () => {
          setIsRecording(true);
          setError('');
        };

        newRecognition.onresult = (event) => {
          try {
            const transcript = event.results[0][0].transcript;
            setVideoTopic(transcript);
            setIsRecording(false);
            setError(''); // Clear any previous errors
          } catch (err) {
            console.error('Error processing speech result:', err);
            setError('Could not process voice input. Please try again.');
            setIsRecording(false);
          }
        };

        newRecognition.onerror = (event) => {
          console.error('Speech recognition error:', event.error);
          setIsRecording(false);
          
          // Provide more specific error messages
          switch (event.error) {
            case 'not-allowed':
              if (!isSecureContext && !isLocalhost) {
                setError('Voice input requires a secure connection (HTTPS). Please use HTTPS or localhost.');
              } else {
                setError('Please allow microphone access to use voice input.');
              }
              break;
            case 'no-speech':
              setError('No speech was detected. Please try again.');
              break;
            case 'network':
              setError('Network error occurred. Please check your connection.');
              break;
            case 'audio-capture':
              setError('No microphone was found. Please check your device settings.');
              break;
            default:
              setError('Voice input error. Please try again.');
          }
        };

        newRecognition.onend = () => {
          setIsRecording(false);
        };

        setRecognition(newRecognition);
      } catch (err) {
        console.error('Error setting up speech recognition:', err);
        setError('Could not initialize voice input. Please try again.');
      }
    }
  }, [router]); // Added router as dependency

  // Update toggleRecording function
  const toggleRecording = async () => {
    if (!recognition) {
      setError('Voice input is not supported in your browser. Please try using Chrome.');
      return;
    }

    // Check for secure context
    const isSecureContext = window.isSecureContext;
    const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';

    if (!isSecureContext && !isLocalhost) {
      setError('Voice input requires a secure connection (HTTPS). Please use HTTPS or localhost.');
      return;
    }

    try {
      if (isRecording) {
        recognition.stop();
        setIsRecording(false);
      } else {
        try {
          // Check if running on localhost
          if (isLocalhost) {
            // For localhost, try to start recognition directly
            recognition.start();
            setIsRecording(true);
            setError('');
          } else {
            // For non-localhost, check microphone access
            const stream = await navigator.mediaDevices?.getUserMedia({ audio: true });
            if (stream) {
              stream.getTracks().forEach(track => track.stop());
              recognition.start();
              setIsRecording(true);
              setError('');
            }
          }
        } catch (err) {
          console.error('Microphone access error:', err);
          if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
            setError('Please allow microphone access to use voice input.');
          } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
            setError('No microphone found. Please check your device settings.');
          } else if (err.name === 'NotReadableError' || err.name === 'TrackStartError') {
            setError('Could not access your microphone. Please check if another application is using it.');
          } else if (!isSecureContext && !isLocalhost) {
            setError('Voice input requires a secure connection (HTTPS). Please use HTTPS or localhost.');
          } else {
            setError('Error accessing microphone. Please try again.');
          }
          setIsRecording(false);
        }
      }
    } catch (err) {
      console.error('Error toggling recording:', err);
      setError('Error with voice input. Please try again.');
      setIsRecording(false);
    }
  };

  useEffect(() => {
    const { payment } = router.query;
    if (!payment) return;

    const handlePaymentStatus = async () => {
      if (payment === 'success') {
        // Show overlay immediately so user never sees "Starter"
        setActivatingPro(true);

        let proActivated = false;
        try {
          const { data: sessionData } = await supabase.auth.getSession();
          const token = sessionData?.session?.access_token;

          if (token) {
            // Try sync-subscription up to 10 times (40 seconds total), 4s apart
            for (let i = 0; i < 10; i++) {
              const syncRes = await fetch('/api/account/sync-subscription', {
                method: 'POST',
                headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
                body: JSON.stringify({}),
              });
              if (syncRes.ok) {
                const syncData = await syncRes.json();
                const p = syncData?.profile || {};
                proActivated = Boolean(
                  syncData?.activated ||
                  p.subscription === 'pro' ||
                  p.subscription_status === 'active' ||
                  p.paid
                );
              }
              if (proActivated) break;
              await new Promise(r => setTimeout(r, 4000));
            }
          }
        } catch (_e) { /* fall through */ }

        // Refresh AuthContext — picks up the updated DB row
        await refreshUserProfile().catch(() => {});
        // Also update the local serverPlan state
        const fresh = await fetchServerPlan().catch(() => null);
        if (fresh) setServerPlan(fresh);

        setActivatingPro(false);
        router.replace('/generate', undefined, { shallow: true });

        if (proActivated) {
          toast.success('Payment successful! Your Pro access is now active. 🎉');
        } else {
          toast.success('Payment received! If your plan hasn\'t updated, please contact support.');
        }
      } else if (payment === 'failed') {
        toast.error('Payment failed. Please try again or contact support.');
        router.replace('/generate', undefined, { shallow: true });
      } else if (payment === 'error') {
        toast.error('An error occurred. Please contact support if payment was deducted.');
        router.replace('/generate', undefined, { shallow: true });
      }
    };

    handlePaymentStatus().catch((err) => {
      console.error('Payment status error:', err);
      setActivatingPro(false);
      router.replace('/generate', undefined, { shallow: true });
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router.query.payment]);

  // ── Pro activation overlay (shown while syncing after payment) ─────────────
  if (activatingPro) {
    return (
      <ProtectedRoute>
        <div style={{
          position: 'fixed', inset: 0, zIndex: 9999,
          background: 'linear-gradient(135deg,#fff5f7 0%,#ffffff 100%)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <div style={{ textAlign: 'center', padding: '2rem' }}>
            <div style={{
              width: 64, height: 64, borderRadius: '50%',
              background: '#FF3366',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 20px',
            }}>
              <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"
                style={{ animation: 'spin 1s linear infinite' }}>
                <path d="M12 2a10 10 0 0 1 10 10" strokeLinecap="round"/>
              </svg>
            </div>
            <h2 style={{ margin: '0 0 8px', fontSize: '1.5rem', fontWeight: 700, color: '#1a1a1a' }}>
              Activating your Pro access…
            </h2>
            <p style={{ color: '#666', fontSize: '0.95rem' }}>
              Just a moment, we&rsquo;re confirming your payment.
            </p>
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        paddingTop: '80px'
      }}>
        <GeneratePageNav onOpenUpgrade={() => setShowSubscriptionModal(true)} />
        
        {notification.show && (
          <div style={{
            position: 'fixed',
            top: '100px',
            left: '50%',
            transform: 'translateX(-50%)',
            backgroundColor: notification.type === 'success' ? '#E8F5E9' : '#FFF2F2',
            color: notification.type === 'success' ? '#2E7D32' : '#FF3366',
            padding: '12px 16px',
            borderRadius: '12px',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            maxWidth: '90%',
            width: 'fit-content',
            minWidth: '300px',
            animation: 'fadeIn 0.2s ease-out'
          }}>
            <span style={{ 
              fontSize: '1.2rem',
              flexShrink: 0 
            }}>
              {notification.type === 'success' ? '✓' : '!'}
            </span>
            <span style={{
              flex: 1,
              fontSize: '0.95rem',
              lineHeight: '1.4'
            }}>
              {notification.message}
            </span>
            <button
              onClick={() => setNotification({ show: false, message: '', type: '' })}
              style={{
                marginLeft: '8px',
                background: 'none',
                border: 'none',
                padding: '4px',
                cursor: 'pointer',
                color: notification.type === 'success' ? '#2E7D32' : '#FF3366',
                fontSize: '1.2rem',
                opacity: 0.7,
                flexShrink: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '20px',
                height: '20px'
              }}
            >
              ×
            </button>
          </div>
        )}

        <style jsx global>{`
          @keyframes fadeIn {
            from {
              opacity: 0;
              transform: translate(-50%, -10px);
            }
            to {
              opacity: 1;
              transform: translate(-50%, 0);
            }
          }
        `}</style>

        <main style={{
          flex: 1,
          padding: '20px',
          background: 'linear-gradient(to bottom, #f8f9ff, #ffffff)',
          fontFamily: 'system-ui, -apple-system, sans-serif'
        }}>
          <div style={{
            maxWidth: '800px',
            margin: '0 auto',
            display: 'flex',
            flexDirection: 'column',
            gap: '30px'
          }}>
            {/* Tab Switcher */}
            <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', marginBottom: '8px' }}>
              {[
                { key: 'script', label: '🎬 Script Generator' },
                { key: 'video-prompt', label: '✦ Video Prompt' },
              ].map(tab => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  style={{
                    padding: '10px 24px',
                    borderRadius: '50px',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: '0.92rem',
                    fontWeight: 700,
                    transition: 'all 0.2s',
                    background: activeTab === tab.key ? '#FF3366' : '#f0f0f0',
                    color: activeTab === tab.key ? '#fff' : '#555',
                    boxShadow: activeTab === tab.key ? '0 4px 16px rgba(255,51,102,0.3)' : 'none',
                    transform: activeTab === tab.key ? 'scale(1.04)' : 'scale(1)',
                  }}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* ── VIDEO PROMPT TAB ─────────────────────────────────────────── */}
            {activeTab === 'video-prompt' && (
              <VideoPromptTab isProUser={isProUser} onUpgrade={() => setShowSubscriptionModal(true)} />
            )}

            {/* ── SCRIPT GENERATOR TAB ─────────────────────────────────────── */}
            {activeTab === 'script' && <>
            {/* Main Card */}
            <div style={{
              background: 'white',
              borderRadius: '20px',
              padding: '30px',
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.05)',
              boxSizing: 'border-box'
            }}>
              {/* Error/Success Message */}
              {error && (
                <div style={{
                  backgroundColor: error.includes('successfully') ? '#E8F5E9' : '#FFF2F2',
                  color: error.includes('successfully') ? '#2E7D32' : '#FF3366',
                  padding: '12px 16px',
                  borderRadius: '12px',
                  marginBottom: '20px',
                  fontSize: '0.9rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  <span style={{
                    fontSize: '1.2rem'
                  }}>
                    {error.includes('successfully') ? '✓' : '!'}
                  </span>
                  {error}
                  {!error.includes('successfully') && (
                    <button
                      onClick={() => setError('')}
                      style={{
                        marginLeft: 'auto',
                        background: 'none',
                        border: 'none',
                        padding: '4px',
                        cursor: 'pointer',
                        color: '#FF3366',
                        fontSize: '1.2rem',
                        opacity: 0.7,
                        ':hover': { opacity: 1 }
                      }}
                    >
                      ×
                    </button>
                  )}
                </div>
              )}


              {/* Video Topic/Ideas Input */}
              <div style={{ marginBottom: '25px' }}>
                <label style={{
                  display: 'block',
                  color: '#666',
                  marginBottom: '8px',
                  fontSize: '0.9rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  Video Topic or Ideas
                  <span style={{
                    fontSize: '0.8rem',
                    color: '#999',
                    fontWeight: 'normal'
                  }}>
                    (Type or record your thoughts)
                  </span>
                </label>
                <div style={{
                  position: 'relative',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px'
                }}>
                  <div style={{
                    position: 'relative',
                    display: 'flex',
                    alignItems: 'flex-start'
                  }}>
                    <textarea
                      value={videoTopic}
                      onChange={(e) => setVideoTopic(e.target.value)}
                      placeholder="Enter your video topic or share your creative ideas here..."
                      style={{
                        width: '100%',
                        padding: '12px 16px',
                        paddingRight: '48px',
                        fontSize: '1rem',
                        border: '1px solid #e0e0e0',
                        borderRadius: '12px',
                        backgroundColor: '#fafafa',
                        color: '#333',
                        outline: 'none',
                        transition: 'all 0.2s',
                        boxSizing: 'border-box',
                        minHeight: '60px',
                        maxHeight: '200px',
                        resize: 'vertical',
                        lineHeight: '1.5',
                        ':focus': {
                          borderColor: '#FF3366',
                          backgroundColor: '#fff',
                          boxShadow: '0 0 0 3px rgba(255, 51, 102, 0.1)'
                        }
                      }}
                    />
                    <button
                      onClick={toggleRecording}
                      title={isRecording ? 'Stop recording' : 'Start recording'}
                      style={{
                        position: 'absolute',
                        right: '12px',
                        top: '12px',
                        background: 'none',
                        border: 'none',
                        padding: '8px',
                        cursor: 'pointer',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transition: 'all 0.2s',
                        backgroundColor: isRecording ? '#FF3366' : 'transparent',
                        width: '32px',
                        height: '32px'
                      }}
                    >
                      <svg 
                        viewBox="0 0 24 24" 
                        width="20" 
                        height="20" 
                        fill={isRecording ? 'white' : '#666'}
                        style={{
                          transition: 'all 0.2s'
                        }}
                      >
                        <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z"/>
                        <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z"/>
                      </svg>
                    </button>
                  </div>
                  {isRecording && (
                    <div style={{
                      padding: '8px 12px',
                      backgroundColor: '#FFF2F2',
                      borderRadius: '8px',
                      color: '#FF3366',
                      fontSize: '0.9rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      animation: 'slideIn 0.3s ease-out'
                    }}>
                      <span style={{
                        width: '8px',
                        height: '8px',
                        borderRadius: '50%',
                        backgroundColor: '#FF3366',
                        display: 'inline-block',
                        animation: 'pulse 1s infinite'
                      }}></span>
                      Recording your ideas...
                    </div>
                  )}
                  <p style={{
                    margin: '4px 0 0',
                    fontSize: '0.8rem',
                    color: '#999',
                    fontStyle: 'italic'
                  }}>
                    Share your topic or brainstorm ideas - they'll be crafted into an engaging script
                  </p>
                </div>
              </div>

              {/* Viral Reference Input */}
              <div style={{ marginBottom: '25px', position: 'relative' }}>
                <label style={{
                  display: 'block',
                  color: '#666',
                  marginBottom: '8px',
                  fontSize: '0.9rem'
                }}>
                  Viral video reference (optional)
                </label>
                <div style={{
                  border: '2px dashed #e0e0e0',
                  borderRadius: '16px',
                  padding: '20px',
                  backgroundColor: '#fafafa',
                  transition: 'all 0.3s ease',
                  ':hover': {
                    borderColor: '#FF3366',
                    backgroundColor: '#fff'
                  }
                }}>
                  <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '12px'
                  }}>
                    <div style={{
                      width: '48px',
                      height: '48px',
                      borderRadius: '50%',
                      backgroundColor: '#FFE5EC',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#FF3366',
                      fontSize: '24px'
                    }}>
                      📎
                    </div>
                    <div style={{
                      textAlign: 'center'
                    }}>
                      <p style={{
                        fontSize: '1rem',
                        color: '#333',
                        marginBottom: '4px'
                      }}>
                        Paste your video link here
                      </p>
                      <p style={{
                        fontSize: '0.8rem',
                        color: '#999'
                      }}>
                        Supports YouTube and TikTok links
                      </p>
                    </div>
                    <textarea
                      value={viralReference}
                      onChange={(e) => setViralReference(e.target.value)}
                      onBlur={(e) => {
                        const val = e.target.value.trim();
                        if (
                          val.includes('youtube.com') || val.includes('youtu.be') ||
                          val.includes('tiktok.com') ||
                          val.includes('instagram.com/reel') || val.includes('instagram.com/p/')
                        ) {
                          processVideoLink(val);
                        }
                      }}
                      placeholder="https://youtube.com/watch?v=..."
                      style={{
                        width: '100%',
                        padding: '12px 16px',
                        fontSize: '1rem',
                        border: '1px solid #e0e0e0',
                        borderRadius: '12px',
                        backgroundColor: 'white',
                        color: '#333',
                        outline: 'none',
                        transition: 'all 0.3s ease',
                        boxSizing: 'border-box',
                        minHeight: '60px',
                        resize: 'vertical',
                        ':focus': {
                          borderColor: '#FF3366',
                          boxShadow: '0 0 0 3px rgba(255, 51, 102, 0.1)'
                        }
                      }}
                    />
                  </div>
                </div>

                {isProcessingVideo && (
                  <div style={{
                    marginTop: '12px',
                    padding: '12px 16px',
                    backgroundColor: '#f8f9ff',
                    borderRadius: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    animation: 'slideIn 0.3s ease-out'
                  }}>
                    <div style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '50%',
                      backgroundColor: '#FFE5EC',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#FF3366',
                      animation: 'spin 1s linear infinite'
                    }}>
                      ⌛
                    </div>
                    <div style={{
                      fontSize: '0.9rem',
                      color: '#666'
                    }}>
                      Analyzing video style...
                    </div>
                  </div>
                )}

                {videoInfo && (
                  <div style={{
                    marginTop: '12px',
                    padding: '16px',
                    backgroundColor: '#f8f9ff',
                    borderRadius: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '16px',
                    animation: 'slideIn 0.3s ease-out',
                    border: '1px solid #FFE5EC'
                  }}>
                    <div style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '50%',
                      backgroundColor: '#FFE5EC',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#FF3366',
                      fontSize: '20px'
                    }}>
                      ✓
                    </div>
                    <div style={{
                      flex: 1
                    }}>
                      <div style={{
                        fontSize: '0.95rem',
                        color: '#333',
                        fontWeight: '500',
                        marginBottom: '4px'
                      }}>
                        {videoInfo.title
                          ? `"${videoInfo.title}"${videoInfo.author ? ` — ${videoInfo.author}` : ''}`
                          : `${videoInfo.platform} video detected`}
                      </div>
                      <div style={{
                        fontSize: '0.8rem',
                        color: '#666',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                      }}>
                        <span style={{
                          padding: '2px 8px',
                          backgroundColor: '#fff',
                          borderRadius: '12px',
                          border: '1px solid #e0e0e0'
                        }}>
                          {videoInfo.platform}
                        </span>
                        <Link 
                          href={videoInfo.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{
                            color: '#FF3366',
                            textDecoration: 'none',
                            fontSize: '0.8rem',
                            ':hover': {
                              textDecoration: 'underline'
                            }
                          }}
                        >
                          View video →
                        </Link>
                      </div>
                    </div>
                    <button
                      onClick={() => setViralReference('')}
                      style={{
                        padding: '8px',
                        backgroundColor: 'transparent',
                        border: 'none',
                        color: '#999',
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        ':hover': {
                          color: '#FF3366'
                        }
                      }}
                    >
                      ✕
                    </button>
                  </div>
                )}
              </div>

              {/* Duration Selection */}
              <div style={{ marginBottom: '25px' }}>
                <label style={{ display: 'block', color: '#444', marginBottom: '12px', fontSize: '0.9rem', fontWeight: 600 }}>
                  Duration
                </label>
                {/* Short-form row */}
                <div style={{ marginBottom: '8px' }}>
                  <p style={{ fontSize: '0.72rem', color: '#aaa', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', margin: '0 0 6px' }}>Short-form</p>
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    {[
                      { val: '15 sec', label: '15s' },
                      { val: '30 sec', label: '30s' },
                      { val: '60 sec', label: '60s' },
                    ].map(({ val, label }) => (
                      <button key={val} onClick={() => setDuration(val)} style={{
                        padding: '8px 18px', borderRadius: '50px', border: 'none', cursor: 'pointer',
                        fontSize: '0.88rem', fontWeight: 600, transition: 'all 0.15s',
                        background: duration === val ? '#FF3366' : '#f4f4f5',
                        color: duration === val ? '#fff' : '#444',
                        boxShadow: duration === val ? '0 4px 12px rgba(255,51,102,0.3)' : 'none',
                        transform: duration === val ? 'scale(1.04)' : 'scale(1)',
                      }}>{label}</button>
                    ))}
                  </div>
                </div>
                {/* Long-form row */}
                <div style={{ marginBottom: '8px' }}>
                  <p style={{ fontSize: '0.72rem', color: '#aaa', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', margin: '0 0 6px' }}>Long-form</p>
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    {[
                      { val: '5 min', label: '5 min' },
                      { val: '10 min', label: '10 min' },
                      { val: '15 min', label: '15 min' },
                      { val: '20 min', label: '20 min' },
                      { val: '30 min', label: '30 min' },
                      { val: '45 min', label: '45 min' },
                      { val: '60 min', label: '60 min' },
                    ].map(({ val, label }) => (
                      <button key={val} onClick={() => setDuration(val)} style={{
                        padding: '8px 18px', borderRadius: '50px', border: 'none', cursor: 'pointer',
                        fontSize: '0.88rem', fontWeight: 600, transition: 'all 0.15s',
                        background: duration === val ? '#FF3366' : '#f4f4f5',
                        color: duration === val ? '#fff' : '#444',
                        boxShadow: duration === val ? '0 4px 12px rgba(255,51,102,0.3)' : 'none',
                        transform: duration === val ? 'scale(1.04)' : 'scale(1)',
                      }}>{label}</button>
                    ))}
                  </div>
                </div>
                {/* Free user duration warning */}
                {!isProUser && duration !== '15 sec' && duration !== '30 sec' && (
                  <div onClick={() => setShowSubscriptionModal(true)} style={{
                    marginTop: '10px', padding: '10px 14px',
                    background: '#fff5f7', border: '1px solid #ffd6e0',
                    borderRadius: '10px', fontSize: '0.82rem', color: '#FF3366',
                    cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px',
                  }}>
                    🔒 Free plan is limited to 30 seconds. <strong style={{ textDecoration: 'underline' }}>Upgrade to Pro</strong> to unlock all durations.
                  </div>
                )}
              </div>

              {/* Tone Selection */}
              <div style={{ marginBottom: '25px' }}>
                <label style={{
                  display: 'block',
                  color: '#666',
                  marginBottom: '8px',
                  fontSize: '0.9rem'
                }}>
                  Tone
                </label>
                <div style={{
                  display: 'flex',
                  gap: '10px',
                  flexWrap: 'wrap'
                }}>
                  {['Casual', 'Funny', 'Informative', 'Inspirational', 'Creative'].map((tone) => (
                    <button
                      key={tone}
                      onClick={() => setSelectedTone(tone.toLowerCase())}
                      style={{
                        padding: '8px 16px',
                        borderRadius: '20px',
                        border: 'none',
                        backgroundColor: selectedTone === tone.toLowerCase() ? '#FF3366' : 'white',
                        color: selectedTone === tone.toLowerCase() ? 'white' : '#666',
                        cursor: 'pointer',
                        fontSize: '0.9rem',
                        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)',
                        transition: 'all 0.2s'
                      }}
                    >
                      {tone}
                    </button>
                  ))}
                </div>
              </div>

              {/* Platform Selection */}
              <div style={{ marginBottom: '30px' }}>
                <label style={{
                  display: 'block',
                  color: '#666',
                  marginBottom: '8px',
                  fontSize: '0.9rem'
                }}>
                  Social media
                </label>
                <div style={{
                  display: 'flex',
                  gap: '10px',
                  flexWrap: 'wrap'
                }}>
                  {['YouTube', 'TikTok', 'Instagram', 'Facebook'].map((platform) => (
                    <button
                      key={platform}
                      onClick={() => {
                        setSelectedPlatform(platform.toLowerCase());
                        setSelectedCreator(''); // Reset creator when platform changes
                      }}
                      style={{
                        padding: '8px 16px',
                        borderRadius: '20px',
                        border: 'none',
                        backgroundColor: selectedPlatform === platform.toLowerCase() ? '#FF3366' : 'white',
                        color: selectedPlatform === platform.toLowerCase() ? 'white' : '#666',
                        cursor: 'pointer',
                        fontSize: '0.9rem',
                        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)',
                        transition: 'all 0.2s'
                      }}
                    >
                      {platform}
                    </button>
                  ))}
                </div>
              </div>

              {/* Creator Style Selection */}
              {selectedPlatform && (
                <div style={{ marginBottom: '25px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                    <label style={{ color: '#666', fontSize: '0.9rem', fontWeight: 500 }}>
                      Creator Style
                      <span style={{ color: '#999', fontWeight: 400, marginLeft: '6px' }}>(optional)</span>
                    </label>
                    {!isProUser && (
                      <span style={{
                        fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.04em',
                        color: '#FF3366', background: '#fff0f3',
                        padding: '2px 10px', borderRadius: '20px', border: '1px solid #ffd6e0',
                      }}>✦ PRO</span>
                    )}
                  </div>
                  <div style={{ position: 'relative' }}>
                    <select
                      value={selectedCreator}
                      onChange={(e) => isProUser && setSelectedCreator(e.target.value)}
                      disabled={!isProUser}
                      style={{
                        width: '100%',
                        padding: '12px 44px 12px 16px',
                        borderRadius: '12px',
                        border: `2px solid ${selectedCreator ? '#FF3366' : '#e8e8e8'}`,
                        backgroundColor: isProUser ? 'white' : '#fafafa',
                        color: '#222',
                        fontSize: '0.95rem',
                        fontWeight: selectedCreator ? 600 : 400,
                        cursor: isProUser ? 'pointer' : 'default',
                        outline: 'none',
                        appearance: 'none',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                        transition: 'border-color 0.2s',
                        filter: isProUser ? 'none' : 'blur(1.5px)',
                      }}
                    >
                      <option value="">— No creator style —</option>
                      {creatorStyles[selectedPlatform].map((c) => (
                        <option key={c.name} value={c.name}>{c.name} · {c.description}</option>
                      ))}
                    </select>
                    <div style={{
                      position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)',
                      pointerEvents: 'none', color: selectedCreator ? '#FF3366' : '#bbb',
                    }}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <polyline points="6 9 12 15 18 9"/>
                      </svg>
                    </div>
                    {/* Pro lock overlay */}
                    {!isProUser && (
                      <div
                        onClick={() => setShowSubscriptionModal(true)}
                        style={{
                          position: 'absolute', inset: 0, borderRadius: '12px',
                          cursor: 'pointer', display: 'flex', alignItems: 'center',
                          justifyContent: 'center', gap: '8px',
                          background: 'rgba(255,255,255,0.6)',
                        }}
                      >
                        <span style={{ fontSize: '1rem' }}>🔒</span>
                        <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#FF3366' }}>
                          Upgrade to Pro to unlock
                        </span>
                      </div>
                    )}
                  </div>
                  {selectedCreator && isProUser && (
                    <p style={{ margin: '8px 0 0', fontSize: '0.78rem', color: '#999' }}>
                      Your script will match {selectedCreator}&rsquo;s style and energy.
                      <button onClick={() => setSelectedCreator('')} style={{ marginLeft: '8px', background: 'none', border: 'none', color: '#FF3366', cursor: 'pointer', fontSize: '0.78rem', padding: 0 }}>Clear</button>
                    </p>
                  )}
                </div>
              )}

              {/* Generate Button */}
              <button
                onClick={handleGenerate}
                disabled={isGenerating}
                style={{
                  width: '100%',
                  padding: '16px',
                  backgroundColor: isGenerating ? '#FFE5EC' : '#FF3366',
                  color: isGenerating ? '#FF3366' : 'white',
                  border: 'none',
                  borderRadius: '12px',
                  fontSize: '1rem',
                  fontWeight: '600',
                  cursor: isGenerating ? 'not-allowed' : 'pointer',
                  boxShadow: '0 4px 15px rgba(255, 51, 102, 0.2)',
                  transition: 'all 0.3s ease',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '10px'
                }}
              >
                {isGenerating ? (
                  <>
                    <span style={{ display: 'inline-block', animation: 'spin 1s linear infinite' }}>⌛</span>
                    Generating...
                  </>
                ) : (
                  'Generate script →'
                )}
              </button>
            </div>

            {/* Generated Script Section */}
            {generatedScript && (
              <div 
                ref={responseRef}
                style={{
                  background: 'white',
                  borderRadius: '20px',
                  padding: '30px',
                  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.05)',
                  animation: 'fadeIn 0.5s ease-out',
                  transition: 'all 0.3s ease'
                }}
              >
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '20px',
                  gap: '12px'
                }}>
                  <h2 style={{
                    fontSize: '1.2rem',
                    color: '#333',
                    margin: 0
                  }}>
                    Generated Script
                  </h2>
                  <button
                    onClick={async () => {
                      // Starter users who have used their free script must upgrade to copy
                      if (!isProUser) {
                        setShowSubscriptionModal(true);
                        setNotification({
                          show: true,
                          message: 'Upgrade to Pro to copy and use your scripts.',
                          type: 'error',
                        });
                        setTimeout(() => setNotification({ show: false, message: '', type: '' }), 3000);
                        return;
                      }
                      try {
                        const tempDiv = document.createElement('div');
                        tempDiv.innerHTML = generatedScript;
                        
                        const styleTags = tempDiv.getElementsByTagName('style');
                        while (styleTags.length > 0) {
                          styleTags[0].parentNode.removeChild(styleTags[0]);
                        }
                        
                        let cleanText = tempDiv.textContent
                          .replace(/\s+/g, ' ')
                          .replace(/\n\s*\n/g, '\n\n')
                          .trim();
                        
                        cleanText = cleanText
                          .replace(/(Viral Title Options|Hook|Intro|Body|Conclusion|CTA)/g, '\n\n$1\n')
                          .replace(/(Title \d+:)/g, '\n$1\n');
                        
                        await navigator.clipboard.writeText(cleanText);
                        setNotification({ show: true, message: 'Script copied to clipboard successfully!', type: 'success' });
                        setTimeout(() => setNotification({ show: false, message: '', type: '' }), 2000);
                      } catch (err) {
                        console.error('Error copying script:', err);
                        setNotification({ show: true, message: 'Could not copy script. Please try again.', type: 'error' });
                        setTimeout(() => setNotification({ show: false, message: '', type: '' }), 2000);
                      }
                    }}
                    style={{
                      padding: '8px 16px',
                      backgroundColor: 'transparent',
                      color: '#FF3366',
                      border: '1px solid #FF3366',
                      borderRadius: '20px',
                      fontSize: '0.9rem',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}
                  >
                    <svg 
                      viewBox="0 0 24 24" 
                      width="16" 
                      height="16" 
                      fill="currentColor"
                    >
                      <path d="M16 1H4C2.9 1 2 1.9 2 3v14h2V3h12V1zm3 4H8C6.9 5 6 5.9 6 7v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z"/>
                    </svg>
                    Copy script
                  </button>
                </div>
                
                <div 
                  style={{
                    backgroundColor: '#f8f9ff',
                    borderRadius: '12px',
                    padding: '20px',
                    color: '#444',
                    lineHeight: '1.6',
                    fontSize: '1rem'
                  }}
                  dangerouslySetInnerHTML={{ __html: generatedScript }}
                />

                {/* SEO & Hashtags Section */}
                {selectedPlatform === 'youtube' && (
                  <div style={{
                    marginTop: '30px',
                    paddingTop: '30px',
                    borderTop: '1px solid #eee'
                  }}>
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginBottom: '20px'
                    }}>
                      <h3 style={{
                        fontSize: '1.1rem',
                        color: '#333',
                        margin: 0
                      }}>
                        SEO & Social Media Tips
                      </h3>
                      <button
                        onClick={() => {
                          if (!isProUser) {
                            setShowSubscriptionModal(true);
                            setNotification({ show: true, message: 'This is a premium feature. Upgrade to Pro to access it!', type: 'error' });
                            setTimeout(() => setNotification({ show: false, message: '', type: '' }), 2000);
                          } else {
                            generateAdvancedContent();
                          }
                        }}
                        disabled={isGeneratingAdvanced}
                        style={{
                          padding: '8px 16px',
                          backgroundColor: isGeneratingAdvanced ? '#FFE5EC' : '#FF3366',
                          color: isGeneratingAdvanced ? '#FF3366' : 'white',
                          border: 'none',
                          borderRadius: '20px',
                          fontSize: '0.9rem',
                          cursor: isGeneratingAdvanced ? 'not-allowed' : 'pointer',
                          transition: 'all 0.2s',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px'
                        }}
                      >
                        {isGeneratingAdvanced ? (
                          <>
                            <span style={{ display: 'inline-block', animation: 'spin 1s linear infinite' }}>⌛</span>
                            Generating...
                          </>
                        ) : (
                          'Generate'
                        )}
                      </button>
                    </div>
                    {(keywords || hashtags || seoTips) && (
                      <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                        gap: '20px'
                      }}>
                        {keywords && (
                          <div style={{
                            backgroundColor: '#f8f9ff',
                            borderRadius: '12px',
                            padding: '20px'
                          }}>
                            <h4 style={{ color: '#FF3366', marginBottom: '10px' }}>Keywords</h4>
                            <p style={{ color: '#444', lineHeight: '1.6' }}>{keywords}</p>
                          </div>
                        )}
                        {hashtags && (
                          <div style={{
                            backgroundColor: '#f8f9ff',
                            borderRadius: '12px',
                            padding: '20px'
                          }}>
                            <h4 style={{ color: '#FF3366', marginBottom: '10px' }}>Hashtags</h4>
                            <p style={{ color: '#444', lineHeight: '1.6' }}>{hashtags}</p>
                          </div>
                        )}
                        {seoTips && (
                          <div style={{
                            backgroundColor: '#f8f9ff',
                            borderRadius: '12px',
                            padding: '20px'
                          }}>
                            <h4 style={{ color: '#FF3366', marginBottom: '10px' }}>SEO Tips</h4>
                            <p style={{ color: '#444', lineHeight: '1.6' }}>{seoTips}</p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* AI Video Prompt Section */}
                <div style={{ marginTop: '24px', paddingTop: '24px', borderTop: '1px solid #f0f0f0' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                    <div>
                      <h3 style={{ fontSize: '1rem', color: '#222', margin: '0 0 4px', fontWeight: 700 }}>
                        🎬 AI Video Prompts
                      </h3>
                      <p style={{ margin: 0, fontSize: '0.78rem', color: '#999' }}>
                        Scene-by-scene prompts for Runway, Kling, Sora & Pika
                      </p>
                    </div>
                    <button
                      onClick={handleGenerateVideoPrompt}
                      disabled={isGeneratingVideoPrompt}
                      style={{
                        padding: '9px 20px',
                        background: isGeneratingVideoPrompt ? '#FFE5EC' : '#FF3366',
                        color: isGeneratingVideoPrompt ? '#FF3366' : 'white',
                        border: 'none', borderRadius: '20px',
                        fontSize: '0.88rem', fontWeight: 600,
                        cursor: isGeneratingVideoPrompt ? 'not-allowed' : 'pointer',
                        display: 'flex', alignItems: 'center', gap: '6px',
                        transition: 'all 0.2s',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {isGeneratingVideoPrompt
                        ? <><span style={{ animation: 'spin 1s linear infinite', display: 'inline-block' }}>⏳</span> Generating…</>
                        : '✦ Generate Prompts'}
                    </button>
                  </div>
                  {videoPrompt && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      {videoPrompt.split('\n').filter(l => l.trim()).map((line, i) => {
                        const isScene = /^SCENE\s+\d+/i.test(line.trim());
                        return (
                          <div key={i} style={{
                            padding: '12px 16px',
                            borderRadius: '10px',
                            background: isScene ? '#fff5f7' : '#f9f9f9',
                            border: isScene ? '1px solid #ffd6e0' : '1px solid #f0f0f0',
                            fontSize: '0.88rem',
                            color: '#333',
                            lineHeight: 1.6,
                          }}>
                            {isScene && <span style={{ fontWeight: 700, color: '#FF3366', marginRight: '6px' }}>▶</span>}
                            {line.trim()}
                          </div>
                        );
                      })}
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(videoPrompt);
                          setNotification({ show: true, message: 'Prompts copied!', type: 'success' });
                          setTimeout(() => setNotification({ show: false, message: '', type: '' }), 2000);
                        }}
                        style={{
                          alignSelf: 'flex-start', padding: '8px 18px',
                          background: 'transparent', color: '#FF3366',
                          border: '1px solid #FF3366', borderRadius: '20px',
                          fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer',
                        }}
                      >
                        Copy all prompts
                      </button>
                    </div>
                  )}
                </div>

                {/* Load Script Confirmation Modal - Moved outside saved scripts section */}
                {/* Action Buttons */}
                <div style={{
                  marginTop: '30px',
                  paddingTop: '30px',
                  borderTop: '1px solid #eee',
                  display: 'flex',
                  gap: '10px',
                  justifyContent: 'flex-end'
                }}>
                  <div style={{ position: 'relative' }}>
                    <button
                      onClick={() => {
                        if (!isProUser) {
                          setShowSubscriptionModal(true);
                          setNotification({ show: true, message: 'This is a premium feature. Upgrade to Pro to export your scripts!', type: 'error' });
                          setTimeout(() => setNotification({ show: false, message: '', type: '' }), 2000);
                        } else {
                          const dropdown = document.getElementById('exportDropdown');
                          dropdown.style.display = dropdown.style.display === 'none' ? 'block' : 'none';
                        }
                      }}
                      style={{
                        padding: '8px 16px',
                        backgroundColor: '#FF3366',
                        color: 'white',
                        border: 'none',
                        borderRadius: '20px',
                        fontSize: '0.9rem',
                        cursor: 'pointer',
                        transition: 'all 0.2s'
                      }}
                    >
                      Export
                    </button>
                    <div 
                      id="exportDropdown"
                      style={{
                        position: 'absolute',
                        top: '100%',
                        right: 0,
                        backgroundColor: 'white',
                        borderRadius: '12px',
                        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
                        padding: '10px',
                        display: 'none',
                        zIndex: 1000
                      }}
                    >
                      <button
                        onClick={exportToPDF}
                        style={{
                          padding: '8px 16px',
                          backgroundColor: 'transparent',
                          color: '#333',
                          border: 'none',
                          borderRadius: '20px',
                          fontSize: '0.9rem',
                          cursor: 'pointer',
                          transition: 'all 0.2s',
                          width: '100%',
                          textAlign: 'left'
                        }}
                      >
                        Export as PDF
                      </button>
                      <button
                        onClick={exportToWord}
                        style={{
                          padding: '8px 16px',
                          backgroundColor: 'transparent',
                          color: '#333',
                          border: 'none',
                          borderRadius: '20px',
                          fontSize: '0.9rem',
                          cursor: 'pointer',
                          transition: 'all 0.2s',
                          width: '100%',
                          textAlign: 'left'
                        }}
                      >
                        Export as Word
                      </button>
                    </div>
                  </div>
                </div>

                {/* Generate Another Button */}
                <div style={{
                  marginTop: '30px',
                  paddingTop: '30px',
                  borderTop: '1px solid #eee',
                  textAlign: 'center'
                }}>
                  <button
                    onClick={handleGenerateAnother}
                    style={{
                      padding: '12px 24px',
                      backgroundColor: '#FF3366',
                      color: 'white',
                      border: 'none',
                      borderRadius: '20px',
                      fontSize: '1rem',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '8px',
                      boxShadow: '0 4px 15px rgba(255, 51, 102, 0.2)'
                    }}
                  >
                    <span style={{ fontSize: '1.2rem' }}>✨</span>
                    Generate Another Script
                  </button>
                </div>
              </div>
            )}
          </> /* end activeTab === 'script' */}

          </div>

        </main>

        <Footer />
      </div>

      {/* Subscription Modal — single instance for the whole page */}
      <SubscriptionModal
        isOpen={showSubscriptionModal}
        onClose={() => setShowSubscriptionModal(false)}
        userProfile={userProfile}
      />
    </ProtectedRoute>
  );
} 