import { createFileRoute, Link } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import { Play, Plus, Heart, Share2, Star, ChevronRight } from 'lucide-react'

import { useSessionStore } from '../stores/session'
import {
  fetchItemDetails,
  fetchEpisodes,
  fetchSeasons,
  fetchSimilar,
  imageUrl,
  backdropUrl,
  streamUrl,
  type JellyfinItem,
} from '../lib/jellyfin'
import { Button } from '../components/ui/Button'
import { Badge } from '../components/ui/Badge'
import { EpisodeCard, CastMember, MediaCard, MediaCarousel } from '../components/media'

export const Route = createFileRoute('/item/$itemId')({
  component: ItemDetail,
})

type Tab = 'episodes' | 'cast' | 'media' | 'details'

function ItemDetail() {
  const { itemId } = Route.useParams()
  const userId = useSessionStore((state) => state.userId)
  const [item, setItem] = useState<JellyfinItem | null>(null)
  const [episodes, setEpisodes] = useState<JellyfinItem[]>([])
  const [seasons, setSeasons] = useState<JellyfinItem[]>([])
  const [selectedSeason, setSelectedSeason] = useState<string | null>(null)
  const [similarItems, setSimilarItems] = useState<JellyfinItem[]>([])
  const [activeTab, setActiveTab] = useState<Tab>('episodes')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [showPlayer, setShowPlayer] = useState(false)

  useEffect(() => {
    if (!userId) return

    setLoading(true)
    Promise.all([
      fetchItemDetails(userId, itemId),
      fetchSimilar(userId, itemId).catch(() => ({ Items: [] })),
    ])
      .then(([itemData, similarData]) => {
        setItem(itemData)
        setSimilarItems(similarData.Items ?? [])

        // If it's a series, fetch seasons
        if (itemData.Type === 'Series') {
          fetchSeasons(userId, itemId)
            .then((seasonsData) => {
              const seasonsList = seasonsData.Items ?? []
              setSeasons(seasonsList)
              if (seasonsList.length > 0) {
                setSelectedSeason(seasonsList[0].Id)
              }
            })
            .catch(console.error)
        }
      })
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed to load item'))
      .finally(() => setLoading(false))
  }, [userId, itemId])

  // Fetch episodes when season changes
  useEffect(() => {
    if (!userId || !selectedSeason) return

    fetchEpisodes(userId, itemId, selectedSeason)
      .then((data) => setEpisodes(data.Items ?? []))
      .catch(console.error)
  }, [userId, itemId, selectedSeason])

  if (loading) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (error || !item) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <p className="text-red-400">{error || 'Item not found'}</p>
      </div>
    )
  }

  const isSeries = item.Type === 'Series'
  const isMovie = item.Type === 'Movie'
  const isEpisode = item.Type === 'Episode'
  const cast = item.People?.filter((p) => p.Type === 'Actor') ?? []
  const directors = item.People?.filter((p) => p.Type === 'Director') ?? []
  const writers = item.People?.filter((p) => p.Type === 'Writer') ?? []

  const tabs: { id: Tab; label: string }[] = [
    { id: 'episodes', label: 'Episodes' },
    { id: 'cast', label: 'Cast & Crew' },
    { id: 'media', label: 'Media' },
    { id: 'details', label: 'Details' },
  ]

  return (
    <div className="pb-16">
      {/* Video Player Modal */}
      {showPlayer && (
        <div className="fixed inset-0 z-50 bg-black flex items-center justify-center">
          <button
            onClick={() => setShowPlayer(false)}
            className="absolute top-4 right-4 text-white/80 hover:text-white"
          >
            Close
          </button>
          <video
            controls
            autoPlay
            className="w-full h-full max-h-screen"
            src={streamUrl(item.Id)}
            poster={backdropUrl(item.Id)}
          />
        </div>
      )}

      {/* Hero Section */}
      <section className="relative h-[70vh] min-h-[540px] w-full overflow-hidden">
        {/* Backdrop */}
        <div className="absolute inset-0">
          <img
            src={backdropUrl(item.Id)}
            alt={item.Name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-hero" />
          <div className="absolute inset-0 bg-gradient-fade" />
        </div>

        {/* Content */}
        <div className="relative z-10 h-full flex items-end px-8 lg:px-20 pb-12">
          <div className="flex gap-8">
            {/* Poster */}
            <div className="hidden lg:block flex-shrink-0 w-[280px] rounded-xl overflow-hidden border border-muted/40 shadow-2xl">
              <img
                src={imageUrl(item.Id, 560)}
                alt={item.Name}
                className="w-full h-auto"
              />
            </div>

            {/* Info */}
            <div className="max-w-2xl space-y-5">
              <h1 className="text-4xl lg:text-5xl font-bold">{item.Name}</h1>

              {/* Metadata Row */}
              <div className="flex items-center gap-4 flex-wrap">
                {item.OfficialRating && (
                  <Badge variant="rating">{item.OfficialRating}</Badge>
                )}
                {item.ProductionYear && (
                  <span className="text-sm text-foreground/70">{item.ProductionYear}</span>
                )}
                {isSeries && seasons.length > 0 && (
                  <span className="text-sm text-foreground/70">{seasons.length} Seasons</span>
                )}
                {isMovie && item.RunTimeTicks && (
                  <span className="text-sm text-foreground/70">
                    {Math.round(item.RunTimeTicks / 10000000 / 60)} min
                  </span>
                )}
              </div>

              {/* Rating */}
              {item.CommunityRating && (
                <div className="flex items-center gap-2">
                  <Star className="w-5 h-5 text-yellow-500" fill="currentColor" />
                  <span className="font-medium">{item.CommunityRating.toFixed(1)}</span>
                  <span className="text-sm text-foreground/60">Community Rating</span>
                </div>
              )}

              {/* Genres */}
              {item.Genres && item.Genres.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {item.Genres.map((genre) => (
                    <Badge key={genre} variant="genre">{genre}</Badge>
                  ))}
                </div>
              )}

              {/* Overview */}
              {item.Overview && (
                <p className="text-sm text-foreground/80 line-clamp-4">{item.Overview}</p>
              )}

              {/* Action Buttons */}
              <div className="flex items-center gap-3 pt-2">
                <Button size="lg" onClick={() => setShowPlayer(true)}>
                  <Play className="w-5 h-5" fill="currentColor" />
                  Play
                </Button>
                <Button variant="secondary" size="lg">
                  <Plus className="w-5 h-5" />
                  Add to List
                </Button>
                <Button variant="ghost" size="lg" className="px-3">
                  <Heart className="w-5 h-5" />
                </Button>
                <Button variant="ghost" size="lg" className="px-3">
                  <Share2 className="w-5 h-5" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Tab Navigation */}
      {isSeries && (
        <div className="border-b border-muted/30">
          <div className="px-8 lg:px-20 flex gap-8">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-5 text-sm font-medium transition-colors relative ${
                  activeTab === tab.id
                    ? 'text-foreground'
                    : 'text-foreground/60 hover:text-foreground'
                }`}
              >
                {tab.label}
                {activeTab === tab.id && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Tab Content */}
      <div className="px-8 lg:px-20 py-12 space-y-12">
        {/* Episodes Tab */}
        {isSeries && activeTab === 'episodes' && (
          <section className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-semibold">Episodes</h2>
              {seasons.length > 1 && (
                <select
                  value={selectedSeason ?? ''}
                  onChange={(e) => setSelectedSeason(e.target.value)}
                  className="px-4 py-2 rounded-lg bg-muted/40 border border-muted/60 text-sm"
                >
                  {seasons.map((season) => (
                    <option key={season.Id} value={season.Id}>
                      {season.Name}
                    </option>
                  ))}
                </select>
              )}
            </div>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {episodes.map((episode) => (
                <EpisodeCard key={episode.Id} item={episode} />
              ))}
            </div>
          </section>
        )}

        {/* Cast Tab */}
        {activeTab === 'cast' && cast.length > 0 && (
          <section className="space-y-6">
            <h2 className="text-2xl font-semibold">Cast & Crew</h2>
            <div className="flex gap-6 overflow-x-auto pb-4">
              {cast.map((person, idx) => (
                <CastMember key={`${person.Name}-${idx}`} person={person} />
              ))}
            </div>
          </section>
        )}

        {/* Details Tab */}
        {activeTab === 'details' && (
          <section className="space-y-6">
            <h2 className="text-2xl font-semibold">More Information</h2>
            <div className="grid gap-6 md:grid-cols-2">
              {directors.length > 0 && (
                <div>
                  <p className="text-sm text-foreground/60 mb-1">Director</p>
                  <p className="font-medium">{directors.map((d) => d.Name).join(', ')}</p>
                </div>
              )}
              {writers.length > 0 && (
                <div>
                  <p className="text-sm text-foreground/60 mb-1">Writers</p>
                  <p className="font-medium">{writers.map((w) => w.Name).join(', ')}</p>
                </div>
              )}
              {item.Studios && item.Studios.length > 0 && (
                <div>
                  <p className="text-sm text-foreground/60 mb-1">Studio</p>
                  <p className="font-medium">{item.Studios.map((s) => s.Name).join(', ')}</p>
                </div>
              )}
              {item.PremiereDate && (
                <div>
                  <p className="text-sm text-foreground/60 mb-1">Release Date</p>
                  <p className="font-medium">{new Date(item.PremiereDate).toLocaleDateString()}</p>
                </div>
              )}
            </div>
          </section>
        )}

        {/* Movie-specific: Show cast directly */}
        {(isMovie || isEpisode) && cast.length > 0 && (
          <section className="space-y-6">
            <h2 className="text-2xl font-semibold">Cast & Crew</h2>
            <div className="flex gap-6 overflow-x-auto pb-4">
              {cast.slice(0, 8).map((person, idx) => (
                <CastMember key={`${person.Name}-${idx}`} person={person} />
              ))}
            </div>
          </section>
        )}

        {/* Similar Items */}
        {similarItems.length > 0 && (
          <MediaCarousel title="You Might Also Like">
            {similarItems.map((similar) => (
              <MediaCard key={similar.Id} item={similar} showRating />
            ))}
          </MediaCarousel>
        )}
      </div>
    </div>
  )
}
