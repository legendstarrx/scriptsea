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

export const getIP = (req) => {
  return req.headers['x-forwarded-for']?.split(',')[0] || 
         req.headers['x-real-ip'] || 
         req.connection.remoteAddress || 
         req.socket.remoteAddress;
}; 