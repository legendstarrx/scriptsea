module.exports = {
  extends: ['next', 'next/core-web-vitals'],
  rules: {
    'react/no-unescaped-entities': 'off',
    '@next/next/no-img-element': 'off',
    // Add this if you want to disable the exhaustive-deps warning
    // 'react-hooks/exhaustive-deps': 'warn'
  }
}; 