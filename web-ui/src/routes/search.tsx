import { createFileRoute, Link } from '@tanstack/react-router'
import { useState } from 'react'

import { useSessionStore } from '../stores/session'
import { imageUrl, searchItems } from '../lib/jellyfin'

export const Route = createFileRoute('/search')({
  component: Search,
})

function Search() {
  const userId = useSessionStore((state) => state.userId)
  const [term, setTerm] = useState('')
  const [results, setResults] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  const handleSearch = async () => {
    if (!userId || !term.trim()) return
    setLoading(true)
    try {
      const res = await searchItems(userId, term.trim())
      setResults(res.Items ?? [])
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="grid gap-6">
      <div>
        <h2 className="text-3xl font-semibold">Search</h2>
        <p className="mt-2 text-sm text-foreground/70">Search across your Jellyfin library.</p>
      </div>

      {!userId && (
        <div className="rounded-2xl border border-muted/60 bg-muted/40 p-6 text-sm">
          Connect your server first in <Link to="/setup" className="text-accent">Setup</Link>.
        </div>
      )}

      <div className="flex flex-col gap-3 sm:flex-row">
        <input
          className="flex-1 rounded-xl border border-muted/70 bg-transparent px-4 py-2"
          placeholder="Search movies, series, episodes..."
          value={term}
          onChange={(event) => setTerm(event.target.value)}
        />
        <button
          className="rounded-full bg-accent px-4 py-2 text-sm font-semibold text-black"
          onClick={handleSearch}
          disabled={!userId || loading}
        >
          {loading ? 'Searching...' : 'Search'}
        </button>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        {results.map((item) => (
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
