/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  env: {
    NEXT_PUBLIC_BASE_URL: 'https://www.scriptsea.com'
  },
  // Optimize build performance
  webpack: (config, { dev, isServer }) => {
    if (!dev && !isServer) {
      Object.assign(config.resolve.alias, {
        'react/jsx-runtime': 'preact/compat/jsx-runtime',
        react: 'preact/compat',
        'react-dom/test-utils': 'preact/test-utils',
        'react-dom': 'preact/compat'
      });
    }
    if (isServer) {
      // Validate required environment variables during build
      const requiredVars = [
        'NEXT_PUBLIC_FIREBASE_API_KEY',
        'NEXT_PUBLIC_FIREBASE_PROJECT_ID',
        'FIREBASE_PRIVATE_KEY',
        'FIREBASE_CLIENT_EMAIL'
      ];

      requiredVars.forEach(varName => {
        if (!process.env[varName]) {
          throw new Error(`Missing required environment variable: ${varName}`);
        }
      });
    }
    return config;
  },
  // Security headers
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'X-XSS-Protection', value: '1; mode=block' },
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self' https://*.scriptsea.com https://*.firebaseapp.com https://*.googleapis.com",
              "script-src 'self' 'unsafe-inline' https://*.firebaseapp.com https://*.googleapis.com https://checkout.flutterwave.com",
              "connect-src 'self' https://*.scriptsea.com https://*.firebaseio.com https://*.googleapis.com wss://*.firebaseio.com",
              "img-src 'self' https://*.scriptsea.com https://*.firebaseapp.com data:",
              "style-src 'self' 'unsafe-inline'",
              "font-src 'self' data:",
            ].join('; ')
          }
        ]
      }
    ];
  },
  // Production optimizations
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production'
  },
  images: {
    domains: ['www.scriptsea.com'],
    unoptimized: true
  },
  output: 'standalone',
  productionBrowserSourceMaps: false,
  // Experimental features
  experimental: {
    optimizeCss: true,
    scrollRestoration: true,
    largePageDataBytes: 128 * 1000, // Increase the threshold for page data size
  },
  // Add rewrites for www subdomain
  async rewrites() {
    return [
      {
        source: '/:path*',
        destination: 'https://www.scriptsea.com/:path*',
        has: [
          {
            type: 'host',
            value: 'scriptsea.com',
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
