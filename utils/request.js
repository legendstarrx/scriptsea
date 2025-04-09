// Function to get IP address from request
export const getIP = (req) => {
  let ip;
  
  if (req.headers['x-forwarded-for']) {
    ip = req.headers['x-forwarded-for'].split(',')[0];
  } else if (req.headers['x-real-ip']) {
    ip = req.headers['x-real-ip'];
  } else {
    ip = req.connection.remoteAddress;
  }

  // Clean up IPv6 formatting
  if (ip.substr(0, 7) === '::ffff:') {
    ip = ip.substr(7);
  }

  return ip;
};

// Function to get user agent from request
export const getUserAgent = (req) => {
  return req.headers['user-agent'] || 'Unknown';
};

// Function to get request origin
export const getOrigin = (req) => {
  return req.headers.origin || req.headers.referer || 'Unknown';
};

// Function to get request method
export const getMethod = (req) => {
  return req.method;
};

// Helper function to parse request body
export const parseBody = async (req) => {
  if (typeof req.body === 'string') {
    try {
      return JSON.parse(req.body);
    } catch (e) {
      return req.body;
    }
  }
  return req.body;
};

// Helper function to validate required fields
export const validateFields = (body, requiredFields) => {
  const missingFields = requiredFields.filter(field => !body[field]);
  if (missingFields.length > 0) {
    throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
  }
  return true;
};

// Helper function to sanitize response data
export const sanitizeResponse = (data) => {
  // Remove sensitive fields
  const sanitized = { ...data };
  const sensitiveFields = ['password', 'token', 'secret', 'key'];
  
  sensitiveFields.forEach(field => {
    if (sanitized[field]) delete sanitized[field];
  });
  
  return sanitized;
};

// Export all utility functions
export default {
  getIP,
  getUserAgent,
  getOrigin,
  getMethod,
  parseBody,
  validateFields,
  sanitizeResponse
}; 