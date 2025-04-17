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
  getRedirectResult
} from 'firebase/auth';
import { useRouter } from 'next/router';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        // Check if user is banned
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        const userData = userDoc.data();
        
        if (userData?.isBanned) {
          // If user is banned, sign them out
          await auth.signOut();
          router.push('/login?error=banned');
          return;
        }

        // Set up real-time listener for ban status
        const unsubscribeBan = onSnapshot(doc(db, 'users', user.uid), (doc) => {
          const userData = doc.data();
          if (userData?.isBanned) {
            auth.signOut();
            router.push('/login?error=banned');
          }
        });

        setUser(user);
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  const signup = async (email, password, displayName) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      if (displayName) {
        await updateProfile(user, { displayName });
      }
      
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
        lastPaymentDate: new Date().toISOString()
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
      
      // Check if IP is banned
      const ipResponse = await fetch('https://api.ipify.org?format=json');
      const { ip } = await ipResponse.json();
      
      // Check banned_ips collection
      const bannedIpRef = doc(db, 'banned_ips', ip);
      const bannedIpDoc = await getDoc(bannedIpRef);
      
      if (bannedIpDoc.exists()) {
        // If IP is banned, sign out and throw error
        await auth.signOut();
        throw new Error('This IP address has been banned. Please contact support.');
      }

      // Continue with normal sign in process if IP is not banned
      const userDoc = await getDoc(doc(db, 'users', result.user.uid));
      if (!userDoc.exists()) {
        await setDoc(doc(db, 'users', result.user.uid), {
          email: result.user.email,
          displayName: result.user.displayName,
          photoURL: result.user.photoURL,
          ipAddress: ip,
          createdAt: new Date().toISOString(),
          lastLogin: new Date().toISOString(),
          subscription: 'free',
          scriptsRemaining: 3,
          scriptsLimit: 3
        });
      }
      return result.user;
    } catch (error) {
      console.error('Google sign-in error:', error);
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
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
} 