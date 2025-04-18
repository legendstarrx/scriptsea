import { adminDb, verifyAdmin, deleteUserCompletely } from '../../../lib/firebaseAdmin';

const VALID_ACTIONS = ['updateSubscription', 'deleteUser', 'banByIP', 'unbanByIP'];

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    await verifyAdmin(req);
    const { userId, action, data } = req.body;

    if (!VALID_ACTIONS.includes(action)) {
      return res.status(400).json({ 
        error: 'Invalid action',
        message: `Action must be one of: ${VALID_ACTIONS.join(', ')}`,
        receivedAction: action 
      });
    }

    switch (action) {
      case 'updateSubscription':
        if (!userId || !data?.plan) {
          return res.status(400).json({ error: 'Missing required fields' });
        }
        
        const subscriptionEnd = new Date();
        let subscriptionType, subscription;
        
        // Standardize subscription naming
        switch (data.plan) {
          case 'pro_monthly':
            subscriptionType = 'monthly';
            subscription = 'pro';
            subscriptionEnd.setMonth(subscriptionEnd.getMonth() + 1);
            break;
          case 'pro_yearly':
            subscriptionType = 'yearly';
            subscription = 'pro';
            subscriptionEnd.setFullYear(subscriptionEnd.getFullYear() + 1);
            break;
          case 'free':
            subscriptionType = null;
            subscription = 'free';
            break;
          default:
            return res.status(400).json({ error: 'Invalid plan type' });
        }
        
        // Update user document
        await adminDb.collection('users').doc(userId).update({
          subscription: subscription, // 'pro' or 'free'
          scriptsRemaining: subscription === 'pro' 
            ? (subscriptionType === 'yearly' ? 1200 : 100) 
            : 3,
          scriptsLimit: subscription === 'pro' 
            ? (subscriptionType === 'yearly' ? 1200 : 100) 
            : 3,
          lastUpdated: new Date().toISOString(),
          subscriptionEnd: subscription === 'free' ? null : subscriptionEnd.toISOString(),
          subscriptionType: subscriptionType // 'monthly', 'yearly', or null
        });
        break;

      case 'deleteUser':
        if (!userId) {
          return res.status(400).json({ error: 'User ID is required' });
        }
        try {
          await deleteUserCompletely(userId);
          return res.status(200).json({ success: true });
        } catch (error) {
          console.error('Error deleting user:', error);
          return res.status(500).json({ error: 'Failed to delete user' });
        }
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

      case 'unbanIP':
        if (!data?.ipAddress) {
          return res.status(400).json({ error: 'IP address is required' });
        }
        
        try {
          // Remove IP from banned_ips collection
          await adminDb.collection('banned_ips').doc(data.ipAddress).delete();

          // Update all users with this IP
          const usersSnapshot = await adminDb.collection('users')
            .where('ipAddress', '==', data.ipAddress)
            .get();

          const batch = adminDb.batch();
          usersSnapshot.docs.forEach(doc => {
            batch.update(doc.ref, { isBanned: false });
          });
          await batch.commit();

          return res.status(200).json({ success: true });
        } catch (error) {
          console.error('Error unbanning IP:', error);
          return res.status(500).json({ error: 'Failed to unban IP' });
        }
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