import { Link } from '@tanstack/react-router'
import { Play, Info } from 'lucide-react'
import { Button } from '../ui/Button'
import { Badge } from '../ui/Badge'
import { backdropUrl, imageUrl } from '../../lib/jellyfin'

interface HeroSectionProps {
  item: {
    Id: string
    Name: string
    Overview?: string
    ProductionYear?: number
    OfficialRating?: string
    Type?: string
    SeriesName?: string
    SeasonName?: string
    IndexNumber?: number
    ParentIndexNumber?: number
  }
  relatedItems?: Array<{ Id: string; Name: string }>
}

export function HeroSection({ item, relatedItems = [] }: HeroSectionProps) {
  const isSeries = item.Type === 'Series' || item.Type === 'Episode'
  const episodeInfo = item.Type === 'Episode'
    ? `S${item.ParentIndexNumber} E${item.IndexNumber}`
    : null

  return (
    <section className="relative h-[85vh] min-h-[600px] w-full overflow-hidden">
      {/* Backdrop Image */}
      <div className="absolute inset-0">
        <img
          src={backdropUrl(item.Id)}
          alt={item.Name}
          className="w-full h-full object-cover"
        />
        {/* Gradient overlays */}
        <div className="absolute inset-0 bg-gradient-hero" />
        <div className="absolute inset-0 bg-gradient-fade" />
      </div>

      {/* Content */}
      <div className="relative z-10 h-full flex flex-col justify-end px-8 lg:px-20 pb-16">
        <div className="max-w-2xl space-y-6">
          {/* Title */}
          <h1 className="text-5xl lg:text-7xl font-bold tracking-tight">
            {item.SeriesName || item.Name}
          </h1>

          {/* Metadata Row */}
          <div className="flex items-center gap-4 flex-wrap">
            {item.OfficialRating && (
              <Badge variant="rating">{item.OfficialRating}</Badge>
            )}
            {item.ProductionYear && (
              <span className="text-sm text-foreground/70">{item.ProductionYear}</span>
            )}
            {isSeries && (
              <span className="text-sm text-foreground/70">
                {episodeInfo || '9 Episodes'}
              </span>
            )}
          </div>

          {/* Description */}
          {item.Overview && (
            <p className="text-base text-foreground/80 line-clamp-3 max-w-xl">
              {item.Overview}
            </p>
          )}

          {/* Action Buttons */}
          <div className="flex items-center gap-4 pt-2">
            <Link to="/item/$itemId" params={{ itemId: item.Id }}>
              <Button size="lg" className="gap-2">
                <Play className="w-5 h-5" fill="currentColor" />
                Watch Now
              </Button>
            </Link>
            <Link to="/item/$itemId" params={{ itemId: item.Id }}>
              <Button variant="outline" size="lg" className="gap-2">
                <Info className="w-5 h-5" />
                More Info
              </Button>
            </Link>
          </div>
        </div>

        {/* Related Thumbnails */}
        {relatedItems.length > 0 && (
          <div className="mt-8 flex items-center gap-3">
            {relatedItems.slice(0, 5).map((related) => (
              <Link
                key={related.Id}
                to="/item/$itemId"
                params={{ itemId: related.Id }}
                className="w-[140px] h-[84px] rounded-lg overflow-hidden border border-muted/40 hover:border-muted/80 transition-colors"
              >
                <img
                  src={imageUrl(related.Id, 280)}
                  alt={related.Name}
                  className="w-full h-full object-cover"
                />
              </Link>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
