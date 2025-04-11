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
        // Get and validate environment variables
        const projectId = getRequiredEnvVar('FIREBASE_PROJECT_ID');
        const clientEmail = getRequiredEnvVar('FIREBASE_CLIENT_EMAIL');
        const privateKey = getRequiredEnvVar('FIREBASE_PRIVATE_KEY').replace(/\\n/g, '\n');

        this.app = initializeFirebaseAdmin({
          credential: cert({
            projectId,
            clientEmail,
            privateKey
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