import { Html, Head, Main, NextScript } from 'next/document';

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        {/* Google Analytics */}
        <script
          async
          src="https://www.googletagmanager.com/gtag/js?id=G-9VTGLJ644Y"
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', 'G-9VTGLJ644Y');
            `
          }}
        />

        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#FF3366" />
        
        {/* Favicon */}
        <link rel="icon" href="/favicon.ico" />
        
        {/* SEO Meta Tags */}
        <meta name="description" content="Generate engaging video scripts for YouTube, TikTok, Instagram, and more with AI-powered technology." />
        <meta name="keywords" content="video scripts, content creation, AI writing, social media content" />
        
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