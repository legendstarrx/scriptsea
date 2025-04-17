export const logSecurityEvent = async (event) => {
  await fetch('/api/log/security', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      event,
      timestamp: new Date().toISOString(),
      ip: window.clientIP // Set by your IP middleware
    })
  });
}; 