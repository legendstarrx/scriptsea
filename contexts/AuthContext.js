import React, { createContext, useContext, useEffect, useState } from 'react';
import { auth } from '../lib/firebase';
import { 
  onAuthStateChanged, 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  updateProfile,
  updatePassword,
  signOut
} from 'firebase/auth';
import { createUserProfile, getUserProfile, checkConnection } from '../lib/db';

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isOnline, setIsOnline] = useState(true);

  // Check network status
  useEffect(() => {
    const checkNetworkStatus = async () => {
      const online = await checkConnection();
      setIsOnline(online);
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
    try {
      const unsubscribe = onAuthStateChanged(auth, async (user) => {
        setUser(user);
        
        if (user) {
          try {
            // Get user profile from Firestore
            const { success, data, isOffline } = await getUserProfile(user.uid);
            
            if (success) {
              setUserProfile(data);
            } else if (isOffline) {
              // If offline, use cached data if available
              const cachedProfile = localStorage.getItem(`userProfile_${user.uid}`);
              if (cachedProfile) {
                setUserProfile(JSON.parse(cachedProfile));
              } else {
                // Create default profile for offline use
                const defaultProfile = {
                  displayName: user.displayName,
                  email: user.email,
                  photoURL: user.photoURL,
                  subscriptionStatus: 'free',
                  scriptsGenerated: 0,
                  scriptsLimit: 5
                };
                setUserProfile(defaultProfile);
                localStorage.setItem(`userProfile_${user.uid}`, JSON.stringify(defaultProfile));
              }
            } else {
              // Create user profile if it doesn't exist
              await createUserProfile(user.uid, {
                displayName: user.displayName,
                email: user.email,
                photoURL: user.photoURL
              });
              setUserProfile({
                displayName: user.displayName,
                email: user.email,
                photoURL: user.photoURL,
                subscriptionStatus: 'free',
                scriptsGenerated: 0,
                scriptsLimit: 5
              });
            }
          } catch (error) {
            console.error('Error fetching user profile:', error);
            // Use cached data if available
            const cachedProfile = localStorage.getItem(`userProfile_${user.uid}`);
            if (cachedProfile) {
              setUserProfile(JSON.parse(cachedProfile));
            }
          }
        } else {
          setUserProfile(null);
        }
        
        setLoading(false);
      });

      return unsubscribe;
    } catch (error) {
      console.error('Auth state change error:', error);
      setLoading(false);
    }
  }, []);

  const signIn = async (email, password) => {
    try {
      return await signInWithEmailAndPassword(auth, email, password);
    } catch (error) {
      console.error('Sign in error:', error);
      throw error;
    }
  };

  const signUp = async (email, password, displayName) => {
    try {
      const result = await createUserWithEmailAndPassword(auth, email, password);
      if (displayName) {
        await updateProfile(result.user, { displayName });
      }
      
      // Create user profile in Firestore
      await createUserProfile(result.user.uid, {
        displayName: displayName || result.user.displayName,
        email: result.user.email,
        photoURL: result.user.photoURL
      });
      
      return result;
    } catch (error) {
      console.error('Sign up error:', error);
      throw error;
    }
  };

  const signInWithGoogle = async () => {
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      
      // Check if user profile exists, if not create it
      const { success } = await getUserProfile(result.user.uid);
      if (!success) {
        await createUserProfile(result.user.uid, {
          displayName: result.user.displayName,
          email: result.user.email,
          photoURL: result.user.photoURL
        });
      }
      
      return result;
    } catch (error) {
      console.error('Google sign in error:', error);
      throw error;
    }
  };

  const updateUserProfile = async (data) => {
    try {
      return await updateProfile(auth.currentUser, data);
    } catch (error) {
      console.error('Profile update error:', error);
      throw error;
    }
  };

  const updateUserPassword = async (newPassword) => {
    try {
      return await updatePassword(auth.currentUser, newPassword);
    } catch (error) {
      console.error('Password update error:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      return await signOut(auth);
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    }
  };

  const value = {
    user,
    userProfile,
    loading,
    isOnline,
    signIn,
    signUp,
    signInWithGoogle,
    updateUserProfile,
    updateUserPassword,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
} 