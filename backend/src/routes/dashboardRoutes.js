/**
 * Dashboard Routes
 */

const express = require('express');
const router = express.Router();
const {
    getStats,
    getWeeklyProgress,
    getRecentTasks,
    getUpcomingDeadlines,
    getHeatmapData,
    getFocusScore
} = require('../controllers/dashboardController');
const { protect } = require('../middlewares/authMiddleware');

// All routes require authentication
router.use(protect);

router.get('/stats', getStats);
router.get('/weekly-progress', getWeeklyProgress);
router.get('/recent-tasks', getRecentTasks);
router.get('/upcoming-deadlines', getUpcomingDeadlines);
router.get('/heatmap', getHeatmapData);
router.get('/focus-score', getFocusScore);

module.exports = router;
