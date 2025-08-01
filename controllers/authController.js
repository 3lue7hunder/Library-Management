const { getDB } = require('../config/database');
const bcrypt = require('bcryptjs');
const { ObjectId } = require('mongodb');
const passport = require('passport');

const register = async (req, res) => {
  try {
    const { username, email, password } = req.body;
    
    if (!username || !email || !password) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    const db = getDB();
    
    // Check if user exists
    const existingUser = await db.collection('users').findOne({ 
      $or: [{ email }, { username }] 
    });
    
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Create user
    const result = await db.collection('users').insertOne({
      username,
      email,
      password: hashedPassword,
      role: 'user',
      authProvider: 'local',
      createdAt: new Date()
    });

    res.status(201).json({ 
      message: 'User registered successfully',
      userId: result.insertedId 
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const db = getDB();
    const user = await db.collection('users').findOne({ 
      email,
      authProvider: { $in: ['local', null, undefined] } // Only allow local auth users
    });
    
    if (!user || !user.password) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Store user session
    req.session.userId = user._id;
    req.session.user = {
      id: user._id,
      username: user.username,
      email: user.email,
      role: user.role,
      authProvider: user.authProvider || 'local'
    };

    // Update last login
    await db.collection('users').updateOne(
      { _id: user._id },
      { $set: { lastLogin: new Date() } }
    );

    res.status(200).json({ 
      message: 'Login successful',
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        authProvider: user.authProvider || 'local'
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// GitHub OAuth login
const githubAuth = passport.authenticate('github', { 
  scope: ['user:email'] 
});

// GitHub OAuth callback
const githubCallback = (req, res, next) => {
  passport.authenticate('github', (err, user, info) => {
    if (err) {
      console.error('GitHub OAuth error:', err);
      return res.redirect(`${process.env.CLIENT_URL || 'http://localhost:3000'}?error=oauth_failed`);
    }
    
    if (!user) {
      return res.redirect(`${process.env.CLIENT_URL || 'http://localhost:3000'}?error=oauth_denied`);
    }
    
    // Log the user in
    req.logIn(user, (err) => {
      if (err) {
        console.error('Session login error:', err);
        return res.redirect(`${process.env.CLIENT_URL || 'http://localhost:3000'}?error=session_failed`);
      }
      
      // Store additional session data
      req.session.userId = user._id;
      req.session.user = {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        authProvider: user.authProvider
      };
      
      // Redirect to success page or dashboard
      res.redirect(`${process.env.CLIENT_URL || 'http://localhost:3000'}?login=success`);
    });
  })(req, res, next);
};

const logout = (req, res) => {
  // Passport logout
  req.logout((err) => {
    if (err) {
      console.error('Passport logout error:', err);
    }
    
    // Destroy session
    req.session.destroy((err) => {
      if (err) {
        console.error('Session destroy error:', err);
        return res.status(500).json({ error: 'Could not log out completely' });
      }
      
      res.clearCookie('library.sid');
      res.status(200).json({ message: 'Logout successful' });
    });
  });
};

const getProfile = async (req, res) => {
  try {
    const db = getDB();
    const user = await db.collection('users').findOne(
      { _id: new ObjectId(req.session.userId || req.user._id) },
      { projection: { password: 0, accessToken: 0 } }
    );
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.status(200).json(user);
  } catch (error) {
    console.error('Profile error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get authentication status
const getAuthStatus = (req, res) => {
  const isAuthenticated = !!(req.session.userId || req.user);
  const user = req.session.user || req.user;
  
  res.status(200).json({
    authenticated: isAuthenticated,
    user: user ? {
      id: user.id || user._id,
      username: user.username,
      email: user.email,
      role: user.role,
      authProvider: user.authProvider || 'local'
    } : null
  });
};

module.exports = {
  register,
  login,
  logout,
  getProfile,
  githubAuth,
  githubCallback,
  getAuthStatus
};