/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      // Inter only applies where `font-sans` is used (the app + auth screens).
      // globals.css sets the marketing pages' body font explicitly.
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      colors: {
        primary: '#FF3366',
        secondary: '#6B7280',
        brand: {
          50: '#fff1f4',
          100: '#ffe4ea',
          200: '#ffccd8',
          300: '#ff9fb5',
          400: '#ff6b8a',
          500: '#ff3366',
          600: '#ed1a52',
          700: '#c80d42',
          800: '#a70f3d',
          900: '#8e1139',
        },
        ink: {
          DEFAULT: '#0f0f14',
          soft: '#2a2a33',
        },
      },
      boxShadow: {
        card: '0 1px 2px rgba(16,16,24,0.04), 0 4px 16px rgba(16,16,24,0.04)',
        lift: '0 2px 4px rgba(16,16,24,0.04), 0 12px 32px rgba(16,16,24,0.08)',
        brand: '0 8px 24px rgba(255,51,102,0.28)',
      },
      keyframes: {
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-400px 0' },
          '100%': { backgroundPosition: '400px 0' },
        },
      },
      animation: {
        'fade-up': 'fade-up 0.35s ease-out both',
        shimmer: 'shimmer 1.4s linear infinite',
      },
    },
  },
  plugins: [],
};
