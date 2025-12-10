/**
 * Button Component
 */

import { cn } from '../../utils/helpers'

const variants = {
    primary: 'btn-primary',
    secondary: 'btn-secondary',
    danger: 'btn-danger',
    ghost: 'btn-ghost'
}

const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2',
    lg: 'px-6 py-3 text-lg'
}

export default function Button({
    children,
    variant = 'primary',
    size = 'md',
    className = '',
    isLoading = false,
    leftIcon,
    rightIcon,
    ...props
}) {
    return (
        <button
            className={cn(
                variants[variant],
                sizes[size],
                isLoading && 'opacity-70 cursor-wait',
                className
            )}
            disabled={isLoading || props.disabled}
            {...props}
        >
            {isLoading ? (
                <span className="spinner mr-2" />
            ) : leftIcon ? (
                <span className="mr-2">{leftIcon}</span>
            ) : null}
            {children}
            {rightIcon && <span className="ml-2">{rightIcon}</span>}
        </button>
    )
}
