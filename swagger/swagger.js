const swaggerJSDoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Library Management API',
      version: '2.0.0',
      description: 'A comprehensive API for managing library books and authors with authentication',
      contact: {
        name: 'Library API Support',
        email: 'support@libraryapi.com'
      }
    },
servers: [
  {
    url: process.env.RENDER_EXTERNAL_URL || 'https://library-management-d0no.onrender.com',
    description: 'Production server (Render)',
  },
  {
    url: `http://localhost:${process.env.PORT || 3000}`,
    description: 'Development server',
  },
],
    components: {
      securitySchemes: {
        sessionAuth: {
          type: 'apiKey',
          in: 'cookie',
          name: 'connect.sid',
          description: 'Session-based authentication using cookies'
        }
      }
    },
    tags: [
      {
        name: 'Authentication',
        description: 'User authentication and authorization'
      },
      {
        name: 'Authors',
        description: 'Author management operations'
      },
      {
        name: 'Books',
        description: 'Book management operations'
      }
    ]
  },
  apis: ['./routes/*.js'], // Path to the API routes
};

const specs = swaggerJSDoc(options);

module.exports = specs;