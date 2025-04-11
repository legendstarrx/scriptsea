import { createContext, useContext, useState, useEffect } from 'react';
import { auth, db } from '../lib/firebase';
import { doc, getDoc, setDoc, collection, query, where, getDocs, updateDoc, deleteDoc, onSnapshot } from 'firebase/firestore';
import { 
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  updatePassword,
  reauthenticateWithCredential,
  EmailAuthProvider,
  signInWithPopup,
  GoogleAuthProvider,
  updateProfile,
  onAuthStateChanged,
  deleteUser,
  signInWithRedirect
} from 'firebase/auth';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isOnline, setIsOnline] = useState(true);

  // Check network status
  useEffect(() => {
    const checkNetworkStatus = () => {
      setIsOnline(navigator.onLine);
    };

    checkNetworkStatus();
    
    // Add event listeners for online/offline status
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);
      
      if (user) {
        try {
          // Always use UID for document ID
          const userRef = doc(db, 'users', user.uid);
          const unsubscribeDoc = onSnapshot(userRef, (doc) => {
            if (doc.exists()) {
              setUserProfile(doc.data());
            } else {
              // Create default profile if it doesn't exist
              const defaultProfile = {
                email: user.email, // Store email in the document
                displayName: user.displayName,
                photoURL: user.photoURL,
                subscription: 'free',
                scriptsRemaining: 3,
                scriptsGenerated: 0,
                isAdmin: user.email === process.env.NEXT_PUBLIC_ADMIN_EMAIL,
                createdAt: new Date().toISOString(),
                lastLogin: new Date().toISOString()
              };
              setDoc(userRef, defaultProfile)
                .then(() => setUserProfile(defaultProfile))
                .catch(console.error);
            }
          });

          return () => unsubscribeDoc();
        } catch (error) {
          console.error('Profile fetch error:', error);
          setUserProfile(null);
        }
      } else {
        setUserProfile(null);
      }
      
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signup = async (email, password, displayName) => {
    try {
      console.log('Starting signup process...');
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      console.log('User created in Firebase Auth:', user.uid);
      
      if (displayName) {
        await updateProfile(user, { displayName });
        console.log('Updated user profile with display name');
      }
      
      // Create user document in Firestore with correct initial values
      const userData = {
        email: user.email,
        displayName: displayName || user.displayName,
        photoURL: user.photoURL,
        subscription: 'free',
        scriptsRemaining: 3,
        scriptsGenerated: 0,
        isAdmin: user.email === process.env.NEXT_PUBLIC_ADMIN_EMAIL,
        createdAt: new Date().toISOString(),
        lastLogin: new Date().toISOString(),
        ipAddress: null, // Will be updated by the API call
        isBanned: false,
        subscriptionStatus: 'free',
        lastPaymentDate: new Date().toISOString()
      };
      
      console.log('Creating user document in Firestore...');
      await setDoc(doc(db, 'users', user.uid), userData);
      console.log('User document created in Firestore');
      setUserProfile(userData);

      try {
        console.log('Updating IP address...');
        // Update IP address after successful signup
        const ipResponse = await fetch('/api/user/ip', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ userId: user.uid }),
        });
        
        if (!ipResponse.ok) {
          console.warn('Failed to update IP address, but user was created:', await ipResponse.text());
        } else {
          console.log('IP address updated successfully');
        }
      } catch (ipError) {
        console.warn('Error updating IP address, but user was created:', ipError);
      }
      
      return user;
    } catch (error) {
      console.error('Signup error:', error);
      // Add more specific error handling
      if (error.code === 'auth/email-already-in-use') {
        throw new Error('This email is already registered. Please try logging in instead.');
      } else if (error.code === 'auth/invalid-email') {
        throw new Error('Invalid email address. Please check and try again.');
      } else if (error.code === 'auth/operation-not-allowed') {
        throw new Error('Email/password accounts are not enabled. Please contact support.');
      } else if (error.code === 'auth/weak-password') {
        throw new Error('Password is too weak. Please choose a stronger password.');
      }
      throw error;
    }
  };

  const login = async (email, password) => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      // Update IP address after successful login
      await fetch('/api/user/ip', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId: userCredential.user.uid }),
      });
      return userCredential.user;
    } catch (error) {
      throw error;
    }
  };

  const signInWithGoogle = async () => {
    try {
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({
        prompt: 'select_account',
        scope: 'profile email',
        auth_type: 'popup',
        nonce: Math.random().toString(36).substring(2)
      });

      if (typeof window !== 'undefined' && window.matchMedia('(display-mode: standalone)').matches) {
        await signInWithRedirect(auth, provider);
      } else {
        try {
          const result = await signInWithPopup(auth, provider);
          await handleSignInResult(result);
        } catch (error) {
          if (error.code === 'auth/popup-blocked' || error.code === 'auth/popup-closed-by-user') {
            await signInWithRedirect(auth, provider);
          } else {
            throw error;
          }
        }
      }
    } catch (error) {
      console.error('Google sign-in error:', error);
      throw error;
    }
  };

  const handleSignInResult = async (result) => {
    if (!result?.user) return;
    
    try {
      const userDoc = await getDoc(doc(db, 'users', result.user.uid));
      if (!userDoc.exists()) {
        const userData = {
          email: result.user.email,
          displayName: result.user.displayName,
          photoURL: result.user.photoURL,
          subscription: 'free',
          scriptsRemaining: 3,
          scriptsGenerated: 0,
          isAdmin: result.user.email === process.env.NEXT_PUBLIC_ADMIN_EMAIL,
          createdAt: new Date().toISOString(),
          lastLogin: new Date().toISOString()
        };
        await setDoc(doc(db, 'users', result.user.uid), userData);
        setUserProfile(userData);
      }

      await fetch('/api/user/ip', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: result.user.uid }),
      });
    } catch (error) {
      console.error('Error handling sign-in result:', error);
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      throw error;
    }
  };

  const resetPassword = async (email) => {
    try {
      await sendPasswordResetEmail(auth, email);
    } catch (error) {
      throw error;
    }
  };

  const updateUserPassword = async (currentPassword, newPassword) => {
    try {
      const credential = EmailAuthProvider.credential(user.email, currentPassword);
      await reauthenticateWithCredential(user, credential);
      await updatePassword(user, newPassword);
    } catch (error) {
      throw error;
    }
  };

  const updateUserProfile = async (data) => {
    try {
      await updateProfile(auth.currentUser, data);
      if (userProfile) {
        setUserProfile({ ...userProfile, ...data });
      }
    } catch (error) {
      throw error;
    }
  };

  const updateSubscription = async (userId, plan) => {
    try {
      const userRef = doc(db, 'users', userId);
      const scriptsRemaining = plan === 'pro' ? 100 : 3;
      await updateDoc(userRef, {
        subscription: plan,
        scriptsRemaining: scriptsRemaining
      });
      
      // Update local state if it's the current user
      if (user && user.uid === userId) {
        setUserProfile(prev => ({
          ...prev,
          subscription: plan,
          scriptsRemaining: scriptsRemaining
        }));
      }
    } catch (error) {
      console.error('Error updating subscription:', error);
      throw error;
    }
  };

  const deleteUserAccount = async (userId) => {
    try {
      // Delete user document from Firestore
      await deleteDoc(doc(db, 'users', userId));
      
      // Delete user from Firebase Auth if it's not the current user
      if (user && user.uid !== userId) {
        const userToDelete = await auth.getUser(userId);
        await deleteUser(userToDelete);
      }
    } catch (error) {
      console.error('Error deleting user:', error);
      throw error;
    }
  };

  const getUsersByIP = async (ipAddress) => {
    try {
      const usersRef = collection(db, 'users');
      const q = query(usersRef, where('ipAddress', '==', ipAddress));
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Error getting users by IP:', error);
      throw error;
    }
  };

  const getAllUsers = async () => {
    try {
      const usersRef = collection(db, 'users');
      const querySnapshot = await getDocs(usersRef);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Error getting all users:', error);
      throw error;
    }
  };

  const value = {
    user,
    userProfile,
    loading,
    isOnline,
    signup,
    login,
    signInWithGoogle,
    logout,
    resetPassword,
    updateUserPassword,
    updateUserProfile,
    updateSubscription,
    deleteUserAccount,
    getUsersByIP,
    getAllUsers
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
} 