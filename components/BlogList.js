/* eslint-disable @next/next/no-img-element */
import Link from 'next/link';
import Navigation from './Navigation';
import Footer from './Footer';
import SEO from './SEO';
import AdSenseScript from './AdSenseScript';
import { SITE_URL, breadcrumbJsonLd } from '../lib/seo';
import { formatDate } from '../lib/blog/format';
import { pagePath } from '../lib/blog/paginate';

const BASE_TITLE = 'The ScriptSea Blog: AI Video Prompts and Scripts';
const DESCRIPTION = 'Straight answers on AI video prompts, scripts and growing on YouTube, from people who make AI videos every day.';

function Pagination({ page, pages }) {
  if (pages <= 1) return null;
  const btn = 'inline-flex h-11 items-center justify-center rounded-full px-5 text-[15px] font-bold ring-1 transition';
  return (
    <nav aria-label="Blog pages" className="mx-auto mt-10 flex max-w-5xl flex-wrap items-center justify-center gap-2 px-4">
      {page > 1 ? (
        <Link href={pagePath(page - 1)} rel="prev" className={`${btn} bg-white text-zinc-800 ring-zinc-200 hover:ring-brand-300`}>
          ← Newer posts
        </Link>
      ) : null}
      {Array.from({ length: pages }, (_, i) => i + 1).map((n) =>
        n === page ? (
          <span key={n} aria-current="page" className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-brand-600 text-[15px] font-bold text-white">
            {n}
          </span>
        ) : (
          <Link key={n} href={pagePath(n)} className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-white text-[15px] font-bold text-zinc-800 ring-1 ring-zinc-200 transition hover:ring-brand-300">
            {n}
          </Link>
        )
      )}
      {page < pages ? (
        <Link href={pagePath(page + 1)} rel="next" className={`${btn} bg-white text-zinc-800 ring-zinc-200 hover:ring-brand-300`}>
          Older posts →
        </Link>
      ) : null}
    </nav>
  );
}

export default function BlogList({ posts, page, pages, total }) {
  const path = pagePath(page);
  const title = page > 1 ? `The ScriptSea Blog, Page ${page} of ${pages}` : BASE_TITLE;
  const description = page > 1 ? `Page ${page} of the ScriptSea blog. ${DESCRIPTION}` : DESCRIPTION;
  const crumbs = [{ name: 'Home', path: '/' }, { name: 'Blog', path: '/blog' }];
  if (page > 1) crumbs.push({ name: `Page ${page}`, path });

  return (
    <div className="flex min-h-screen flex-col bg-[#fafafa]">
      <SEO
        title={title}
        description={description}
        path={path}
        jsonLd={[
          {
            '@context': 'https://schema.org',
            '@type': 'Blog',
            name: 'The ScriptSea blog',
            description: DESCRIPTION,
            url: `${SITE_URL}${path}`,
            publisher: { '@id': `${SITE_URL}/#organization` },
            blogPost: posts.map((p) => ({ '@type': 'BlogPosting', headline: p.title, url: `${SITE_URL}/blog/${p.slug}`, datePublished: p.date })),
          },
          breadcrumbJsonLd(crumbs),
        ]}
      />
      <AdSenseScript />
      <Navigation />
      <main className="flex-1 pt-16">
        <section className="bg-gradient-to-b from-[#fff5f7] to-[#fafafa] pb-8 pt-10 sm:pt-14">
          <div className="mx-auto max-w-5xl px-4">
            <h1 className="text-[2rem] font-extrabold leading-tight tracking-tight text-zinc-950 sm:text-5xl">The ScriptSea blog</h1>
            <p className="mt-3 max-w-2xl text-[17px] leading-relaxed text-zinc-600">
              Straight answers on AI video prompts, scripts and growing on YouTube.
            </p>
            <p className="mt-3 text-[14px] font-semibold text-zinc-500">
              {total} guides{pages > 1 ? ` · Page ${page} of ${pages}` : ''}
            </p>
          </div>
        </section>

        <section className="pb-16">
          <div className="mx-auto grid max-w-5xl gap-6 px-4 sm:grid-cols-2">
            {posts.map((p, i) => (
              <Link key={p.slug} href={`/blog/${p.slug}`} className="group overflow-hidden rounded-3xl bg-white ring-1 ring-zinc-200 transition hover:ring-brand-300">
                {p.heroImage && (
                  <img
                    src={p.heroImage}
                    alt={p.heroAlt}
                    width={1200}
                    height={630}
                    loading={i < 2 ? 'eager' : 'lazy'}
                    decoding="async"
                    className="aspect-[1200/630] w-full object-cover"
                  />
                )}
                <div className="p-5 sm:p-6">
                  <p className="text-[13px] text-zinc-500">{formatDate(p.date)}{p.readTime ? ` · ${p.readTime}` : ''}</p>
                  <h2 className="mt-2 text-xl font-extrabold leading-snug text-zinc-950 group-hover:text-brand-600">{p.title}</h2>
                  <p className="mt-2 leading-relaxed text-zinc-600">{p.description}</p>
                </div>
              </Link>
            ))}
          </div>
          <Pagination page={page} pages={pages} />
        </section>
      </main>
      <Footer />
    </div>
  );
}
