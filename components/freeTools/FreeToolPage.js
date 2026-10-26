import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import Navigation from '../Navigation';
import Footer from '../Footer';
import SEO from '../SEO';
import { SITE_URL, webApplicationJsonLd, faqJsonLd, breadcrumbJsonLd } from '../../lib/seo';
import PromptTool from './PromptTool';
import CopyButton from './CopyButton';
import { signupHref } from './links';

const wrap = 'mx-auto w-full max-w-3xl px-4';
const h2 = 'text-2xl font-extrabold tracking-tight text-zinc-950 sm:text-3xl';

function StickyBar({ slug, watchRef }) {
  const [show, setShow] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    try { if (sessionStorage.getItem('ss_ft_bar') === '1') setDismissed(true); } catch { /* ignore */ }
    const onScroll = () => {
      const el = watchRef.current;
      if (el) setShow(el.getBoundingClientRect().top < 0);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [watchRef]);

  if (dismissed || !show) return null;
  return (
    <div className="fixed inset-x-3 bottom-3 z-[900] flex items-center gap-3 rounded-2xl bg-zinc-950 px-4 py-3 text-white shadow-2xl md:hidden">
      <p className="flex-1 text-sm leading-snug">
        Need the full video? Script it first.{' '}
        <a href={signupHref(slug, 'sticky-bar')} className="font-bold text-brand-300 underline-offset-2 hover:underline">Try ScriptSea free →</a>
      </p>
      <button
        type="button"
        aria-label="Close"
        onClick={() => { setDismissed(true); try { sessionStorage.setItem('ss_ft_bar', '1'); } catch { /* ignore */ } }}
        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/10 text-lg leading-none"
      >
        ×
      </button>
    </div>
  );
}

export default function FreeToolPage({
  slug, page, modelLabel, picker, styleOptions, soundOptions, maxInput, dailyLimit, links, brandLine,
}) {
  const path = `/${slug}`;
  const toolEnd = useRef(null);
  const isHub = page.kind === 'hub';
  const isModel = page.kind === 'model';
  const name = page.h1Name;
  const badge = isModel ? `Free · No signup · ${modelLabel}` : 'Free · No signup';

  const modelLinks = links.filter((l) => l.kind === 'model');
  const specialLinks = links.filter((l) => l.kind !== 'model');

  return (
    <div className="flex min-h-screen flex-col bg-[#fafafa]">
      <SEO
        title={page.title}
        description={page.description}
        path={path}
        ogImage={`${SITE_URL}/og/tools/${slug}.png`}
        jsonLd={[
          webApplicationJsonLd({ name: page.h1, description: page.description, path }),
          faqJsonLd(page.faqs),
          breadcrumbJsonLd([
            { name: 'Home', path: '/' },
            { name: 'Free Tools', path: '/tools' },
            { name: page.navLabel || `${name} Prompt Generator`, path },
          ]),
        ]}
      />
      <Navigation />

      <main className="flex-1 pt-16">
        {/* Slim top banner */}
        <div className="bg-zinc-950 px-4 py-2 text-center text-[13px] text-zinc-300">
          Making a full video?{' '}
          <a href={signupHref(slug, 'top-banner')} className="font-semibold text-white underline decoration-brand-400 underline-offset-2">
            ScriptSea writes the script and every scene prompt. Try it free
          </a>
        </div>

        {/* Hero + tool */}
        <section className="bg-gradient-to-b from-[#fff5f7] to-[#fafafa] pb-10 pt-8 sm:pt-12">
          <div className={wrap}>
            <nav aria-label="Breadcrumb" className="mb-5 text-[13px] text-zinc-500">
              <Link href="/" className="hover:text-zinc-800">Home</Link>
              <span className="mx-1.5">/</span>
              <Link href="/tools" className="hover:text-zinc-800">Free Tools</Link>
              <span className="mx-1.5">/</span>
              <span className="text-zinc-700">{page.navLabel || `${name} Prompt Generator`}</span>
            </nav>
            <span className="inline-block rounded-full bg-brand-100 px-3.5 py-1 text-[13px] font-semibold text-brand-700">{badge}</span>
            <h1 className="mt-4 text-[2rem] font-extrabold leading-[1.1] tracking-tight text-zinc-950 sm:text-5xl">{page.h1}</h1>
            {page.intro.map((p, i) => (
              <p key={i} className="mt-4 text-[17px] leading-relaxed text-zinc-600">{p}</p>
            ))}

            <div className="mt-7">
              <PromptTool
                slug={slug}
                picker={picker}
                defaultModel={page.model}
                defaultMode={page.defaultMode || 'generate'}
                pickerOpen={isHub}
                placeholder={page.placeholder}
                styleOptions={styleOptions}
                soundOptions={soundOptions}
                maxInput={maxInput}
                dailyLimit={dailyLimit}
                brandLine={brandLine}
              />
            </div>
            <div ref={toolEnd} />
          </div>
        </section>

        {/* Hub: every model */}
        {isHub && (
          <section className="py-12">
            <div className={wrap}>
              <h2 className={h2}>Prompt generators for every AI video model</h2>
              <p className="mt-3 text-zinc-600">Each page opens the tool set to that model, with a guide to how it reads prompts.</p>
              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                {modelLinks.map((l) => (
                  <Link key={l.slug} href={`/${l.slug}`} className="rounded-2xl bg-white px-5 py-4 font-semibold text-zinc-900 ring-1 ring-zinc-200 transition hover:ring-brand-300">
                    {l.label} <span className="text-brand-500">→</span>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* How to write prompts */}
        <section className="py-12">
          <div className={wrap}>
            <h2 className={h2}>{page.tipsTitle}</h2>
            <div className="mt-6 space-y-5">
              {page.tips.map((t) => (
                <div key={t.title}>
                  <h3 className="text-lg font-bold text-zinc-900">{t.title}</h3>
                  <p className="mt-1 leading-relaxed text-zinc-600">{t.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Examples */}
        <section className="bg-white py-12">
          <div className={wrap}>
            <h2 className={h2}>{page.examplesTitle}</h2>
            <p className="mt-3 text-zinc-600">Copy any of these and paste it straight in, or use it as a starting point.</p>
            <div className="mt-6 space-y-4">
              {page.examples.map((ex) => (
                <div key={ex.title} className="rounded-2xl bg-[#fafafa] p-5 ring-1 ring-zinc-200">
                  <div className="mb-2 flex items-center justify-between gap-3">
                    <h3 className="font-bold text-zinc-900">{ex.title}</h3>
                    <CopyButton text={ex.prompt} />
                  </div>
                  {ex.before && (
                    <p className="mb-2 text-sm text-zinc-500"><span className="font-semibold text-zinc-600">{page.kind === 'script' ? 'Script:' : 'Before:'}</span> {ex.before}</p>
                  )}
                  <p className="whitespace-pre-line text-[15px] leading-relaxed text-zinc-700">
                    {ex.before && <span className="font-semibold text-zinc-600">{page.kind === 'script' ? 'Prompt: ' : 'After: '}</span>}
                    {ex.prompt}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Mistakes */}
        <section className="py-12">
          <div className={wrap}>
            <h2 className={h2}>{page.mistakesTitle}</h2>
            <ul className="mt-6 space-y-4">
              {page.mistakes.map((m) => (
                <li key={m.title} className="flex gap-3">
                  <span className="mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-red-50 text-sm font-bold text-red-500" aria-hidden>✕</span>
                  <p className="leading-relaxed text-zinc-600"><strong className="text-zinc-900">{m.title}.</strong> {m.body}</p>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* ScriptSea block */}
        <section className="py-12">
          <div className={wrap}>
            <div className="rounded-3xl bg-zinc-950 p-6 text-white sm:p-10">
              <h2 className="text-2xl font-extrabold tracking-tight sm:text-3xl">One prompt is one shot. A video is 6&ndash;10.</h2>
              <p className="mt-3 leading-relaxed text-zinc-300">
                This free tool writes one great prompt. ScriptSea makes the whole video plan: you give it one idea, it writes a scroll-stopping hook and a full script, then a ready prompt for every scene, with the same character in every shot. It works with {isModel ? `${name} and every other` : 'every'} major video model.
              </p>
              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl bg-white/5 p-5 ring-1 ring-white/10">
                  <p className="text-sm font-bold uppercase tracking-wider text-zinc-400">This free tool</p>
                  <ul className="mt-3 space-y-2 text-[15px] text-zinc-300">
                    <li>One prompt at a time</li>
                    <li>First 2 scenes of a script</li>
                    <li>You write the script yourself</li>
                  </ul>
                </div>
                <div className="rounded-2xl bg-brand-500/15 p-5 ring-1 ring-brand-400/40">
                  <p className="text-sm font-bold uppercase tracking-wider text-brand-300">ScriptSea</p>
                  <ul className="mt-3 space-y-2 text-[15px] text-white">
                    <li>Idea → hook → full script</li>
                    <li>A ready prompt for every scene</li>
                    <li>Same character across all scenes</li>
                    <li>Any model: Seedance, Veo, Omni Flash, Kling and more</li>
                  </ul>
                </div>
              </div>
              <a href={signupHref(slug, 'scriptsea-block')} className="mt-7 inline-flex rounded-xl bg-brand-500 px-6 py-3.5 font-bold text-white hover:bg-brand-600">
                Try ScriptSea free
              </a>
              <p className="mt-2 text-sm text-zinc-400">3 free scripts. No card.</p>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="bg-white py-12">
          <div className={wrap}>
            <h2 className={h2}>{isHub ? 'AI video prompt generator FAQ' : `${page.navLabel || `${name} prompt generator`} FAQ`}</h2>
            <div className="mt-6 divide-y divide-zinc-200 rounded-2xl ring-1 ring-zinc-200">
              {page.faqs.map((f) => (
                <details key={f.q} className="group px-5 py-4">
                  <summary className="flex cursor-pointer list-none items-start justify-between gap-4">
                    <h3 className="font-semibold text-zinc-900">{f.q}</h3>
                    <span className="mt-0.5 text-brand-500 transition group-open:rotate-45" aria-hidden>+</span>
                  </summary>
                  <p className="mt-2 leading-relaxed text-zinc-600">{f.a}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        {/* Other models */}
        <section className="py-12">
          <div className={wrap}>
            <h2 className={h2}>Prompt generators for other models</h2>
            <div className="mt-6 flex flex-wrap gap-2">
              {modelLinks.map((l) => (
                <Link key={l.slug} href={`/${l.slug}`} className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-brand-700 ring-1 ring-brand-100 hover:ring-brand-300">
                  {l.label}
                </Link>
              ))}
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              {specialLinks.map((l) => (
                <Link key={l.slug} href={`/${l.slug}`} className="rounded-full bg-zinc-100 px-4 py-2 text-sm font-semibold text-zinc-700 hover:bg-zinc-200">
                  {l.label}
                </Link>
              ))}
              <Link href="/tools" className="rounded-full bg-zinc-100 px-4 py-2 text-sm font-semibold text-zinc-700 hover:bg-zinc-200">All free tools</Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
      <StickyBar slug={slug} watchRef={toolEnd} />
    </div>
  );
}
