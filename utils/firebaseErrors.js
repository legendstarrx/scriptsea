export const handleFirebaseError = (error) => {
  let message = 'An error occurred. Please try again.';
  
  switch (error.code) {
    case 'auth/network-request-failed':
      message = 'Network error. Please check your internet connection.';
      break;
    case 'auth/internal-error':
      message = 'Internal server error. Please try again later.';
      break;
    case 'auth/invalid-email':
      message = 'Invalid email address.';
      break;
    case 'auth/user-disabled':
      message = 'This account has been disabled.';
      break;
    case 'auth/user-not-found':
      message = 'User not found.';
      break;
    case 'auth/wrong-password':
      message = 'Invalid password.';
      break;
    default:
      message = error.message;
  }
  
  return message;
}; 