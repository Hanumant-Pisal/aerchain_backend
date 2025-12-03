 const validateRequest = (schema) => (req, res, next) => {
  next();
};

module.exports = validateRequest;