import React, { useEffect, useState } from 'react';
import { auth, getFirestore, doc, getDoc } from '../lib/firebase';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<firebase.User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Monitor auth state changes with timestamps
    const unsubscribe = auth.onAuthStateChanged((user) => {
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

    const db = getFirestore();
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

  return (
    <div>
      {/* Render your component content here */}
    </div>
  );
} 