const User = require('../models/User');
const AdminLog = require('../models/AdminLog');

const logAdminAction = async (adminId, action, targetId, details) => {
  await AdminLog.create({ adminId, action, targetId, details });
};

const getUsers = async (req, res) => {
  try {
    const users = await User.find({}).select('-password');
    res.json(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message || 'Server Error' });
  }
};

const toggleRoleBlock = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (user) {
      if ((user.role === 'admin' || user.role === 'moderator') && user._id.toString() !== req.user._id.toString() && req.user.role === 'moderator') {
        return res.status(403).json({ message: 'Moderators cannot block admins or other moderators' });
      }
      if (user.role === 'admin' && user._id.toString() !== req.user._id.toString() && req.user.role === 'admin') {
        return res.status(400).json({ message: 'Cannot block another admin' });
      }
      user.isBlocked = !user.isBlocked;
      const updatedUser = await user.save();

      await logAdminAction(req.user._id, user.isBlocked ? 'BLOCK_USER' : 'UNBLOCK_USER', user._id, `Admin changed block status for ${user.username}`);

      res.json(updatedUser);
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

const getAdminLogs = async (req, res) => {
  try {
    const logs = await AdminLog.find({}).populate('adminId', 'username').sort({ createdAt: -1 }).limit(100);
    res.json(logs);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message || 'Server Error' });
  }
};

const updateUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    if (user.role === 'admin' && req.user.role === 'moderator') {
      return res.status(403).json({ message: 'Moderators cannot update admins' });
    }

    user.username = req.body.username || user.username;
    user.email = req.body.email || user.email;
    user.avatar = req.body.avatar || user.avatar;
    user.bio = req.body.bio !== undefined ? req.body.bio : user.bio;

    if (req.user.role === 'admin' && req.body.role) {
        user.role = req.body.role;
    }

    if (req.body.password) {
      const bcrypt = require('bcryptjs');
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(req.body.password, salt);
    }

    const updatedUser = await user.save();
    await logAdminAction(req.user._id, 'UPDATE_USER', user._id, `Admin updated profile for ${user.username}`);

    res.json(updatedUser);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

const generatePopularPosts = async (req, res) => {
  try {
    const Post = require('../models/Post');
    const Category = require('../models/Category');

    const adminUser = await User.findById(req.user._id);
    const allUsers = await User.find({});

    const categories = await Category.find({});
    const randomCategory = categories.length > 0 ? categories[Math.floor(Math.random() * categories.length)]._id : null;

    const mockTitles = [
      "The Future of Artificial Intelligence in 2026",
      "Why React is still dominating the frontend landscape",
      "The ultimate guide to building scalable Node.js architectures",
      "I built a SaaS in 3 days, here's what happened",
      "Top 10 productivity hacks for remote developers"
    ];

    const mockPosts = [];
    for (let i = 0; i < 3; i++) {
      const randomUser = allUsers.length > 0 ? allUsers[Math.floor(Math.random() * allUsers.length)] : adminUser;
      const post = new Post({
        title: mockTitles[Math.floor(Math.random() * mockTitles.length)] + ` #${Math.floor(Math.random() * 1000)}`,
        content: "This is a brilliantly written post containing profound insights into technology and the modern era.",
        author: randomUser._id,
        category: randomCategory,
        image: `https://picsum.photos/seed/${Math.random()}/800/400`,
        views: Math.floor(Math.random() * 5000) + 100,
        likes: []
      });
      const saved = await post.save();
      mockPosts.push(saved);
    }

    await logAdminAction(req.user._id, 'GENERATE_POSTS', null, `Generated 3 popular mock posts`);

    res.status(201).json({ message: "Generated successfully", posts: mockPosts });
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

module.exports = {
  getUsers,
  toggleRoleBlock,
  getAdminLogs,
  updateUser,
  generatePopularPosts
};
