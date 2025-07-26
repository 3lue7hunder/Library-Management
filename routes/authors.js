const express = require('express');
const router = express.Router();
const { requireAuth } = require('../middleware/auth');
const { validateAuthor } = require('../middleware/validation');
const {
  getAllAuthors,
  getAuthorById,
  createAuthor,
  updateAuthor,
  deleteAuthor
} = require('../controllers/authorsController');

/**
 * @swagger
 * components:
 *   schemas:
 *     Author:
 *       type: object
 *       required:
 *         - name
 *         - email
 *       properties:
 *         _id:
 *           type: string
 *           description: Auto-generated ID
 *         name:
 *           type: string
 *           description: Author's full name
 *           example: J.K. Rowling
 *         email:
 *           type: string
 *           description: Author's email address
 *           example: jk.rowling@example.com
 *         biography:
 *           type: string
 *           description: Author's biography
 *           example: British author best known for the Harry Potter series
 *         birthDate:
 *           type: string
 *           format: date
 *           description: Author's birth date
 *           example: 1965-07-31
 *         nationality:
 *           type: string
 *           description: Author's nationality
 *           example: British
 */

/**
 * @swagger
 * /authors:
 *   get:
 *     summary: Get all authors
 *     tags: [Authors]
 *     responses:
 *       200:
 *         description: List of all authors
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Author'
 */
router.get('/', getAllAuthors);

/**
 * @swagger
 * /authors/{id}:
 *   get:
 *     summary: Get author by ID
 *     tags: [Authors]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Author ID
 *     responses:
 *       200:
 *         description: Author details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Author'
 *       404:
 *         description: Author not found
 */
router.get('/:id', getAuthorById);

/**
 * @swagger
 * /authors:
 *   post:
 *     summary: Create a new author (Protected)
 *     tags: [Authors]
 *     security:
 *       - sessionAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Author'
 *     responses:
 *       201:
 *         description: Author created successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Authentication required
 */
router.post('/', requireAuth, validateAuthor, createAuthor);

/**
 * @swagger
 * /authors/{id}:
 *   put:
 *     summary: Update an author (Protected)
 *     tags: [Authors]
 *     security:
 *       - sessionAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Author ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Author'
 *     responses:
 *       200:
 *         description: Author updated successfully
 *       401:
 *         description: Authentication required
 *       404:
 *         description: Author not found
 */
router.put('/:id', requireAuth, validateAuthor, updateAuthor);

/**
 * @swagger
 * /authors/{id}:
 *   delete:
 *     summary: Delete an author (Protected)
 *     tags: [Authors]
 *     security:
 *       - sessionAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Author ID
 *     responses:
 *       200:
 *         description: Author deleted successfully
 *       401:
 *         description: Authentication required
 *       404:
 *         description: Author not found
 */
router.delete('/:id', requireAuth, deleteAuthor);

module.exports = router;