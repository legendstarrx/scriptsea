import { getAuth } from 'firebase-admin/auth';
import { db } from '../../../lib/firebase';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Redirect to login page
  res.redirect('/login');
} 