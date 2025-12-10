/**
 * AI Routes
 */

const express = require('express');
const router = express.Router();
const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage() }); // Store in memory for direct processing

const {
    generatePlan,
    summarize,
    suggestPriority,
    rewriteNotes,
    breakdownTask,
    predictDeadline,
    analyzeHabits,
    handleOCR
} = require('../controllers/aiController');
const { protect } = require('../middlewares/authMiddleware');

// All routes require authentication
router.use(protect);

router.post('/generate-plan', generatePlan);
router.post('/summarize', summarize);
router.post('/suggest-priority', suggestPriority);
router.post('/rewrite-notes', rewriteNotes);

// New features
router.post('/breakdown', breakdownTask);
router.post('/predict-deadline', predictDeadline);
router.get('/analyze-habits', analyzeHabits); // GET because it doesn't need body, just user context
router.post('/ocr', upload.single('image'), handleOCR);

module.exports = router;
