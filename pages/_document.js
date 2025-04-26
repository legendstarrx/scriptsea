import { Html, Head, Main, NextScript } from 'next/document';

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        <link rel="icon" type="image/png" sizes="96x96" href="/favicon-96x96.png" />
        <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
        <link rel="shortcut icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/site.webmanifest" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
        <meta name="msapplication-TileColor" content="#FF3366" />
        <meta name="theme-color" content="#FF3366" />
        
        {/* Primary Meta Tags */}
        <meta name="title" content="ScriptSea - AI Video Script Generator" />
        <meta name="description" content="Generate engaging video scripts for YouTube, TikTok, Instagram, and more with AI-powered technology." />
        
        {/* Open Graph / Facebook */}
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://www.scriptsea.com/" />
        <meta property="og:title" content="ScriptSea - AI Video Script Generator" />
        <meta property="og:description" content="Generate engaging video scripts for YouTube, TikTok, Instagram, and more with AI-powered technology." />
        <meta property="og:image" content="https://www.scriptsea.com/og-image.png" />

        {/* Twitter */}
        <meta property="twitter:card" content="summary_large_image" />
        <meta property="twitter:url" content="https://www.scriptsea.com/" />
        <meta property="twitter:title" content="ScriptSea - AI Video Script Generator" />
        <meta property="twitter:description" content="Generate engaging video scripts for YouTube, TikTok, Instagram, and more with AI-powered technology." />
        <meta property="twitter:image" content="https://www.scriptsea.com/og-image.png" />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
} 