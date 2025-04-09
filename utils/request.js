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