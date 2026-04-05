const express = require('express');
const router = express.Router();
const Category = require('../models/Category');

// @desc    Get all categories
// @route   GET /api/categories
// @access  Public
router.get('/', async (req, res) => {
  try {
    const categories = await Category.find({});
    res.json(categories);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
});

// @desc    Create new category
// @route   POST /api/categories
// @access  Public
router.post('/', async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) return res.status(400).json({ message: 'Category name is required' });
    
    let category = await Category.findOne({ name });
    if (!category) {
      category = await Category.create({ name });
    }
    res.status(201).json(category);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
});

module.exports = router;
