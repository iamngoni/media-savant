import { createFileRoute, Link } from '@tanstack/react-router'
import { useState, useCallback, useEffect } from 'react'
import { Search as SearchIcon, X } from 'lucide-react'

import { useSessionStore } from '../stores/session'
import { searchItems, type JellyfinItem } from '../lib/jellyfin'
import { MediaCard } from '../components/media'
import { Input, Button } from '../components/ui'

export const Route = createFileRoute('/search')({
  component: Search,
})

function Search() {
  const userId = useSessionStore((state) => state.userId)
  const isAuthenticated = useSessionStore((state) => state.isAuthenticated)
  const [term, setTerm] = useState('')
  const [results, setResults] = useState<JellyfinItem[]>([])
  const [loading, setLoading] = useState(false)
  const [hasSearched, setHasSearched] = useState(false)

  // Group results by type
  const movies = results.filter((item) => item.Type === 'Movie')
  const series = results.filter((item) => item.Type === 'Series')
  const episodes = results.filter((item) => item.Type === 'Episode')

  const handleSearch = useCallback(async () => {
    if (!userId || !term.trim()) return
    setLoading(true)
    setHasSearched(true)
    try {
      const res = await searchItems(userId, term.trim())
      setResults(res.Items ?? [])
    } finally {
      setLoading(false)
    }
  }, [userId, term])

  // Handle enter key
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch()
    }
  }

  const clearSearch = () => {
    setTerm('')
    setResults([])
    setHasSearched(false)
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-8">
        <SearchIcon className="w-12 h-12 text-foreground/20 mb-4" />
        <h2 className="text-2xl font-semibold mb-2">Sign in to search</h2>
        <p className="text-foreground/60 mb-6 max-w-md">
          Connect to your Jellyfin server to search your media collection.
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

  return (
    <div className="py-8 pb-16 space-y-8">
      {/* Header */}
      <div className="px-8 lg:px-20 space-y-6">
        <h1 className="text-3xl font-bold">Search</h1>

        {/* Search Input */}
        <div className="flex gap-3 max-w-2xl">
          <div className="flex-1 relative">
            <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-foreground/40" />
            <input
              type="text"
              placeholder="Search movies, series, episodes..."
              value={term}
              onChange={(e) => setTerm(e.target.value)}
              onKeyDown={handleKeyDown}
              className="w-full pl-12 pr-10 py-3 rounded-xl border border-muted/60 bg-muted/30 text-sm text-foreground placeholder:text-foreground/40 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/50"
            />
            {term && (
              <button
                onClick={clearSearch}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-foreground/40 hover:text-foreground/60"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
          <Button onClick={handleSearch} disabled={loading || !term.trim()}>
            {loading ? 'Searching...' : 'Search'}
          </Button>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex justify-center py-12">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {/* Results */}
      {!loading && hasSearched && (
        <div className="px-8 lg:px-20 space-y-10">
          {/* Movies */}
          {movies.length > 0 && (
            <section className="space-y-4">
              <h2 className="text-xl font-semibold">Movies ({movies.length})</h2>
              <div className="grid gap-6 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
                {movies.map((item) => (
                  <MediaCard key={item.Id} item={item} showGenres />
                ))}
              </div>
            </section>
          )}

          {/* Series */}
          {series.length > 0 && (
            <section className="space-y-4">
              <h2 className="text-xl font-semibold">TV Shows ({series.length})</h2>
              <div className="grid gap-6 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
                {series.map((item) => (
                  <MediaCard key={item.Id} item={item} showRating />
                ))}
              </div>
            </section>
          )}

          {/* Episodes */}
          {episodes.length > 0 && (
            <section className="space-y-4">
              <h2 className="text-xl font-semibold">Episodes ({episodes.length})</h2>
              <div className="grid gap-6 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
                {episodes.map((item) => (
                  <MediaCard key={item.Id} item={item} />
                ))}
              </div>
            </section>
          )}

          {/* No Results */}
          {results.length === 0 && (
            <div className="min-h-[40vh] flex flex-col items-center justify-center text-center">
              <SearchIcon className="w-12 h-12 text-foreground/20 mb-4" />
              <h2 className="text-xl font-semibold mb-2">No results found</h2>
              <p className="text-foreground/60 max-w-md">
                Try searching for something else or check your spelling.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Initial State */}
      {!loading && !hasSearched && (
        <div className="min-h-[40vh] flex flex-col items-center justify-center text-center px-8">
          <SearchIcon className="w-12 h-12 text-foreground/20 mb-4" />
          <h2 className="text-xl font-semibold mb-2">Search your library</h2>
          <p className="text-foreground/60 max-w-md">
            Find movies, TV shows, and episodes in your Jellyfin library.
          </p>
        </div>
      )}
    </div>
  )
}
