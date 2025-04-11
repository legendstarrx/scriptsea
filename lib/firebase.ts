import { initializeApp, getApps } from 'firebase/app';
import { 
  initializeFirestore, 
  getFirestore,
  persistentLocalCache,
  persistentMultipleTabManager
} from 'firebase/firestore';
const db = initializeFirestore(app, {
  // Use modern cache configuration
  localCache: persistentLocalCache({
    // Enable synchronization between tabs
    tabManager: persistentMultipleTabManager()
  })
});

export { app, auth, db, googleProvider }; 

export { app, auth, db, googleProvider }; 