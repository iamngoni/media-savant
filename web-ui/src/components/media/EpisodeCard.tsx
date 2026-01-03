import { Link } from '@tanstack/react-router'
import { Play } from 'lucide-react'
import { imageUrl } from '../../lib/jellyfin'
import { cn } from '../../lib/utils'

interface EpisodeCardProps {
  item: {
    Id: string
    Name: string
    Overview?: string
    IndexNumber?: number
    ParentIndexNumber?: number
    RunTimeTicks?: number
    UserData?: {
      PlayedPercentage?: number
    }
  }
  className?: string
}

export function EpisodeCard({ item, className }: EpisodeCardProps) {
  const progress = item.UserData?.PlayedPercentage || 0
  const episodeNumber = item.IndexNumber || 0
  const runtime = item.RunTimeTicks
    ? Math.round(item.RunTimeTicks / 10000000 / 60)
    : null

  return (
    <Link
      to="/item/$itemId"
      params={{ itemId: item.Id }}
      className={cn(
        'group flex-shrink-0 w-full rounded-xl overflow-hidden bg-card-bg border border-muted/20 hover:border-muted/60 transition-all duration-300',
        className
      )}
    >
      {/* Thumbnail */}
      <div className="relative aspect-video">
        <img
          src={imageUrl(item.Id, 800)}
          alt={item.Name}
          className="w-full h-full object-cover"
          loading="lazy"
        />

        {/* Play overlay */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-black/40">
          <div className="w-16 h-16 rounded-full bg-white/90 flex items-center justify-center">
            <Play className="w-6 h-6 text-background ml-1" fill="currentColor" />
          </div>
        </div>

        {/* Progress bar */}
        {progress > 0 && (
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-muted/60">
            <div
              className="h-full bg-primary"
              style={{ width: `${progress}%` }}
            />
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-5 space-y-2">
        <h4 className="font-semibold line-clamp-1">{item.Name}</h4>
        <p className="text-sm text-foreground/60">
          E{episodeNumber}
          {runtime && <span> • {runtime} min</span>}
        </p>
        {item.Overview && (
          <p className="text-sm text-foreground/70 line-clamp-2">{item.Overview}</p>
        )}
      </div>
    </Link>
  )
}
