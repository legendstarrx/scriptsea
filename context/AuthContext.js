import { createContext, useContext, useState, useEffect } from 'react';
import { auth, db } from '../lib/firebase';
import { doc, getDoc, setDoc, collection, query, where, getDocs, updateDoc, deleteDoc, onSnapshot, Timestamp } from 'firebase/firestore';
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
  getRedirectResult
} from 'firebase/auth';
import { useRouter } from 'next/router';
import { sendVerificationEmail } from '../lib/brevo';
import crypto from 'crypto';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const router = useRouter();

  const generateVerificationToken = () => {
    return crypto.randomBytes(32).toString('hex');
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const userRef = doc(db, 'users', user.uid);
          const docSnap = await getDoc(userRef);
          
          // Check if user is banned
          if (docSnap.exists() && docSnap.data().isBanned) {
            await signOut(auth);
            setUser(null);
            setUserProfile(null);
            return;
          }
          
          if (docSnap.exists()) {
            const userData = docSnap.data();
            if (!userData.emailVerified) {
              // If email is not verified, sign out the user
              await signOut(auth);
              setError('Please verify your email before logging in.');
              return;
            }
            
            const isAdminUser = user.email === 'legendstarr2024@gmail.com';
            
            userData.isAdmin = isAdminUser;
            setUserProfile({
              ...userData,
              isAdmin: isAdminUser
            });
          } else {
            const defaultProfile = {
              email: user.email,
              displayName: user.displayName,
              photoURL: user.photoURL,
              subscription: 'free',
              scriptsRemaining: 3,
              scriptsGenerated: 0,
              isAdmin: user.email === 'legendstarr2024@gmail.com',
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
      
      const verificationToken = generateVerificationToken();
      const expirationTime = new Date();
      expirationTime.setHours(expirationTime.getHours() + 24);

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
        emailVerified: false,
        verificationToken,
        verificationTokenExpires: Timestamp.fromDate(expirationTime)
      };
      
      await setDoc(doc(db, 'users', user.uid), userData);
      await sendVerificationEmail(email, verificationToken);
      
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
      
      // Update IP address after successful login
      await fetch('/api/user/ip', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId: userCredential.user.uid })
      });
      
      return userCredential.user;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const signInWithGoogle = async () => {
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      
      // Check if user is banned BEFORE creating/updating profile
      const userDoc = await getDoc(doc(db, 'users', result.user.uid));
      if (userDoc.exists() && userDoc.data().isBanned) {
        await signOut(auth); // Sign out immediately if banned
        throw new Error('Your account has been banned. Please contact support.');
      }

      // Only proceed if not banned
      const userData = {
        email: result.user.email,
        displayName: result.user.displayName,
        photoURL: result.user.photoURL,
        subscription: 'free',
        scriptsRemaining: 3,
        scriptsGenerated: 0,
        isAdmin: result.user.email === process.env.NEXT_PUBLIC_ADMIN_EMAIL,
        createdAt: new Date().toISOString(),
        lastLogin: new Date().toISOString(),
        isBanned: false
      };

      await setDoc(doc(db, 'users', result.user.uid), userData, { merge: true });
      setUserProfile(userData);
      return result;
    } catch (error) {
      console.error('Google Sign-in error:', error);
      await signOut(auth);
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

  const isEmailVerified = async (userId) => {
    try {
      const userDoc = await getDoc(doc(db, 'users', userId));
      return userDoc.exists() && userDoc.data().emailVerified === true;
    } catch (error) {
      console.error('Error checking email verification:', error);
      return false;
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
    isEmailVerified
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