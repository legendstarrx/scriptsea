/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  poweredByHeader: false,
  
  images: {
    domains: ['www.google.com'],
    minimumCacheTTL: 60,
  },
  
  async redirects() {
    return [
      // Old standalone prompt page; the tool now lives inside /generate.
      { source: '/video-prompt', destination: '/ai-video-prompt-generator', permanent: true },
    ];
  },

  async headers() {
    // App and account pages render a spinner on the server, so a meta robots tag
    // may never reach crawlers. Send noindex as a header instead.
    const privateRoutes = ['/generate', '/login', '/register', '/verify-email', '/payment-success', '/payment-error', '/auth/:path*'];
    return [
      ...privateRoutes.map((source) => ({
        source,
        headers: [{ key: 'X-Robots-Tag', value: 'noindex, follow' }],
      })),
      {
        source: '/:path*',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://*.vercel-insights.com https://*.vercel-scripts.com https://*.vercel.com https://*.vercel.app *.google.com apis.google.com va.vercel-scripts.com www.googletagmanager.com *.google-analytics.com https://googleads.g.doubleclick.net https://www.googleadservices.com",
              "connect-src 'self' https://*.vercel-insights.com https://*.vercel-scripts.com https://*.vercel.com vitals.vercel-insights.com *.googleapis.com connect.mailerlite.com *.google-analytics.com https://*.supabase.co https://*.supabase.com https://www.google.com https://*.google.com.my https://googleads.g.doubleclick.net https://www.googleadservices.com https://*.googleadservices.com",
              "img-src 'self' data: *.googleusercontent.com www.google.com www.googletagmanager.com https://*.google.com.my https://googleads.g.doubleclick.net https://www.googleadservices.com",
              "frame-src 'self' *.google.com",
              "style-src 'self' 'unsafe-inline' fonts.googleapis.com",
              "font-src 'self' fonts.gstatic.com",
              "media-src 'self'",
              "object-src 'none'"
            ].join('; ')
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin'
          }
        ]
      },
      {
        source: '/_next/static/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        source: '/api/:path*',
        headers: [
          {
            key: 'Set-Cookie',
            value: 'Path=/; Secure; SameSite=Strict'
          },
          {
            key: 'Cache-Control',
            value: 'no-store, no-cache, must-revalidate',
          },
        ],
      },
    ];
  },

  // No custom splitChunks: the old override forced every node_module (docx, jspdf, …)
  // into one bundle loaded on every page. Next's default splits per page.
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
      };
    }
    return config;
  },

  serverRuntimeConfig: {
    cookieOptions: {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/'
    }
  }
};

module.exports = nextConfig;
