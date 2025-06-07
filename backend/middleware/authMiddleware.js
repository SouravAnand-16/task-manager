const jwt = require('jsonwebtoken');
const User = require('../models/User');

module.exports = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'No token provided' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.id).select('-password');

    if (!user || user.tokenVersion !== decoded.tokenVersion) {
      return res.status(403).json({ message: 'Token expired or invalid' });
    }
    req.user = user;
    next();
  } catch (err) {
    console.error('Auth error:', err.message);
    return res.status(403).json({ message: 'Unauthorized' });
  }
};
