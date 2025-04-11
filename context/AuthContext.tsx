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
  error: Error | null;
  // Add other properties your context needs
}

// Create the context with a default value
const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    let unsubscribe: () => void;
    let mounted = true;

    const initAuth = async () => {
      try {
        unsubscribe = onAuthStateChanged(
          auth,
          (user) => {
            if (mounted) {
              console.log('Auth state changed:', {
                userId: user?.uid,
                isAuthenticated: !!user,
                timestamp: new Date().toISOString()
              });
              setUser(user);
              setLoading(false);
              setIsReady(true);
            }
          },
          (error) => {
            console.error('Auth state change error:', error);
            if (mounted) {
              setError(error);
              setLoading(false);
              setIsReady(true);
            }
          }
        );
      } catch (error) {
        console.error('Auth initialization error:', error);
        if (mounted) {
          setError(error as Error);
          setLoading(false);
          setIsReady(true);
        }
      }
    };

    // Initialize auth
    initAuth();

    // Cleanup function
    return () => {
      mounted = false;
      if (unsubscribe) unsubscribe();
    };
  }, []);

  // Show loading screen until everything is ready
  if (!isReady || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="bg-white p-8 rounded-lg shadow-md text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Authenticating...</h1>
          <p className="text-gray-600">Please wait while we verify your session.</p>
        </div>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ user, loading, error }}>
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