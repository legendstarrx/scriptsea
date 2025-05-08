/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  poweredByHeader: false,
  
  images: {
    domains: ['firebasestorage.googleapis.com', 'www.google.com'],
    minimumCacheTTL: 60,
  },
  
  async rewrites() {
    return [
      {
        source: '/auth/:path*',
        destination: 'https://scriptsea-4c5cd.firebaseapp.com/__/auth/:path*'
      }
    ];
  },
  
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://*.vercel-insights.com https://*.vercel-scripts.com https://*.vercel.com https://*.vercel.app *.firebaseapp.com *.google.com apis.google.com identitytoolkit.googleapis.com va.vercel-scripts.com www.googletagmanager.com *.google-analytics.com",
              "connect-src 'self' https://*.vercel-insights.com https://*.vercel-scripts.com https://*.vercel.com vitals.vercel-insights.com *.firebaseapp.com *.googleapis.com identitytoolkit.googleapis.com wss://*.firebaseio.com connect.mailerlite.com *.google-analytics.com",
              "img-src 'self' data: *.googleusercontent.com firebasestorage.googleapis.com www.google.com www.googletagmanager.com",
              "frame-src 'self' *.firebaseapp.com *.google.com",
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

  webpack: (config, { dev, isServer }) => {
    if (!dev && !isServer) {
      config.optimization.splitChunks = {
        chunks: 'all',
        minSize: 20000,
        maxSize: 244000,
        minChunks: 1,
        maxAsyncRequests: 30,
        maxInitialRequests: 30,
        cacheGroups: {
          default: false,
          vendors: false,
          framework: {
            name: 'framework',
            chunks: 'all',
            test: /[\\/]node_modules[\\/]/,
            priority: 40,
            enforce: true,
          },
          lib: {
            test: /[\\/]node_modules[\\/]/,
            name(module) {
              const packageName = module.context.match(
                /[\\/]node_modules[\\/](.*?)([\\/]|$)/
              )[1];
              return `npm.${packageName.replace('@', '')}`;
            },
            priority: 30,
          },
        },
      };
    }
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
