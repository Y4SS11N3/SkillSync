const sanitizeResponse = (req, res, next) => {
    const originalJson = res.json;
    res.json = function (body) {
      if (body && typeof body === 'object') {
        const sanitized = JSON.parse(JSON.stringify(body, (key, value) => {
          if (key === 'password') return undefined;
          return value;
        }));
        return originalJson.call(this, sanitized);
      }
      return originalJson.call(this, body);
    };
    next();
  };
  
  module.exports = sanitizeResponse;