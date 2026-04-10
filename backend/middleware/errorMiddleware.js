/**
 * Global Error Handling Middleware
 */
const errorHandler = (err, req, res, next) => {
    // Set status code (default to 500)
    const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
    
    res.status(statusCode).json({
        message: err.message,
        stack: process.env.NODE_ENV === 'production' ? null : err.stack,
        path: req.originalUrl,
        timestamp: new Date().toISOString()
    });
};

/**
 * Handle 404 (Not Found) Routes
 */
const notFound = (req, res, next) => {
    const error = new Error(`Not Found - ${req.originalUrl}`);
    res.status(404);
    next(error);
};

module.exports = {
    errorHandler,
    notFound
};
