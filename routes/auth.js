const express = require('express');
const router = express.Router();
const { requireAuth } = require('../middleware/auth');
const { validateUser, validateLogin } = require('../middleware/validation');
const {
  register,
  login,
  logout,
  getProfile,
  githubAuth,
  githubCallback,
  getAuthStatus
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
 *         authProvider:
 *           type: string
 *           description: Authentication provider
 *           example: local
 *           enum: [local, github]
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
 *       name: library.sid
 *       description: Session-based authentication using cookies
 */

/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Register a new user (local auth)
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
 *     summary: Login user (local auth)
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
 * /auth/github:
 *   get:
 *     summary: Login with GitHub OAuth
 *     tags: [Authentication]
 *     description: Redirects to GitHub for OAuth authentication
 *     responses:
 *       302:
 *         description: Redirect to GitHub OAuth
 */
router.get('/github', githubAuth);

/**
 * @swagger
 * /auth/github/callback:
 *   get:
 *     summary: GitHub OAuth callback
 *     tags: [Authentication]
 *     description: Handles the callback from GitHub OAuth
 *     parameters:
 *       - in: query
 *         name: code
 *         schema:
 *           type: string
 *         description: Authorization code from GitHub
 *     responses:
 *       302:
 *         description: Redirect to application with login status
 */
router.get('/github/callback', githubCallback);

/**
 * @swagger
 * /auth/status:
 *   get:
 *     summary: Get authentication status
 *     tags: [Authentication]
 *     description: Check if user is currently authenticated
 *     responses:
 *       200:
 *         description: Authentication status
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 authenticated:
 *                   type: boolean
 *                 user:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     username:
 *                       type: string
 *                     email:
 *                       type: string
 *                     role:
 *                       type: string
 *                     authProvider:
 *                       type: string
 */
router.get('/status', getAuthStatus);

/**
 * @swagger
 * /auth/logout:
 *   post:
 *     summary: Logout user
 *     tags: [Authentication]
 *     description: Logout user (works for both local and OAuth users)
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