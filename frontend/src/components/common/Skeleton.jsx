/**
 * Skeleton Loading Components
 * Beautiful loading placeholders for various UI elements
 */

import { motion } from 'framer-motion';

// Base Skeleton Component
export const Skeleton = ({ className = '', animate = true }) => (
    <div
        className={`bg-gray-200 dark:bg-gray-700 rounded ${animate ? 'animate-pulse' : ''} ${className}`}
    />
);

// Text Skeleton
export const SkeletonText = ({ lines = 3, className = '' }) => (
    <div className={`space-y-2 ${className}`}>
        {Array.from({ length: lines }).map((_, i) => (
            <Skeleton
                key={i}
                className={`h-4 ${i === lines - 1 ? 'w-3/4' : 'w-full'}`}
            />
        ))}
    </div>
);

// Card Skeleton
export const SkeletonCard = ({ className = '' }) => (
    <div className={`card p-4 ${className}`}>
        <div className="flex items-center gap-3 mb-4">
            <Skeleton className="w-10 h-10 rounded-full" />
            <div className="flex-1">
                <Skeleton className="h-4 w-1/3 mb-2" />
                <Skeleton className="h-3 w-1/2" />
            </div>
        </div>
        <SkeletonText lines={2} />
    </div>
);

// Task Card Skeleton
export const SkeletonTask = () => (
    <div className="card p-4">
        <div className="flex items-start gap-4">
            <Skeleton className="w-5 h-5 rounded-full mt-1" />
            <div className="flex-1">
                <Skeleton className="h-5 w-2/3 mb-2" />
                <Skeleton className="h-3 w-full mb-3" />
                <div className="flex gap-2">
                    <Skeleton className="h-6 w-16 rounded-full" />
                    <Skeleton className="h-6 w-20 rounded-full" />
                    <Skeleton className="h-6 w-24 rounded-full" />
                </div>
            </div>
        </div>
    </div>
);

// Table Row Skeleton
export const SkeletonTableRow = ({ cols = 5 }) => (
    <tr className="border-b dark:border-gray-700">
        {Array.from({ length: cols }).map((_, i) => (
            <td key={i} className="px-4 py-3">
                <Skeleton className="h-4 w-full" />
            </td>
        ))}
    </tr>
);

// Stats Card Skeleton
export const SkeletonStats = () => (
    <div className="card p-5">
        <div className="flex items-center gap-4">
            <Skeleton className="w-12 h-12 rounded-xl" />
            <div>
                <Skeleton className="h-3 w-20 mb-2" />
                <Skeleton className="h-8 w-16 mb-1" />
                <Skeleton className="h-3 w-24" />
            </div>
        </div>
    </div>
);

// List Skeleton
export const SkeletonList = ({ count = 5, type = 'task' }) => (
    <div className="space-y-3">
        {Array.from({ length: count }).map((_, i) => (
            type === 'task' ? <SkeletonTask key={i} /> : <SkeletonCard key={i} />
        ))}
    </div>
);

// Dashboard Skeleton
export const SkeletonDashboard = () => (
    <div className="animate-fade-in">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
            <div>
                <Skeleton className="h-8 w-48 mb-2" />
                <Skeleton className="h-4 w-64" />
            </div>
            <Skeleton className="h-10 w-32 rounded-lg" />
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {Array.from({ length: 4 }).map((_, i) => (
                <SkeletonStats key={i} />
            ))}
        </div>

        {/* Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="card p-4">
                <Skeleton className="h-6 w-40 mb-4" />
                <SkeletonList count={3} />
            </div>
            <div className="card p-4">
                <Skeleton className="h-6 w-40 mb-4" />
                <Skeleton className="h-64 w-full rounded-lg" />
            </div>
        </div>
    </div>
);

export default Skeleton;
