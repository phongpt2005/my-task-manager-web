/**
 * Input Component
 */

import { forwardRef } from 'react'
import { cn } from '../../utils/helpers'

const Input = forwardRef(({
    label,
    error,
    className = '',
    leftIcon,
    rightIcon,
    ...props
}, ref) => {
    return (
        <div className="w-full">
            {label && (
                <label className="label">{label}</label>
            )}
            <div className="relative">
                {leftIcon && (
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                        {leftIcon}
                    </span>
                )}
                <input
                    ref={ref}
                    className={cn(
                        'input',
                        leftIcon && 'pl-10',
                        rightIcon && 'pr-10',
                        error && 'input-error',
                        className
                    )}
                    {...props}
                />
                {rightIcon && (
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                        {rightIcon}
                    </span>
                )}
            </div>
            {error && (
                <p className="mt-1 text-sm text-red-500">{error}</p>
            )}
        </div>
    )
})

Input.displayName = 'Input'

export default Input
