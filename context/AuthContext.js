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
  signInWithRedirect,
  getRedirectResult,
  sendEmailVerification
} from 'firebase/auth';
import { useRouter } from 'next/router';

const AuthContext = createContext();
const ADMIN_EMAIL = process.env.NEXT_PUBLIC_ADMIN_EMAIL;

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          // Set the user state immediately
          setUser(user);
          
          const userRef = doc(db, 'users', user.uid);
          const docSnap = await getDoc(userRef);
          
          // Check if user is banned
          if (docSnap.exists() && docSnap.data().isBanned) {
            await signOut(auth);
            setUser(null);
            setUserProfile(null);
            return;
          }
          
          const isAdminUser = user.email === ADMIN_EMAIL;
          
          if (docSnap.exists()) {
            const userData = docSnap.data();
            userData.isAdmin = isAdminUser;
            setUserProfile({
              ...userData,
              isAdmin: isAdminUser,
              email: user.email // Ensure email is always current
            });
          } else {
            const defaultProfile = {
              email: user.email,
              displayName: user.displayName,
              photoURL: user.photoURL,
              subscription: 'free',
              scriptsRemaining: 3,
              scriptsGenerated: 0,
              isAdmin: isAdminUser,
              createdAt: new Date().toISOString(),
              lastLogin: new Date().toISOString()
            };
            await setDoc(userRef, defaultProfile);
            setUserProfile(defaultProfile);
          }
        } catch (error) {
          console.error('Profile fetch error:', error);
          setError(error);
        }
      } else {
        setUser(null);
        setUserProfile(null);
      }
      
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signup = async (email, password, displayName) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      if (displayName) {
        await updateProfile(user, { displayName });
      }
      
      // Send verification email
      await sendEmailVerification(user);
      
      // Create user document in Firestore
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
        ipAddress: null,
        isBanned: false,
        subscriptionStatus: 'free',
        lastPaymentDate: new Date().toISOString(),
        emailVerified: false
      };
      
      await setDoc(doc(db, 'users', user.uid), userData);
      
      // Update IP address
      await fetch('/api/user/ip', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId: user.uid })
      });
      
      setUserProfile(userData);
      return user;
    } catch (error) {
      console.error('Signup error:', error);
      throw error;
    }
  };

  const login = async (email, password) => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      // Set the user state immediately
      setUser(user);
      
      // Update IP address after successful login
      await fetch('/api/user/ip', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId: user.uid })
      });
      
      // Get user profile
      const userRef = doc(db, 'users', user.uid);
      const docSnap = await getDoc(userRef);
      
      if (docSnap.exists()) {
        const userData = docSnap.data();
        userData.isAdmin = user.email === ADMIN_EMAIL;
        setUserProfile({
          ...userData,
          email: user.email // Ensure email is always current
        });
      }
      
      return user;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const signInWithGoogle = async () => {
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      
      // Set the user state immediately
      setUser(result.user);
      
      // Check if user is banned BEFORE creating/updating profile
      const userDoc = await getDoc(doc(db, 'users', result.user.uid));
      if (userDoc.exists() && userDoc.data().isBanned) {
        await signOut(auth);
        setUser(null);
        setUserProfile(null);
        throw new Error('Your account has been banned. Please contact support.');
      }

      // Only proceed if not banned
      let userData;
      
      if (userDoc.exists()) {
        // If user exists, keep their existing data but update login time
        userData = {
          ...userDoc.data(),
          lastLogin: new Date().toISOString(),
          email: result.user.email,
          displayName: result.user.displayName,
          photoURL: result.user.photoURL,
          isAdmin: result.user.email === ADMIN_EMAIL
        };
      } else {
        // If new user, create default profile
        userData = {
          email: result.user.email,
          displayName: result.user.displayName,
          photoURL: result.user.photoURL,
          subscription: 'free',
          scriptsRemaining: 3,
          scriptsGenerated: 0,
          isAdmin: result.user.email === ADMIN_EMAIL,
          createdAt: new Date().toISOString(),
          lastLogin: new Date().toISOString(),
          isBanned: false
        };
      }

      await setDoc(doc(db, 'users', result.user.uid), userData, { merge: true });
      
      // Update IP address after successful sign-in
      await fetch('/api/user/ip', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId: result.user.uid })
      });
      
      setUserProfile(userData);
      return result;
    } catch (error) {
      console.error('Google Sign-in error:', error);
      await signOut(auth);
      setUser(null);
      setUserProfile(null);
      throw error;
    }
  };

  useEffect(() => {
    const handleRedirectResult = async () => {
      try {
        const result = await getRedirectResult(auth);
        if (result?.user) {
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
        }
      } catch (error) {
        console.error('Redirect result error:', error);
      }
    };

    handleRedirectResult();
  }, []);

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
      if (!user || user.email !== 'legendstarr2024@gmail.com') {
        throw new Error('Unauthorized');
      }
      const usersRef = collection(db, 'users');
      const querySnapshot = await getDocs(usersRef);
      const users = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      console.log('Fetched users:', users);
      return users;
    } catch (error) {
      console.error('Error getting all users:', error);
      throw error;
    }
  };

  const checkEmailVerification = async () => {
    if (!user) return false;
    
    try {
      // Reload the user to get the latest email verification status
      await user.reload();
      
      // Check if email is verified
      const isVerified = user.emailVerified;
      
      // If verified, update the user profile in Firestore
      if (isVerified) {
        const userRef = doc(db, 'users', user.uid);
        await updateDoc(userRef, {
          emailVerified: true,
          lastLogin: new Date().toISOString()
        });
        
        // Update local user profile state
        if (userProfile) {
          setUserProfile(prev => ({
            ...prev,
            emailVerified: true
          }));
        }
      }
      
      return isVerified;
    } catch (error) {
      console.error('Error checking email verification:', error);
      return false;
    }
  };

  const resendVerificationEmail = async () => {
    try {
      if (!auth.currentUser) {
        throw new Error('No user logged in');
      }
      await sendEmailVerification(auth.currentUser);
      return true;
    } catch (error) {
      console.error('Resend verification email error:', error);
      throw error;
    }
  };

  const value = {
    user,
    userProfile,
    loading,
    error,
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
    getAllUsers,
    checkEmailVerification,
    resendVerificationEmail
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
} 