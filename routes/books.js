const express = require('express');
const { requireAuth } = require('../middleware/auth');
const router = express.Router();
const { validateBook } = require('../middleware/validation');
const {
  getAllBooks,
  getBookById,
  createBook,
  updateBook,
  deleteBook
} = require('../controllers/booksController');

/**
 * @swagger
 * components:
 *   schemas:
 *     Book:
 *       type: object
 *       required:
 *         - title
 *         - authorId
 *         - isbn
 *       properties:
 *         _id:
 *           type: string
 *           description: Auto-generated ID
 *         title:
 *           type: string
 *           description: Book title
 *         authorId:
 *           type: string
 *           description: Author's ID
 *         isbn:
 *           type: string
 *           description: ISBN number
 *         publishedYear:
 *           type: number
 *           description: Year of publication
 *         genre:
 *           type: string
 *           description: Book genre
 *         pages:
 *           type: number
 *           description: Number of pages
 *         publisher:
 *           type: string
 *           description: Publisher name
 *         language:
 *           type: string
 *           description: Book language
 *         description:
 *           type: string
 *           description: Book description
 *         price:
 *           type: number
 *           description: Book price
 *         inStock:
 *           type: boolean
 *           description: Availability status
 */

/**
 * @swagger
 * /books:
 *   get:
 *     summary: Get all books
 *     tags: [Books]
 *     responses:
 *       200:
 *         description: List of all books
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Book'
 */
router.get('/', getAllBooks);

/**
 * @swagger
 * /books/{id}:
 *   get:
 *     summary: Get book by ID
 *     tags: [Books]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Book details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Book'
 *       404:
 *         description: Book not found
 */
router.get('/:id', getBookById);

/**
 * @swagger
 * /books:
 *   post:
 *     summary: Create a new book
 *     tags: [Books]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Book'
 *     responses:
 *       201:
 *         description: Book created successfully
 *       400:
 *         description: Validation error
 */
router.post('/', requireAuth, validateBook, createBook);

/**
 * @swagger
 * /books/{id}:
 *   put:
 *     summary: Update a book
 *     tags: [Books]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Book'
 *     responses:
 *       200:
 *         description: Book updated successfully
 *       404:
 *         description: Book not found
 */
router.put('/:id', requireAuth, validateBook, updateBook);

/**
 * @swagger
 * /books/{id}:
 *   delete:
 *     summary: Delete a book
 *     tags: [Books]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Book deleted successfully
 *       404:
 *         description: Book not found
 */
router.delete('/:id', requireAuth, deleteBook);

module.exports = router;