import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  limit, 
  serverTimestamp,
  addDoc,
  enableNetwork,
  disableNetwork
} from 'firebase/firestore';
import { db } from './firebase';

// Network status management
export const checkConnection = async () => {
  try {
    await enableNetwork(db);
    return true;
  } catch (error) {
    console.error('Network check error:', error);
    return false;
  }
};

// User operations
export const createUserProfile = async (userId, userData) => {
  try {
    await setDoc(doc(db, 'users', userId), {
      ...userData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      subscriptionStatus: 'free',
      scriptsGenerated: 0,
      scriptsLimit: 5
    });
    return { success: true };
  } catch (error) {
    console.error('Error creating user profile:', error);
    return { 
      success: false, 
      error: error.message || 'Failed to create user profile',
      isOffline: error.code === 'failed-precondition' || error.code === 'unavailable'
    };
  }
};

export const getUserProfile = async (userId) => {
  try {
    const userDoc = await getDoc(doc(db, 'users', userId));
    if (userDoc.exists()) {
      return { success: true, data: userDoc.data() };
    } else {
      return { success: false, error: 'User not found' };
    }
  } catch (error) {
    console.error('Error getting user profile:', error);
    return { 
      success: false, 
      error: error.message || 'Failed to get user profile',
      isOffline: error.code === 'failed-precondition' || error.code === 'unavailable'
    };
  }
};

export const updateUserProfile = async (userId, userData) => {
  try {
    await updateDoc(doc(db, 'users', userId), {
      ...userData,
      updatedAt: serverTimestamp()
    });
    return { success: true };
  } catch (error) {
    console.error('Error updating user profile:', error);
    return { 
      success: false, 
      error: error.message || 'Failed to update user profile',
      isOffline: error.code === 'failed-precondition' || error.code === 'unavailable'
    };
  }
};

// Script operations
export const saveScript = async (userId, scriptData) => {
  try {
    const scriptRef = await addDoc(collection(db, 'scripts'), {
      ...scriptData,
      userId,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    
    // Update user's script count
    const userRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userRef);
    
    if (userDoc.exists()) {
      const userData = userDoc.data();
      await updateDoc(userRef, {
        scriptsGenerated: (userData.scriptsGenerated || 0) + 1,
        updatedAt: serverTimestamp()
      });
    }
    
    return { success: true, scriptId: scriptRef.id };
  } catch (error) {
    console.error('Error saving script:', error);
    return { 
      success: false, 
      error: error.message || 'Failed to save script',
      isOffline: error.code === 'failed-precondition' || error.code === 'unavailable'
    };
  }
};

export const getUserScripts = async (userId) => {
  try {
    const scriptsQuery = query(
      collection(db, 'scripts'),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    );
    
    const querySnapshot = await getDocs(scriptsQuery);
    const scripts = [];
    
    querySnapshot.forEach((doc) => {
      scripts.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    return { success: true, data: scripts };
  } catch (error) {
    console.error('Error getting user scripts:', error);
    return { 
      success: false, 
      error: error.message || 'Failed to get user scripts',
      isOffline: error.code === 'failed-precondition' || error.code === 'unavailable'
    };
  }
};

export const getScriptById = async (scriptId) => {
  try {
    const scriptDoc = await getDoc(doc(db, 'scripts', scriptId));
    if (scriptDoc.exists()) {
      return { success: true, data: { id: scriptDoc.id, ...scriptDoc.data() } };
    } else {
      return { success: false, error: 'Script not found' };
    }
  } catch (error) {
    console.error('Error getting script:', error);
    return { 
      success: false, 
      error: error.message || 'Failed to get script',
      isOffline: error.code === 'failed-precondition' || error.code === 'unavailable'
    };
  }
};

export const updateScript = async (scriptId, scriptData) => {
  try {
    await updateDoc(doc(db, 'scripts', scriptId), {
      ...scriptData,
      updatedAt: serverTimestamp()
    });
    return { success: true };
  } catch (error) {
    console.error('Error updating script:', error);
    return { 
      success: false, 
      error: error.message || 'Failed to update script',
      isOffline: error.code === 'failed-precondition' || error.code === 'unavailable'
    };
  }
};

export const deleteScript = async (scriptId) => {
  try {
    await deleteDoc(doc(db, 'scripts', scriptId));
    return { success: true };
  } catch (error) {
    console.error('Error deleting script:', error);
    return { 
      success: false, 
      error: error.message || 'Failed to delete script',
      isOffline: error.code === 'failed-precondition' || error.code === 'unavailable'
    };
  }
};

// Subscription operations
export const updateSubscriptionStatus = async (userId, subscriptionData) => {
  try {
    await updateDoc(doc(db, 'users', userId), {
      subscriptionStatus: subscriptionData.status,
      subscriptionPlan: subscriptionData.plan,
      subscriptionExpiry: subscriptionData.expiryDate,
      scriptsLimit: subscriptionData.scriptsLimit,
      updatedAt: serverTimestamp()
    });
    return { success: true };
  } catch (error) {
    console.error('Error updating subscription:', error);
    return { 
      success: false, 
      error: error.message || 'Failed to update subscription',
      isOffline: error.code === 'failed-precondition' || error.code === 'unavailable'
    };
  }
};

export const checkScriptLimit = async (userId) => {
  try {
    const userDoc = await getDoc(doc(db, 'users', userId));
    if (userDoc.exists()) {
      const userData = userDoc.data();
      const canGenerate = userData.scriptsGenerated < userData.scriptsLimit;
      return { 
        success: true, 
        canGenerate,
        scriptsGenerated: userData.scriptsGenerated,
        scriptsLimit: userData.scriptsLimit
      };
    } else {
      return { success: false, error: 'User not found' };
    }
  } catch (error) {
    console.error('Error checking script limit:', error);
    return { 
      success: false, 
      error: error.message || 'Failed to check script limit',
      isOffline: error.code === 'failed-precondition' || error.code === 'unavailable'
    };
  }
}; 