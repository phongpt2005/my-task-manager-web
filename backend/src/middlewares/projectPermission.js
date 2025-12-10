/**
 * Project Permission Middleware
 * Check user's permission level in a project
 */

const Project = require('../models/Project');
const User = require('../models/User');
const { isValidObjectId } = require('../utils/validators');

/**
 * Permission levels and their capabilities
 */
const PERMISSIONS = {
    owner: ['view', 'create_task', 'edit_task', 'delete_task', 'invite_member', 'manage_roles', 'delete_project', 'edit_project'],
    manager: ['view', 'create_task', 'edit_task', 'delete_task', 'invite_member'],
    member: ['view', 'create_task', 'edit_own_task'],
    viewer: ['view']
};

/**
 * Check if user is system admin
 */
const isSystemAdmin = (user) => {
    return user && user.role === 'admin';
};

/**
 * Get project from request (supports projectId in params, body, or query)
 */
const getProjectId = (req) => {
    return req.params.projectId || req.params.id || req.body.projectId || req.body.project || req.query.projectId;
};

/**
 * Middleware: Require project access (any role)
 */
const requireProjectAccess = async (req, res, next) => {
    try {
        const projectId = getProjectId(req);

        // If no project specified, let the route handle it
        if (!projectId) {
            return next();
        }

        if (!isValidObjectId(projectId)) {
            return res.status(400).json({
                success: false,
                message: 'ID dự án không hợp lệ'
            });
        }

        // System admin has access to all
        if (isSystemAdmin(req.user)) {
            req.isAdmin = true;
            return next();
        }

        const project = await Project.findById(projectId);

        if (!project) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy dự án'
            });
        }

        // Check if user can access
        if (!project.canAccess(req.user.id)) {
            return res.status(403).json({
                success: false,
                message: 'Bạn không có quyền truy cập dự án này'
            });
        }

        // Attach project and user's role to request
        req.project = project;
        req.projectRole = project.getUserRole(req.user.id);

        // If user is creator but not in members, they are effectively owner
        if (!req.projectRole && project.createdBy.toString() === req.user.id.toString()) {
            req.projectRole = 'owner';
        }

        next();
    } catch (error) {
        console.error('Project Access Error:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi kiểm tra quyền truy cập'
        });
    }
};

/**
 * Middleware factory: Require specific role(s)
 * Usage: requireProjectRole('owner', 'manager')
 */
const requireProjectRole = (...allowedRoles) => {
    return async (req, res, next) => {
        try {
            const projectId = getProjectId(req);

            if (!projectId) {
                return res.status(400).json({
                    success: false,
                    message: 'Thiếu ID dự án'
                });
            }

            // System admin has all permissions
            if (isSystemAdmin(req.user)) {
                req.isAdmin = true;
                return next();
            }

            const project = await Project.findById(projectId);

            if (!project) {
                return res.status(404).json({
                    success: false,
                    message: 'Không tìm thấy dự án'
                });
            }

            // Get user's role
            let userRole = project.getUserRole(req.user.id);

            // Creator is owner
            if (!userRole && project.createdBy.toString() === req.user.id.toString()) {
                userRole = 'owner';
            }

            if (!userRole || !allowedRoles.includes(userRole)) {
                return res.status(403).json({
                    success: false,
                    message: 'Bạn không có quyền thực hiện thao tác này'
                });
            }

            req.project = project;
            req.projectRole = userRole;
            next();
        } catch (error) {
            console.error('Project Role Check Error:', error);
            res.status(500).json({
                success: false,
                message: 'Lỗi kiểm tra quyền'
            });
        }
    };
};

/**
 * Middleware factory: Require specific permission
 * Usage: requirePermission('edit_task')
 */
const requirePermission = (permission) => {
    return async (req, res, next) => {
        try {
            const projectId = getProjectId(req);

            // System admin has all permissions
            if (isSystemAdmin(req.user)) {
                req.isAdmin = true;
                return next();
            }

            if (!projectId) {
                return next(); // Let route handle missing project
            }

            const project = await Project.findById(projectId);

            if (!project) {
                return res.status(404).json({
                    success: false,
                    message: 'Không tìm thấy dự án'
                });
            }

            // Get user's role
            let userRole = project.getUserRole(req.user.id);

            if (!userRole && project.createdBy.toString() === req.user.id.toString()) {
                userRole = 'owner';
            }

            if (!userRole) {
                return res.status(403).json({
                    success: false,
                    message: 'Bạn không phải thành viên của dự án này'
                });
            }

            const rolePermissions = PERMISSIONS[userRole] || [];

            if (!rolePermissions.includes(permission)) {
                return res.status(403).json({
                    success: false,
                    message: 'Bạn không có quyền thực hiện thao tác này'
                });
            }

            req.project = project;
            req.projectRole = userRole;
            next();
        } catch (error) {
            console.error('Permission Check Error:', error);
            res.status(500).json({
                success: false,
                message: 'Lỗi kiểm tra quyền'
            });
        }
    };
};

/**
 * Check if user can edit a specific task
 * For 'member' role, can only edit own tasks
 */
const canEditTask = async (req, res, next) => {
    try {
        // Admin and owner/manager can edit any task
        if (req.isAdmin || ['owner', 'manager'].includes(req.projectRole)) {
            return next();
        }

        // Member can only edit own tasks
        if (req.projectRole === 'member') {
            const Task = require('../models/Task');
            const taskId = req.params.id || req.params.taskId;
            const task = await Task.findById(taskId);

            if (!task) {
                return res.status(404).json({
                    success: false,
                    message: 'Không tìm thấy task'
                });
            }

            if (task.createdBy.toString() !== req.user.id.toString()) {
                return res.status(403).json({
                    success: false,
                    message: 'Bạn chỉ có thể sửa task do mình tạo'
                });
            }

            return next();
        }

        // Viewer cannot edit
        return res.status(403).json({
            success: false,
            message: 'Bạn không có quyền chỉnh sửa'
        });
    } catch (error) {
        console.error('Can Edit Task Error:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi kiểm tra quyền'
        });
    }
};

module.exports = {
    PERMISSIONS,
    isSystemAdmin,
    requireProjectAccess,
    requireProjectRole,
    requirePermission,
    canEditTask
};
