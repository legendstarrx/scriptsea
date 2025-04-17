import { getAuth } from 'firebase-admin/auth';
import { adminDb, adminAuth } from '../../../lib/firebaseAdmin';

export async function validateAdminRequest(req) {
  try {
    // Check for authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      throw new Error('No authorization token');
    }

    // Get token
    const token = authHeader.split('Bearer ')[1];
    if (!token) {
      throw new Error('Invalid token format');
    }

    // Verify token
    const decodedToken = await getAuth().verifyIdToken(token);
    
    // Get user from database
    const userDoc = await adminDb.collection('users').doc(decodedToken.uid).get();
    const userData = userDoc.data();

    // Check if user is admin
    if (!userData?.isAdmin) {
      throw new Error('User is not an admin');
    }

    return {
      userId: decodedToken.uid,
      email: decodedToken.email,
      userData
    };
  } catch (error) {
    console.error('Admin validation error:', error);
    throw error;
  }
} 