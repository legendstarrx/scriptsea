// Small Markdown + frontmatter parser for the blog (no extra packages).
// Supports: frontmatter (key: value, lists of values or of key/value maps),
// ## / ### headings, paragraphs, **bold**, *italic*, `code`, [links](/url),
// ![images](/src), - and 1. lists, > quotes, | tables | and ``` fenced blocks ```.
// Posts are our own files, so HTML in them is escaped, not trusted.

const unquote = (v) => {
  const t = v.trim();
  return (t.startsWith('"') && t.endsWith('"')) || (t.startsWith("'") && t.endsWith("'")) ? t.slice(1, -1) : t;
};

/** Split "---\nfrontmatter\n---\nbody" into { data, body }. */
export function parseFrontmatter(src) {
  const text = src.replace(/\r\n/g, '\n');
  const m = text.match(/^---\n([\s\S]*?)\n---\n?/);
  if (!m) return { data: {}, body: text };
  const data = {};
  let listKey = null;
  m[1].split('\n').forEach((line) => {
    if (!line.trim() || line.trim().startsWith('#')) return;
    const item = line.match(/^\s+-\s+(.*)$/);
    const cont = line.match(/^\s{3,}([A-Za-z]\w*):\s*(.*)$/);
    if (item && listKey) {
      const kv = item[1].match(/^([A-Za-z]\w*):\s*(.*)$/);
      data[listKey].push(kv ? { [kv[1]]: unquote(kv[2]) } : unquote(item[1]));
    } else if (cont && listKey && typeof data[listKey][data[listKey].length - 1] === 'object') {
      data[listKey][data[listKey].length - 1][cont[1]] = unquote(cont[2]);
    } else {
      const kv = line.match(/^([A-Za-z]\w*):\s*(.*)$/);
      if (!kv) return;
      if (kv[2].trim() === '') { listKey = kv[1]; data[kv[1]] = []; } else { listKey = null; data[kv[1]] = unquote(kv[2]); }
    }
  });
  return { data, body: text.slice(m[0].length) };
}

const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

export function slugifyHeading(s) {
  return s.toLowerCase().replace(/<[^>]+>/g, '').replace(/&[a-z]+;/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

/** Inline Markdown → HTML. */
export function inline(text) {
  let s = esc(text);
  s = s.replace(/`([^`]+)`/g, '<code>$1</code>');
  s = s.replace(/!\[([^\]]*)\]\(([^)\s]+)\)/g, '<img src="$2" alt="$1" loading="lazy" decoding="async" />');
  s = s.replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, (_, label, href) => (
    /^https?:\/\//.test(href)
      ? `<a href="${href}" target="_blank" rel="noopener noreferrer">${label}</a>`
      : `<a href="${href}">${label}</a>`
  ));
  s = s.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  s = s.replace(/(^|[^*\w])\*([^*\n]+)\*(?!\*)/g, '$1<em>$2</em>');
  return s;
}

/** Inline Markdown → plain text (for schema and meta). */
export function plain(text) {
  return text
    .replace(/!\[([^\]]*)\]\([^)]+\)/g, '$1')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/[*`]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

const splitRow = (row) => row.trim().replace(/^\||\|$/g, '').split('|').map((c) => c.trim());

/** Block Markdown → HTML. */
export function markdownToHtml(md) {
  const lines = md.replace(/\r\n/g, '\n').split('\n');
  const out = [];
  let para = [];
  const flush = () => {
    if (para.length) { out.push(`<p>${inline(para.join(' '))}</p>`); para = []; }
  };

  for (let i = 0; i < lines.length; i += 1) {
    const line = lines[i];
    const t = line.trim();
    if (!t) { flush(); continue; }

    // ``` fenced block: shown as-is (templates, prompts), whitespace kept.
    if (t.startsWith('```')) {
      flush();
      const block = [];
      i += 1;
      while (i < lines.length && !lines[i].trim().startsWith('```')) { block.push(lines[i]); i += 1; }
      out.push(`<pre class="md-block"><code>${esc(block.join('\n'))}</code></pre>`);
      continue;
    }

    const h = t.match(/^(#{2,4})\s+(.*)$/);
    if (h) {
      flush();
      const level = h[1].length;
      const html = inline(h[2]);
      out.push(`<h${level} id="${slugifyHeading(html)}">${html}</h${level}>`);
      continue;
    }

    if (t.startsWith('|')) {
      flush();
      const rows = [];
      while (i < lines.length && lines[i].trim().startsWith('|')) { rows.push(lines[i]); i += 1; }
      i -= 1;
      const head = splitRow(rows[0]);
      const body = rows.slice(1).filter((r) => !/^\s*\|?\s*:?-{2,}/.test(r)).map(splitRow);
      out.push(
        `<div class="table-wrap"><table><thead><tr>${head.map((c) => `<th>${inline(c)}</th>`).join('')}</tr></thead>`
        + `<tbody>${body.map((r) => `<tr>${r.map((c) => `<td>${inline(c)}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`,
      );
      continue;
    }

    if (/^[-*]\s+/.test(t) || /^\d+\.\s+/.test(t)) {
      flush();
      const ordered = /^\d+\.\s+/.test(t);
      const items = [];
      while (i < lines.length && (ordered ? /^\d+\.\s+/ : /^[-*]\s+/).test(lines[i].trim())) {
        items.push(lines[i].trim().replace(ordered ? /^\d+\.\s+/ : /^[-*]\s+/, ''));
        i += 1;
      }
      i -= 1;
      const tag = ordered ? 'ol' : 'ul';
      // Keep numbering going when a numbered list is split up (e.g. 1–5, then 6–10).
      const startNum = ordered ? parseInt(t, 10) : 1;
      const open = ordered && startNum > 1 ? `<ol start="${startNum}">` : `<${tag}>`;
      out.push(`${open}${items.map((it) => `<li>${inline(it)}</li>`).join('')}</${tag}>`);
      continue;
    }

    if (t.startsWith('>')) {
      flush();
      const quote = [];
      while (i < lines.length && lines[i].trim().startsWith('>')) { quote.push(lines[i].trim().replace(/^>\s?/, '')); i += 1; }
      i -= 1;
      // A bare ">" line separates paragraphs inside the quote.
      const paras = quote.join('\n').split(/\n\s*\n/).map((q) => q.replace(/\n/g, ' ').trim()).filter(Boolean);
      out.push(`<blockquote>${paras.map((q) => `<p>${inline(q)}</p>`).join('')}</blockquote>`);
      continue;
    }

    para.push(t);
  }
  flush();
  return out.join('\n');
}

/**
 * Pull the "## FAQ" section out of the body. Each "### Question" followed by
 * its answer becomes { q, a, aHtml }. Returns { body, faqs }.
 */
export function extractFaq(md) {
  const text = md.replace(/\r\n/g, '\n');
  const start = text.search(/^##\s+(FAQ|Frequently asked questions)\s*$/im);
  if (start === -1) return { body: text, faqs: [] };
  const afterHeading = text.indexOf('\n', start) + 1;
  const rest = text.slice(afterHeading);
  const nextH2 = rest.search(/^##\s+/m);
  const section = nextH2 === -1 ? rest : rest.slice(0, nextH2);
  const body = text.slice(0, start) + (nextH2 === -1 ? '' : rest.slice(nextH2));
  const faqs = section.split(/^###\s+/m).slice(1).map((chunk) => {
    const [qLine, ...aLines] = chunk.split('\n');
    const a = aLines.join('\n').trim();
    return { q: plain(qLine), a: plain(a), aHtml: markdownToHtml(a) };
  }).filter((f) => f.q && f.a);
  return { body, faqs };
}

export function countWords(md) {
  return plain(md.replace(/^#+\s+/gm, '').replace(/\|/g, ' ')).split(/\s+/).filter(Boolean).length;
}
