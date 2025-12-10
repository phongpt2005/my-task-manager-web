/**
 * Admin Dashboard Page
 * User management and system statistics for administrators
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    HiUsers,
    HiClipboardList,
    HiFolderOpen,
    HiChartBar,
    HiSearch,
    HiFilter,
    HiShieldCheck,
    HiUserCircle,
    HiBan,
    HiCheck,
    HiRefresh,
    HiDotsVertical,
    HiTrash
} from 'react-icons/hi';
import toast from 'react-hot-toast';
import { adminApi } from '../api/adminApi';
import { useAuthStore } from '../store/authStore';
import Loading from '../components/common/Loading';

const ROLE_BADGES = {
    admin: { label: 'Admin', class: 'bg-red-100 text-red-600 dark:bg-red-900/30' },
    user: { label: 'User', class: 'bg-gray-100 text-gray-600 dark:bg-gray-900/30' }
};

export default function AdminDashboard() {
    const { user: currentUser } = useAuthStore();
    const [stats, setStats] = useState(null);
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [usersLoading, setUsersLoading] = useState(false);
    const [search, setSearch] = useState('');
    const [roleFilter, setRoleFilter] = useState('');
    const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
    const [actionMenuOpen, setActionMenuOpen] = useState(null);

    useEffect(() => {
        fetchStats();
        fetchUsers();
    }, []);

    const fetchStats = async () => {
        try {
            const response = await adminApi.getStats();
            setStats(response.data.data);
        } catch (error) {
            toast.error('Không thể tải thống kê');
        }
    };

    const fetchUsers = async (page = 1) => {
        try {
            setUsersLoading(true);
            const response = await adminApi.getUsers({
                page,
                limit: 10,
                search,
                role: roleFilter
            });
            setUsers(response.data.data.users);
            setPagination(response.data.data.pagination);
        } catch (error) {
            toast.error('Không thể tải danh sách người dùng');
        } finally {
            setUsersLoading(false);
            setLoading(false);
        }
    };

    const handleSearch = (e) => {
        e.preventDefault();
        fetchUsers(1);
    };

    const handleRoleChange = async (userId, newRole) => {
        try {
            await adminApi.updateUserRole(userId, newRole);
            toast.success(`Đã cập nhật vai trò thành ${newRole}`);
            fetchUsers(pagination.page);
            setActionMenuOpen(null);
        } catch (error) {
            toast.error(error.response?.data?.message || 'Lỗi cập nhật vai trò');
        }
    };

    const handleToggleStatus = async (userId, currentStatus) => {
        try {
            await adminApi.toggleUserStatus(userId, !currentStatus);
            toast.success(currentStatus ? 'Đã vô hiệu hóa tài khoản' : 'Đã kích hoạt tài khoản');
            fetchUsers(pagination.page);
            setActionMenuOpen(null);
        } catch (error) {
            toast.error(error.response?.data?.message || 'Lỗi cập nhật trạng thái');
        }
    };

    const handleDeleteUser = async (userId, userName) => {
        if (!confirm(`Bạn có chắc muốn xóa người dùng "${userName}"?`)) return;

        try {
            await adminApi.deleteUser(userId);
            toast.success('Đã xóa người dùng');
            fetchUsers(pagination.page);
        } catch (error) {
            toast.error(error.response?.data?.message || 'Lỗi xóa người dùng');
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <Loading size="lg" />
            </div>
        );
    }

    return (
        <div className="animate-fade-in">
            {/* Header */}
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    <HiShieldCheck className="w-8 h-8 text-purple-500" />
                    Admin Dashboard
                </h1>
                <p className="text-gray-600 dark:text-gray-400">
                    Quản lý người dùng và hệ thống
                </p>
            </div>

            {/* Stats Cards */}
            {stats && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                    <StatsCard
                        icon={HiUsers}
                        label="Tổng người dùng"
                        value={stats.users.total}
                        subtext={`${stats.users.active} hoạt động`}
                        color="blue"
                    />
                    <StatsCard
                        icon={HiClipboardList}
                        label="Tổng Tasks"
                        value={stats.tasks.total}
                        subtext={`${stats.tasks.completionRate}% hoàn thành`}
                        color="green"
                    />
                    <StatsCard
                        icon={HiFolderOpen}
                        label="Tổng Projects"
                        value={stats.projects.total}
                        color="purple"
                    />
                    <StatsCard
                        icon={HiChartBar}
                        label="Mới tuần này"
                        value={stats.tasks.newThisWeek}
                        subtext={`${stats.users.newThisWeek} users mới`}
                        color="orange"
                    />
                </div>
            )}

            {/* Users Table */}
            <div className="card">
                <div className="p-4 border-b dark:border-gray-700">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                            Quản lý người dùng
                        </h2>

                        <div className="flex gap-2">
                            <form onSubmit={handleSearch} className="flex gap-2">
                                <div className="relative">
                                    <HiSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                    <input
                                        type="text"
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                        placeholder="Tìm kiếm..."
                                        className="input pl-10 py-2"
                                    />
                                </div>
                                <select
                                    value={roleFilter}
                                    onChange={(e) => {
                                        setRoleFilter(e.target.value);
                                        setTimeout(() => fetchUsers(1), 0);
                                    }}
                                    className="input py-2"
                                >
                                    <option value="">Tất cả vai trò</option>
                                    <option value="admin">Admin</option>
                                    <option value="user">User</option>
                                </select>
                            </form>
                            <button
                                onClick={() => fetchUsers(pagination.page)}
                                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                                title="Làm mới"
                            >
                                <HiRefresh className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Users List */}
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 dark:bg-gray-800">
                            <tr>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                    Người dùng
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                    Vai trò
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                    Trạng thái
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                    Tasks
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                    Ngày tạo
                                </th>
                                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                                    Hành động
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y dark:divide-gray-700">
                            {usersLoading ? (
                                <tr>
                                    <td colSpan="6" className="py-8 text-center">
                                        <Loading />
                                    </td>
                                </tr>
                            ) : users.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="py-8 text-center text-gray-500">
                                        Không tìm thấy người dùng
                                    </td>
                                </tr>
                            ) : (
                                users.map((user) => (
                                    <tr key={user._id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-3">
                                                {user.avatar ? (
                                                    <img
                                                        src={user.avatar}
                                                        alt={user.name}
                                                        className="w-10 h-10 rounded-full object-cover"
                                                    />
                                                ) : (
                                                    <div className="w-10 h-10 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold">
                                                        {user.name?.charAt(0) || '?'}
                                                    </div>
                                                )}
                                                <div>
                                                    <p className="font-medium text-gray-900 dark:text-white">
                                                        {user.name}
                                                    </p>
                                                    <p className="text-sm text-gray-500">{user.email}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${ROLE_BADGES[user.role]?.class}`}>
                                                {ROLE_BADGES[user.role]?.label}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3">
                                            {user.isActive ? (
                                                <span className="flex items-center gap-1 text-green-500 text-sm">
                                                    <HiCheck className="w-4 h-4" /> Hoạt động
                                                </span>
                                            ) : (
                                                <span className="flex items-center gap-1 text-red-500 text-sm">
                                                    <HiBan className="w-4 h-4" /> Vô hiệu
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                                            {user.taskCount || 0} tasks
                                        </td>
                                        <td className="px-4 py-3 text-sm text-gray-500">
                                            {new Date(user.createdAt).toLocaleDateString('vi-VN')}
                                        </td>
                                        <td className="px-4 py-3 text-right relative">
                                            {user._id !== currentUser.id && (
                                                <>
                                                    <button
                                                        onClick={() => setActionMenuOpen(actionMenuOpen === user._id ? null : user._id)}
                                                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                                                    >
                                                        <HiDotsVertical className="w-5 h-5" />
                                                    </button>

                                                    {actionMenuOpen === user._id && (
                                                        <div className="absolute right-4 top-full mt-1 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border dark:border-gray-700 z-10 overflow-hidden">
                                                            {user.role === 'user' ? (
                                                                <button
                                                                    onClick={() => handleRoleChange(user._id, 'admin')}
                                                                    className="w-full flex items-center gap-2 px-4 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-700 text-purple-600"
                                                                >
                                                                    <HiShieldCheck className="w-4 h-4" />
                                                                    Nâng cấp Admin
                                                                </button>
                                                            ) : (
                                                                <button
                                                                    onClick={() => handleRoleChange(user._id, 'user')}
                                                                    className="w-full flex items-center gap-2 px-4 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-700"
                                                                >
                                                                    <HiUserCircle className="w-4 h-4" />
                                                                    Hạ cấp User
                                                                </button>
                                                            )}
                                                            <button
                                                                onClick={() => handleToggleStatus(user._id, user.isActive)}
                                                                className="w-full flex items-center gap-2 px-4 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-700"
                                                            >
                                                                {user.isActive ? (
                                                                    <>
                                                                        <HiBan className="w-4 h-4 text-orange-500" />
                                                                        Vô hiệu hóa
                                                                    </>
                                                                ) : (
                                                                    <>
                                                                        <HiCheck className="w-4 h-4 text-green-500" />
                                                                        Kích hoạt
                                                                    </>
                                                                )}
                                                            </button>
                                                            <hr className="dark:border-gray-700" />
                                                            <button
                                                                onClick={() => handleDeleteUser(user._id, user.name)}
                                                                className="w-full flex items-center gap-2 px-4 py-2 text-left text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"
                                                            >
                                                                <HiTrash className="w-4 h-4" />
                                                                Xóa người dùng
                                                            </button>
                                                        </div>
                                                    )}
                                                </>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {pagination.pages > 1 && (
                    <div className="flex items-center justify-center gap-2 p-4 border-t dark:border-gray-700">
                        {Array.from({ length: pagination.pages }, (_, i) => i + 1).map((page) => (
                            <button
                                key={page}
                                onClick={() => fetchUsers(page)}
                                className={`px-4 py-2 rounded-lg font-medium transition-colors ${pagination.page === page
                                        ? 'bg-purple-500 text-white'
                                        : 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600'
                                    }`}
                            >
                                {page}
                            </button>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

// Stats Card Component
function StatsCard({ icon: Icon, label, value, subtext, color }) {
    const colors = {
        blue: 'from-blue-500 to-cyan-500',
        green: 'from-green-500 to-emerald-500',
        purple: 'from-purple-500 to-indigo-500',
        orange: 'from-orange-500 to-amber-500'
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="card p-5"
        >
            <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${colors[color]} flex items-center justify-center text-white`}>
                    <Icon className="w-6 h-6" />
                </div>
                <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{label}</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
                    {subtext && (
                        <p className="text-xs text-gray-400">{subtext}</p>
                    )}
                </div>
            </div>
        </motion.div>
    );
}
