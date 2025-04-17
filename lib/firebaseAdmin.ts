import { getApps, cert, initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';
import type { NextApiRequest } from 'next';

// Initialize Firebase Admin if not already initialized
if (!getApps().length) {
  try {
    initializeApp({
      credential: cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n')
      })
    });
  } catch (error) {
    console.error('Firebase Admin initialization error:', error);
    throw error;
  }
}

// Export the admin instances
export const adminDb = getFirestore();
export const adminAuth = getAuth();

// Helper function to verify admin session
export const verifyAdmin = async (req: NextApiRequest) => {
  const adminKey = req.headers.authorization?.split('Bearer ')[1];
  if (adminKey !== process.env.ADMIN_API_KEY) {
    throw new Error('Unauthorized');
  }
};