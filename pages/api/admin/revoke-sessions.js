import { getAuth } from 'firebase-admin/auth';
import { verifyAdmin } from '../../../lib/firebaseAdmin';

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        await verifyAdmin(req);
        const { userId } = req.body;

        if (!userId) {
            return res.status(400).json({ error: 'User ID is required' });
        }

        // Revoke all refresh tokens for the user
        await getAuth().revokeRefreshTokens(userId);

        return res.status(200).json({ success: true });
    } catch (error) {
        console.error('Error revoking sessions:', error);
        return res.status(500).json({ error: 'Failed to revoke sessions' });
    }
} 