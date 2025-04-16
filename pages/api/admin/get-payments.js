import { adminDb } from '../../../lib/firebaseAdmin';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Verify admin
    if (req.headers.authorization !== process.env.NEXT_PUBLIC_ADMIN_API_KEY) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const paymentsSnapshot = await adminDb.collection('payments')
      .orderBy('date', 'desc')
      .get();

    const payments = paymentsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      date: doc.data().date.toDate().toISOString()
    }));

    return res.status(200).json({ payments });
  } catch (error) {
    console.error('Error fetching payments:', error);
    return res.status(500).json({ error: 'Failed to fetch payments' });
  }
} 