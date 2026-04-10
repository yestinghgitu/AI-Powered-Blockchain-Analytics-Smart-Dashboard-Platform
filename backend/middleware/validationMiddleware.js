const logger = require('../utils/logger');

/**
 * Generic middleware for validating request bodies, queries, and params using Zod.
 * @param {import('zod').ZodSchema} schema 
 */
const validate = (schema) => async (req, res, next) => {
  try {
    await schema.parseAsync({
      body: req.body,
      query: req.query,
      params: req.params,
    });
    return next();
  } catch (error) {
    logger.warn(`[Validation Error] on ${req.method} ${req.url}: ${error.message}`);
    return res.status(400).json({
      success: false,
      error: 'Validation Failed',
      details: error.errors || error.message
    });
  }
};

module.exports = validate;
