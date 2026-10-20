// Turns the model's raw script output into { title, body } and handles export.

const stripQuotes = (s = '') => s.trim().replace(/^["'“”]+|["'“”]+$/g, '').trim();

/** Same cleanup the old formatScript() applied, but kept as plain text. */
export function cleanScriptText(text = '') {
  return text
    .replace(/\[Top 3 Viral Title Options\]/g, '# Title\n')
    .replace(/\*/g, '')
    .replace(/\((.*?camera.*?)\)/gi, '')
    .replace(/\((.*?visual.*?)\)/gi, '')
    .replace(/\((.*?music.*?)\)/gi, '')
    .replace(/\((.*?sound.*?)\)/gi, '')
    .replace(/[ \t]+([.,!?;:])/g, '$1')
    .replace(/[ \t]{2,}/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

/**
 * Expected format: "# Title\n<title>\n\n## Script\n<script>" plus, for ads,
 * "## Hook variations" (numbered) and "## On-screen text". Tolerant of variations.
 * Returns { title, body, hooks: string[], overlay }.
 */
export function parseScript(raw = '') {
  const text = cleanScriptText(raw);
  const sections = {};
  let preamble = '';
  let current = null;

  text.split('\n').forEach((line) => {
    const heading = line.match(/^#{1,3}\s*(.+?)\s*$/);
    if (heading) {
      const name = heading[1].toLowerCase();
      if (/^(viral\s+)?title/.test(name)) {
        current = 'title';
        const inline = heading[1].replace(/^(viral\s+)?title(\s+options)?\s*:?\s*/i, '');
        if (inline) sections.title = inline;
      } else if (/^script/.test(name)) current = 'body';
      else if (/hook/.test(name)) current = 'hooks';
      else if (/on.?screen|overlay|text on screen/.test(name)) current = 'overlay';
      else if (/from your site|from the site|sources?/.test(name)) current = 'facts';
      else if (!sections.title && !current) { sections.title = heading[1]; current = 'title-done'; }
      else current = 'other';
      return;
    }
    if (!current) { preamble += `${line}\n`; return; }
    sections[current] = `${sections[current] || ''}${line}\n`;
  });

  const title = stripQuotes((sections.title || '').split('\n').find((l) => l.trim()) || '')
    .replace(/^Title\s*\d*\s*:\s*/i, '');
  const body = (sections.body || sections['title-done'] || preamble || text)
    .replace(/\n{3,}/g, '\n\n').trim();
  const hooks = (sections.hooks || '')
    .split('\n')
    .map((l) => stripQuotes(l.replace(/^\s*(\d+[.)]|[-•*])\s*/, '')))
    .filter(Boolean);
  const overlay = stripQuotes((sections.overlay || '').trim().split('\n')[0] || '');
  const facts = (sections.facts || '')
    .split('\n')
    .map((l) => l.replace(/^\s*(\d+[.)]|[-•*])\s*/, '').trim())
    .filter(Boolean);

  return { title, body, hooks, overlay, facts };
}

export const countWords = (text = '') => (text.trim() ? text.trim().split(/\s+/).length : 0);

/** ~150 spoken words per minute. */
export function readTime(words) {
  const secs = Math.max(1, Math.round((words / 150) * 60));
  if (secs < 90) return `~${secs} sec`;
  return `~${Math.round(secs / 60)} min`;
}

export const scriptToPlainText = ({ title, body }) => (title ? `${title}\n\n${body}` : body);

const cap = (s = '') => s.charAt(0).toUpperCase() + s.slice(1);
const fileName = (title) => (title || 'ScriptSea script').replace(/[\\/:*?"<>|]+/g, '').slice(0, 80);

export async function exportScriptPDF({ title, body, platform, duration, tone }) {
  const { jsPDF } = await import('jspdf');
  const doc = new jsPDF();
  const margin = 20;
  const width = 170;
  let y = 24;

  doc.setFont(undefined, 'bold');
  doc.setFontSize(18);
  const titleLines = doc.splitTextToSize(title || 'Untitled Script', width);
  doc.text(titleLines, margin, y);
  y += titleLines.length * 8 + 4;

  doc.setFont(undefined, 'normal');
  doc.setFontSize(10);
  doc.setTextColor(120);
  doc.text(`${cap(platform)} · ${duration} · ${cap(tone)} · ScriptSea`, margin, y);
  doc.setTextColor(30);
  y += 12;

  doc.setFontSize(12);
  body.split(/\n+/).forEach((para) => {
    const lines = doc.splitTextToSize(para, width);
    lines.forEach((line) => {
      if (y > 275) { doc.addPage(); y = 20; }
      doc.text(line, margin, y);
      y += 6.5;
    });
    y += 3;
  });

  const pages = doc.internal.getNumberOfPages();
  for (let i = 1; i <= pages; i += 1) {
    doc.setPage(i);
    doc.setFontSize(9);
    doc.setTextColor(150);
    doc.text(`Page ${i} of ${pages}`, margin, 288);
  }
  doc.save(`${fileName(title)}.pdf`);
}

export async function exportScriptWord({ title, body, platform, duration, tone }) {
  const [{ Document, Packer, Paragraph, TextRun }, { saveAs }] = await Promise.all([import('docx'), import('file-saver')]);
  const doc = new Document({
    sections: [{
      properties: { page: { margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 } } },
      children: [
        new Paragraph({ children: [new TextRun({ text: title || 'Untitled Script', bold: true, size: 36 })], spacing: { after: 200 } }),
        new Paragraph({
          children: [new TextRun({ text: `${cap(platform)} · ${duration} · ${cap(tone)}`, color: '777777', size: 20 })],
          spacing: { after: 400 },
        }),
        ...body.split(/\n+/).filter(Boolean).map((para) =>
          new Paragraph({ children: [new TextRun({ text: para, size: 24 })], spacing: { after: 200, line: 360 } })
        ),
      ],
    }],
  });
  const blob = await Packer.toBlob(doc);
  saveAs(blob, `${fileName(title)}.docx`);
}
