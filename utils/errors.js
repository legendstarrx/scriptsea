export const safeErrorMessage = (error) => {
  const messages = {
    'auth/wrong-password': 'Invalid login credentials',
    'auth/user-not-found': 'Invalid login credentials',
    'auth/email-already-in-use': 'Account already exists',
    'auth/invalid-email': 'Invalid email format',
    'auth/weak-password': 'Password is too weak'
  };
  
  return messages[error.code] || 'An error occurred. Please try again.';
}; 