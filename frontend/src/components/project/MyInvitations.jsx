/**
 * My Invitations Component
 * Shows pending project invitations for the current user
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    EnvelopeIcon,
    CheckCircleIcon,
    XCircleIcon,
    FolderIcon
} from '@heroicons/react/24/outline';
import api from '../../api/axios';
import toast from 'react-hot-toast';

const MyInvitations = () => {
    const [invites, setInvites] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchInvites();
    }, []);

    const fetchInvites = async () => {
        try {
            setLoading(true);
            const response = await api.get('/projects/invites/my');
            setInvites(response.data.data.invites || []);
        } catch (error) {
            console.error('Error fetching invites:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleAccept = async (token) => {
        try {
            await api.post('/projects/invite/accept', { token });
            toast.success('Đã tham gia dự án thành công!');
            fetchInvites();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Lỗi chấp nhận lời mời');
        }
    };

    const handleDecline = (inviteId) => {
        // Remove from local state (user ignores the invite)
        setInvites(prev => prev.filter(i => i._id !== inviteId));
        toast.success('Đã từ chối lời mời');
    };

    if (loading) {
        return (
            <div className="p-4 text-center">
                <div className="animate-spin w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full mx-auto"></div>
            </div>
        );
    }

    if (invites.length === 0) {
        return null; // Don't render if no invites
    }

    return (
        <div className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-2xl p-4 mb-6">
            <div className="flex items-center gap-2 mb-3">
                <EnvelopeIcon className="w-5 h-5 text-indigo-500" />
                <h3 className="font-semibold text-gray-900 dark:text-white">
                    Lời mời dự án ({invites.length})
                </h3>
            </div>

            <AnimatePresence>
                {invites.map((invite) => (
                    <motion.div
                        key={invite._id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, x: -100 }}
                        className="flex items-center justify-between bg-white dark:bg-gray-800 rounded-xl p-4 mb-2 shadow-sm"
                    >
                        <div className="flex items-center gap-3">
                            <div
                                className="w-10 h-10 rounded-xl flex items-center justify-center text-xl"
                                style={{ backgroundColor: invite.project?.color + '20' }}
                            >
                                {invite.project?.icon || '📁'}
                            </div>
                            <div>
                                <p className="font-medium text-gray-900 dark:text-white">
                                    {invite.project?.name || 'Dự án'}
                                </p>
                                <p className="text-sm text-gray-500">
                                    Từ {invite.invitedBy?.name} • Vai trò: {
                                        invite.role === 'manager' ? 'Quản lý' :
                                            invite.role === 'member' ? 'Thành viên' : 'Người xem'
                                    }
                                </p>
                            </div>
                        </div>

                        <div className="flex gap-2">
                            <button
                                onClick={() => handleDecline(invite._id)}
                                className="p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                                title="Từ chối"
                            >
                                <XCircleIcon className="w-6 h-6" />
                            </button>
                            <button
                                onClick={() => handleAccept(invite.token)}
                                className="px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-lg hover:opacity-90 transition-all flex items-center gap-1"
                            >
                                <CheckCircleIcon className="w-5 h-5" />
                                Chấp nhận
                            </button>
                        </div>
                    </motion.div>
                ))}
            </AnimatePresence>
        </div>
    );
};

export default MyInvitations;
