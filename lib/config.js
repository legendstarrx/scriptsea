const requiredEnvVars = ['POLAR_ACCESS_TOKEN', 'POLAR_WEBHOOK_SECRET'];

requiredEnvVars.forEach(envVar => {
  if (!process.env[envVar]) {
    throw new Error(`Missing required environment variable: ${envVar}`);
  }
});

export const config = {
  baseUrl: process.env.NEXT_PUBLIC_BASE_URL || 'https://scriptsea.com',
  polar: {
    accessToken: process.env.POLAR_ACCESS_TOKEN,
    webhookSecret: process.env.POLAR_WEBHOOK_SECRET
  },
  supabase: {
    url: process.env.NEXT_PUBLIC_SUPABASE_URL,
    publishableKey: process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
  }
}; 