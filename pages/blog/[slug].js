/* eslint-disable @next/next/no-img-element */
import Head from 'next/head';
import Link from 'next/link';
import Navigation from '../../components/Navigation';
import Footer from '../../components/Footer';
import SEO from '../../components/SEO';
import { SITE_URL, absoluteUrl, faqJsonLd, breadcrumbJsonLd } from '../../lib/seo';
import { getAllPosts, getPost } from '../../lib/blog/posts';
import { formatDate } from '../../lib/blog/format';

export default function BlogPost({ post }) {
  const path = `/blog/${post.slug}`;
  const ogImage = post.ogImage ? absoluteUrl(post.ogImage) : undefined;
  // Long titles go out without the " | ScriptSea" suffix so search results don't cut them off.
  const seoTitle = post.title.length <= 48 ? `${post.title} | ScriptSea` : post.title;

  return (
    <div className="flex min-h-screen flex-col bg-white">
      <SEO
        title={seoTitle}
        description={post.description}
        path={path}
        ogImage={ogImage}
        jsonLd={[
          {
            '@context': 'https://schema.org',
            '@type': 'Article',
            headline: post.title,
            description: post.description,
            image: ogImage ? [ogImage] : undefined,
            datePublished: post.date,
            dateModified: post.date,
            author: { '@type': 'Organization', name: 'ScriptSea Team', url: `${SITE_URL}/` },
            publisher: { '@id': `${SITE_URL}/#organization` },
            mainEntityOfPage: absoluteUrl(path),
          },
          post.faqs.length ? faqJsonLd(post.faqs) : null,
          breadcrumbJsonLd([{ name: 'Home', path: '/' }, { name: 'Blog', path: '/blog' }, { name: post.title, path }]),
        ]}
      />
      {/* Article-specific social tags (same keys as SEO, so these replace its defaults) */}
      <Head>
        <meta key="og:type" property="og:type" content="article" />
        <meta key="og:image:alt" property="og:image:alt" content={post.heroAlt} />
        <meta key="twitter:image:alt" name="twitter:image:alt" content={post.heroAlt} />
        <meta key="article:published_time" property="article:published_time" content={post.date} />
        <meta key="article:author" property="article:author" content="ScriptSea Team" />
      </Head>
      <Navigation />

      <main className="flex-1 pt-16">
        <article className="mx-auto max-w-3xl px-4 pb-16 pt-8 sm:pt-12">
          <nav aria-label="Breadcrumb" className="text-[13px] text-zinc-500">
            <Link href="/" className="hover:text-zinc-800">Home</Link>
            <span className="mx-1.5">&gt;</span>
            <Link href="/blog" className="hover:text-zinc-800">Blog</Link>
            <span className="mx-1.5">&gt;</span>
            <span className="text-zinc-700">{post.title}</span>
          </nav>

          <h1 className="mt-5 text-[2rem] font-extrabold leading-[1.12] tracking-tight text-zinc-950 sm:text-[2.75rem]">{post.title}</h1>
          <p className="mt-4 text-[15px] text-zinc-500">
            <span className="font-semibold text-zinc-800">ScriptSea Team</span>
            <span className="mx-2">·</span>
            <time dateTime={post.date}>{formatDate(post.date)}</time>
            {post.readTime && <><span className="mx-2">·</span>{post.readTime}</>}
          </p>

          {post.heroImage && (
            <img
              src={post.heroImage}
              alt={post.heroAlt}
              width={1200}
              height={630}
              loading="eager"
              fetchPriority="high"
              decoding="async"
              className="mt-7 aspect-[1200/630] w-full rounded-3xl object-cover ring-1 ring-zinc-200"
            />
          )}

          <div className="post-body mt-8" dangerouslySetInnerHTML={{ __html: post.html }} />

          {post.faqs.length > 0 && (
            <section className="mt-12">
              <h2 className="text-2xl font-extrabold tracking-tight text-zinc-950 sm:text-3xl">FAQ</h2>
              <div className="mt-5 divide-y divide-zinc-200 rounded-2xl ring-1 ring-zinc-200">
                {post.faqs.map((f) => (
                  <details key={f.q} className="group px-5 py-4">
                    <summary className="flex cursor-pointer list-none items-start justify-between gap-4">
                      <h3 className="font-semibold text-zinc-900">{f.q}</h3>
                      <span className="mt-0.5 text-brand-500 transition group-open:rotate-45" aria-hidden>+</span>
                    </summary>
                    <div className="post-body post-body-faq mt-2" dangerouslySetInnerHTML={{ __html: f.aHtml }} />
                  </details>
                ))}
              </div>
            </section>
          )}

          <section className="mt-12 rounded-3xl bg-zinc-950 p-6 text-white sm:p-10">
            <h2 className="text-2xl font-extrabold tracking-tight sm:text-3xl">Write your next script in one click</h2>
            <p className="mt-2 text-zinc-300">Free to try. No card needed.</p>
            <Link href="/register" className="mt-6 inline-flex rounded-xl bg-brand-500 px-6 py-3.5 font-bold text-white hover:bg-brand-600">
              Try ScriptSea free
            </Link>
          </section>

          {post.relatedLinks.length > 0 && (
            <section className="mt-12">
              <h2 className="text-xl font-extrabold tracking-tight text-zinc-950">Keep reading</h2>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                {post.relatedLinks.slice(0, 2).map((l) => (
                  <Link key={l.href} href={l.href} className="rounded-2xl bg-[#fafafa] px-5 py-4 font-semibold text-zinc-900 ring-1 ring-zinc-200 transition hover:ring-brand-300">
                    {l.title} <span className="text-brand-500">→</span>
                  </Link>
                ))}
              </div>
            </section>
          )}
        </article>
      </main>
      <Footer />

      <style jsx global>{`
        .post-body { color: #3f3f46; font-size: 1.075rem; line-height: 1.8; }
        .post-body > * + * { margin-top: 1.1em; }
        .post-body h2 { margin-top: 2.2em; font-size: 1.65rem; line-height: 1.25; font-weight: 800; color: #09090b; letter-spacing: -0.01em; }
        .post-body h3 { margin-top: 1.8em; font-size: 1.2rem; line-height: 1.35; font-weight: 700; color: #09090b; }
        .post-body h2 + *, .post-body h3 + * { margin-top: 0.6em; }
        .post-body a { color: #ed1a52; font-weight: 600; text-decoration: underline; text-underline-offset: 3px; }
        .post-body strong { color: #09090b; font-weight: 700; }
        .post-body ul, .post-body ol { padding-left: 1.4em; }
        .post-body ul { list-style: disc; }
        .post-body ol { list-style: decimal; }
        .post-body li + li { margin-top: 0.35em; }
        .post-body blockquote { border-left: 4px solid #ff3366; background: #fff5f7; border-radius: 0 14px 14px 0; padding: 0.9em 1.1em; color: #27272a; font-size: 1rem; }
        .post-body blockquote p + p { margin-top: 0.5em; }
        .post-body code { background: #f4f4f5; border-radius: 6px; padding: 0.1em 0.35em; font-size: 0.92em; }
        .post-body img { border-radius: 18px; width: 100%; height: auto; }
        .post-body .table-wrap { overflow-x: auto; border-radius: 16px; border: 1px solid #e4e4e7; }
        .post-body table { width: 100%; border-collapse: collapse; font-size: 0.95rem; line-height: 1.55; }
        .post-body th { background: #fafafa; text-align: left; font-weight: 700; color: #09090b; }
        .post-body th, .post-body td { padding: 0.75em 0.9em; border-bottom: 1px solid #e4e4e7; vertical-align: top; min-width: 120px; }
        .post-body tr:last-child td { border-bottom: 0; }
        .post-body-faq { font-size: 1rem; line-height: 1.7; color: #52525b; }
      `}</style>
    </div>
  );
}

export async function getStaticPaths() {
  return { paths: getAllPosts().map((p) => ({ params: { slug: p.slug } })), fallback: false };
}

export async function getStaticProps({ params }) {
  const post = getPost(params.slug);
  if (!post) return { notFound: true };
  return { props: { post } };
}
