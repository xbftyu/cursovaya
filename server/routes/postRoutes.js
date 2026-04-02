const express = require('express');
const router = express.Router();
const { getPosts, getPost, createPost, deletePost, addComment } = require('../controllers/postController');
const { protect } = require('../middleware/authMiddleware');

router.route('/').get(getPosts).post(protect, createPost);
router.route('/:id').get(getPost).delete(protect, deletePost);
router.route('/:id/comment').post(protect, addComment);

module.exports = router;
