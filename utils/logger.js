const winston = require("winston");

const isDevelopment = process.env.NODE_ENV === 'development';

const logger = winston.createLogger({
  level: isDevelopment ? 'debug' : 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console({
      format: isDevelopment 
        ? winston.format.simple()
        : winston.format.combine(
            winston.format.timestamp(),
            winston.format.json()
          )
    })
  ],
  // Add file transports in production
  ...(process.env.NODE_ENV === 'production' && [
    new winston.transports.File({ 
      filename: 'logs/error.log', 
      level: 'error' 
    }),
    new winston.transports.File({ 
      filename: 'logs/combined.log' 
    })
  ])
});

module.exports = logger;
