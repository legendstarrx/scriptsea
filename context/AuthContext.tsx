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
  const [isOnline, setIsOnline] = useState(true);

  // Monitor online/offline status
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    setIsOnline(navigator.onLine);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  useEffect(() => {
    let unsubscribe: () => void;
    let profileUnsubscribe: () => void;

    const initAuth = async () => {
      try {
        unsubscribe = onAuthStateChanged(auth, async (user) => {
          setUser(user);
          
          if (user) {
            // Get user profile with offline support
            const userRef = doc(db, 'users', user.uid);
            profileUnsubscribe = onSnapshot(userRef, 
              {
                // Include metadata changes to detect online/offline
                includeMetadataChanges: true
              },
              (doc) => {
                if (doc.exists()) {
                  const data = doc.data();
                  setUserProfile(data);
                  // Cache the profile for offline use
                  localStorage.setItem(`userProfile_${user.uid}`, JSON.stringify(data));
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
                  setDoc(userRef, defaultProfile)
                    .then(() => {
                      setUserProfile(defaultProfile);
                      localStorage.setItem(`userProfile_${user.uid}`, JSON.stringify(defaultProfile));
                    })
                    .catch(console.error);
                }
                setLoading(false);
              },
              (error) => {
                console.error('Profile fetch error:', error);
                // Try to use cached profile on error
                const cachedProfile = localStorage.getItem(`userProfile_${user.uid}`);
                if (cachedProfile) {
                  setUserProfile(JSON.parse(cachedProfile));
                }
                setLoading(false);
              }
            );
          } else {
            setUserProfile(null);
            setLoading(false);
          }
        });
      } catch (error) {
        console.error('Auth initialization error:', error);
        setLoading(false);
      }
    };

    initAuth();

    return () => {
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