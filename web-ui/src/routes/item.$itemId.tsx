import { createFileRoute } from '@tanstack/react-router'
import { useEffect, useState } from 'react'

import { useSessionStore } from '../stores/session'
import { fetchItem, imageUrl, streamUrl } from '../lib/jellyfin'

export const Route = createFileRoute('/item/$itemId')({
  component: ItemDetail,
})

function ItemDetail() {
  const { itemId } = Route.useParams()
  const userId = useSessionStore((state) => state.userId)
  const [item, setItem] = useState<any | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!userId) return
    fetchItem(userId, itemId)
      .then((data) => setItem(data))
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed to load item'))
  }, [userId, itemId])

  if (error) {
    return <p className="text-sm text-red-400">{error}</p>
  }

  if (!item) {
    return <p className="text-sm text-foreground/60">Loading item...</p>
  }

  return (
    <section className="grid gap-6">
      <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
        <div className="overflow-hidden rounded-2xl border border-muted/60 bg-muted/40">
          <img src={imageUrl(item.Id, 480)} alt={item.Name} className="w-full object-cover" />
        </div>
        <div className="grid gap-4">
          <div>
            <h2 className="text-3xl font-semibold">{item.Name}</h2>
            <p className="text-sm text-foreground/60">{item.ProductionYear ?? '—'}</p>
          </div>
          <p className="text-sm text-foreground/70">{item.Overview ?? 'No overview available.'}</p>
          <div className="grid gap-2 text-xs text-foreground/60">
            <span>Type: {item.Type}</span>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-muted/60 bg-muted/40 p-4">
        <video
          controls
          className="w-full rounded-xl"
          src={streamUrl(item.Id)}
          poster={imageUrl(item.Id, 640)}
        />
      </div>
    </section>
  )
}
