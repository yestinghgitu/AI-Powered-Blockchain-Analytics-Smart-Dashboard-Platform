const logger = require('../utils/logger');

/**
 * Admin Authorization Middleware
 * Only allows access if the authenticated user has the 'admin' role.
 * Must be used AFTER the general 'auth' middleware.
 */
const admin = (req, res, next) => {
  if (!req.user) {
    logger.error('[Admin Middleware] Error: User object not found on request. Ensure auth middleware is run first.');
    return res.status(500).json({ error: 'Authorization context missing.' });
  }

  if (req.user.role !== 'admin') {
    logger.warn(`[Admin Middleware] Unauthorized access attempt by user: ${req.user.email || req.user.id}`);
    return res.status(403).json({ 
      error: 'Access Denied: Administrative privileges required.',
      details: 'This segment of the neural core is restricted to level-1 operators.'
    });
  }

  next();
};

module.exports = admin;
