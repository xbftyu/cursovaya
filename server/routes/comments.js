const express = require('express');
const router = express.Router();
const { getCommentsByPost, createComment, deleteComment, updateComment } = require('../controllers/commentController');
const { protect } = require('../middleware/authMiddleware');

router.route('/')
  .post(protect, createComment);

router.route('/post/:postId')
  .get(getCommentsByPost);

router.route('/:id')
  .put(protect, updateComment)
  .delete(protect, deleteComment);

module.exports = router;