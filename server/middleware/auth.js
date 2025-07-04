import dotenv from 'dotenv';

dotenv.config();

/**
 * Middleware to check if user is authenticated
 */
export const isAuthenticated = (req, res, next) => {
  // In a real application, this would check for a valid JWT or session
  // For now, we'll use a simple API key check
  const apiKey = req.headers['x-api-key'];
  
  if (!apiKey || apiKey !== process.env.API_KEY) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
  
  next();
};

/**
 * Middleware to check if user is an admin
 */
export const isAdmin = (req, res, next) => {
  // For development purposes, we'll allow access from localhost without authentication
  const clientIP = req.ip || req.connection.remoteAddress;
  
  if (clientIP.includes('127.0.0.1') || clientIP.includes('::1') || clientIP.includes('localhost')) {
    return next();
  }
  
  // In production, you would check for admin role in JWT or session
  const apiKey = req.headers['x-api-key'];
  
  if (!apiKey || apiKey !== process.env.ADMIN_API_KEY) {
    return res.status(403).json({ message: 'Forbidden: Admin access required' });
  }
  
  next();
}; 