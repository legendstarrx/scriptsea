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
import { setCookie, getCookie } from '../utils/cookies';

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
    let mounted = true;

    const initAuth = async () => {
      try {
        // Check for existing session
        const sessionCookie = getCookie('auth_session');
        
        unsubscribe = onAuthStateChanged(auth, async (user) => {
          if (!mounted) return;

          if (user) {
            // Set session cookie
            setCookie('auth_session', 'true');
            setUser(user);

            try {
              const userRef = doc(db, 'users', user.uid);
              const docSnap = await getDoc(userRef);

              if (docSnap.exists()) {
                setUserProfile(docSnap.data());
              } else {
                // Create default profile
                const defaultProfile = {
                  email: user.email,
                  displayName: user.displayName,
                  photoURL: user.photoURL,
                  subscription: 'free',
                  scriptsRemaining: 3,
                  lastLogin: new Date().toISOString()
                };
                await setDoc(userRef, defaultProfile);
                setUserProfile(defaultProfile);
              }
            } catch (error) {
              console.error('Profile fetch error:', error);
              // Use cached profile if available
              const cachedProfile = localStorage.getItem(`profile_${user.uid}`);
              if (cachedProfile) {
                setUserProfile(JSON.parse(cachedProfile));
              }
            }
          } else {
            setCookie('auth_session', '', 0); // Clear cookie
            setUser(null);
            setUserProfile(null);
          }
          setLoading(false);
        });
      } catch (error) {
        console.error('Auth initialization error:', error);
        setLoading(false);
      }
    };

    initAuth();

    return () => {
      mounted = false;
      if (unsubscribe) unsubscribe();
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