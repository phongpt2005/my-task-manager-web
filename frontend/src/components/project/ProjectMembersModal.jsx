/**
 * Project Members Modal
 * Display and manage project members with role controls
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    XMarkIcon,
    UserPlusIcon,
    TrashIcon,
    ChevronDownIcon,
    UserCircleIcon,
    ShieldCheckIcon,
    EyeIcon,
    UsersIcon
} from '@heroicons/react/24/outline';
import api from '../../api/axios';
import toast from 'react-hot-toast';

const ROLE_CONFIG = {
    owner: {
        label: 'Chủ sở hữu',
        color: 'text-purple-600 bg-purple-100 dark:bg-purple-900/30',
        icon: ShieldCheckIcon,
        description: 'Toàn quyền quản lý'
    },
    manager: {
        label: 'Quản lý',
        color: 'text-blue-600 bg-blue-100 dark:bg-blue-900/30',
        icon: UsersIcon,
        description: 'Quản lý task và mời thành viên'
    },
    member: {
        label: 'Thành viên',
        color: 'text-green-600 bg-green-100 dark:bg-green-900/30',
        icon: UserCircleIcon,
        description: 'Tạo và sửa task của mình'
    },
    viewer: {
        label: 'Người xem',
        color: 'text-gray-600 bg-gray-100 dark:bg-gray-900/30',
        icon: EyeIcon,
        description: 'Chỉ xem, không chỉnh sửa'
    }
};

const ProjectMembersModal = ({ isOpen, onClose, project, userRole, onMembersChange }) => {
    const [members, setMembers] = useState([]);
    const [pendingInvites, setPendingInvites] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showInviteModal, setShowInviteModal] = useState(false);
    const [roleDropdown, setRoleDropdown] = useState(null);

    const canManageRoles = ['owner', 'admin'].includes(userRole);
    const canInvite = ['owner', 'manager', 'admin'].includes(userRole);

    useEffect(() => {
        if (isOpen && project) {
            fetchMembers();
        }
    }, [isOpen, project]);

    const fetchMembers = async () => {
        try {
            setLoading(true);
            const response = await api.get(`/projects/${project._id || project.id}/members`);
            setMembers(response.data.data.members || []);
        } catch (error) {
            toast.error('Không thể tải danh sách thành viên');
        } finally {
            setLoading(false);
        }
    };

    const handleRoleChange = async (userId, newRole) => {
        try {
            await api.put(`/projects/${project._id || project.id}/members/${userId}`, { role: newRole });
            toast.success('Cập nhật vai trò thành công');
            fetchMembers();
            onMembersChange?.();
            setRoleDropdown(null);
        } catch (error) {
            toast.error(error.response?.data?.message || 'Lỗi cập nhật vai trò');
        }
    };

    const handleRemoveMember = async (userId, memberName) => {
        if (!confirm(`Bạn có chắc muốn xóa ${memberName} khỏi dự án?`)) return;

        try {
            await api.delete(`/projects/${project._id || project.id}/members/${userId}`);
            toast.success('Đã xóa thành viên');
            fetchMembers();
            onMembersChange?.();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Lỗi xóa thành viên');
        }
    };

    const handleCancelInvite = async (inviteId) => {
        try {
            await api.delete(`/projects/${project._id || project.id}/invite/${inviteId}`);
            toast.success('Đã hủy lời mời');
            setPendingInvites(prev => prev.filter(i => i._id !== inviteId));
        } catch (error) {
            toast.error('Lỗi hủy lời mời');
        }
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                onClick={onClose}
            >
                <motion.div
                    initial={{ scale: 0.95, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.95, opacity: 0 }}
                    className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-2xl max-h-[80vh] overflow-hidden shadow-xl"
                    onClick={e => e.stopPropagation()}
                >
                    {/* Header */}
                    <div className="flex items-center justify-between p-6 border-b dark:border-gray-700">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-500 flex items-center justify-center text-white text-xl">
                                {project?.icon || '📁'}
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                                    Thành viên dự án
                                </h2>
                                <p className="text-sm text-gray-500">{project?.name}</p>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                        >
                            <XMarkIcon className="w-6 h-6" />
                        </button>
                    </div>

                    {/* Content */}
                    <div className="p-6 overflow-y-auto max-h-[60vh]">
                        {/* Invite Button */}
                        {canInvite && (
                            <button
                                onClick={() => setShowInviteModal(true)}
                                className="w-full mb-6 flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-xl hover:opacity-90 transition-all"
                            >
                                <UserPlusIcon className="w-5 h-5" />
                                Mời thành viên mới
                            </button>
                        )}

                        {/* Members List */}
                        {loading ? (
                            <div className="text-center py-8">
                                <div className="animate-spin w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full mx-auto"></div>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
                                    Thành viên ({members.length})
                                </h3>

                                {members.map((member) => {
                                    const roleConfig = ROLE_CONFIG[member.role];
                                    const RoleIcon = roleConfig?.icon || UserCircleIcon;
                                    const user = member.user;

                                    return (
                                        <div
                                            key={user?._id || user?.id}
                                            className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl"
                                        >
                                            <div className="flex items-center gap-3">
                                                {user?.avatar ? (
                                                    <img
                                                        src={user.avatar}
                                                        alt={user.name}
                                                        className="w-10 h-10 rounded-full object-cover"
                                                    />
                                                ) : (
                                                    <div className="w-10 h-10 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold">
                                                        {user?.name?.charAt(0) || '?'}
                                                    </div>
                                                )}
                                                <div>
                                                    <p className="font-medium text-gray-900 dark:text-white">
                                                        {user?.name || 'Unknown'}
                                                    </p>
                                                    <p className="text-sm text-gray-500">{user?.email}</p>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-2">
                                                {/* Role Badge/Dropdown */}
                                                <div className="relative">
                                                    <button
                                                        onClick={() => canManageRoles && member.role !== 'owner' && setRoleDropdown(roleDropdown === user._id ? null : user._id)}
                                                        disabled={!canManageRoles || member.role === 'owner'}
                                                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium ${roleConfig?.color} ${canManageRoles && member.role !== 'owner' ? 'cursor-pointer hover:opacity-80' : 'cursor-default'}`}
                                                    >
                                                        <RoleIcon className="w-4 h-4" />
                                                        {roleConfig?.label}
                                                        {canManageRoles && member.role !== 'owner' && (
                                                            <ChevronDownIcon className="w-4 h-4" />
                                                        )}
                                                    </button>

                                                    {/* Role Dropdown */}
                                                    {roleDropdown === user._id && (
                                                        <div className="absolute right-0 top-full mt-1 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border dark:border-gray-700 z-10 overflow-hidden">
                                                            {Object.entries(ROLE_CONFIG).filter(([key]) => key !== 'owner').map(([key, config]) => (
                                                                <button
                                                                    key={key}
                                                                    onClick={() => handleRoleChange(user._id, key)}
                                                                    className={`w-full flex items-center gap-2 px-4 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-700 ${member.role === key ? 'bg-gray-100 dark:bg-gray-700' : ''}`}
                                                                >
                                                                    <config.icon className={`w-4 h-4 ${config.color.split(' ')[0]}`} />
                                                                    <div>
                                                                        <p className="font-medium text-sm">{config.label}</p>
                                                                        <p className="text-xs text-gray-500">{config.description}</p>
                                                                    </div>
                                                                </button>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Remove Button */}
                                                {canManageRoles && member.role !== 'owner' && (
                                                    <button
                                                        onClick={() => handleRemoveMember(user._id, user.name)}
                                                        className="p-2 text-red-500 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                                                        title="Xóa thành viên"
                                                    >
                                                        <TrashIcon className="w-5 h-5" />
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}

                        {/* Pending Invites */}
                        {pendingInvites.length > 0 && (
                            <div className="mt-6">
                                <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
                                    Đang chờ ({pendingInvites.length})
                                </h3>
                                {pendingInvites.map((invite) => (
                                    <div
                                        key={invite._id}
                                        className="flex items-center justify-between p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-xl border border-yellow-200 dark:border-yellow-900"
                                    >
                                        <div>
                                            <p className="font-medium text-gray-900 dark:text-white">
                                                {invite.email}
                                            </p>
                                            <p className="text-sm text-gray-500">
                                                Vai trò: {ROLE_CONFIG[invite.role]?.label} • Hết hạn: {new Date(invite.expiresAt).toLocaleDateString('vi-VN')}
                                            </p>
                                        </div>
                                        <button
                                            onClick={() => handleCancelInvite(invite._id)}
                                            className="text-red-500 hover:text-red-600 text-sm font-medium"
                                        >
                                            Hủy
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </motion.div>

                {/* Invite Member Modal */}
                {showInviteModal && (
                    <InviteMemberModal
                        projectId={project._id || project.id}
                        onClose={() => setShowInviteModal(false)}
                        onInvited={() => {
                            setShowInviteModal(false);
                            fetchMembers();
                        }}
                    />
                )}
            </motion.div>
        </AnimatePresence>
    );
};

// Invite Member Modal Component
const InviteMemberModal = ({ projectId, onClose, onInvited }) => {
    const [email, setEmail] = useState('');
    const [role, setRole] = useState('member');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!email) return;

        try {
            setLoading(true);
            await api.post(`/projects/${projectId}/invite`, { email, role });
            toast.success('Đã gửi lời mời thành công');
            onInvited();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Lỗi gửi lời mời');
        } finally {
            setLoading(false);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 bg-black/30 z-60 flex items-center justify-center p-4"
            onClick={onClose}
        >
            <motion.div
                initial={{ scale: 0.95 }}
                animate={{ scale: 1 }}
                className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-md p-6 shadow-xl"
                onClick={e => e.stopPropagation()}
            >
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                    Mời thành viên
                </h3>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Email
                        </label>
                        <input
                            type="email"
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            placeholder="email@example.com"
                            className="w-full px-4 py-3 rounded-xl border dark:border-gray-600 dark:bg-gray-700 focus:ring-2 focus:ring-indigo-500 outline-none"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Vai trò
                        </label>
                        <select
                            value={role}
                            onChange={e => setRole(e.target.value)}
                            className="w-full px-4 py-3 rounded-xl border dark:border-gray-600 dark:bg-gray-700 focus:ring-2 focus:ring-indigo-500 outline-none"
                        >
                            <option value="manager">Quản lý - Có thể quản lý task</option>
                            <option value="member">Thành viên - Có thể tạo task</option>
                            <option value="viewer">Người xem - Chỉ xem</option>
                        </select>
                    </div>

                    <div className="flex gap-3 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-4 py-3 border dark:border-gray-600 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                        >
                            Hủy
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-1 px-4 py-3 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-xl hover:opacity-90 disabled:opacity-50 transition-all"
                        >
                            {loading ? 'Đang gửi...' : 'Gửi lời mời'}
                        </button>
                    </div>
                </form>
            </motion.div>
        </motion.div>
    );
};

export default ProjectMembersModal;
