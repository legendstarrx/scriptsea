import { ADSENSE_PUB_ID } from '../lib/ads';

// Served at /ads.txt. Built from NEXT_PUBLIC_ADSENSE_CLIENT so it always matches the AdSense account.
export async function getServerSideProps({ res }) {
  res.setHeader('Content-Type', 'text/plain; charset=utf-8');
  res.setHeader('Cache-Control', 'public, s-maxage=86400, stale-while-revalidate=86400');
  res.write(ADSENSE_PUB_ID ? `google.com, ${ADSENSE_PUB_ID}, DIRECT, f08c47fec0942fa0\n` : '');
  res.end();
  return { props: {} };
}

export default function AdsTxt() {
  return null;
}
