import { Link } from '@tanstack/react-router'
import { Star } from 'lucide-react'
import { imageUrl } from '../../lib/jellyfin'
import { Badge } from '../ui/Badge'
import { cn } from '../../lib/utils'

interface MediaCardProps {
  item: {
    Id: string
    Name: string
    Type?: string
    ProductionYear?: number
    CommunityRating?: number
    Genres?: string[]
  }
  showRating?: boolean
  showGenres?: boolean
  className?: string
}

export function MediaCard({ item, showRating = false, showGenres = false, className }: MediaCardProps) {
  return (
    <Link
      to="/item/$itemId"
      params={{ itemId: item.Id }}
      className={cn(
        'group flex-shrink-0 w-[200px] space-y-3',
        className
      )}
    >
      {/* Poster */}
      <div className="relative aspect-[2/3] rounded-xl overflow-hidden bg-muted/40 border border-muted/20 group-hover:border-muted/60 transition-all duration-300">
        <img
          src={imageUrl(item.Id, 400)}
          alt={item.Name}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          loading="lazy"
        />
        {/* Gradient overlay on hover */}
        <div className="absolute inset-0 bg-gradient-card opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </div>

      {/* Title */}
      <h3 className="font-medium text-sm line-clamp-1">{item.Name}</h3>

      {/* Rating */}
      {showRating && item.CommunityRating && (
        <div className="flex items-center gap-1.5">
          <Star className="w-4 h-4 text-yellow-500" fill="currentColor" />
          <span className="text-sm text-foreground/70">
            {item.CommunityRating.toFixed(1)}
          </span>
        </div>
      )}

      {/* Genres */}
      {showGenres && item.Genres && item.Genres.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {item.Genres.slice(0, 2).map((genre) => (
            <Badge key={genre} variant="genre" className="text-xs px-2 py-0.5">
              {genre}
            </Badge>
          ))}
        </div>
      )}
    </Link>
  )
}
