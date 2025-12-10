/**
 * Comment Routes
 */

const express = require('express');
const router = express.Router();
const {
    getTaskComments,
    addComment,
    deleteComment
} = require('../controllers/commentController');
const { protect } = require('../middlewares/authMiddleware');

// All routes require authentication
router.use(protect);

router.get('/task/:taskId', getTaskComments);
router.post('/', addComment);
router.delete('/:id', deleteComment);

module.exports = router;
