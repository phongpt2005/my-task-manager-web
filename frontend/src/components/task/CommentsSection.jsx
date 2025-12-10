import { useState, useEffect, useRef } from 'react'
import { HiPaperAirplane, HiUserCircle, HiTrash } from 'react-icons/hi'
import { commentApi } from '../../api/commentApi'
import { useAuthStore } from '../../store/authStore'
import socket from '../../utils/socket'
import { formatRelativeTime } from '../../utils/helpers'
import toast from 'react-hot-toast'

export default function CommentsSection({ taskId }) {
    const [comments, setComments] = useState([])
    const [newComment, setNewComment] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const [isSending, setIsSending] = useState(false)
    const { user } = useAuthStore()
    const messagesEndRef = useRef(null)

    useEffect(() => {
        if (taskId) {
            fetchComments()

            // Join task room
            socket.emit('join_task', taskId)

            // Listen for new comments
            // Note: in a real app, handle duplicates if necessary, but standard push is usually fine if we don't optimistic-UI duplicate
            const handleNewComment = (comment) => {
                // Check if already exists (optimistic UI or duplicate event)
                setComments(prev => {
                    if (prev.find(c => c._id === comment._id)) return prev
                    return [comment, ...prev]
                })
            }

            socket.on('new_comment', handleNewComment)

            return () => {
                socket.off('new_comment', handleNewComment)
            }
        }
    }, [taskId])

    const fetchComments = async () => {
        try {
            setIsLoading(true)
            const result = await commentApi.getComments(taskId)
            setComments(result.data.comments)
        } catch (error) {
            console.error(error)
        } finally {
            setIsLoading(false)
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (!newComment.trim()) return

        try {
            setIsSending(true)
            await commentApi.addComment(taskId, newComment)
            setNewComment('')
        } catch (error) {
            toast.error('Không thể gửi bình luận')
        } finally {
            setIsSending(false)
        }
    }

    const handleDelete = async (commentId) => {
        if (!window.confirm('Xóa bình luận này?')) return
        try {
            await commentApi.deleteComment(commentId)
            setComments(prev => prev.filter(c => c._id !== commentId))
            toast.success('Đã xóa bình luận')
        } catch (error) {
            toast.error('Lỗi xóa bình luận')
        }
    }

    return (
        <div className="border-t border-gray-200 dark:border-gray-700 pt-4 mt-6">
            <h4 className="font-medium text-gray-900 dark:text-white mb-4">
                Bình luận ({comments.length})
            </h4>

            {/* Comment List */}
            <div className="space-y-4 max-h-60 overflow-y-auto mb-4 pr-2 custom-scrollbar">
                {isLoading ? (
                    <p className="text-sm text-center text-gray-500">Đang tải...</p>
                ) : comments.length === 0 ? (
                    <p className="text-sm text-center text-gray-500 py-4">Chưa có bình luận nào</p>
                ) : (
                    comments.map((comment) => (
                        <div key={comment._id} className="flex gap-3 group">
                            {comment.user?.avatar ? (
                                <img
                                    src={comment.user.avatar}
                                    alt={comment.user.name}
                                    className="w-8 h-8 rounded-full object-cover"
                                />
                            ) : (
                                <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                                    <span className="text-xs font-medium text-gray-600 dark:text-gray-300">
                                        {(comment.user?.name || '?').charAt(0)}
                                    </span>
                                </div>
                            )}

                            <div className="flex-1">
                                <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3 relative">
                                    <div className="flex items-center justify-between mb-1">
                                        <span className="text-sm font-medium text-gray-900 dark:text-white">
                                            {comment.user?.name || 'Unknown'}
                                        </span>
                                        <span className="text-xs text-gray-500 dark:text-gray-400">
                                            {formatRelativeTime(comment.createdAt)}
                                        </span>
                                    </div>
                                    <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                                        {comment.content}
                                    </p>

                                    {/* Delete button for owner */}
                                    {user && user._id === comment.user?._id && (
                                        <button
                                            onClick={() => handleDelete(comment._id)}
                                            className="absolute top-2 right-2 p-1 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                                        >
                                            <HiTrash className="w-3.5 h-3.5" />
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <form onSubmit={handleSubmit} className="flex gap-2">
                <input
                    type="text"
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Viết bình luận..."
                    className="flex-1 input py-2 text-sm"
                    disabled={isSending}
                />
                <button
                    type="submit"
                    disabled={isSending || !newComment.trim()}
                    className="btn btn-primary p-2 rounded-lg"
                >
                    <HiPaperAirplane className={`w-5 h-5 ${isSending ? 'animate-bounce' : 'rotate-90'}`} />
                </button>
            </form>
        </div>
    )
}
