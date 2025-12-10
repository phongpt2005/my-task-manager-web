/**
 * Task Routes
 * With project permission integration
 */

const express = require('express');
const router = express.Router();
const {
    getTasks,
    getTask,
    createTask,
    updateTask,
    updateTaskStatus,
    deleteTask,
    getTasksByDate,
    uploadAttachment,
    reorderTasks,
    startTimer,
    stopTimer,
    logPomodoro
} = require('../controllers/taskController');
const { protect } = require('../middlewares/authMiddleware');
const { requireProjectAccess, requirePermission, canEditTask } = require('../middlewares/projectPermission');
const upload = require('../middlewares/upload');

// All routes require authentication
router.use(protect);

// ============ TASK CRUD ============
// GET all tasks - filter by user's projects
router.get('/', getTasks);

// POST create task - require permission if project specified
router.post('/', requirePermission('create_task'), createTask);

// Bulk reorder for Kanban
router.patch('/reorder', reorderTasks);

// Calendar route
router.get('/calendar/:date', getTasksByDate);

// ============ SINGLE TASK ROUTES ============
// GET single task - require project access
router.get('/:id', requireProjectAccess, getTask);

// PUT update task - require edit permission
router.put('/:id', requireProjectAccess, canEditTask, updateTask);

// DELETE task - require delete permission (owner/manager only)
router.delete('/:id', requirePermission('delete_task'), deleteTask);

// ============ STATUS UPDATE ============
// PATCH status (for Kanban drag & drop)
router.patch('/:id/status', requireProjectAccess, canEditTask, updateTaskStatus);

// ============ FILE UPLOAD ============
router.post('/:id/upload', requireProjectAccess, canEditTask, upload.single('file'), uploadAttachment);

// ============ TIME TRACKING ============
router.post('/:id/start-timer', requireProjectAccess, canEditTask, startTimer);
router.post('/:id/stop-timer', requireProjectAccess, canEditTask, stopTimer);
router.post('/:id/pomodoro', requireProjectAccess, canEditTask, logPomodoro);

module.exports = router;

