import jwt from 'jsonwebtoken';

const verify = (req, res, next) => {
  // Get the token from the Authorization header (Bearer token)
  const token = req.headers.authorization && req.headers.authorization.split(' ')[1];

  if (!token) {
    return res.status(403).json({ message: 'No token provided. Please log in.' });
  }

  // Verify the token
  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(401).json({ message: 'Invalid or expired token.' });
    }

    // If the token is valid, attach decoded user information to the request object
    req.user = decoded;
    next(); // Pass control to the next middleware or route handler
  });
};

export default verify;
