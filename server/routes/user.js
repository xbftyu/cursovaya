const express = require('express');
const router = express.Router();
const {
    getUserProfile,
    updateUserProfile,
    followTag,
    handleFriendRequest,
    getSuggestedFriends,
} = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');

router.route('/profile')
    .get(protect, getUserProfile)
    .put(protect, updateUserProfile);

router.route('/follow-tag').put(protect, followTag);

router.route('/friend-request/:id').post(protect, handleFriendRequest);

router.route('/suggested-friends').get(protect, getSuggestedFriends);

module.exports = router;
