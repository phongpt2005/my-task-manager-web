/**
 * Project Routes
 * With role-based permissions
 */

const express = require('express');
const router = express.Router();
const {
    getProjects,
    getProject,
    createProject,
    updateProject,
    deleteProject,
    // Member management
    getMembers,
    addMember,
    removeMember,
    updateMemberRole,
    // Invitations
    inviteMember,
    acceptInvite,
    getMyInvites,
    cancelInvite,
    // Leave
    leaveProject
} = require('../controllers/projectController');
const { protect } = require('../middlewares/authMiddleware');
const { requireProjectAccess, requireProjectRole } = require('../middlewares/projectPermission');

// All routes require authentication
router.use(protect);

// ============ MY INVITES (must be before /:id routes) ============
router.get('/invites/my', getMyInvites);
router.post('/invite/accept', acceptInvite);

// ============ PROJECT CRUD ============
router.route('/')
    .get(getProjects)
    .post(createProject);

router.route('/:id')
    .get(requireProjectAccess, getProject)
    .put(requireProjectRole('owner', 'manager'), updateProject)
    .delete(requireProjectRole('owner'), deleteProject);

// ============ MEMBER MANAGEMENT ============
router.get('/:id/members', requireProjectAccess, getMembers);
router.post('/:id/members', requireProjectRole('owner', 'manager'), addMember);
router.delete('/:id/members/:userId', requireProjectRole('owner'), removeMember);
router.put('/:id/members/:userId', requireProjectRole('owner'), updateMemberRole);

// ============ INVITATIONS ============
router.post('/:id/invite', requireProjectRole('owner', 'manager'), inviteMember);
router.delete('/:id/invite/:inviteId', requireProjectRole('owner', 'manager'), cancelInvite);

// ============ LEAVE PROJECT ============
router.post('/:id/leave', requireProjectAccess, leaveProject);

module.exports = router;

