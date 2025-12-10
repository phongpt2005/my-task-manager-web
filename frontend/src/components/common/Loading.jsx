/**
 * Loading Component
 */

import { cn } from '../../utils/helpers'

export default function Loading({ size = 'md', className = '' }) {
    const sizes = {
        sm: 'w-4 h-4 border-2',
        md: 'w-8 h-8 border-2',
        lg: 'w-12 h-12 border-3'
    }

    return (
        <div className={cn('flex items-center justify-center', className)}>
            <div
                className={cn(
                    'rounded-full border-primary-200 border-t-primary-600 animate-spin',
                    sizes[size]
                )}
            />
        </div>
    )
}

export function LoadingOverlay({ message = 'Đang tải...' }) {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm">
            <div className="text-center">
                <Loading size="lg" />
                <p className="mt-4 text-gray-600 dark:text-gray-400">{message}</p>
            </div>
        </div>
    )
}

export function LoadingCard() {
    return (
        <div className="card p-6 animate-pulse">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-4" />
            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-2" />
            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-2/3" />
        </div>
    )
}
