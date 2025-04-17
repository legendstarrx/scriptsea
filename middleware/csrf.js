import { csrf } from 'next-csrf';

export const { csrf: csrfMiddleware, setup: setupCSRF } = csrf({
  secret: process.env.CSRF_SECRET
}); 