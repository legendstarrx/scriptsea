import { adminDb, verifyAdmin } from '../../../lib/firebaseAdmin';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    await verifyAdmin(req);
    const { userId, action, data } = req.body;

    switch (action) {
      case 'updateSubscription':
        if (!userId || !data?.plan) {
          return res.status(400).json({ error: 'Missing required fields' });
        }
        
        const subscriptionEnd = new Date();
        if (data.plan === 'pro_yearly') {
          subscriptionEnd.setFullYear(subscriptionEnd.getFullYear() + 1);
        } else if (data.plan === 'pro_monthly') {
          subscriptionEnd.setMonth(subscriptionEnd.getMonth() + 1);
        }
        
        await adminDb.collection('users').doc(userId).update({
          subscription: data.plan,
          scriptsRemaining: data.plan.startsWith('pro') ? 100 : 3,
          scriptsLimit: data.plan.startsWith('pro') ? 100 : 3,
          lastUpdated: new Date().toISOString(),
          subscriptionEnd: data.plan === 'free' ? null : subscriptionEnd.toISOString(),
          subscriptionType: data.plan === 'free' ? null : data.plan.includes('yearly') ? 'yearly' : 'monthly'
        });
        break;

      case 'deleteUser':
        if (!userId) {
          return res.status(400).json({ error: 'User ID is required' });
        }
        await adminDb.collection('users').doc(userId).delete();
        break;

      case 'banByIP':
        if (!data?.ipAddress) {
          return res.status(400).json({ error: 'IP address is required' });
        }
        
        // Add IP to banned_ips collection
        await adminDb.collection('banned_ips').doc(data.ipAddress).set({
          bannedAt: new Date().toISOString(),
          bannedBy: data.adminEmail
        });

        // Update all users with this IP
        const usersSnapshot = await adminDb.collection('users')
          .where('ipAddress', '==', data.ipAddress)
          .get();

        const batch = adminDb.batch();
        usersSnapshot.docs.forEach(doc => {
          batch.update(doc.ref, { isBanned: true });
        });
        await batch.commit();
        break;

      case 'unbanByIP':
        if (!data?.ipAddress) {
          return res.status(400).json({ error: 'IP address is required' });
        }
        
        // Remove IP from banned_ips collection
        await adminDb.collection('banned_ips').doc(data.ipAddress).delete();

        // Update all users with this IP
        const bannedUsersSnapshot = await adminDb.collection('users')
          .where('ipAddress', '==', data.ipAddress)
          .get();

        const unbanBatch = adminDb.batch();
        bannedUsersSnapshot.docs.forEach(doc => {
          unbanBatch.update(doc.ref, { isBanned: false });
        });
        await unbanBatch.commit();
        break;

      default:
        return res.status(400).json({ error: 'Invalid action' });
    }

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('Admin action error:', error);
    return res.status(401).json({ error: 'Unauthorized' });
  }
} 