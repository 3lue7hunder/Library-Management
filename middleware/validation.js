const Joi = require('joi');

// Author validation schema
const authorSchema = Joi.object({
  name: Joi.string().min(2).max(100).required(),
  email: Joi.string().email().required(),
  biography: Joi.string().max(1000).allow(''),
  birthDate: Joi.date().allow(''),
  nationality: Joi.string().max(50).allow('')
});

// Book validation schema (7+ fields)
const bookSchema = Joi.object({
  title: Joi.string().min(1).max(200).required(),
  authorId: Joi.string().required(),
  isbn: Joi.string().pattern(/^[0-9-X]+$/).required(),
  publishedYear: Joi.number().integer().min(1000).max(new Date().getFullYear()).allow(''),
  genre: Joi.string().max(50).allow(''),
  pages: Joi.number().integer().min(1).allow(''),
  publisher: Joi.string().max(100).allow(''),
  language: Joi.string().max(30).allow(''),
  description: Joi.string().max(2000).allow(''),
  price: Joi.number().min(0).allow(''),
  inStock: Joi.boolean().allow('')
});

// User validation schema
const userSchema = Joi.object({
  username: Joi.string().min(3).max(30).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required()
});

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required()
});

const validateAuthor = (req, res, next) => {
  const { error } = authorSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ 
      error: 'Validation failed', 
      details: error.details[0].message 
    });
  }
  next();
};

const validateBook = (req, res, next) => {
  const { error } = bookSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ 
      error: 'Validation failed', 
      details: error.details[0].message 
    });
  }
  next();
};

const validateUser = (req, res, next) => {
  const { error } = userSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ 
      error: 'Validation failed', 
      details: error.details[0].message 
    });
  }
  next();
};

const validateLogin = (req, res, next) => {
  const { error } = loginSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ 
      error: 'Validation failed', 
      details: error.details[0].message 
    });
  }
  next();
};

const sanitizeInput = (req, res, next) => {
  // Remove any keys that start with $ or contain .
  const sanitize = (obj) => {
    if (typeof obj === 'object' && obj !== null) {
      Object.keys(obj).forEach(key => {
        if (key.startsWith('$') || key.includes('.')) {
          delete obj[key];
        } else if (typeof obj[key] === 'object') {
          sanitize(obj[key]);
        }
      });
    }
  };
  
  sanitize(req.body);
  next();
};

module.exports = { 
  validateAuthor, 
  validateBook, 
  validateUser, 
  validateLogin 
};