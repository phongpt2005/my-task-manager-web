/**
 * Admin Routes
 * Routes for admin-only operations
 */

const express = require('express');
const router = express.Router();
const {
    getAllUsers,
    getUser,
    updateUserRole,
    toggleUserStatus,
    getSystemStats,
    deleteUser
} = require('../controllers/adminController');
const { protect, adminOnly } = require('../middlewares/authMiddleware');

// All routes require authentication and admin role
router.use(protect);
router.use(adminOnly);

// System stats
router.get('/stats', getSystemStats);

// User management
router.get('/users', getAllUsers);
router.get('/users/:id', getUser);
router.put('/users/:id/role', updateUserRole);
router.put('/users/:id/status', toggleUserStatus);
router.delete('/users/:id', deleteUser);

module.exports = router;
