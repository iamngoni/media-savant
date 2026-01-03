import { createFileRoute, Link } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import { FolderOpen } from 'lucide-react'

import { useSessionStore } from '../stores/session'
import { fetchLatest, fetchLibraries, fetchResume, type JellyfinItem } from '../lib/jellyfin'
import { MediaCarousel, MediaCard, MediaThumbnail } from '../components/media'
import { Card } from '../components/ui'

export const Route = createFileRoute('/library')({
  component: Library,
})

function Library() {
  const userId = useSessionStore((state) => state.userId)
  const isAuthenticated = useSessionStore((state) => state.isAuthenticated)
  const [libraries, setLibraries] = useState<JellyfinItem[]>([])
  const [resumeItems, setResumeItems] = useState<JellyfinItem[]>([])
  const [latestItems, setLatestItems] = useState<JellyfinItem[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!userId) return
    setLoading(true)
    Promise.all([fetchLibraries(userId), fetchResume(userId), fetchLatest(userId)])
      .then(([libraryRes, resumeRes, latestRes]) => {
        setLibraries(libraryRes.Items ?? [])
        setResumeItems(resumeRes.Items ?? [])
        setLatestItems(latestRes ?? [])
      })
      .finally(() => setLoading(false))
  }, [userId])

  if (!isAuthenticated) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-8">
        <h2 className="text-2xl font-semibold mb-2">Sign in to view your library</h2>
        <p className="text-foreground/60 mb-6 max-w-md">
          Connect to your Jellyfin server to browse your media collection.
        </p>
        <Link
          to="/setup"
          className="px-6 py-3 bg-primary text-white rounded-lg font-medium hover:bg-primary/90 transition-colors"
        >
          Sign In
        </Link>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-12 py-8 pb-16">
      {/* Page Header */}
      <div className="px-8 lg:px-20">
        <h1 className="text-3xl font-bold">Library</h1>
        <p className="text-foreground/60 mt-2">
          Browse your media collection
        </p>
      </div>

      {/* Continue Watching */}
      {resumeItems.length > 0 && (
        <MediaCarousel title="Continue Watching" viewAllLink="/search">
          {resumeItems.map((item) => (
            <MediaThumbnail key={item.Id} item={item} showProgress />
          ))}
        </MediaCarousel>
      )}

      {/* Recently Added */}
      {latestItems.length > 0 && (
        <MediaCarousel title="Recently Added" viewAllLink="/search">
          {latestItems.map((item) => (
            <MediaThumbnail key={item.Id} item={item} showBadge showTimestamp />
          ))}
        </MediaCarousel>
      )}

      {/* Libraries Grid */}
      <section className="px-8 lg:px-20 space-y-6">
        <h2 className="text-2xl font-semibold">Your Libraries</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {libraries.map((library) => (
            <Link
              key={library.Id}
              to="/library/$libraryId"
              params={{ libraryId: library.Id }}
            >
              <Card hover className="p-6 h-full">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <FolderOpen className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold">{library.Name}</h3>
                    <p className="text-sm text-foreground/60 mt-1">Browse collection</p>
                  </div>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      </section>

      {/* Empty State */}
      {libraries.length === 0 && resumeItems.length === 0 && latestItems.length === 0 && (
        <div className="min-h-[40vh] flex flex-col items-center justify-center text-center px-8">
          <div className="w-16 h-16 rounded-full bg-muted/40 flex items-center justify-center mb-4">
            <FolderOpen className="w-8 h-8 text-foreground/40" />
          </div>
          <h2 className="text-xl font-semibold mb-2">No libraries found</h2>
          <p className="text-foreground/60 max-w-md">
            Your Jellyfin server doesn't have any libraries configured yet.
          </p>
        </div>
      )}
    </div>
  )
}
