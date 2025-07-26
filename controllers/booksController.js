const { getDB } = require('../config/database');
const { ObjectId } = require('mongodb');

// GET all books
const getAllBooks = async (req, res) => {
  try {
    const db = getDB();
    const books = await db.collection('books').find({}).toArray();
    res.status(200).json(books);
  } catch (error) {
    console.error('Error fetching books:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// GET single book
const getBookById = async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid book ID' });
    }

    const db = getDB();
    const book = await db.collection('books').findOne({ _id: new ObjectId(id) });
    
    if (!book) {
      return res.status(404).json({ error: 'Book not found' });
    }
    
    res.status(200).json(book);
  } catch (error) {
    console.error('Error fetching book:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// POST create book
const createBook = async (req, res) => {
  try {
    const db = getDB();
    
    // Verify author exists if authorId is provided
    if (req.body.authorId && ObjectId.isValid(req.body.authorId)) {
      const authorExists = await db.collection('authors').findOne({ 
        _id: new ObjectId(req.body.authorId) 
      });
      
      if (!authorExists) {
        return res.status(400).json({ error: 'Author not found' });
      }
    }

    const result = await db.collection('books').insertOne(req.body);
    res.status(201).json({ 
      message: 'Book created successfully', 
      bookId: result.insertedId 
    });
  } catch (error) {
    console.error('Error creating book:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// PUT update book
const updateBook = async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid book ID' });
    }

    const db = getDB();
    
    // If authorId is being updated, verify the author exists
    if (req.body.authorId && ObjectId.isValid(req.body.authorId)) {
      const authorExists = await db.collection('authors').findOne({ 
        _id: new ObjectId(req.body.authorId) 
      });
      
      if (!authorExists) {
        return res.status(400).json({ error: 'Author not found' });
      }
    }

    const result = await db.collection('books').updateOne(
      { _id: new ObjectId(id) },
      { $set: req.body }
    );
    
    if (result.matchedCount === 0) {
      return res.status(404).json({ error: 'Book not found' });
    }
    
    res.status(200).json({ message: 'Book updated successfully' });
  } catch (error) {
    console.error('Error updating book:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// DELETE book
const deleteBook = async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid book ID' });
    }

    const db = getDB();
    const result = await db.collection('books').deleteOne({ _id: new ObjectId(id) });
    
    if (result.deletedCount === 0) {
      return res.status(404).json({ error: 'Book not found' });
    }
    
    res.status(200).json({ message: 'Book deleted successfully' });
  } catch (error) {
    console.error('Error deleting book:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = {
  getAllBooks,
  getBookById,
  createBook,
  updateBook,
  deleteBook
};