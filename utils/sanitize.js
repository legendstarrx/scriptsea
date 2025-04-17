export const sanitizeError = (error) => {
  const safeErrors = {
    'auth/email-already-in-use': 'Email already in use',
    'auth/invalid-email': 'Invalid email address',
    'auth/operation-not-allowed': 'Operation not allowed',
    'auth/weak-password': 'Password is too weak'
  };
  
  return safeErrors[error.code] || 'An error occurred. Please try again.';
} 