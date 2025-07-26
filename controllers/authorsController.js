const { getDB } = require('../config/database');
const { ObjectId } = require('mongodb');

// GET all authors
const getAllAuthors = async (req, res) => {
  try {
    const db = getDB();
    const authors = await db.collection('authors').find({}).toArray();
    res.status(200).json(authors);
  } catch (error) {
    console.error('Error fetching authors:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// GET single author
const getAuthorById = async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid author ID' });
    }

    const db = getDB();
    const author = await db.collection('authors').findOne({ _id: new ObjectId(id) });
    
    if (!author) {
      return res.status(404).json({ error: 'Author not found' });
    }
    
    res.status(200).json(author);
  } catch (error) {
    console.error('Error fetching author:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// POST create author
const createAuthor = async (req, res) => {
  try {
    const db = getDB();
    const result = await db.collection('authors').insertOne(req.body);
    res.status(201).json({ 
      message: 'Author created successfully', 
      authorId: result.insertedId 
    });
  } catch (error) {
    console.error('Error creating author:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// PUT update author
const updateAuthor = async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid author ID' });
    }

    const db = getDB();
    const result = await db.collection('authors').updateOne(
      { _id: new ObjectId(id) },
      { $set: req.body }
    );
    
    if (result.matchedCount === 0) {
      return res.status(404).json({ error: 'Author not found' });
    }
    
    res.status(200).json({ message: 'Author updated successfully' });
  } catch (error) {
    console.error('Error updating author:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// DELETE author
const deleteAuthor = async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid author ID' });
    }

    const db = getDB();
    const result = await db.collection('authors').deleteOne({ _id: new ObjectId(id) });
    
    if (result.deletedCount === 0) {
      return res.status(404).json({ error: 'Author not found' });
    }
    
    res.status(200).json({ message: 'Author deleted successfully' });
  } catch (error) {
    console.error('Error deleting author:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = {
  getAllAuthors,
  getAuthorById,
  createAuthor,
  updateAuthor,
  deleteAuthor
};