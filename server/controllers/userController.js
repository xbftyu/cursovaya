const User = require('../models/User');
const Post = require('../models/Post');
const Comment = require('../models/Comment');

// @desc    Get user profile (includes posts and comments)
// @route   GET /api/users/profile
// @access  Private
const getUserProfile = async (req, res, next) => {
    try {
        const user = await User.findById(req.user._id)
            .select('-password')
            .populate('friends', 'username avatar')
            .populate('friendRequests', 'username avatar');
            
        if (!user) {
            res.status(404);
            throw new Error('User not found');
        }

        const posts = await Post.find({ author: req.user._id })
            .populate('author', 'username avatar')
            .populate('category', 'name')
            .sort({ createdAt: -1 });
        const comments = await Comment.find({ author: req.user._id }).populate('post', 'title').sort({ createdAt: -1 });

        res.json({
            user,
            posts,
            comments
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
const updateUserProfile = async (req, res, next) => {
    try {
        const user = await User.findById(req.user._id);

        if (user) {
            user.username = req.body.username || user.username;
            user.email = req.body.email || user.email;
            user.avatar = req.body.avatar || user.avatar;
            user.bio = req.body.bio !== undefined ? req.body.bio : user.bio;
            
            if (req.body.password) {
                user.password = req.body.password;
            }

            const updatedUser = await user.save();

            res.json({
                _id: updatedUser._id,
                username: updatedUser.username,
                email: updatedUser.email,
                avatar: updatedUser.avatar,
                bio: updatedUser.bio,
                followedTags: updatedUser.followedTags,
                friends: updatedUser.friends,
            });
        } else {
            res.status(404);
            throw new Error('User not found');
        }
    } catch (error) {
        next(error);
    }
};

// @desc    Follow or unfollow a tag
// @route   PUT /api/users/follow-tag
// @access  Private
const followTag = async (req, res, next) => {
    try {
        const { tag } = req.body;
        
        if (!tag) {
            res.status(400);
            throw new Error('Please provide a tag');
        }

        const user = await User.findById(req.user._id);
        
        if (user.followedTags.includes(tag)) {
            // Unfollow
            user.followedTags = user.followedTags.filter(t => t !== tag);
        } else {
            // Follow
            user.followedTags.push(tag);
        }
        
        await user.save();
        res.json({ tags: user.followedTags });
    } catch (error) {
        next(error);
    }
};

// @desc    Handle friend request (send/accept/decline)
// @route   POST /api/users/friend-request/:id
// @access  Private
const handleFriendRequest = async (req, res, next) => {
    try {
        const { action } = req.body; // 'send', 'accept', 'decline'
        const targetUserId = req.params.id;
        
        if (targetUserId === req.user._id.toString()) {
            res.status(400);
            throw new Error('Cannot add yourself as a friend');
        }

        const targetUser = await User.findById(targetUserId);
        const currentUser = await User.findById(req.user._id);

        if (!targetUser) {
            res.status(404);
            throw new Error('Target user not found');
        }

        if (action === 'send') {
            if (!targetUser.friendRequests.some(id => id.toString() === req.user._id.toString()) &&
                !targetUser.friends.some(id => id.toString() === req.user._id.toString())) {
                targetUser.friendRequests.push(req.user._id);
                await targetUser.save();
            }
            res.json({ message: 'Friend request sent' });
        } else if (action === 'accept') {
            if (currentUser.friendRequests.some(id => id.toString() === targetUserId)) {
                currentUser.friendRequests = currentUser.friendRequests.filter(id => id.toString() !== targetUserId);
                currentUser.friends.push(targetUserId);
                targetUser.friends.push(currentUser._id);
                await currentUser.save();
                await targetUser.save();
                res.json({ message: 'Friend request accepted' });
            } else {
                res.status(400);
                throw new Error('No pending request from this user');
            }
        } else if (action === 'decline') {
            if (currentUser.friendRequests.some(id => id.toString() === targetUserId)) {
                currentUser.friendRequests = currentUser.friendRequests.filter(id => id.toString() !== targetUserId);
                await currentUser.save();
                res.json({ message: 'Friend request declined' });
            } else {
                res.status(400);
                throw new Error('No pending request from this user');
            }
        } else {
            res.status(400);
            throw new Error('Invalid action');
        }
    } catch (error) {
        next(error);
    }
};

// @desc    Get suggested friends
// @route   GET /api/users/suggested-friends
// @access  Private
const getSuggestedFriends = async (req, res, next) => {
    try {
        const currentUser = await User.findById(req.user._id);
        const exclusions = [...currentUser.friends, ...currentUser.friendRequests, req.user._id];
        
        // Find users not in friends or requests, limit to 5
        const suggestions = await User.find({ _id: { $nin: exclusions } })
            .select('username avatar bio followedTags')
            .limit(5);
            
        res.json(suggestions);
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getUserProfile,
    updateUserProfile,
    followTag,
    handleFriendRequest,
    getSuggestedFriends
};
