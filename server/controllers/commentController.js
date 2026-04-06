const Comment = require('../models/Comment');

const getCommentsByPost = async (req, res) => {
  try {
    const comments = await Comment.find({ post: req.params.postId }).populate('author', 'username avatar');
    res.json(comments);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

const createComment = async (req, res) => {
  try {
    const { text, postId } = req.body;

    const comment = new Comment({
      text,
      post: postId,
      author: req.user._id
    });

    const savedComment = await comment.save();
    const populatedComment = await savedComment.populate('author', 'username avatar');

    res.status(201).json(populatedComment);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

const deleteComment = async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);

    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }

    if (comment.author.toString() !== req.user._id.toString() && req.user.role !== 'admin' && req.user.role !== 'moderator') {
      return res.status(401).json({ message: 'User not authorized' });
    }

    await comment.deleteOne();
    res.json({ message: 'Comment removed' });
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

const updateComment = async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);

    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }

    if (comment.author.toString() !== req.user._id.toString() && req.user.role !== 'admin' && req.user.role !== 'moderator') {
      return res.status(401).json({ message: 'User not authorized' });
    }

    comment.text = req.body.text || comment.text;
    const updatedComment = await comment.save();
    const populatedComment = await updatedComment.populate('author', 'username avatar');

    res.json(populatedComment);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

module.exports = {
  getCommentsByPost,
  createComment,
  deleteComment,
  updateComment
};
