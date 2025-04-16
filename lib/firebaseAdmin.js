import * as admin from 'firebase-admin';

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
    }),
  });
}

export const adminDb = admin.firestore();
export const adminAuth = admin.auth();

// Helper function to check if user is admin
export const isAdmin = async (email) => {
  return email === process.env.NEXT_PUBLIC_ADMIN_EMAIL;
};

// Helper function to verify admin session
export const verifyAdmin = async (req) => {
  const adminKey = req.headers.authorization?.split('Bearer ')[1];
  if (adminKey !== process.env.ADMIN_SECRET_KEY) {
    throw new Error('Unauthorized');
  }
};

export const updateUserSubscription = async (userId, plan) => {
  try {
    const userRef = adminDb.collection('users').doc(userId);
    await userRef.update({
      subscription: plan,
      scriptsRemaining: plan === 'pro' ? 100 : 3,
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