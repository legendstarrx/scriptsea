import React from 'react';
import Link from 'next/link';
import Navigation from '../components/Navigation';
import Footer from '../components/Footer';
import SEO from '../components/SEO';
import { useAuthRedirect } from '../hooks/useAuthRedirect';
import { organizationJsonLd, websiteJsonLd, softwareJsonLd, faqJsonLd } from '../lib/seo';

const TITLE = 'ScriptSea: AI Script Generator & AI Video Prompt Generator';
const DESCRIPTION =
  'Free AI script generator for TikTok, Reels and YouTube. Get a viral script in seconds, then turn it into ready-to-paste video prompts for Seedance, Kling, Veo and Sora.';

// Models with a dedicated page link to it; the rest are shown as plain chips.
const MODELS = [
  { name: 'Seedance 2.0', href: '/seedance-prompt-generator' },
  { name: 'Kling 3.0', href: '/kling-prompt-generator' },
  { name: 'Veo 3.1', href: '/veo-prompt-generator' },
  { name: 'Sora 2', href: '/sora-prompt-generator' },
  { name: 'Wan' },
  { name: 'Hailuo' },
  { name: 'Higgsfield' },
];

const FAQS = [
  { q: 'What is ScriptSea?', a: 'ScriptSea is an AI script generator and AI video prompt generator. You type an idea, it writes a viral video script, then turns that script into scene-by-scene prompts for AI video models like Seedance, Kling, Veo and Sora.' },
  { q: 'How is this different from ChatGPT?', a: 'ChatGPT is a general chatbot. You have to tell it what to do, then fix what it gives you. ScriptSea is built only for video. Scripts open with a hook and fit your video length to the word. Video prompts keep the same character in every scene and use camera and light the way video models understand.' },
  { q: 'Which AI video models do the prompts work with?', a: 'Seedance 2.0, Kling 3.0, Veo 3.1, Sora 2, Wan, Hailuo and tools like Higgsfield. The prompts are detailed, plain-English scene descriptions, so they work in any text-to-video model. Just paste and generate.' },
  { q: 'Do I need to know prompt engineering?', a: 'No. That is the whole point. Type your idea or paste your script, and ScriptSea handles the character, camera, lighting, style and pacing.' },
  { q: 'Can I try it for free?', a: 'Yes. You get 3 free scripts when you sign up, no card needed. After that, Pro is $4.99 a week for 15 scripts or $19.99 a month for 60. Scripts and video prompts use the same allowance.' },
  { q: 'What makes the scripts go viral?', a: 'Every script opens with a hook, fits your video length to the word, and cuts anything that does not keep people watching. It is written the way people talk, not the way people write.' },
  { q: 'What can I make with it?', a: 'TikToks, Instagram Reels, YouTube Shorts, long YouTube videos up to 60 minutes, UGC ads, product videos and faceless channels with fully AI-generated visuals.' },
];

export default function Home() {
  useAuthRedirect();
  const [openFaq, setOpenFaq] = React.useState(null);

  const card = {
    background: '#fff', borderRadius: '20px', padding: '32px',
    boxShadow: '0 4px 24px rgba(0,0,0,0.05)', transition: 'transform 0.2s',
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <SEO
        title={TITLE}
        description={DESCRIPTION}
        path="/"
        jsonLd={[
          organizationJsonLd,
          websiteJsonLd,
          softwareJsonLd({ name: 'ScriptSea', description: DESCRIPTION, path: '/' }),
          faqJsonLd(FAQS),
        ]}
      />
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
              AI Script Generator + AI Video Prompt Generator
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
              maxWidth: '640px', margin: '0 auto 32px',
            }}>
              Type an idea. Get a script with a hook people can&apos;t scroll past. Then turn it into ready-to-paste prompts for Seedance, Kling, Veo and Sora. No writing. No prompt skills. Just post.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', alignItems: 'center' }}>
              <Link href="/register" style={{
                background: 'linear-gradient(135deg,#FF3366,#ff6b8a)', color: 'white', textDecoration: 'none',
                padding: '16px 40px', borderRadius: '14px', fontSize: '1.1rem', fontWeight: 700,
                boxShadow: '0 8px 30px rgba(255,51,102,0.3)',
                display: 'flex', alignItems: 'center', gap: '10px', transition: 'transform 0.15s',
              }}>
                Write My First Script Free <span style={{ fontSize: '1.3rem' }}>→</span>
              </Link>
              <p style={{ fontSize: '0.82rem', color: '#999' }}>3 free scripts. No credit card. Sign up with Google in one click.</p>
            </div>
          </div>
        </section>

        {/* ── MODELS STRIP ────────────────────────────────────────── */}
        <section style={{ padding: '28px 1rem', background: '#fff', borderBottom: '1px solid #f3f3f3' }}>
          <div style={{ maxWidth: '1000px', margin: '0 auto', textAlign: 'center' }}>
            <h2 style={{ fontSize: '0.82rem', color: '#999', fontWeight: 600, margin: '0 0 14px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              Prompts ready for the models everyone&apos;s using
            </h2>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', justifyContent: 'center' }}>
              {MODELS.map((m) => {
                const chip = {
                  background: '#FFE5EC', color: '#FF3366', padding: '7px 16px', borderRadius: '50px',
                  fontSize: '0.9rem', fontWeight: 700, textDecoration: 'none',
                };
                return m.href
                  ? <Link key={m.name} href={m.href} style={chip}>{m.name}</Link>
                  : <span key={m.name} style={chip}>{m.name}</span>;
              })}
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
                  desc: 'A product, a story, a tip. One line is enough. Or paste a YouTube or TikTok link and match its style.',
                },
                {
                  step: '02', icon: '🎬', title: 'Get a Viral Script',
                  desc: 'Hook first. No filler. The exact word count for your video length. Sounds like a person, not a robot.',
                },
                {
                  step: '03', icon: '✦', title: 'Get Your Video Prompts',
                  desc: 'One click turns the script into scene-by-scene prompts. Paste into Seedance, Kling, Veo or Sora and hit generate.',
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
                  <li>Stops the scroll in the first line</li>
                  <li>Exact word count for 15 seconds up to 60 minutes</li>
                  <li>Paste a video link and match its style</li>
                  <li>Products, brands, stories, faceless channels, anything</li>
                  <li>Export to PDF or Word in one click</li>
                </ul>
                <Link href="/ai-script-generator" style={{ display: 'inline-block', marginTop: '16px', color: '#FF3366', fontWeight: 600, fontSize: '0.92rem', textDecoration: 'none' }}>
                  See the AI script generator →
                </Link>
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
                  <li>Scene-by-scene prompts for Seedance, Kling, Veo, Sora, Wan & Hailuo</li>
                  <li>Same character in every clip. Same face, same look</li>
                  <li>UGC, B-Roll, or Animation (3D Pixar, Realistic 3D, 2D, Stick Figure)</li>
                  <li>Optional voiceover with hook, body and close</li>
                  <li>Open any scene on Higgsfield in one click</li>
                </ul>
                <Link href="/ai-video-prompt-generator" style={{ display: 'inline-block', marginTop: '16px', color: '#FF3366', fontWeight: 600, fontSize: '0.92rem', textDecoration: 'none' }}>
                  See the AI video prompt generator →
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* ── WHY SCRIPTSEA ──────────────────────────────────────── */}
        <section style={{ padding: 'clamp(3rem, 6vw, 5rem) 1rem', background: '#fff' }}>
          <div style={{ maxWidth: '900px', margin: '0 auto', textAlign: 'center' }}>
            <p style={{ color: '#FF3366', fontWeight: 700, fontSize: '0.82rem', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '8px' }}>Why ScriptSea</p>
            <h2 style={{ fontSize: 'clamp(1.5rem, 4vw, 2.2rem)', fontWeight: 800, color: '#111', marginBottom: '48px' }}>
              Why Creators Switch to ScriptSea
            </h2>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px', textAlign: 'left' }}>
              {[
                { icon: '⚡', title: '60 Seconds, Not 2 Hours', desc: 'Writing a script and every prompt by hand takes hours. Here it takes a minute. Spend the time posting.' },
                { icon: '🧠', title: 'It Actually Reads Your Script', desc: 'Every scene matches what the script says at that moment. Culture, religion, tone and audience included.' },
                { icon: '🎯', title: 'Made to Be Watched', desc: 'Hooks that stop the scroll. Fast cuts right where viewers usually leave. Nothing that makes people swipe.' },
                { icon: '🧍', title: 'Same Face in Every Scene', desc: 'Video models forget your character between clips. Our prompts describe them in full every time, so they never change.' },
                { icon: '🔄', title: 'Script to Video in One Place', desc: 'Write the script, get the prompts, open any scene on Higgsfield. No juggling five tabs and three chatbots.' },
                { icon: '🌍', title: 'Any Niche, Any Culture', desc: 'Islamic content, gaming, fitness, fashion, tech, education, product ads. It fits your world, not the other way around.' },
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
                { num: '6+', label: 'Top AI video models' },
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
              {FAQS.map((faq, i) => (
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
              <br />Start Posting.
            </h2>
            <p style={{ color: 'rgba(255,255,255,0.85)', fontSize: '1.05rem', marginBottom: '32px', lineHeight: 1.6 }}>
              Right now, someone in your niche is posting the video you&apos;ve been planning for weeks. Make yours today. Your first 3 scripts are on us.
            </p>
            <Link href="/register" style={{
              background: 'white', color: '#FF3366', textDecoration: 'none', display: 'inline-block',
              padding: '16px 40px', borderRadius: '14px', fontSize: '1.1rem', fontWeight: 700,
              boxShadow: '0 8px 30px rgba(0,0,0,0.15)',
              transition: 'transform 0.15s',
            }}>
              Get My 3 Free Scripts →
            </Link>
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
