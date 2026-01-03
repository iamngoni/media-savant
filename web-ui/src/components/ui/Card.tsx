import { forwardRef, type HTMLAttributes } from 'react'
import { cn } from '../../lib/utils'

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  hover?: boolean
}

export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ className, hover = false, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'rounded-2xl border border-muted/40 bg-card-bg/80 backdrop-blur-sm',
          hover && 'transition-all duration-200 hover:border-muted/60 hover:bg-hover-bg/80',
          className
        )}
        {...props}
      >
        {children}
      </div>
    )
  }
)

Card.displayName = 'Card'
