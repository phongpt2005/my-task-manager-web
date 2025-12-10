/**
 * Role Badge Component
 * Displays user's role in a project with appropriate styling
 */

import {
    ShieldCheckIcon,
    UsersIcon,
    UserCircleIcon,
    EyeIcon,
    StarIcon
} from '@heroicons/react/24/outline';

const ROLE_CONFIG = {
    admin: {
        label: 'Admin',
        color: 'text-red-600 bg-red-100 dark:bg-red-900/30',
        icon: StarIcon
    },
    owner: {
        label: 'Chủ sở hữu',
        color: 'text-purple-600 bg-purple-100 dark:bg-purple-900/30',
        icon: ShieldCheckIcon
    },
    manager: {
        label: 'Quản lý',
        color: 'text-blue-600 bg-blue-100 dark:bg-blue-900/30',
        icon: UsersIcon
    },
    member: {
        label: 'Thành viên',
        color: 'text-green-600 bg-green-100 dark:bg-green-900/30',
        icon: UserCircleIcon
    },
    viewer: {
        label: 'Người xem',
        color: 'text-gray-600 bg-gray-100 dark:bg-gray-700',
        icon: EyeIcon
    }
};

const RoleBadge = ({ role, size = 'md' }) => {
    const config = ROLE_CONFIG[role] || ROLE_CONFIG.member;
    const Icon = config.icon;

    const sizeClasses = {
        sm: 'text-xs px-2 py-0.5',
        md: 'text-sm px-2.5 py-1',
        lg: 'text-base px-3 py-1.5'
    };

    const iconSizes = {
        sm: 'w-3 h-3',
        md: 'w-4 h-4',
        lg: 'w-5 h-5'
    };

    return (
        <span className={`inline-flex items-center gap-1 rounded-full font-medium ${config.color} ${sizeClasses[size]}`}>
            <Icon className={iconSizes[size]} />
            {config.label}
        </span>
    );
};

export default RoleBadge;
