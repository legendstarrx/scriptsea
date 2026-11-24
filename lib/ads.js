// Google AdSense settings. Set NEXT_PUBLIC_ADSENSE_CLIENT (e.g. "ca-pub-1234567890123456")
// in Vercel and redeploy. Until it's set, nothing ad-related is output anywhere.
export const ADSENSE_CLIENT = (process.env.NEXT_PUBLIC_ADSENSE_CLIENT || '').trim();

/** "ca-pub-123" → "pub-123" (the form ads.txt uses). */
export const ADSENSE_PUB_ID = ADSENSE_CLIENT.replace(/^ca-/, '');
