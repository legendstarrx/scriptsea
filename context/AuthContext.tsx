import { createContext, useContext, useState, useEffect } from 'react';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
  User as FirebaseUser
} from 'firebase/auth';
import {
  doc,
  setDoc,
  getDoc,
  updateDoc,
  collection,
  query,
  where,
  getDocs
} from 'firebase/firestore';
import { auth, db } from '../lib/firebase';

// Define interface for the context value
interface AuthContextType {
  user: FirebaseUser | null;
  loading: boolean;
  // Add other properties your context needs
}

// Create the context with a default value
const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Monitor auth state changes with timestamps
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      console.log('Auth state changed:', {
        timestamp: new Date().toISOString(),
        userId: user?.uid,
        isAuthenticated: !!user
      });
      setUser(user);
      setLoading(false);
    }, (error) => {
      console.error('Auth state change error:', {
        timestamp: new Date().toISOString(),
        error
      });
    });

    return () => unsubscribe();
  }, []);

  // Add Firestore connection monitoring
  useEffect(() => {
    if (!user) return;

    const userRef = doc(db, 'users', user.uid);

    // Test Firestore connection
    const testConnection = async () => {
      try {
        await getDoc(userRef);
        console.log('Firestore connection successful');
      } catch (error) {
        console.error('Firestore connection error:', {
          timestamp: new Date().toISOString(),
          error,
          userId: user.uid
        });
      }
    };

    testConnection();
  }, [user]);

  const value = {
    user,
    loading,
    // Add other values you want to expose
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

// Custom hook to use the auth context
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
} 