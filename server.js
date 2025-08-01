const express = require('express');
const cors = require('cors');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const passport = require('./config/passport');
const swaggerUi = require('swagger-ui-express');
const swaggerSpecs = require('./swagger/swagger');
const { connectDB } = require('./config/database');
require('dotenv').config();

// Check required environment variables
const requiredEnvVars = ['MONGODB_URL', 'SESSION_SECRET', 'GITHUB_CLIENT_ID', 'GITHUB_CLIENT_SECRET'];
requiredEnvVars.forEach(envVar => {
  if (!process.env[envVar]) {
    console.error(`Missing required environment variable: ${envVar}`);
    process.exit(1);
  }
});

const app = express();
const PORT = process.env.PORT || 3000;

console.log('🚀 Starting Library Management with OAuth...');
console.log(`📍 Environment: ${process.env.NODE_ENV || 'development'}`);
console.log(`🔌 Port: ${PORT}`);

// Enhanced CORS configuration for Render
app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (mobile apps, curl, etc.)
    if (!origin) return callback(null, true);
    
    const allowedOrigins = [
      'https://library-management-d0no.onrender.com',
      'http://localhost:3000',
      'http://localhost:3001',
      'http://127.0.0.1:3000'
    ];
    
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    
    // For production, be more permissive to allow API testing tools
    if (process.env.NODE_ENV === 'production') {
      return callback(null, true);
    }
    
    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// Trust proxy for Render
app.set('trust proxy', 1);

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Enhanced session configuration for production
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  name: 'library.sid', // Custom session name
  store: process.env.NODE_ENV === 'production' ? MongoStore.create({
    mongoUrl: process.env.MONGODB_URL,
    touchAfter: 24 * 3600 // lazy session update
  }) : undefined, // Use MemoryStore for development
  cookie: { 
    secure: process.env.NODE_ENV === 'production', // HTTPS only in production
    httpOnly: true,
    maxAge: 1000 * 60 * 60 * 24, // 24 hours
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax' // For cross-origin requests
  }
}));

// Initialize Passport middleware
app.use(passport.initialize());
app.use(passport.session());

// Add request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path} - IP: ${req.ip}`);
  next();
});

// Routes
app.use('/auth', require('./routes/auth'));
app.use('/authors', require('./routes/authors'));
app.use('/books', require('./routes/books'));

// Enhanced API docs with login status
app.get('/api-docs', (req, res, next) => {
  // Check for login status in query params
  const loginSuccess = req.query.login === 'success';
  const error = req.query.error;
  const isAuthenticated = !!(req.session.userId || req.user);
  
  // If there's a login success or error, show a simple page first
  if (loginSuccess || error) {
    let message = '';
    let statusColor = '';
    
    if (loginSuccess) {
      const username = req.session.user?.username || req.user?.username || 'User';
      message = `✅ Login successful! Welcome, ${username}. You can now use protected API endpoints.`;
      statusColor = 'green';
    } else if (error) {
      switch (error) {
        case 'oauth_failed':
          message = '❌ OAuth authentication failed. Please try again.';
          break;
        case 'oauth_denied':
          message = '❌ OAuth access denied. Please authorize the application.';
          break;
        case 'session_failed':
          message = '❌ Session creation failed. Please try logging in again.';
          break;
        default:
          message = '❌ Authentication error occurred.';
      }
      statusColor = 'red';
    }
    
    // Simple HTML page with auto-redirect to API docs
    const html = `
    <!DOCTYPE html>
    <html>
    <head>
        <title>Library Management API - Login Status</title>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <style>
            body { 
                font-family: Arial, sans-serif; 
                max-width: 800px; 
                margin: 50px auto; 
                padding: 20px;
                text-align: center;
            }
            .message { 
                padding: 20px; 
                border-radius: 8px; 
                margin: 20px 0;
                font-size: 18px;
            }
            .success { background-color: #d4edda; color: #155724; border: 1px solid #c3e6cb; }
            .error { background-color: #f8d7da; color: #721c24; border: 1px solid #f5c6cb; }
            .user-info {
                background-color: #e3f2fd;
                padding: 15px;
                border-radius: 8px;
                margin: 20px 0;
            }
            .btn {
                display: inline-block;
                padding: 12px 24px;
                background-color: #007bff;
                color: white;
                text-decoration: none;
                border-radius: 5px;
                margin: 10px;
            }
            .btn:hover { background-color: #0056b3; }
            .auth-links { margin: 30px 0; }
        </style>
        <script>
            // Auto-redirect to API docs after 5 seconds
            setTimeout(() => {
                window.location.href = '/api-docs-swagger';
            }, 5000);
        </script>
    </head>
    <body>
        <h1>🚀 Library Management API</h1>
        <div class="message ${loginSuccess ? 'success' : 'error'}">
            ${message}
        </div>
        
        ${isAuthenticated ? `
        <div class="user-info">
            <h3>👤 Current User</h3>
            <p><strong>Username:</strong> ${req.session.user?.username || req.user?.username}</p>
            <p><strong>Email:</strong> ${req.session.user?.email || req.user?.email}</p>
            <p><strong>Role:</strong> ${req.session.user?.role || req.user?.role}</p>
            <p><strong>Auth Provider:</strong> ${req.session.user?.authProvider || req.user?.authProvider || 'local'}</p>
        </div>
        ` : ''}
        
        <div class="auth-links">
            <a href="/api-docs-swagger" class="btn">📚 View API Documentation</a>
            ${!isAuthenticated ? `
                <a href="/auth/github" class="btn">🔐 Login with GitHub</a>
            ` : `
                <form method="POST" action="/auth/logout" style="display: inline;">
                    <button type="submit" class="btn" style="background-color: #dc3545; border: none; cursor: pointer;">
                        🚪 Logout
                    </button>
                </form>
            `}
        </div>
        
        <p><em>Redirecting to API documentation in 5 seconds...</em></p>
        
        <div style="margin-top: 50px; font-size: 14px; color: #666;">
            <h4>🔒 Protected Endpoints (Require Authentication)</h4>
            <p>POST /authors, PUT /authors/:id, DELETE /authors/:id</p>
            <p>POST /books, PUT /books/:id, DELETE /books/:id</p>
            <p>GET /auth/profile</p>
        </div>
    </body>
    </html>
    `;
    
    return res.send(html);
  }
  
  // Otherwise, proceed to normal Swagger docs
  next();
}, swaggerUi.serve, swaggerUi.setup(swaggerSpecs));

// Add a separate route for direct Swagger access
app.use('/api-docs-swagger', swaggerUi.serve, swaggerUi.setup(swaggerSpecs));

// Swagger Documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpecs));

// Enhanced root route with more information
app.get('/', (req, res) => {
  res.json({ 
    message: 'Library Management with OAuth',
    status: 'active',
    timestamp: new Date().toISOString(),
    documentation: '/api-docs',
    features: ['CRUD Operations', 'Authentication', 'OAuth (GitHub)', 'Data Validation'],
    collections: ['Authors', 'Books', 'Users'],
    endpoints: {
      authentication: '/auth (POST /register, POST /login, POST /logout, GET /profile)',
      oauth: '/auth/github (GET), /auth/github/callback (GET)',
      authors: '/authors (GET, POST, PUT, DELETE)',
      books: '/books (GET, POST, PUT, DELETE)',
      documentation: '/api-docs',
      health: '/health'
    },
    environment: process.env.NODE_ENV || 'development',
    port: PORT
  });
});

// Enhanced health check route
app.get('/health', async (req, res) => {
  try {
    // Test database connection
    const { getDB } = require('./config/database');
    const db = getDB();
    await db.admin().ping();
    
    res.status(200).json({ 
      status: 'healthy', 
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      database: 'connected',
      oauth: {
        github: {
          configured: !!(process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET),
          callbackUrl: process.env.GITHUB_CALLBACK_URL || "http://localhost:3000/auth/github/callback"
        }
      },
      environment: process.env.NODE_ENV || 'development',
      port: PORT,
      memory: {
        used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024) + ' MB',
        total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024) + ' MB'
      }
    });
  } catch (error) {
    console.error('Health check failed:', error);
    res.status(503).json({ 
      status: 'unhealthy', 
      timestamp: new Date().toISOString(),
      error: 'Database connection failed',
      uptime: process.uptime()
    });
  }
});

// Test route for API functionality
app.get('/test', (req, res) => {
  res.json({
    message: 'API is working!',
    timestamp: new Date().toISOString(),
    method: req.method,
    url: req.url,
    authenticated: !!req.user,
    user: req.user ? {
      id: req.user._id,
      username: req.user.username,
      authProvider: req.user.authProvider || 'local'
    } : null,
    headers: req.headers,
    ip: req.ip
  });
});

// 404 handler
app.use('*', (req, res) => {
  console.log(`404 - Route not found: ${req.method} ${req.originalUrl}`);
  res.status(404).json({ 
    error: 'Route not found',
    message: `The route ${req.originalUrl} does not exist on this server`,
    availableRoutes: ['/auth', '/auth/github', '/authors', '/books', '/api-docs', '/health', '/test'],
    timestamp: new Date().toISOString()
  });
});

// Enhanced global error handler
app.use((err, req, res, next) => {
  console.error('Global error handler:', {
    error: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
    timestamp: new Date().toISOString()
  });
  
  res.status(err.status || 500).json({ 
    error: 'Something went wrong!',
    message: process.env.NODE_ENV === 'production' 
      ? 'Internal server error' 
      : err.message,
    timestamp: new Date().toISOString()
  });
});

// Enhanced graceful shutdown
const gracefulShutdown = (signal) => {
  console.log(`${signal} received, shutting down gracefully`);
  
  // Close server
  const server = app.listen(PORT);
  server.close(() => {
    console.log('HTTP server closed');
    process.exit(0);
  });
  
  // Force close after 30 seconds
  setTimeout(() => {
    console.error('Could not close connections in time, forcefully shutting down');
    process.exit(1);
  }, 30000);
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

// Start server
const startServer = async () => {
  try {
    console.log('🔄 Attempting to connect to MongoDB...');
    console.log('📍 MongoDB URL:', process.env.MONGODB_URL ? 'Set' : 'Not set');
    console.log('🔑 GitHub OAuth:', process.env.GITHUB_CLIENT_ID ? 'Configured' : 'Not configured');
    
    await connectDB();
    
    const server = app.listen(PORT, '0.0.0.0', () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📚 API Documentation: http://localhost:${PORT}/api-docs`);
      console.log(`🔗 Health Check: http://localhost:${PORT}/health`);
      console.log(`🌐 API Base URL: http://localhost:${PORT}`);
      console.log(`🔐 GitHub OAuth: http://localhost:${PORT}/auth/github`);
      
      if (process.env.NODE_ENV === 'production') {
        console.log(`🌍 Production URL: https://library-management-d0no.onrender.com`);
      }
    });

    // Handle server errors
    server.on('error', (error) => {
      if (error.code === 'EADDRINUSE') {
        console.error(`Port ${PORT} is already in use`);
      } else {
        console.error('Server error:', error);
      }
      process.exit(1);
    });

  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();