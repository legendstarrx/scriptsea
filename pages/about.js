import Link from 'next/link';
import Navigation from '../components/Navigation';
import Footer from '../components/Footer';
import SEO from '../components/SEO';
import { SITE_URL } from '../lib/seo';

const p = { color: '#5b5b5b', lineHeight: 1.7, fontSize: '1.05rem', margin: '0 0 1rem' };
const h2 = { fontSize: '1.3rem', fontWeight: 800, margin: '2rem 0 0.75rem', color: '#111' };
const a = { color: '#FF3366' };
const ul = { ...p, listStyle: 'disc', paddingLeft: '1.3rem', margin: '0.4rem 0 0' };

export default function AboutPage() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <SEO
        title="About ScriptSea: The AI Script Generator for Creators"
        description="ScriptSea helps creators and brands write video scripts and AI video prompts. Learn who we are, what we build and what our blog covers."
        path="/about"
        jsonLd={{
          '@context': 'https://schema.org',
          '@type': 'AboutPage',
          name: 'About ScriptSea',
          url: `${SITE_URL}/about`,
          publisher: { '@id': `${SITE_URL}/#organization` },
        }}
      />
      <Navigation />
      <main
        style={{
          flex: 1,
          background: 'linear-gradient(135deg, #fff5f7 0%, #ffffff 100%)',
          padding: '92px 1rem 3rem'
        }}
      >
        <section style={{ maxWidth: '920px', margin: '0 auto' }}>
          <div
            style={{
              background: '#fff',
              borderRadius: '20px',
              boxShadow: '0 12px 40px rgba(0, 0, 0, 0.08)',
              padding: '2rem'
            }}
          >
            <p style={{ margin: 0, color: '#FF3366', fontWeight: 600, letterSpacing: '0.02em' }}>
              About ScriptSea
            </p>
            <h1 style={{ margin: '0.75rem 0 1rem', fontSize: 'clamp(1.8rem, 5vw, 2.4rem)', fontWeight: 800, lineHeight: 1.15, color: '#111' }}>
              We help creators turn ideas into videos people watch to the end.
            </h1>
            <p style={p}>
              ScriptSea started in 2025 with a simple problem. Making short videos and video ads takes far longer than it
              should, and most of that time goes into two things: writing a script that holds attention, and turning that
              script into shots. We built ScriptSea to make both fast, without making the result sound generic.
            </p>
            <p style={p}>
              Today, creators, faceless channels, small brands and ad teams use ScriptSea to write scripts for TikTok,
              Instagram Reels, YouTube Shorts and long YouTube videos, and to plan AI-generated videos scene by scene.
            </p>

            <h2 style={h2}>What ScriptSea does</h2>
            <p style={p}>
              Our <Link href="/ai-script-generator" style={a}>AI script generator</Link> writes hook-first scripts timed to your
              video length. Our <Link href="/ai-video-prompt-generator" style={a}>AI video prompt generator</Link> turns a script
              into scene-by-scene prompts for the AI video models creators use today, like Seedance, Kling, Veo and Sora.
            </p>
            <p style={p}>
              We also run a set of <Link href="/tools" style={a}>free tools</Link>, from a video hook generator to prompt
              generators for individual AI video models. You can try the full app free with 3 scripts, and{' '}
              <Link href="/pricing" style={a}>Pro plans</Link> start at $4.99 a week.
            </p>

            <h2 style={h2}>The ScriptSea blog</h2>
            <p style={p}>
              Our <Link href="/blog" style={a}>blog</Link> is where we share what we learn from making scripts and AI videos
              every day. It covers:
            </p>
            <ul style={ul}>
              <li>Writing scripts and hooks for Shorts, Reels, TikTok and YouTube</li>
              <li>Writing AI video prompts that give consistent, realistic results</li>
              <li>Growing a channel, including faceless channels, within platform rules</li>
              <li>Writing UGC and video ad scripts that sell</li>
            </ul>
            <p style={{ ...p, marginTop: '1rem' }}>
              Every guide is written to be practical: clear steps, real examples and templates you can copy. When we cover
              platform rules or AI model features, we check the official documentation first, and we update articles when
              things change.
            </p>

            <h2 style={h2}>Get in touch</h2>
            <p style={{ ...p, marginBottom: 0 }}>
              Questions, feedback or a topic you&rsquo;d like us to cover? Email{' '}
              <a href="mailto:support@scriptsea.com" style={a}>support@scriptsea.com</a> or visit our{' '}
              <Link href="/contact" style={a}>contact page</Link>. We usually reply within 24 hours.
            </p>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
