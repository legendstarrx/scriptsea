import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';

// Initialize Firebase Admin if not already initialized
if (!getApps().length) {
  initializeApp({
    credential: cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n')
    })
  });
}

// Export the admin instances
export const adminDb = getFirestore();
export const adminAuth = getAuth();

// Helper function to check if user is admin
export const isAdmin = async (userId) => {
  const userDoc = await adminDb.collection('users').doc(userId).get();
  return userDoc.exists() && userDoc.data().isAdmin === true;
};

// Helper function to verify admin session
export const verifyAdmin = async (req) => {
  const adminKey = req.headers.authorization?.split('Bearer ')[1];
  if (adminKey !== process.env.NEXT_PUBLIC_ADMIN_API_KEY) {
    throw new Error('Unauthorized');
  }
};

export const updateUserSubscription = async (userId, plan) => {
  try {
    const userRef = adminDb.collection('users').doc(userId);
    const userDoc = await userRef.get();
    const userData = userDoc.data();
    const subscriptionType = userData?.subscriptionType || 'monthly';
    
    await userRef.update({
      subscription: plan,
      scriptsRemaining: plan === 'pro' 
        ? (subscriptionType === 'yearly' ? 1200 : 100) 
        : 3,
      scriptsLimit: plan === 'pro'
        ? (subscriptionType === 'yearly' ? 1200 : 100)
        : 3,
      lastPaymentDate: new Date().toISOString()
    });
    return true;
  } catch (error) {
    console.error('Error updating subscription:', error);
    return false;
  }
};

export const getUserData = async (userId) => {
  try {
    const userRef = adminDb.collection('users').doc(userId);
    const userDoc = await userRef.get();
    return userDoc.exists ? userDoc.data() : null;
  } catch (error) {
    console.error('Error getting user data:', error);
    return null;
  }
};

export const getAllUsers = async () => {
  try {
    const snapshot = await adminDb.collection('users').get();
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error getting users:', error);
    return [];
  }
};

export const deleteUser = async (userId) => {
  try {
    await adminDb.collection('users').doc(userId).delete();
    return true;
  } catch (error) {
    console.error('Error deleting user:', error);
    return false;
  }
};

export const getUsersByIP = async (ipAddress) => {
  try {
    const snapshot = await adminDb.collection('users')
      .where('ipAddress', '==', ipAddress)
      .get();
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error getting users by IP:', error);
    return [];
  }
};

export const updateUserScriptCount = async (userId, count) => {
  try {
    const userRef = adminDb.collection('users').doc(userId);
    await userRef.update({
      scriptsRemaining: count
    });
    return true;
  } catch (error) {
    console.error('Error updating script count:', error);
    return false;
  }
};

export const deleteUserCompletely = async (userId) => {
    try {
        const batch = adminDb.batch();

        // Delete user document from Firestore
        const userRef = adminDb.collection('users').doc(userId);
        batch.delete(userRef);

        // Delete user's payments
        const paymentsSnapshot = await adminDb.collection('payments')
            .where('userId', '==', userId)
            .get();
        paymentsSnapshot.docs.forEach(doc => {
            batch.delete(doc.ref);
        });

        // Execute all Firestore deletions
        await batch.commit();

        // Delete the user's Firebase Authentication account
        await getAuth().deleteUser(userId);

        return true;
    } catch (error) {
        console.error('Error deleting user completely:', error);
        throw error;
    }
};