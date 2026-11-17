import Link from 'next/link';
import Navigation from '../../components/Navigation';
import Footer from '../../components/Footer';
import SEO from '../../components/SEO';
import { signupHref } from '../../components/freeTools/links';
import { SITE_URL, breadcrumbJsonLd } from '../../lib/seo';
import { PAGES, MODEL_PAGE_ORDER, SPECIAL_PAGE_ORDER, MODELS, pageH1 } from '../../lib/freeTools/config';

const TITLE = 'Free AI Video Prompt Tools | ScriptSea';
const DESCRIPTION = 'Free AI video prompt tools: prompt generators for Seedance, Veo, Omni Flash, Kling and more, a prompt enhancer and a script converter. No signup.';

export default function ToolsIndex({ special, models }) {
  return (
    <div className="flex min-h-screen flex-col bg-[#fafafa]">
      <SEO
        title={TITLE}
        description={DESCRIPTION}
        path="/tools"
        ogImage={`${SITE_URL}/og/tools/tools.png`}
        jsonLd={[
          {
            '@context': 'https://schema.org',
            '@type': 'CollectionPage',
            name: 'Free AI Video Prompt Tools',
            description: DESCRIPTION,
            url: `${SITE_URL}/tools`,
            hasPart: [...special, ...models].map((t) => ({ '@type': 'WebApplication', name: t.h1, url: `${SITE_URL}/${t.slug}` })),
          },
          breadcrumbJsonLd([{ name: 'Home', path: '/' }, { name: 'Free Tools', path: '/tools' }]),
        ]}
      />
      <Navigation />
      <main className="flex-1 pt-16">
        <section className="bg-gradient-to-b from-[#fff5f7] to-[#fafafa] pb-8 pt-10 sm:pt-14">
          <div className="mx-auto max-w-4xl px-4">
            <nav aria-label="Breadcrumb" className="mb-5 text-[13px] text-zinc-500">
              <Link href="/" className="hover:text-zinc-800">Home</Link>
              <span className="mx-1.5">/</span>
              <span className="text-zinc-700">Free Tools</span>
            </nav>
            <h1 className="text-[2rem] font-extrabold leading-tight tracking-tight text-zinc-950 sm:text-5xl">Free AI Video Prompt Tools</h1>
            <p className="mt-4 max-w-2xl text-[17px] leading-relaxed text-zinc-600">
              Write better prompts for every major AI video model. Free, no signup, 5 prompts a day.
            </p>
          </div>
        </section>

        <section className="pb-6">
          <div className="mx-auto grid max-w-4xl gap-3 px-4 sm:grid-cols-3">
            {special.map((t) => (
              <Link key={t.slug} href={`/${t.slug}`} className="rounded-2xl bg-white p-5 ring-1 ring-zinc-200 transition hover:ring-brand-300">
                <p className="font-bold text-zinc-950">{t.h1}</p>
                <p className="mt-1 text-sm leading-relaxed text-zinc-600">{t.blurb}</p>
              </Link>
            ))}
          </div>
        </section>

        <section className="py-8">
          <div className="mx-auto max-w-4xl px-4">
            <h2 className="text-2xl font-extrabold tracking-tight text-zinc-950">Script tools</h2>
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              {SCRIPT_TOOL_LINKS.map((t) => (
                <Link key={t.href} href={t.href} className="rounded-2xl bg-white px-5 py-4 ring-1 ring-zinc-200 transition hover:ring-brand-300">
                  <span className="block font-bold text-zinc-950">{t.label}</span>
                  <span className="text-sm text-zinc-500">{t.blurb}</span>
                </Link>
              ))}
            </div>
          </div>
        </section>

        <section className="py-8">
          <div className="mx-auto max-w-4xl px-4">
            <h2 className="text-2xl font-extrabold tracking-tight text-zinc-950">Prompt generators by model</h2>
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              {models.map((t) => (
                <Link key={t.slug} href={`/${t.slug}`} className="flex items-center justify-between rounded-2xl bg-white px-5 py-4 ring-1 ring-zinc-200 transition hover:ring-brand-300">
                  <span>
                    <span className="block font-bold text-zinc-950">{t.h1}</span>
                    <span className="text-sm text-zinc-500">{t.version}</span>
                  </span>
                  <span className="text-brand-500">→</span>
                </Link>
              ))}
            </div>
          </div>
        </section>

        <section className="py-10">
          <div className="mx-auto max-w-4xl px-4">
            <div className="rounded-3xl bg-zinc-950 p-6 text-white sm:p-10">
              <h2 className="text-2xl font-extrabold tracking-tight">Need the whole video?</h2>
              <p className="mt-2 max-w-2xl leading-relaxed text-zinc-300">
                ScriptSea turns one idea into a full script with a scroll-stopping hook and a ready prompt for every scene, with the same character in every shot.
              </p>
              <a href={signupHref('tools', 'tools-index')} className="mt-5 inline-flex rounded-xl bg-brand-500 px-6 py-3 font-bold text-white hover:bg-brand-600">Try ScriptSea free</a>
              <p className="mt-2 text-sm text-zinc-400">3 free scripts. No card.</p>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}

const SCRIPT_TOOL_LINKS = [
  { href: '/video-hook-generator', label: 'Free Video Hook Generator', blurb: '10 opening lines for any idea, then a full script.' },
  { href: '/instagram-reels-script-generator', label: 'Free Instagram Reels Script Generator', blurb: 'Reel scripts with a hook and a caption.' },
  { href: '/youtube-shorts-script-generator', label: 'Free YouTube Shorts Script Generator', blurb: 'Tight Shorts scripts with a loop ending.' },
  { href: '/faceless-youtube-script-generator', label: 'Free Faceless YouTube Script Generator', blurb: 'Voiceover scripts split into scenes.' },
  { href: '/ai-script-generator', label: 'AI Script Generator', blurb: 'Full scripts with AI video prompts, in ScriptSea.' },
  { href: '/youtube-script-generator', label: 'YouTube Script Generator', blurb: 'Long and short YouTube scripts, in ScriptSea.' },
  { href: '/tiktok-script-generator', label: 'TikTok Script Generator', blurb: 'TikTok scripts with scroll-stopping hooks, in ScriptSea.' },
  { href: '/ugc-ad-script-generator', label: 'UGC Ad Script Generator', blurb: 'Ad scripts from a product or a link, in ScriptSea.' },
];

const BLURBS = {
  'ai-video-prompt-generator': 'Every model in one place. Pick a model, describe your idea, get a prompt.',
  'video-prompt-enhancer': 'Paste a prompt that gave you a bad clip. Get a fixed version and what changed.',
  'script-to-video-prompts': 'Paste a script. We split it into scenes and write the prompts.',
};

export async function getStaticProps() {
  const special = SPECIAL_PAGE_ORDER.map((slug) => ({ slug, h1: pageH1(PAGES[slug]), blurb: BLURBS[slug] }));
  const models = MODEL_PAGE_ORDER.map((slug) => ({ slug, h1: pageH1(PAGES[slug]), version: MODELS[PAGES[slug].model].version }));
  return { props: { special, models } };
}
