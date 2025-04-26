import { Html, Head, Main, NextScript } from 'next/document';

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        {/* Favicon */}
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        
        {/* PWA primary color */}
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