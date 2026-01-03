import { type HTMLAttributes } from 'react'
import { cn } from '../../lib/utils'

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'rating' | 'genre' | 'type'
}

export function Badge({ className, variant = 'default', children, ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-md px-2.5 py-1 text-xs font-medium',
        {
          'bg-muted/60 text-foreground/80': variant === 'default',
          'bg-primary/20 text-primary border border-primary/40': variant === 'rating',
          'bg-muted/40 text-foreground/70 border border-muted/60': variant === 'genre',
          'bg-accent/20 text-accent': variant === 'type',
        },
        className
      )}
      {...props}
    >
      {children}
    </span>
  )
}
