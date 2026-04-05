const Post = require('../models/Post');

// @desc    Fetch all posts (with pagination, sort, search)
// @route   GET /api/posts
// @access  Public
const getPosts = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    let query = {};

    if (req.query.search) {
      query.$text = { $search: req.query.search };
    }
    
    if (req.query.category) {
      query.category = req.query.category;
    }

    let sortConfig = { createdAt: -1 }; // default new
    if (req.query.sort === 'popular') {
      sortConfig = { views: -1 };
    }

    const posts = await Post.find(query)
      .populate('author', 'username avatar')
      .populate('category', 'name')
      .populate('tags', 'name')
      .sort(sortConfig)
      .skip(skip)
      .limit(limit);

    const total = await Post.countDocuments(query);

    res.json({
      posts,
      page,
      pages: Math.ceil(total / limit),
      total
    });
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Fetch single post
// @route   GET /api/posts/:id
// @access  Public
const getPostById = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id)
      .populate('author', 'username avatar')
      .populate('category', 'name');

    if (post) {
      // Increment view count
      post.views += 1;
      await post.save();
      res.json(post);
    } else {
      res.status(404).json({ message: 'Post not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Create a post
// @route   POST /api/posts
// @access  Private
const createPost = async (req, res) => {
  try {
    const { title, content, category, tags, image } = req.body;

    const post = new Post({
      title,
      content,
      category: category || null,
      tags: tags || [],
      image: image || `https://picsum.photos/seed/${Date.now()}/600/300`,
      author: req.user._id
    });

    const createdPost = await post.save();
    await createdPost.populate('author', 'username avatar');
    if (createdPost.category) await createdPost.populate('category', 'name');
    if (createdPost.tags && createdPost.tags.length) await createdPost.populate('tags', 'name');
    res.status(201).json(createdPost);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Delete a post
// @route   DELETE /api/posts/:id
// @access  Private
const deletePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    // Check ownership or moderator/admin rights
    if (post.author.toString() !== req.user._id.toString() && req.user.role !== 'admin' && req.user.role !== 'moderator') {
      return res.status(401).json({ message: 'User not authorized to delete this post' });
    }

    await post.deleteOne();
    res.json({ message: 'Post removed' });
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Like / Unlike a post
// @route   PUT /api/posts/:id/like
// @access  Private
const toggleLike = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found' });

    const isLiked = post.likes.includes(req.user._id);

    if (isLiked) {
      post.likes = post.likes.filter((id) => id.toString() !== req.user._id.toString());
    } else {
      post.likes.push(req.user._id);
    }

    await post.save();
    res.json({ likes: post.likes });
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Update a post
// @route   PUT /api/posts/:id
// @access  Private
const updatePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    // Check ownership or moderator/admin rights
    if (post.author.toString() !== req.user._id.toString() && req.user.role !== 'admin' && req.user.role !== 'moderator') {
      return res.status(401).json({ message: 'User not authorized to edit this post' });
    }

    post.title = req.body.title || post.title;
    post.content = req.body.content || post.content;
    if (req.body.category !== undefined) post.category = req.body.category || null;
    if (req.body.tags !== undefined) post.tags = req.body.tags;
    if (req.body.image) post.image = req.body.image;

    const updatedPost = await post.save();
    await updatedPost.populate('author', 'username avatar');
    if (updatedPost.category) await updatedPost.populate('category', 'name');
    if (updatedPost.tags && updatedPost.tags.length) await updatedPost.populate('tags', 'name');

    res.json(updatedPost);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

module.exports = {
  getPosts,
  getPostById,
  createPost,
  deletePost,
  toggleLike,
  updatePost
};
