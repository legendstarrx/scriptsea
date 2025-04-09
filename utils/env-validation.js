export const validateEnvVariables = () => {
  const required = {
    firebase: [
      'NEXT_PUBLIC_FIREBASE_API_KEY',
      'NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN',
      'NEXT_PUBLIC_FIREBASE_PROJECT_ID',
    ],
    flutterwave: [
      'FLW_PUBLIC_KEY',
      'FLW_SECRET_KEY',
      'FLW_WEBHOOK_SECRET',
    ],
  };

  const missing = [];

  Object.entries(required).forEach(([service, vars]) => {
    vars.forEach(varName => {
      if (!process.env[varName]?.trim()) {
        missing.push(varName);
      }
    });
  });

  if (missing.length > 0) {
    console.error('Missing required environment variables:', missing.join(', '));
    if (typeof window === 'undefined') {
      throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
    }
  }
}; 