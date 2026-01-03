import { Link } from '@tanstack/react-router'
import { ChevronRight } from 'lucide-react'
import { useRef } from 'react'
import { cn } from '../../lib/utils'

interface MediaCarouselProps {
  title: string
  viewAllLink?: string
  children: React.ReactNode
  className?: string
}

export function MediaCarousel({ title, viewAllLink, children, className }: MediaCarouselProps) {
  const scrollRef = useRef<HTMLDivElement>(null)

  return (
    <section className={cn('space-y-4', className)}>
      {/* Header */}
      <div className="flex items-center justify-between px-8 lg:px-20">
        <h2 className="text-2xl font-semibold">{title}</h2>
        {viewAllLink && (
          <Link
            to={viewAllLink}
            className="flex items-center gap-1 text-sm text-foreground/60 hover:text-foreground transition-colors"
          >
            View all
            <ChevronRight className="w-4 h-4" />
          </Link>
        )}
      </div>

      {/* Scrollable container */}
      <div
        ref={scrollRef}
        className="flex gap-4 overflow-x-auto px-8 lg:px-20 pb-4 scrollbar-hide"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {children}
      </div>
    </section>
  )
}
