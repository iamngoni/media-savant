import { createFileRoute, Link } from '@tanstack/react-router'
import { useEffect, useState } from 'react'

import { useSessionStore } from '../stores/session'
import { fetchLatest, fetchLibraries, fetchResume, imageUrl } from '../lib/jellyfin'

export const Route = createFileRoute('/library')({
  component: Library,
})

function Library() {
  const userId = useSessionStore((state) => state.userId)
  const [libraries, setLibraries] = useState<{ Id: string; Name: string }[]>([])
  const [resumeItems, setResumeItems] = useState<any[]>([])
  const [latestItems, setLatestItems] = useState<any[]>([])
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

  return (
    <section className="grid gap-8">
      <div>
        <h2 className="text-3xl font-semibold">Library overview</h2>
        <p className="mt-2 text-sm text-foreground/70">
          Queue, resume, and keep your family profiles in sync.
        </p>
      </div>

      {!userId && (
        <div className="rounded-2xl border border-muted/60 bg-muted/40 p-6 text-sm">
          Connect your server first in <Link to="/setup" className="text-accent">Setup</Link>.
        </div>
      )}

      {loading && (
        <div className="rounded-2xl border border-muted/60 bg-muted/40 p-6 text-sm">
          Loading library...
        </div>
      )}

      {userId && !loading && (
        <div className="grid gap-8">
          <Shelf title="Continue watching" items={resumeItems} />
          <Shelf title="Recently added" items={latestItems} />

          <div className="grid gap-4">
            <h3 className="text-lg font-semibold">Libraries</h3>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {libraries.map((library) => (
                <Link
                  key={library.Id}
                  to="/library/$libraryId"
                  params={{ libraryId: library.Id }}
                  className="rounded-2xl border border-muted/60 bg-muted/40 p-4 hover:border-accent"
                >
                  <p className="text-sm font-semibold">{library.Name}</p>
                  <p className="text-xs text-foreground/60">Open library</p>
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}
    </section>
  )
}

function Shelf({ title, items }: { title: string; items: any[] }) {
  if (!items?.length) return null
  return (
    <div className="grid gap-3">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">{title}</h3>
        <Link to="/search" className="text-xs uppercase tracking-[0.3em] text-foreground/50">
          View all
        </Link>
      </div>
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
    </div>
  )
}
