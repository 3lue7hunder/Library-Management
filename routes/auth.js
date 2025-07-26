const express = require('express');
const router = express.Router();
const { requireAuth } = require('../middleware/auth');
const { validateUser, validateLogin } = require('../middleware/validation');
const {
  register,
  login,
  logout,
  getProfile
} = require('../controllers/authController');

/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       required:
 *         - username
 *         - email
 *         - password
 *       properties:
 *         username:
 *           type: string
 *           description: User's username
 *           example: librarian1
 *         email:
 *           type: string
 *           description: User's email address
 *           example: librarian@library.com
 *         password:
 *           type: string
 *           description: User's password
 *           example: securepassword123
 *     LoginRequest:
 *       type: object
 *       required:
 *         - email
 *         - password
 *       properties:
 *         email:
 *           type: string
 *           example: librarian@library.com
 *         password:
 *           type: string
 *           example: securepassword123
 *   securitySchemes:
 *     sessionAuth:
 *       type: apiKey
 *       in: cookie
 *       name: connect.sid
 *       description: Session-based authentication using cookies
 */

/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/User'
 *     responses:
 *       201:
 *         description: User registered successfully
 *       400:
 *         description: Validation error or user already exists
 */
router.post('/register', validateUser, register);

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Login user
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginRequest'
 *     responses:
 *       200:
 *         description: Login successful
 *       401:
 *         description: Invalid credentials
 */
router.post('/login', validateLogin, login);

/**
 * @swagger
 * /auth/logout:
 *   post:
 *     summary: Logout user
 *     tags: [Authentication]
 *     responses:
 *       200:
 *         description: Logout successful
 */
router.post('/logout', logout);

/**
 * @swagger
 * /auth/profile:
 *   get:
 *     summary: Get user profile (Protected)
 *     tags: [Authentication]
 *     security:
 *       - sessionAuth: []
 *     responses:
 *       200:
 *         description: User profile data
 *       401:
 *         description: Authentication required
 */
router.get('/profile', requireAuth, getProfile);

module.exports = router;