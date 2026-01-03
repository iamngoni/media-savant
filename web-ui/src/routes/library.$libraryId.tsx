import { createFileRoute, Link } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import { ArrowLeft, Grid, List } from 'lucide-react'

import { useSessionStore } from '../stores/session'
import { fetchItemsByParent, type JellyfinItem } from '../lib/jellyfin'
import { MediaCard } from '../components/media'
import { Button } from '../components/ui'

export const Route = createFileRoute('/library/$libraryId')({
  component: LibraryDetail,
})

function LibraryDetail() {
  const { libraryId } = Route.useParams()
  const userId = useSessionStore((state) => state.userId)
  const [items, setItems] = useState<JellyfinItem[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!userId) return
    setLoading(true)
    fetchItemsByParent(userId, libraryId)
      .then((res) => setItems(res.Items ?? []))
      .finally(() => setLoading(false))
  }, [userId, libraryId])

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="py-8 pb-16 space-y-8">
      {/* Header */}
      <div className="px-8 lg:px-20 space-y-4">
        <Link
          to="/library"
          className="inline-flex items-center gap-2 text-sm text-foreground/60 hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to libraries
        </Link>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Library</h1>
            <p className="text-foreground/60 mt-1">{items.length} items</p>
          </div>
          <div className="flex gap-2">
            <Button variant="ghost" size="sm" className="px-3">
              <Grid className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="sm" className="px-3">
              <List className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Items Grid */}
      <div className="px-8 lg:px-20">
        <div className="grid gap-6 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
          {items.map((item) => (
            <MediaCard key={item.Id} item={item} showRating />
          ))}
        </div>
      </div>

      {/* Empty State */}
      {items.length === 0 && (
        <div className="min-h-[40vh] flex flex-col items-center justify-center text-center px-8">
          <h2 className="text-xl font-semibold mb-2">No items found</h2>
          <p className="text-foreground/60 max-w-md">
            This library doesn't have any content yet.
          </p>
        </div>
      )}
    </div>
  )
}
