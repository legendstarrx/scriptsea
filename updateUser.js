import { db } from './lib/firebase.js';
import { doc, setDoc } from 'firebase/firestore';

// Replace this with your user's UID
const userId = 'YOUR_USER_ID';

async function updateUserDocument() {
  try {
    const userRef = doc(db, 'users', userId);
    
    await setDoc(userRef, {
      subscription: 'free',
      scriptsRemaining: 3,
      scriptsGenerated: 0,
      createdAt: new Date().toISOString()
    }, { merge: true });

    console.log('User document updated successfully!');
  } catch (error) {
    console.error('Error updating user document:', error);
  }
}

updateUserDocument(); 