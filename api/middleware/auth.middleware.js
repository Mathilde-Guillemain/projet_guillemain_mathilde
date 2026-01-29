const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
      return res.status(401).send({ message: 'No token provided' });
    }

    // Extraire le token du header "Bearer <token>"
    const parts = authHeader.split(' ');
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      return res.status(401).send({ message: 'Invalid token format' });
    }

    const token = parts[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    req.userId = decoded.id;
    req.userEmail = decoded.email;
    next();
  } catch (err) {
    console.error('Auth error:', err.message);
    return res.status(401).send({ message: 'Invalid token: ' + err.message });
  }
};

module.exports = authMiddleware;
