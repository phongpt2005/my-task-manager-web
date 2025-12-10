/**
 * Project Controller
 * Handles project CRUD operations and member management
 */

const crypto = require('crypto');
const Project = require('../models/Project');
const ProjectInvite = require('../models/ProjectInvite');
const Task = require('../models/Task');
const User = require('../models/User');
const { isValidObjectId } = require('../utils/validators');
const { createNotification } = require('./notificationController');

/**
 * @desc    Get all projects (user is member or owner)
 * @route   GET /api/projects
 * @access  Private
 */
const getProjects = async (req, res) => {
    try {
        // Admin sees all projects
        const isAdmin = req.user.role === 'admin';

        let query;
        if (isAdmin) {
            query = { isActive: true };
        } else {
            query = {
                isActive: true,
                $or: [
                    { createdBy: req.user.id },
                    { 'members.user': req.user.id }
                ]
            };
        }

        const projects = await Project.find(query)
            .populate('createdBy', 'name email avatar')
            .populate('members.user', 'name email avatar')
            .sort({ createdAt: -1 });

        // Get task count for each project
        const projectsWithStats = await Promise.all(
            projects.map(async (project) => {
                const taskCount = await Task.countDocuments({ project: project._id });
                const completedCount = await Task.countDocuments({
                    project: project._id,
                    status: 'done'
                });

                // Get user's role in this project
                let userRole = project.getUserRole(req.user.id);
                if (!userRole && project.createdBy._id.toString() === req.user.id.toString()) {
                    userRole = 'owner';
                }
                if (isAdmin) userRole = 'admin';

                return {
                    ...project.toObject(),
                    taskCount,
                    completedCount,
                    progress: taskCount > 0 ? Math.round((completedCount / taskCount) * 100) : 0,
                    userRole
                };
            })
        );

        res.json({
            success: true,
            data: { projects: projectsWithStats }
        });
    } catch (error) {
        console.error('Get Projects Error:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi lấy danh sách dự án'
        });
    }
};

/**
 * @desc    Get single project with members
 * @route   GET /api/projects/:id
 * @access  Private
 */
const getProject = async (req, res) => {
    try {
        const { id } = req.params;

        if (!isValidObjectId(id)) {
            return res.status(400).json({
                success: false,
                message: 'ID dự án không hợp lệ'
            });
        }

        const project = await Project.findById(id)
            .populate('createdBy', 'name email avatar')
            .populate('members.user', 'name email avatar');

        if (!project) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy dự án'
            });
        }

        // Check access (admin or member)
        const isAdmin = req.user.role === 'admin';
        if (!isAdmin && !project.canAccess(req.user.id)) {
            return res.status(403).json({
                success: false,
                message: 'Bạn không có quyền truy cập dự án này'
            });
        }

        // Get tasks
        const tasks = await Task.find({ project: id })
            .populate('createdBy', 'name avatar')
            .sort({ createdAt: -1 });

        // Get pending invites (if owner/manager)
        let pendingInvites = [];
        const userRole = project.getUserRole(req.user.id);
        if (isAdmin || userRole === 'owner' || userRole === 'manager' ||
            project.createdBy._id.toString() === req.user.id.toString()) {
            pendingInvites = await ProjectInvite.find({
                project: id,
                status: 'pending'
            }).select('email role createdAt expiresAt');
        }

        res.json({
            success: true,
            data: {
                project,
                tasks,
                pendingInvites,
                userRole: isAdmin ? 'admin' : (userRole || 'owner')
            }
        });
    } catch (error) {
        console.error('Get Project Error:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi lấy thông tin dự án'
        });
    }
};

/**
 * @desc    Create new project
 * @route   POST /api/projects
 * @access  Private
 */
const createProject = async (req, res) => {
    try {
        const { name, description, color, icon } = req.body;

        if (!name) {
            return res.status(400).json({
                success: false,
                message: 'Vui lòng nhập tên dự án'
            });
        }

        const project = await Project.create({
            name,
            description,
            color: color || '#667eea',
            icon: icon || '📁',
            createdBy: req.user.id,
            // Creator is automatically owner
            members: [{
                user: req.user.id,
                role: 'owner',
                joinedAt: new Date()
            }]
        });

        const populatedProject = await Project.findById(project._id)
            .populate('createdBy', 'name email avatar')
            .populate('members.user', 'name email avatar');

        res.status(201).json({
            success: true,
            message: 'Tạo dự án thành công',
            data: { project: populatedProject }
        });
    } catch (error) {
        console.error('Create Project Error:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi tạo dự án'
        });
    }
};

/**
 * @desc    Update project
 * @route   PUT /api/projects/:id
 * @access  Private (owner, manager, admin)
 */
const updateProject = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, description, color, icon } = req.body;

        if (!isValidObjectId(id)) {
            return res.status(400).json({
                success: false,
                message: 'ID dự án không hợp lệ'
            });
        }

        const project = await Project.findByIdAndUpdate(
            id,
            { name, description, color, icon },
            { new: true, runValidators: true }
        ).populate('members.user', 'name email avatar');

        if (!project) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy dự án'
            });
        }

        res.json({
            success: true,
            message: 'Cập nhật dự án thành công',
            data: { project }
        });
    } catch (error) {
        console.error('Update Project Error:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi cập nhật dự án'
        });
    }
};

/**
 * @desc    Delete project (soft delete)
 * @route   DELETE /api/projects/:id
 * @access  Private (owner, admin)
 */
const deleteProject = async (req, res) => {
    try {
        const { id } = req.params;

        if (!isValidObjectId(id)) {
            return res.status(400).json({
                success: false,
                message: 'ID dự án không hợp lệ'
            });
        }

        const project = await Project.findByIdAndUpdate(
            id,
            { isActive: false },
            { new: true }
        );

        if (!project) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy dự án'
            });
        }

        res.json({
            success: true,
            message: 'Xóa dự án thành công'
        });
    } catch (error) {
        console.error('Delete Project Error:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi xóa dự án'
        });
    }
};

// ==================== MEMBER MANAGEMENT ====================

/**
 * @desc    Get project members
 * @route   GET /api/projects/:id/members
 * @access  Private
 */
const getMembers = async (req, res) => {
    try {
        const project = await Project.findById(req.params.id)
            .populate('members.user', 'name email avatar')
            .populate('createdBy', 'name email avatar');

        if (!project) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy dự án'
            });
        }

        res.json({
            success: true,
            data: {
                members: project.members,
                createdBy: project.createdBy
            }
        });
    } catch (error) {
        console.error('Get Members Error:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi lấy danh sách thành viên'
        });
    }
};

/**
 * @desc    Add member to project directly
 * @route   POST /api/projects/:id/members
 * @access  Private (owner, manager, admin)
 */
const addMember = async (req, res) => {
    try {
        const { userId, email, role = 'member' } = req.body;
        const projectId = req.params.id;

        // Validate role
        if (!['manager', 'member', 'viewer'].includes(role)) {
            return res.status(400).json({
                success: false,
                message: 'Vai trò không hợp lệ'
            });
        }

        // Find user by ID or email
        let user;
        if (userId) {
            user = await User.findById(userId);
        } else if (email) {
            user = await User.findOne({ email: email.toLowerCase() });
        }

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy người dùng'
            });
        }

        const project = await Project.findById(projectId);

        // Check if already a member
        if (project.members.some(m => m.user.toString() === user._id.toString())) {
            return res.status(400).json({
                success: false,
                message: 'Người dùng đã là thành viên của dự án'
            });
        }

        // Add member
        project.members.push({
            user: user._id,
            role,
            joinedAt: new Date()
        });

        await project.save();

        // Send notification to new member
        await createNotification(req.app.get('io'), {
            recipient: user._id,
            type: 'stats',
            title: 'Thêm vào dự án! 📂',
            message: `Bạn đã được thêm vào dự án "${project.name}" với vai trò ${role}.`,
            data: { projectId: project._id, link: `/projects/${project._id}` }
        });

        const updatedProject = await Project.findById(projectId)
            .populate('members.user', 'name email avatar');

        res.json({
            success: true,
            message: 'Thêm thành viên thành công',
            data: { members: updatedProject.members }
        });
    } catch (error) {
        console.error('Add Member Error:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi thêm thành viên'
        });
    }
};

/**
 * @desc    Remove member from project
 * @route   DELETE /api/projects/:id/members/:userId
 * @access  Private (owner, admin)
 */
const removeMember = async (req, res) => {
    try {
        const { id: projectId, userId } = req.params;

        const project = await Project.findById(projectId);

        if (!project) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy dự án'
            });
        }

        // Cannot remove owner
        const memberToRemove = project.members.find(m => m.user.toString() === userId);
        if (memberToRemove && memberToRemove.role === 'owner') {
            return res.status(400).json({
                success: false,
                message: 'Không thể xóa chủ sở hữu khỏi dự án'
            });
        }

        // Remove member
        project.members = project.members.filter(m => m.user.toString() !== userId);
        await project.save();

        // Notify removed user
        await createNotification(req.app.get('io'), {
            recipient: userId,
            type: 'stats',
            title: 'Rời khỏi dự án 📂',
            message: `Bạn đã bị xóa khỏi dự án "${project.name}".`,
            data: { link: '/projects' }
        });

        res.json({
            success: true,
            message: 'Xóa thành viên thành công'
        });
    } catch (error) {
        console.error('Remove Member Error:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi xóa thành viên'
        });
    }
};

/**
 * @desc    Update member role
 * @route   PUT /api/projects/:id/members/:userId
 * @access  Private (owner, admin)
 */
const updateMemberRole = async (req, res) => {
    try {
        const { id: projectId, userId } = req.params;
        const { role } = req.body;

        if (!['owner', 'manager', 'member', 'viewer'].includes(role)) {
            return res.status(400).json({
                success: false,
                message: 'Vai trò không hợp lệ'
            });
        }

        const project = await Project.findById(projectId);

        if (!project) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy dự án'
            });
        }

        // Find and update member
        const memberIndex = project.members.findIndex(m => m.user.toString() === userId);

        if (memberIndex === -1) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy thành viên'
            });
        }

        // If changing to owner, demote current owner to manager
        if (role === 'owner') {
            project.members.forEach(m => {
                if (m.role === 'owner') {
                    m.role = 'manager';
                }
            });
        }

        project.members[memberIndex].role = role;
        await project.save();

        // Notify user about role change
        await createNotification(req.app.get('io'), {
            recipient: userId,
            type: 'stats',
            title: 'Thay đổi vai trò! 🔄',
            message: `Vai trò của bạn trong dự án "${project.name}" đã được đổi thành ${role}.`,
            data: { projectId: project._id, link: `/projects/${project._id}` }
        });

        const updatedProject = await Project.findById(projectId)
            .populate('members.user', 'name email avatar');

        res.json({
            success: true,
            message: 'Cập nhật vai trò thành công',
            data: { members: updatedProject.members }
        });
    } catch (error) {
        console.error('Update Member Role Error:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi cập nhật vai trò'
        });
    }
};

// ==================== INVITATIONS ====================

/**
 * @desc    Invite member by email
 * @route   POST /api/projects/:id/invite
 * @access  Private (owner, manager, admin)
 */
const inviteMember = async (req, res) => {
    try {
        const { email, role = 'member' } = req.body;
        const projectId = req.params.id;

        if (!email) {
            return res.status(400).json({
                success: false,
                message: 'Vui lòng nhập email'
            });
        }

        if (!['manager', 'member', 'viewer'].includes(role)) {
            return res.status(400).json({
                success: false,
                message: 'Vai trò không hợp lệ'
            });
        }

        const project = await Project.findById(projectId);

        if (!project) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy dự án'
            });
        }

        // Check if user already exists and is a member
        const existingUser = await User.findOne({ email: email.toLowerCase() });
        if (existingUser && project.members.some(m => m.user.toString() === existingUser._id.toString())) {
            return res.status(400).json({
                success: false,
                message: 'Người dùng đã là thành viên của dự án'
            });
        }

        // Check if there's already a pending invite
        const existingInvite = await ProjectInvite.findOne({
            project: projectId,
            email: email.toLowerCase(),
            status: 'pending'
        });

        if (existingInvite) {
            return res.status(400).json({
                success: false,
                message: 'Đã có lời mời đang chờ xác nhận cho email này'
            });
        }

        // Create invite token
        const token = crypto.randomBytes(32).toString('hex');

        const invite = await ProjectInvite.create({
            project: projectId,
            invitedBy: req.user.id,
            email: email.toLowerCase(),
            role,
            token
        });

        // TODO: Send email with invite link
        // const inviteLink = `${process.env.FRONTEND_URL}/invite/${token}`;

        res.status(201).json({
            success: true,
            message: 'Gửi lời mời thành công',
            data: {
                invite: {
                    email: invite.email,
                    role: invite.role,
                    expiresAt: invite.expiresAt,
                    token: invite.token // For testing, remove in production
                }
            }
        });
    } catch (error) {
        console.error('Invite Member Error:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi gửi lời mời'
        });
    }
};

/**
 * @desc    Accept invitation
 * @route   POST /api/projects/invite/accept
 * @access  Private
 */
const acceptInvite = async (req, res) => {
    try {
        const { token } = req.body;

        if (!token) {
            return res.status(400).json({
                success: false,
                message: 'Thiếu token'
            });
        }

        const invite = await ProjectInvite.findOne({ token })
            .populate('project', 'name');

        if (!invite) {
            return res.status(404).json({
                success: false,
                message: 'Lời mời không tồn tại'
            });
        }

        if (!invite.isValid()) {
            return res.status(400).json({
                success: false,
                message: 'Lời mời đã hết hạn hoặc đã được sử dụng'
            });
        }

        // Verify email matches
        if (invite.email !== req.user.email.toLowerCase()) {
            return res.status(403).json({
                success: false,
                message: 'Lời mời này không dành cho bạn'
            });
        }

        // Add user to project
        const project = await Project.findById(invite.project);

        if (!project) {
            return res.status(404).json({
                success: false,
                message: 'Dự án không còn tồn tại'
            });
        }

        project.members.push({
            user: req.user.id,
            role: invite.role,
            joinedAt: new Date()
        });

        await project.save();

        // Update invite status
        invite.status = 'accepted';
        await invite.save();

        // Notify inviter
        await createNotification(req.app.get('io'), {
            recipient: invite.invitedBy,
            type: 'stats',
            title: 'Lời mời đã được chấp nhận! ✅',
            message: `${req.user.name} đã tham gia dự án "${project.name}".`,
            data: { projectId: project._id }
        });

        res.json({
            success: true,
            message: 'Tham gia dự án thành công',
            data: { project }
        });
    } catch (error) {
        console.error('Accept Invite Error:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi chấp nhận lời mời'
        });
    }
};

/**
 * @desc    Get my pending invites
 * @route   GET /api/projects/invites/my
 * @access  Private
 */
const getMyInvites = async (req, res) => {
    try {
        const invites = await ProjectInvite.find({
            email: req.user.email.toLowerCase(),
            status: 'pending',
            expiresAt: { $gt: new Date() }
        })
            .populate('project', 'name icon color')
            .populate('invitedBy', 'name email');

        res.json({
            success: true,
            data: { invites }
        });
    } catch (error) {
        console.error('Get My Invites Error:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi lấy danh sách lời mời'
        });
    }
};

/**
 * @desc    Cancel/revoke invitation
 * @route   DELETE /api/projects/:id/invite/:inviteId
 * @access  Private (owner, manager, admin)
 */
const cancelInvite = async (req, res) => {
    try {
        const { inviteId } = req.params;

        const invite = await ProjectInvite.findByIdAndDelete(inviteId);

        if (!invite) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy lời mời'
            });
        }

        res.json({
            success: true,
            message: 'Hủy lời mời thành công'
        });
    } catch (error) {
        console.error('Cancel Invite Error:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi hủy lời mời'
        });
    }
};

/**
 * @desc    Leave project
 * @route   POST /api/projects/:id/leave
 * @access  Private
 */
const leaveProject = async (req, res) => {
    try {
        const projectId = req.params.id;
        const userId = req.user.id;

        const project = await Project.findById(projectId);

        if (!project) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy dự án'
            });
        }

        // Check if user is owner
        const member = project.members.find(m => m.user.toString() === userId);
        if (member && member.role === 'owner') {
            return res.status(400).json({
                success: false,
                message: 'Chủ sở hữu không thể rời dự án. Hãy chuyển quyền sở hữu trước.'
            });
        }

        // Remove user from members
        project.members = project.members.filter(m => m.user.toString() !== userId);
        await project.save();

        res.json({
            success: true,
            message: 'Rời dự án thành công'
        });
    } catch (error) {
        console.error('Leave Project Error:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi rời dự án'
        });
    }
};

module.exports = {
    // Project CRUD
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
};

