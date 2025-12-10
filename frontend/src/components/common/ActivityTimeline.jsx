/**
 * Activity Timeline Component
 * Displays activity history in a beautiful timeline format
 */

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    HiPlus,
    HiPencil,
    HiTrash,
    HiArrowRight,
    HiCheck,
    HiUserPlus,
    HiUserMinus,
    HiChat,
    HiPaperClip,
    HiLogin,
    HiUserAdd
} from 'react-icons/hi';
import { activityApi } from '../../api/adminApi';

const ACTION_CONFIG = {
    task_created: { icon: HiPlus, color: 'bg-green-500', text: 'đã tạo task' },
    task_updated: { icon: HiPencil, color: 'bg-blue-500', text: 'đã cập nhật task' },
    task_deleted: { icon: HiTrash, color: 'bg-red-500', text: 'đã xóa task' },
    task_status_changed: { icon: HiArrowRight, color: 'bg-orange-500', text: 'đã thay đổi trạng thái' },
    task_completed: { icon: HiCheck, color: 'bg-emerald-500', text: 'đã hoàn thành task' },
    project_created: { icon: HiPlus, color: 'bg-purple-500', text: 'đã tạo dự án' },
    project_updated: { icon: HiPencil, color: 'bg-indigo-500', text: 'đã cập nhật dự án' },
    project_deleted: { icon: HiTrash, color: 'bg-red-500', text: 'đã xóa dự án' },
    member_added: { icon: HiUserPlus, color: 'bg-cyan-500', text: 'đã thêm thành viên' },
    member_removed: { icon: HiUserMinus, color: 'bg-pink-500', text: 'đã xóa thành viên' },
    member_role_changed: { icon: HiUserAdd, color: 'bg-yellow-500', text: 'đã thay đổi vai trò' },
    comment_added: { icon: HiChat, color: 'bg-teal-500', text: 'đã bình luận' },
    file_uploaded: { icon: HiPaperClip, color: 'bg-gray-500', text: 'đã tải file lên' },
    user_login: { icon: HiLogin, color: 'bg-blue-500', text: 'đã đăng nhập' },
    user_registered: { icon: HiUserAdd, color: 'bg-green-500', text: 'đã đăng ký' }
};

const ActivityTimeline = ({ taskId, limit = 10, showAll = false }) => {
    const [activities, setActivities] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchActivities();
    }, [taskId]);

    const fetchActivities = async () => {
        try {
            setLoading(true);
            let response;

            if (taskId) {
                response = await activityApi.getTaskActivities(taskId);
            } else {
                response = await activityApi.getMyActivities(limit);
            }

            setActivities(response.data.data.activities || []);
        } catch (error) {
            console.error('Failed to fetch activities:', error);
        } finally {
            setLoading(false);
        }
    };

    const formatTime = (date) => {
        const now = new Date();
        const diff = now - new Date(date);
        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(diff / 3600000);
        const days = Math.floor(diff / 86400000);

        if (minutes < 1) return 'Vừa xong';
        if (minutes < 60) return `${minutes} phút trước`;
        if (hours < 24) return `${hours} giờ trước`;
        if (days < 7) return `${days} ngày trước`;
        return new Date(date).toLocaleDateString('vi-VN');
    };

    if (loading) {
        return (
            <div className="space-y-4 animate-pulse">
                {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="flex gap-3">
                        <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700" />
                        <div className="flex-1">
                            <div className="h-4 w-3/4 bg-gray-200 dark:bg-gray-700 rounded mb-2" />
                            <div className="h-3 w-1/2 bg-gray-200 dark:bg-gray-700 rounded" />
                        </div>
                    </div>
                ))}
            </div>
        );
    }

    if (activities.length === 0) {
        return (
            <div className="text-center py-8 text-gray-500">
                <p>Chưa có hoạt động nào</p>
            </div>
        );
    }

    return (
        <div className="relative">
            {/* Timeline line */}
            <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200 dark:bg-gray-700" />

            <div className="space-y-4">
                {activities.map((activity, index) => {
                    const config = ACTION_CONFIG[activity.action] || {
                        icon: HiPencil,
                        color: 'bg-gray-500',
                        text: activity.action
                    };
                    const Icon = config.icon;

                    return (
                        <motion.div
                            key={activity._id}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.05 }}
                            className="relative flex gap-3 pl-1"
                        >
                            {/* Icon */}
                            <div className={`relative z-10 w-8 h-8 rounded-full ${config.color} flex items-center justify-center text-white shadow-lg`}>
                                <Icon className="w-4 h-4" />
                            </div>

                            {/* Content */}
                            <div className="flex-1 bg-gray-50 dark:bg-gray-800/50 rounded-lg p-3">
                                <p className="text-sm text-gray-900 dark:text-white">
                                    <span className="font-medium">
                                        {activity.user?.name || 'Unknown'}
                                    </span>{' '}
                                    <span className="text-gray-600 dark:text-gray-400">
                                        {config.text}
                                    </span>{' '}
                                    {activity.entityName && (
                                        <span className="font-medium text-primary-500">
                                            "{activity.entityName}"
                                        </span>
                                    )}
                                </p>

                                {activity.details && (
                                    <p className="text-xs text-gray-500 mt-1">
                                        {typeof activity.details === 'string'
                                            ? activity.details
                                            : JSON.stringify(activity.details)}
                                    </p>
                                )}

                                <p className="text-xs text-gray-400 mt-1">
                                    {formatTime(activity.createdAt)}
                                </p>
                            </div>
                        </motion.div>
                    );
                })}
            </div>
        </div>
    );
};

export default ActivityTimeline;
