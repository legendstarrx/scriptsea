import React from 'react';
import Navigation from '../components/Navigation';
import Footer from '../components/Footer';
import { useRouter } from 'next/router';
import { useAuthRedirect } from '../hooks/useAuthRedirect';

export default function Home() {
  useAuthRedirect();
  const router = useRouter();
  const [openFaq, setOpenFaq] = React.useState(null);

  const go = () => router.push('/register');

  const card = {
    background: '#fff', borderRadius: '20px', padding: '32px',
    boxShadow: '0 4px 24px rgba(0,0,0,0.05)', transition: 'transform 0.2s',
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navigation />

      <main style={{ flex: '1', paddingTop: '37px', display: 'flex', flexDirection: 'column' }}>

        {/* ── HERO ─────────────────────────────────────────────────── */}
        <section style={{
          background: 'linear-gradient(135deg, #fff5f7 0%, #ffffff 50%, #fff5f7 100%)',
          padding: 'clamp(3rem, 8vw, 6rem) 1rem clamp(2rem, 6vw, 4rem)',
          textAlign: 'center', position: 'relative', overflow: 'hidden',
        }}>
          <div style={{ maxWidth: '820px', margin: '0 auto', position: 'relative', zIndex: 1 }}>
            <div style={{
              display: 'inline-block', background: '#FFE5EC', color: '#FF3366',
              padding: '6px 18px', borderRadius: '50px', fontSize: '0.85rem', fontWeight: 600, marginBottom: '24px',
            }}>
              The Only Tool You Need to Go Viral
            </div>

            <h1 style={{
              fontSize: 'clamp(2rem, 5.5vw, 3.2rem)', fontWeight: 800, color: '#111',
              lineHeight: 1.15, marginBottom: '20px',
            }}>
              From Idea to <span style={{ color: '#FF3366' }}>Viral Video</span>
              <br />in Under 60 Seconds
            </h1>

            <p style={{
              fontSize: 'clamp(1rem, 2.2vw, 1.18rem)', color: '#555', lineHeight: 1.7,
              maxWidth: '620px', margin: '0 auto 32px',
            }}>
              Type your idea. Get a viral script. Transform it into AI video prompts ready for Kling, Veo, Runway, Higgsfield, and more. Two tools, one click each. That's the entire workflow.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', alignItems: 'center' }}>
              <button onClick={go} style={{
                background: 'linear-gradient(135deg,#FF3366,#ff6b8a)', color: 'white', border: 'none',
                padding: '16px 40px', borderRadius: '14px', fontSize: '1.1rem', fontWeight: 700,
                cursor: 'pointer', boxShadow: '0 8px 30px rgba(255,51,102,0.3)',
                display: 'flex', alignItems: 'center', gap: '10px', transition: 'transform 0.15s',
              }}>
                Start Creating Free <span style={{ fontSize: '1.3rem' }}>→</span>
              </button>
              <p style={{ fontSize: '0.82rem', color: '#999' }}>No credit card required. 1 free script included.</p>
            </div>
          </div>
        </section>

        {/* ── HOW IT WORKS (3 steps) ──────────────────────────────── */}
        <section style={{ padding: 'clamp(3rem, 6vw, 5rem) 1rem', background: '#fff' }}>
          <div style={{ maxWidth: '1000px', margin: '0 auto', textAlign: 'center' }}>
            <p style={{ color: '#FF3366', fontWeight: 700, fontSize: '0.82rem', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '8px' }}>How It Works</p>
            <h2 style={{ fontSize: 'clamp(1.5rem, 4vw, 2.2rem)', fontWeight: 800, color: '#111', marginBottom: '48px' }}>
              Idea → Script → Video Prompt
            </h2>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '24px', textAlign: 'left' }}>
              {[
                {
                  step: '01', icon: '💡', title: 'Type Your Idea',
                  desc: 'Describe your product, paste a reference video link, or just type what you want to talk about. ScriptSea takes it from there.',
                },
                {
                  step: '02', icon: '🎬', title: 'Get a Viral Script',
                  desc: 'AI writes a hook-first, retention-optimized script with exact word counts. Every word is designed to keep viewers watching.',
                },
                {
                  step: '03', icon: '✦', title: 'Generate Video Prompts',
                  desc: 'One click transforms your script into scene-by-scene AI video prompts. Paste into Kling, Veo, Runway, Higgsfield, or Pika — done.',
                },
              ].map((s, i) => (
                <div key={i} style={{ ...card, position: 'relative', paddingTop: '40px' }}>
                  <div style={{
                    position: 'absolute', top: '-16px', left: '24px',
                    background: '#FF3366', color: 'white', width: '36px', height: '36px',
                    borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '0.8rem', fontWeight: 700, boxShadow: '0 4px 12px rgba(255,51,102,0.3)',
                  }}>{s.step}</div>
                  <div style={{ fontSize: '1.6rem', marginBottom: '12px' }}>{s.icon}</div>
                  <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#111', marginBottom: '8px' }}>{s.title}</h3>
                  <p style={{ color: '#666', lineHeight: 1.65, fontSize: '0.95rem' }}>{s.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── SCRIPT + PROMPT FEATURES ────────────────────────────── */}
        <section style={{ padding: 'clamp(3rem, 6vw, 5rem) 1rem', background: '#fafafa' }}>
          <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
            <div style={{ textAlign: 'center', marginBottom: '48px' }}>
              <p style={{ color: '#FF3366', fontWeight: 700, fontSize: '0.82rem', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '8px' }}>Two Powerful Tools, One Platform</p>
              <h2 style={{ fontSize: 'clamp(1.5rem, 4vw, 2.2rem)', fontWeight: 800, color: '#111' }}>
                Everything You Need to Go Viral
              </h2>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
              {/* Script Generator */}
              <div style={{ ...card, border: '2px solid #f0f0f0' }}>
                <div style={{
                  display: 'inline-block', background: '#FFE5EC', color: '#FF3366', padding: '4px 12px',
                  borderRadius: '50px', fontSize: '0.78rem', fontWeight: 700, marginBottom: '16px',
                }}>SCRIPT GENERATOR</div>
                <h3 style={{ fontSize: '1.3rem', fontWeight: 700, color: '#111', marginBottom: '12px' }}>
                  AI Scripts That Actually Go Viral
                </h3>
                <ul style={{ color: '#555', lineHeight: 2, fontSize: '0.93rem', paddingLeft: '18px', margin: 0 }}>
                  <li>Hook-first writing — stops the scroll in the first line</li>
                  <li>Exact word counts matched to your video duration</li>
                  <li>Paste a reference video link — AI matches the style</li>
                  <li>Works for products, brands, personal content, anything</li>
                  <li>Export to PDF or Word with one click</li>
                </ul>
              </div>

              {/* Video Prompt Generator */}
              <div style={{ ...card, border: '2px solid #FF3366', position: 'relative', overflow: 'hidden' }}>
                <div style={{
                  position: 'absolute', top: '16px', right: '16px', background: '#FF3366', color: 'white',
                  padding: '3px 10px', borderRadius: '50px', fontSize: '0.7rem', fontWeight: 700,
                }}>NEW</div>
                <div style={{
                  display: 'inline-block', background: '#FFE5EC', color: '#FF3366', padding: '4px 12px',
                  borderRadius: '50px', fontSize: '0.78rem', fontWeight: 700, marginBottom: '16px',
                }}>AI VIDEO PROMPTS</div>
                <h3 style={{ fontSize: '1.3rem', fontWeight: 700, color: '#111', marginBottom: '12px' }}>
                  Turn Any Script into AI Video Clips
                </h3>
                <ul style={{ color: '#555', lineHeight: 2, fontSize: '0.93rem', paddingLeft: '18px', margin: 0 }}>
                  <li>Scene-by-scene prompts for Kling, Veo, Runway, Higgsfield, Pika & more</li>
                  <li>Consistent character across every clip — same person, same look</li>
                  <li>Choose UGC, B-Roll, or Animation (3D Pixar, 2D, Stick Figure)</li>
                  <li>Optional voiceover scripts with hook → body → CTA</li>
                  <li>Pick your character's gender and appearance</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* ── WHY SCRIPTSEA ──────────────────────────────────────── */}
        <section style={{ padding: 'clamp(3rem, 6vw, 5rem) 1rem', background: '#fff' }}>
          <div style={{ maxWidth: '900px', margin: '0 auto', textAlign: 'center' }}>
            <p style={{ color: '#FF3366', fontWeight: 700, fontSize: '0.82rem', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '8px' }}>Why ScriptSea</p>
            <h2 style={{ fontSize: 'clamp(1.5rem, 4vw, 2.2rem)', fontWeight: 800, color: '#111', marginBottom: '48px' }}>
              This Is the Future of Content Creation
            </h2>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px', textAlign: 'left' }}>
              {[
                { icon: '⚡', title: 'Seconds, Not Hours', desc: 'What used to take 2 hours of writing and prompt engineering now takes 60 seconds flat.' },
                { icon: '🧠', title: 'AI That Actually Understands', desc: 'Reads your script, understands the culture, religion, tone, and audience — then writes prompts that match.' },
                { icon: '🎯', title: 'Built for Virality', desc: 'Every script and prompt is designed around retention — hooks that stop scrolling, visuals that keep watching.' },
                { icon: '🔄', title: 'Script → Prompt → Video', desc: 'The only platform that connects all three steps. Generate prompts and open directly in Higgsfield or any AI video tool.' },
                { icon: '🌍', title: 'Any Niche, Any Culture', desc: 'Islamic content, gaming, fitness, fashion, tech, education — ScriptSea adapts to your world, not the other way around.' },
                { icon: '🚀', title: 'The Future Is Now', desc: 'AI video generation is exploding. The creators who move first will dominate. ScriptSea is your unfair advantage.' },
              ].map((f, i) => (
                <div key={i} style={{ padding: '24px', background: '#fafafa', borderRadius: '16px' }}>
                  <div style={{ fontSize: '1.4rem', marginBottom: '10px' }}>{f.icon}</div>
                  <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#111', marginBottom: '6px' }}>{f.title}</h3>
                  <p style={{ color: '#666', fontSize: '0.9rem', lineHeight: 1.6, margin: 0 }}>{f.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── SOCIAL PROOF / STATS ────────────────────────────────── */}
        <section style={{ padding: 'clamp(2rem, 5vw, 4rem) 1rem', background: '#111', color: 'white', textAlign: 'center' }}>
          <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            <h2 style={{ fontSize: 'clamp(1.3rem, 3.5vw, 1.8rem)', fontWeight: 700, marginBottom: '40px', color: '#fff' }}>
              Creators Are Already Using ScriptSea to Win
            </h2>
            <div style={{ display: 'flex', justifyContent: 'center', gap: 'clamp(2rem, 5vw, 4rem)', flexWrap: 'wrap' }}>
              {[
                { num: '30s', label: 'Script in seconds' },
                { num: '1-Click', label: 'Script to video prompts' },
                { num: '6+', label: 'AI video tools supported' },
                { num: '∞', label: 'Niches & languages' },
              ].map((s, i) => (
                <div key={i} style={{ textAlign: 'center', minWidth: '120px' }}>
                  <div style={{ fontSize: 'clamp(1.8rem, 4vw, 2.5rem)', fontWeight: 800, color: '#FF3366', marginBottom: '6px' }}>{s.num}</div>
                  <div style={{ fontSize: '0.85rem', color: '#aaa' }}>{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── FAQ ─────────────────────────────────────────────────── */}
        <section id="faq" style={{ padding: 'clamp(3rem, 6vw, 5rem) 1rem', background: '#fafafa' }}>
          <div style={{ maxWidth: '720px', margin: '0 auto' }}>
            <h2 style={{ fontSize: 'clamp(1.4rem, 3.5vw, 1.8rem)', textAlign: 'center', marginBottom: '36px', color: '#111', fontWeight: 800 }}>
              Questions? We Got You.
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {[
                { q: 'What is ScriptSea?', a: 'ScriptSea is an AI-powered platform that generates viral video scripts and transforms them into ready-to-paste prompts for AI video generators like Kling, Veo, Runway, SeedDance, Hailuo, and Pika.' },
                { q: 'How is this different from ChatGPT?', a: 'ChatGPT is a general chatbot. ScriptSea is purpose-built for viral content — every script follows proven retention formulas, and the video prompt engine understands consistent characters, cultural context, camera movements, and what makes AI video tools produce realistic results.' },
                { q: 'What AI video tools do the prompts work with?', a: 'Kling, Google Veo, Runway Gen-3, Higgsfield, SeedDance, Hailuo/Minimax, and Pika. The prompts are structured to work across all of them — just paste and generate.' },
                { q: 'Do I need to know prompt engineering?', a: 'No. That is literally the point. You type your idea or paste your script, and ScriptSea handles all the prompt engineering — character consistency, camera movements, lighting, style, cultural context, everything.' },
                { q: 'Can I try it for free?', a: 'Yes. Sign up and get 1 free script generation. Upgrade to Pro for unlimited access to both the script generator and video prompt engine.' },
                { q: 'What makes the scripts "viral"?', a: 'Every script is built around hook-first writing, exact word counts for your video duration, and retention patterns analyzed from millions of viral videos. No filler, no fluff — every word earns its place.' },
              ].map((faq, i) => (
                <div key={i} onClick={() => setOpenFaq(openFaq === i ? null : i)} style={{
                  background: 'white', borderRadius: '14px', boxShadow: '0 2px 10px rgba(0,0,0,0.04)', cursor: 'pointer',
                }}>
                  <div style={{ padding: '18px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px' }}>
                    <h3 style={{ fontSize: '1rem', color: '#222', fontWeight: 600, margin: 0 }}>{faq.q}</h3>
                    <div style={{ color: '#FF3366', transform: openFaq === i ? 'rotate(180deg)' : 'rotate(0)', transition: 'transform 0.3s', flexShrink: 0 }}>▼</div>
                  </div>
                  <div style={{
                    padding: openFaq === i ? '0 20px 18px' : '0 20px',
                    maxHeight: openFaq === i ? '300px' : '0', overflow: 'hidden',
                    transition: 'all 0.3s', opacity: openFaq === i ? 1 : 0,
                  }}>
                    <p style={{ color: '#666', lineHeight: 1.65, margin: 0, fontSize: '0.93rem' }}>{faq.a}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── FINAL CTA ──────────────────────────────────────────── */}
        <section style={{
          padding: 'clamp(3rem, 7vw, 5rem) 1rem',
          background: 'linear-gradient(135deg, #FF3366 0%, #ff6b8a 100%)',
          textAlign: 'center',
        }}>
          <div style={{ maxWidth: '640px', margin: '0 auto' }}>
            <h2 style={{ fontSize: 'clamp(1.5rem, 4vw, 2.2rem)', fontWeight: 800, color: 'white', marginBottom: '16px', lineHeight: 1.2 }}>
              Stop Scripting. Stop Prompting.
              <br />Start Creating.
            </h2>
            <p style={{ color: 'rgba(255,255,255,0.85)', fontSize: '1.05rem', marginBottom: '32px', lineHeight: 1.6 }}>
              The future of content is AI-generated video. The creators who move now will own the next era. ScriptSea is the bridge between your idea and a viral clip.
            </p>
            <button onClick={go} style={{
              background: 'white', color: '#FF3366', border: 'none',
              padding: '16px 40px', borderRadius: '14px', fontSize: '1.1rem', fontWeight: 700,
              cursor: 'pointer', boxShadow: '0 8px 30px rgba(0,0,0,0.15)',
              transition: 'transform 0.15s',
            }}>
              Get Started Free →
            </button>
            <p style={{ marginTop: '12px', fontSize: '0.82rem', color: 'rgba(255,255,255,0.7)' }}>
              No credit card required
            </p>
          </div>
        </section>

      </main>
      <Footer />
    </div>
  );
}
