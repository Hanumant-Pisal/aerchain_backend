 const logger = require('../utils/logger');

const errorMiddleware = (err, req, res, next) => {
  logger.error('Error occurred:', {
    message: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
    ip: req.ip,
    timestamp: new Date().toISOString()
  });

  // Don't expose stack trace in production
  const isDevelopment = process.env.NODE_ENV === 'development';
  
  const response = {
    message: err.message || 'Internal Server Error',
    ...(isDevelopment && { stack: err.stack })
  };

  const status = err.status || 500;
  res.status(status).json(response);
};

module.exports = errorMiddleware;