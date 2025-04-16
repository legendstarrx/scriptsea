import { adminDb } from '../lib/firebaseAdmin';

async function cleanupUsers() {
  const usersRef = adminDb.collection('users');
  const snapshot = await usersRef.get();

  snapshot.docs.forEach(async (doc) => {
    const data = doc.data();
    if (data.subscription === 'free') {
      await doc.ref.update({
        scriptsRemaining: Math.min(data.scriptsRemaining, 3),
        scriptsLimit: 3
      });
    } else if (data.subscription === 'pro') {
      await doc.ref.update({
        scriptsLimit: 100,
        scriptsRemaining: Math.min(data.scriptsRemaining, 100)
      });
    }
  });
}

cleanupUsers().then(() => console.log('Cleanup complete')); 