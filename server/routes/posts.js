const express = require('express');
const router = express.Router();
const { getPosts, getPostById, createPost, deletePost, toggleLike, updatePost } = require('../controllers/postController');
const { protect } = require('../middleware/authMiddleware');

router.route('/')
  .get(getPosts)
  .post(protect, createPost);

router.route('/:id')
  .get(getPostById)
  .put(protect, updatePost)
  .delete(protect, deletePost);

router.route('/:id/like')
  .put(protect, toggleLike);

module.exports = router;