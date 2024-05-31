const jwt = require('jsonwebtoken');
const jwtConfig = require('../config/jwtConfig.js');

exports.createToken = (user) => {
  return jwt.sign({ id: user._id }, jwtConfig.secret, { expiresIn: jwtConfig.expiresIn });
};

exports.verifyToken = (req, res, next) => {
  let token = req.headers['authorization'];
  if (!token) {
    return res.status(403).send({ message: 'Token je potreban za autentifikaciju.' });
  }
  token = token.replace(/^Bearer\s+/, "");
  jwt.verify(token, jwtConfig.secret, (err, decoded) => {
    if (err) {
      return res.status(401).send({ message: 'Neautorizovan pristup.' });
    }
    req.userId = decoded.id;
    next();
  });
};
