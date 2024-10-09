const jwt = require('jsonwebtoken');
const { User } = require('../models/associations');

const authMiddleware = async (req, res, next) => {


  try {
    const authHeader = req.header('Authorization');

    if (!authHeader) {
      return res.status(401).json({ error: 'No Authorization header provided' });
    }

    const parts = authHeader.split(' ');
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      return res.status(401).json({ error: 'Invalid Authorization header format' });
    }

    const token = parts[1];

    if (!token) {
      return res.status(401).json({ error: 'No token provided in Authorization header' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findByPk(decoded.userId);
    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }

    req.user = user;
    req.token = token;
    next();
  } catch (error) {
    console.error('Authentication error:', error);
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: 'Invalid token' });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token has expired' });
    }
    res.status(500).json({ error: 'Internal server error during authentication' });
  }
};

module.exports = authMiddleware;