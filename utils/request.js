export const getIpAddress = (req) => {
  return req.headers['x-forwarded-for'] || 
         req.headers['x-real-ip'] || 
         req.socket.remoteAddress || 
         'unknown';
};

export const isValidRequest = (req) => {
  return req.headers && 
         req.method && 
         req.url;
};

// Get client IP address from request
export const getIP = (req) => {
  let ip;
  
  // Get IP from various headers
  if (req.headers['x-forwarded-for']) {
    ip = req.headers['x-forwarded-for'].split(',')[0];
  } else if (req.headers['x-real-ip']) {
    ip = req.headers['x-real-ip'];
  } else if (req.connection && req.connection.remoteAddress) {
    ip = req.connection.remoteAddress;
  } else if (req.socket && req.socket.remoteAddress) {
    ip = req.socket.remoteAddress;
  } else {
    ip = '0.0.0.0';
  }

  // Clean the IP address
  return ip.replace(/::ffff:/, '');
};

// Get user agent from request
export const getUserAgent = (req) => {
  return req.headers['user-agent'] || 'Unknown';
};

// Get request origin
export const getOrigin = (req) => {
  return req.headers.origin || req.headers.referer || 'Unknown';
};

// Validate request method
export const validateMethod = (req, allowedMethods = ['POST']) => {
  return allowedMethods.includes(req.method);
};

// Basic rate limiting check (you might want to use a proper rate limiting solution)
export const checkRateLimit = async (ip, limit = 100, window = 3600000) => {
  // Implementation would depend on your database/caching solution
  return true; // Placeholder return
}; 