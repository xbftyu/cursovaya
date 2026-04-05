const express = require('express');
const router = express.Router();
const { getUsers, toggleRoleBlock, getAdminLogs, updateUser, generatePopularPosts } = require('../controllers/adminController');
const { protect } = require('../middleware/authMiddleware');
const { admin } = require('../middleware/adminMiddleware');

router.route('/users').get(protect, admin, getUsers);
router.route('/users/:id').put(protect, admin, updateUser);
router.route('/users/:id/block').put(protect, admin, toggleRoleBlock);
router.route('/logs').get(protect, admin, getAdminLogs);
router.route('/generate-popular').post(protect, admin, generatePopularPosts);

module.exports = router;
