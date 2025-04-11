import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

if (!process.env.FIREBASE_PRIVATE_KEY || !process.env.FIREBASE_CLIENT_EMAIL || !process.env.FIREBASE_PROJECT_ID) {
  throw new Error('Missing Firebase Admin environment variables. Check your .env file');
}

const firebaseAdminConfig = {
  credential: cert({
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n')
  })
};

// Initialize Firebase Admin
const apps = getApps();
const adminApp = apps.length === 0 ? initializeApp(firebaseAdminConfig) : apps[0];
const adminDb = getFirestore(adminApp);

export { adminDb }; 
import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

const getFirebaseAdminConfig = () => {
  const privateKey = process.env.FIREBASE_PRIVATE_KEY;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const projectId = process.env.FIREBASE_PROJECT_ID;

  if (!privateKey || !clientEmail || !projectId) {
    console.error('Firebase Admin environment variables are missing:', {
      hasPrivateKey: !!privateKey,
      hasClientEmail: !!clientEmail,
      hasProjectId: !!projectId
    });
    throw new Error('Firebase Admin configuration is incomplete. Check your environment variables.');
  }

  return {
    credential: cert({
      projectId,
      clientEmail,
      privateKey: privateKey.replace(/\\n/g, '\n')
    })
  };
};

// Initialize Firebase Admin
let adminDb: ReturnType<typeof getFirestore>;

try {
  const apps = getApps();
  const adminApp = apps.length === 0 ? initializeApp(getFirebaseAdminConfig()) : apps[0];
  adminDb = getFirestore(adminApp);
} catch (error) {
  console.error('Firebase Admin initialization error:', error);
  throw error;
}

export { adminDb }; 