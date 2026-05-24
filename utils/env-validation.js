export const validateEnvVariables = () => {
  const required = {
    ai: ['OPENAI_API_KEY'],
    supabase: [
      'NEXT_PUBLIC_SUPABASE_URL',
      'NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY'
    ],
    billing: ['POLAR_ACCESS_TOKEN', 'POLAR_WEBHOOK_SECRET', 'POLAR_PRODUCT_WEEKLY_ID', 'POLAR_PRODUCT_MONTHLY_ID']
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