const requireAuth = (req, res, next) => {
  // Check both session-based auth and Passport auth
  const isAuthenticated = !!(req.session.userId || req.user);
  
  if (!isAuthenticated) {
    return res.status(401).json({ 
      error: 'Authentication required',
      message: 'You must be logged in to access this resource'
    });
  }
  
  // Ensure user data is available in req.user for consistency
  if (req.session.userId && !req.user) {
    req.user = req.session.user;
  }
  
  next();
};

const requireAdmin = (req, res, next) => {
  const isAuthenticated = !!(req.session.userId || req.user);
  
  if (!isAuthenticated) {
    return res.status(401).json({ 
      error: 'Authentication required',
      message: 'You must be logged in to access this resource'
    });
  }
  
  const user = req.session.user || req.user;
  
  if (user.role !== 'admin') {
    return res.status(403).json({ 
      error: 'Access denied',
      message: 'Admin privileges required'
    });
  }
  
  next();
};

// Optional auth - for routes that work with or without authentication
const optionalAuth = (req, res, next) => {
  // Set user data if available but don't require it
  if (req.session.userId && !req.user) {
    req.user = req.session.user;
  }
  next();
};

module.exports = { requireAuth, requireAdmin, optionalAuth };