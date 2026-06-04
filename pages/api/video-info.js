/**
 * GET /api/video-info?url=VIDEO_URL
 * Fetches video title/author via oEmbed — server-side so CSP doesn't block it.
 */
export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { url } = req.query;
  if (!url || typeof url !== 'string') {
    return res.status(400).json({ error: 'url param required' });
  }

  try {
    let oembedUrl = null;

    if (url.includes('youtube.com') || url.includes('youtu.be')) {
      oembedUrl = `https://www.youtube.com/oembed?url=${encodeURIComponent(url)}&format=json`;
    } else if (url.includes('tiktok.com')) {
      oembedUrl = `https://www.tiktok.com/oembed?url=${encodeURIComponent(url)}`;
    }

    if (!oembedUrl) {
      return res.status(200).json({ title: null, author: null });
    }

    const response = await fetch(oembedUrl, {
      headers: { 'User-Agent': 'ScriptSea/1.0' },
    });

    if (!response.ok) {
      return res.status(200).json({ title: null, author: null });
    }

    const data = await response.json();
    return res.status(200).json({
      title:  data.title       || null,
      author: data.author_name || null,
    });
  } catch {
    return res.status(200).json({ title: null, author: null });
  }
}
