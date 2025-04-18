export const handleError = (error, type = 'generic') => {
  console.error(`${type} error:`, error);
  
  // Generic error messages for users
  const userMessages = {
    auth: 'Authentication failed. Please try again.',
    payment: 'Payment processing failed. Please try again.',
    generic: 'An error occurred. Please try again.'
  };
  
  return userMessages[type] || userMessages.generic;
}; 