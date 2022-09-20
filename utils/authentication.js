require('dotenv').config();
const jwt = require('jsonwebtoken');

// Authenticates access token
async function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) return res.sendStatus(401); // user hasn't sent a token
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, userId) => {
      if (err) return res.sendStatus(403); // token sent isn't valid
      req.userId = userId;
      next();
    });
  }

  module.exports = authenticateToken;