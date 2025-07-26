const requireAuth = (req, res, next) => {
  if (!req.session.userId) {
    return res.status(401).json({ 
      error: 'Authentication required',
      message: 'You must be logged in to access this resource'
    });
  }
  next();
};

const requireAdmin = (req, res, next) => {
  if (!req.session.userId) {
    return res.status(401).json({ 
      error: 'Authentication required',
      message: 'You must be logged in to access this resource'
    });
  }
  
  if (req.session.user.role !== 'admin') {
    return res.status(403).json({ 
      error: 'Access denied',
      message: 'Admin privileges required'
    });
  }
  
  next();
};

module.exports = { requireAuth, requireAdmin };