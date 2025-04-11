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
  getDocs,
  onSnapshot
} from 'firebase/firestore';
import { auth, db } from '../lib/firebase';

// Define interface for the context value
interface AuthContextType {
  user: FirebaseUser | null;
  loading: boolean;
  error: Error | null;
  // Add other properties your context needs
}

// Create the context with a default value
const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let unsubscribe: () => void;
    let profileUnsubscribe: () => void;
    let mounted = true;

    const initAuth = async () => {
      try {
        // Set up auth state listener with timeout
        const authPromise = new Promise((resolve) => {
          unsubscribe = onAuthStateChanged(auth, (user) => {
            if (mounted) {
              setUser(user);
              resolve(user);
            }
          });
        });

        // Wait for auth with timeout
        const timeoutPromise = new Promise((_, reject) => {
          setTimeout(() => reject(new Error('Auth timeout')), 5000);
        });

        const user = await Promise.race([authPromise, timeoutPromise]);

        if (user) {
          // Get user profile only if authenticated
          const userRef = doc(db, 'users', user.uid);
          profileUnsubscribe = onSnapshot(userRef, 
            (doc) => {
              if (mounted) {
                setUserProfile(doc.exists() ? doc.data() : null);
                setLoading(false);
              }
            },
            (error) => {
              console.error('Profile fetch error:', error);
              if (mounted) {
                setError(error);
                setLoading(false);
              }
            }
          );
        } else {
          // No user, stop loading
          if (mounted) {
            setLoading(false);
          }
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        if (mounted) {
          setError(error as Error);
          setLoading(false);
        }
      }
    };

    initAuth();

    return () => {
      mounted = false;
      if (unsubscribe) unsubscribe();
      if (profileUnsubscribe) profileUnsubscribe();
    };
  }, []);

  // Show loading screen until everything is ready
  if (!loading) {
    return (
      <AuthContext.Provider value={{ user, loading, error }}>
        {children}
      </AuthContext.Provider>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md text-center">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">Authenticating...</h1>
        <p className="text-gray-600">Please wait while we verify your session.</p>
      </div>
    </div>
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