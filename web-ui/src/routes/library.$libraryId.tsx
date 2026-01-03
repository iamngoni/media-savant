import { createFileRoute, Link } from '@tanstack/react-router'
import { useEffect, useState } from 'react'

import { useSessionStore } from '../stores/session'
import { fetchItemsByParent, imageUrl } from '../lib/jellyfin'

export const Route = createFileRoute('/library/$libraryId')({
  component: LibraryDetail,
})

function LibraryDetail() {
  const { libraryId } = Route.useParams()
  const userId = useSessionStore((state) => state.userId)
  const [items, setItems] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!userId) return
    setLoading(true)
    fetchItemsByParent(userId, libraryId)
      .then((res) => setItems(res.Items ?? []))
      .finally(() => setLoading(false))
  }, [userId, libraryId])

  return (
    <section className="grid gap-6">
      <div>
        <Link to="/library" className="text-xs uppercase tracking-[0.3em] text-foreground/60">
          Back to libraries
        </Link>
        <h2 className="mt-2 text-3xl font-semibold">Library items</h2>
      </div>

      {loading && <p className="text-sm text-foreground/60">Loading items...</p>}

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        {items.map((item) => (
          <Link
            key={item.Id}
            to="/item/$itemId"
            params={{ itemId: item.Id }}
            className="group overflow-hidden rounded-2xl border border-muted/60 bg-muted/40"
          >
            <div className="aspect-[3/4] w-full overflow-hidden bg-muted/80">
              <img
                src={imageUrl(item.Id, 320)}
                alt={item.Name}
                className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                loading="lazy"
              />
            </div>
            <div className="p-3 text-xs text-foreground/70">{item.Name}</div>
          </Link>
        ))}
      </div>
    </section>
  )
}
