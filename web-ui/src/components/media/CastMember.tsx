import { User } from 'lucide-react'
import { cn } from '../../lib/utils'

interface CastMemberProps {
  person: {
    Id?: string
    Name: string
    Role?: string
    Type?: string
    PrimaryImageTag?: string
  }
  className?: string
}

export function CastMember({ person, className }: CastMemberProps) {
  const imageUrl = person.Id && person.PrimaryImageTag
    ? `/api/jellyfin/Items/${person.Id}/Images/Primary?fillWidth=280&quality=80`
    : null

  return (
    <div className={cn('flex-shrink-0 w-[160px] text-center space-y-3', className)}>
      {/* Photo */}
      <div className="mx-auto w-[140px] h-[140px] rounded-full overflow-hidden bg-muted/40 border border-muted/20">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={person.Name}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <User className="w-12 h-12 text-foreground/30" />
          </div>
        )}
      </div>

      {/* Name */}
      <div className="space-y-1">
        <h4 className="font-medium text-sm line-clamp-1">{person.Name}</h4>
        {person.Role && (
          <p className="text-xs text-foreground/60 line-clamp-1">{person.Role}</p>
        )}
      </div>
    </div>
  )
}
