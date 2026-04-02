const Post = require('../models/Post');
const Comment = require('../models/Comment');

// @desc    Get all posts
// @route   GET /api/posts
// @access  Public
const getPosts = async (req, res, next) => {
    try {
        const posts = await Post.find()
            .populate('author', 'username')
            .sort({ createdAt: -1 });
        res.status(200).json(posts);
    } catch (error) {
        next(error);
    }
};

// @desc    Get single post along with its comments
// @route   GET /api/posts/:id
// @access  Public
const getPost = async (req, res, next) => {
    try {
        const post = await Post.findById(req.params.id).populate('author', 'username');
        if (!post) {
            res.status(404);
            throw new Error('Post not found');
        }

        const comments = await Comment.find({ postId: req.params.id }).populate(
            'author',
            'username'
        ).sort({ createdAt: 1 });

        res.status(200).json({ post, comments });
    } catch (error) {
        next(error);
    }
};

// @desc    Create post
// @route   POST /api/posts
// @access  Private
const createPost = async (req, res, next) => {
    try {
        const { title, content } = req.body;

        if (!title || !content) {
            res.status(400);
            throw new Error('Please add title and content');
        }

        const post = await Post.create({
            title,
            content,
            author: req.user.id,
        });

        const populatedPost = await Post.findById(post._id).populate('author', 'username');

        res.status(201).json(populatedPost);
    } catch (error) {
        next(error);
    }
};

// @desc    Delete post
// @route   DELETE /api/posts/:id
// @access  Private
const deletePost = async (req, res, next) => {
    try {
        const post = await Post.findById(req.params.id);

        if (!post) {
            res.status(404);
            throw new Error('Post not found');
        }

        // Check for user
        if (!req.user) {
            res.status(401);
            throw new Error('User not found');
        }

        // Make sure the logged in user matches the post author
        if (post.author.toString() !== req.user.id) {
            res.status(401);
            throw new Error('User not authorized');
        }

        await post.deleteOne();

        // Also delete comments associated with post
        await Comment.deleteMany({ postId: req.params.id });

        res.status(200).json({ id: req.params.id });
    } catch (error) {
        next(error);
    }
};

// @desc    Add comment to post
// @route   POST /api/posts/:id/comment
// @access  Private
const addComment = async (req, res, next) => {
    try {
        const { text } = req.body;
        const postId = req.params.id;

        if (!text) {
            res.status(400);
            throw new Error('Please add comment text');
        }

        const comment = await Comment.create({
            text,
            author: req.user.id,
            postId,
        });

        const populatedComment = await Comment.findById(comment._id).populate('author', 'username');

        res.status(201).json(populatedComment);
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getPosts,
    getPost,
    createPost,
    deletePost,
    addComment,
};
