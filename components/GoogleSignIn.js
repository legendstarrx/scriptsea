// After successful Google sign-in
const updateUserWithIp = async (user) => {
  try {
    await fetch('/api/update-user', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId: user.uid,
      })
    });
  } catch (error) {
    console.error('Error updating user IP:', error);
  }
};

// Call this after successful Google sign-in
await updateUserWithIp(user); 