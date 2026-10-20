// Detects YouTube / TikTok / Instagram links used as a style reference and
// fetches the video title through our own API (avoids CSP issues).

export const looksLikeVideoLink = (val = '') =>
  val.includes('youtube.com') || val.includes('youtu.be') ||
  val.includes('tiktok.com') ||
  val.includes('instagram.com/reel') || val.includes('instagram.com/p/');

async function fetchInfo(url) {
  try {
    const res = await fetch(`/api/video-info?url=${encodeURIComponent(url)}`);
    return res.ok ? await res.json() : null;
  } catch {
    return null; // title is optional
  }
}

export async function resolveVideoLink(link) {
  if (!link) return null;

  if (link.includes('youtube.com') || link.includes('youtu.be')) {
    // watch?v=, youtu.be/, /shorts/, /live/
    let videoId = null;
    if (link.includes('youtu.be/')) videoId = link.split('youtu.be/')[1]?.split('?')[0];
    else if (link.includes('/shorts/')) videoId = link.split('/shorts/')[1]?.split('?')[0];
    else if (link.includes('/live/')) videoId = link.split('/live/')[1]?.split('?')[0];
    else if (link.includes('v=')) videoId = link.split('v=')[1]?.split('&')[0];
    if (!videoId) return null;

    const video = { platform: 'YouTube', id: videoId, url: `https://www.youtube.com/watch?v=${videoId}`, title: null, author: null };
    const info = await fetchInfo(video.url);
    if (info?.title) { video.title = info.title; video.author = info.author || null; }
    return video;
  }

  if (link.includes('tiktok.com')) {
    // /@user/video/ID and short links (vm./vt.tiktok.com/XXX)
    const videoId = link.includes('/video/')
      ? link.split('/video/')[1]?.split('?')[0]
      : link.split('tiktok.com/')[1]?.split('?')[0] || 'short';
    const video = { platform: 'TikTok', id: videoId, url: link, title: null, author: null };
    const info = await fetchInfo(link);
    if (info?.title) { video.title = info.title; video.author = info.author || null; }
    return video;
  }

  if (link.includes('instagram.com/reel') || link.includes('instagram.com/p/')) {
    const reelId = link.includes('/reel/')
      ? link.split('/reel/')[1]?.split('/')[0]?.split('?')[0]
      : link.split('/p/')[1]?.split('/')[0]?.split('?')[0];
    // Instagram oEmbed needs an auth token — no title, still useful as a style reference.
    return reelId ? { platform: 'Instagram', id: reelId, url: link, title: null, author: null } : null;
  }

  return null;
}
