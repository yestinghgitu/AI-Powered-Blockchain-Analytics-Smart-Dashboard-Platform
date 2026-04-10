const jwt = require('jsonwebtoken');
const logger = require('../utils/logger');

const auth = (req, res, next) => {
  // 0. Global Authentication Bypass for Development
  if (process.env.SKIP_AUTH === 'true') {
    logger.warn(`[Auth] SECURITY WARNING: Authentication is globally bypassed via SKIP_AUTH.`);
    req.user = { id: 'admin-dev', role: 'admin' };
    return next();
  }

  // 1. Check for Development Bypass Header (Granular)
  const devBypassToken = process.env.DEV_BYPASS_TOKEN;
  const clientBypassToken = req.header('x-dev-bypass');

  if (devBypassToken && clientBypassToken === devBypassToken) {
    logger.info(`[Auth] Development bypass activated for ${req.method} ${req.url}`);
    req.user = { id: 'dev-user', email: 'dev@nexus.os', role: 'developer' };
    return next();
  }

  // 2. Standard JWT Validation
  const token = req.header('Authorization')?.replace('Bearer ', '');

  if (!token) {
    return res.status(401).json({ error: 'Access denied. No authentication token provided.' });
  }

  try {
    const secret = process.env.JWT_SECRET || 'fallback-secret-for-dev';
    const decoded = jwt.verify(token, secret);
    req.user = decoded;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      logger.warn('[Auth] Expired token attempt');
      return res.status(401).json({ error: 'Session Expired: Please log in again.' });
    }
    if (error.name === 'JsonWebTokenError') {
      logger.warn('[Auth] Invalid token attempt');
      return res.status(401).json({ error: 'Invalid Security Token: Access Denied.' });
    }
    
    logger.error(`[Auth] Unexpected error: ${error.message}`);
    res.status(400).json({ error: 'Authentication failed.' });
  }
};

module.exports = auth;
