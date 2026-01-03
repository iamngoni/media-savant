import { Link } from '@tanstack/react-router'
import { Play } from 'lucide-react'
import { imageUrl } from '../../lib/jellyfin'
import { Badge } from '../ui/Badge'
import { cn } from '../../lib/utils'

interface MediaThumbnailProps {
  item: {
    Id: string
    Name: string
    Type?: string
    SeriesName?: string
    SeasonName?: string
    IndexNumber?: number
    ParentIndexNumber?: number
    UserData?: {
      PlayedPercentage?: number
      PlaybackPositionTicks?: number
    }
    DateCreated?: string
  }
  showProgress?: boolean
  showBadge?: boolean
  showTimestamp?: boolean
  className?: string
}

export function MediaThumbnail({
  item,
  showProgress = false,
  showBadge = false,
  showTimestamp = false,
  className,
}: MediaThumbnailProps) {
  const progress = item.UserData?.PlayedPercentage || 0
  const isEpisode = item.Type === 'Episode'
  const episodeInfo = isEpisode
    ? `S${item.ParentIndexNumber} E${item.IndexNumber}`
    : null

  const getTimeAgo = (dateString?: string) => {
    if (!dateString) return null
    const date = new Date(dateString)
    const now = new Date()
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24))
    if (diffDays === 0) return 'Today'
    if (diffDays === 1) return '1 day ago'
    if (diffDays < 7) return `${diffDays} days ago`
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`
    return `${Math.floor(diffDays / 30)} months ago`
  }

  return (
    <Link
      to="/item/$itemId"
      params={{ itemId: item.Id }}
      className={cn('group flex-shrink-0 w-[300px] space-y-2', className)}
    >
      {/* Thumbnail */}
      <div className="relative aspect-video rounded-xl overflow-hidden bg-muted/40 border border-muted/20 group-hover:border-muted/60 transition-all duration-300">
        <img
          src={imageUrl(item.Id, 600)}
          alt={item.Name}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          loading="lazy"
        />

        {/* Play icon overlay */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-black/30">
          <div className="w-12 h-12 rounded-full bg-white/90 flex items-center justify-center">
            <Play className="w-5 h-5 text-background ml-0.5" fill="currentColor" />
          </div>
        </div>

        {/* Badge */}
        {showBadge && (
          <div className="absolute top-3 left-3">
            <Badge variant="type">{item.Type}</Badge>
          </div>
        )}

        {/* Progress bar */}
        {showProgress && progress > 0 && (
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-muted/60">
            <div
              className="h-full bg-primary"
              style={{ width: `${progress}%` }}
            />
          </div>
        )}
      </div>

      {/* Title */}
      <h3 className="font-medium text-sm line-clamp-1">
        {item.SeriesName || item.Name}
      </h3>

      {/* Subtitle */}
      <p className="text-xs text-foreground/60">
        {episodeInfo && <span>{episodeInfo} • </span>}
        {isEpisode && item.Name}
        {showTimestamp && getTimeAgo(item.DateCreated)}
      </p>
    </Link>
  )
}
