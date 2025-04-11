import { getApps, cert, App, initializeApp as initializeFirebaseAdmin } from 'firebase-admin/app';
import { getFirestore, Firestore } from 'firebase-admin/firestore';
import { getAuth, Auth } from 'firebase-admin/auth';

// Helper function to get environment variables with type checking
const getRequiredEnvVar = (name: string): string => {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
};

class FirebaseAdmin {
  public db: Firestore;
  public auth: Auth;
  private static instance: FirebaseAdmin;
  private app: App;

  private constructor() {
    const apps = getApps();
    
    if (!apps.length) {
      try {
        this.app = initializeFirebaseAdmin({
          credential: cert({
            projectId: process.env.FIREBASE_PROJECT_ID!,
            clientEmail: process.env.FIREBASE_CLIENT_EMAIL!,
            privateKey: process.env.FIREBASE_PRIVATE_KEY!.replace(/\\n/g, '\n')
          })
        });
      } catch (error) {
        console.error('Firebase Admin initialization error:', error);
        throw error;
      }
    } else {
      this.app = apps[0];
    }

    this.db = getFirestore(this.app);
    this.auth = getAuth(this.app);
  }

  public static getInstance(): FirebaseAdmin {
    if (!FirebaseAdmin.instance) {
      FirebaseAdmin.instance = new FirebaseAdmin();
    }
    return FirebaseAdmin.instance;
  }
}

// Export initialized instances
const { db: adminDb, auth: adminAuth } = FirebaseAdmin.getInstance();
export { adminDb, adminAuth };