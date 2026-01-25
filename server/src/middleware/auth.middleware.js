// Refresh token rotation: issue new refresh token on use
exports.rotateRefreshToken = (res, user, isAdmin = false) => {
  const newRefreshToken = jwt.sign(
    { id: user._id, email: user.email },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: '7d' }
  );
  res.cookie('refreshToken', newRefreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: isAdmin ? 'strict' : 'lax',
    path: '/api/auth/refresh',
    maxAge: 7 * 24 * 60 * 60 * 1000
  });
  return newRefreshToken;
};
const jwt = require('jsonwebtoken');


// Middleware to set JWT in HttpOnly, Secure cookie
exports.setAuthCookie = (res, token) => {
  res.cookie('accessToken', token, {
    httpOnly: true,
    secure: false, // For localhost development; set to true in production with HTTPS
    sameSite: 'lax',
    path: '/',
    domain: 'localhost',
    maxAge: 15 * 60 * 1000 // 15 minutes
  });
};

// Middleware to verify JWT from HttpOnly cookie
exports.verifyToken = (req, res, next) => {
  const token = req.cookies && req.cookies.accessToken;
  if (!token) {
    return res.status(401).json({ message: 'No token provided.' });
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Invalid or expired token.' });
  }
};


// Middleware to handle refresh token logic (from HttpOnly cookie)
exports.handleRefreshToken = (req, res, next) => {
  const refreshToken = req.cookies && req.cookies.refreshToken;
  if (!refreshToken) {
    return res.status(401).json({ message: 'No refresh token provided.' });
  }
  try {
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Invalid or expired refresh token.' });
  }
};


// Utility to generate new access and refresh tokens and set cookies
exports.generateTokens = (res, user, isAdmin = false) => {
  const accessToken = jwt.sign(
    { id: user._id, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: '15m' }
  );
  const refreshToken = jwt.sign(
    { id: user._id, email: user.email },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: '7d' }
  );
  // Set access token cookie
  res.cookie('accessToken', accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: isAdmin ? 'lax' : 'lax', // 'lax' for localhost, 'strict' for production if needed
    domain: isAdmin ? 'localhost' : undefined, // set domain for admin panel if needed
    path: '/',
    maxAge: 15 * 60 * 1000
  });
  // Set refresh token cookie
  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: isAdmin ? 'lax' : 'lax', // 'lax' for localhost, 'strict' for production if needed
    domain: isAdmin ? 'localhost' : undefined,
    path: '/api/auth/refresh',
    maxAge: 7 * 24 * 60 * 60 * 1000
  });
};
