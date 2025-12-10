/**
 * Activity Routes
 */

const express = require('express');
const router = express.Router();
const {
    getActivities,
    getMyActivities,
    getTaskActivities
} = require('../controllers/activityController');
const { protect } = require('../middlewares/authMiddleware');

router.use(protect);

router.get('/', getActivities);
router.get('/my', getMyActivities);
router.get('/task/:taskId', getTaskActivities);

module.exports = router;
