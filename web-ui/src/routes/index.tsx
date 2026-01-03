import { createFileRoute, Link } from '@tanstack/react-router'
import { useEffect, useState } from 'react'

import { useSessionStore } from '../stores/session'
import {
  fetchLatest,
  fetchPopular,
  fetchRecommended,
  fetchResume,
  type JellyfinItem,
} from '../lib/jellyfin'
import { HeroSection, MediaCarousel, MediaCard, MediaThumbnail } from '../components/media'
import { Button } from '../components/ui'

export const Route = createFileRoute('/')({
  component: Home,
})

function Home() {
  const { userId, isAuthenticated } = useSessionStore()
  const [loading, setLoading] = useState(false)
  const [heroItem, setHeroItem] = useState<JellyfinItem | null>(null)
  const [resumeItems, setResumeItems] = useState<JellyfinItem[]>([])
  const [latestItems, setLatestItems] = useState<JellyfinItem[]>([])
  const [popularItems, setPopularItems] = useState<JellyfinItem[]>([])
  const [recommendedItems, setRecommendedItems] = useState<JellyfinItem[]>([])

  useEffect(() => {
    if (!userId) return

    setLoading(true)
    Promise.all([
      fetchResume(userId),
      fetchLatest(userId),
      fetchPopular(userId),
      fetchRecommended(userId),
    ])
      .then(([resumeRes, latestRes, popularRes, recommendedRes]) => {
        const resume = resumeRes?.Items ?? []
        const latest = latestRes ?? []
        const popular = popularRes?.Items ?? []
        const recommended = recommendedRes?.Items ?? []

        setResumeItems(resume)
        setLatestItems(latest)
        setPopularItems(popular)
        setRecommendedItems(recommended)

        // Pick a hero item from resume or latest
        const heroCandidate = resume[0] || latest[0] || popular[0]
        if (heroCandidate) {
          setHeroItem(heroCandidate)
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [userId])

  // Show welcome screen if not authenticated
  if (!isAuthenticated) {
    return <WelcomeScreen />
  }

  if (loading) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-12 pb-16">
      {/* Hero Section */}
      {heroItem && (
        <HeroSection
          item={heroItem}
          relatedItems={latestItems.slice(0, 5)}
        />
      )}

      {/* Continue Watching */}
      {resumeItems.length > 0 && (
        <MediaCarousel title="Continue Watching" viewAllLink="/library">
          {resumeItems.map((item) => (
            <MediaThumbnail key={item.Id} item={item} showProgress />
          ))}
        </MediaCarousel>
      )}

      {/* Recommended for You */}
      {recommendedItems.length > 0 && (
        <MediaCarousel title="Recommended for You" viewAllLink="/library">
          {recommendedItems.map((item) => (
            <MediaCard key={item.Id} item={item} showGenres />
          ))}
        </MediaCarousel>
      )}

      {/* Popular TV Shows */}
      {popularItems.length > 0 && (
        <MediaCarousel title="Popular TV Shows" viewAllLink="/library">
          {popularItems.map((item) => (
            <MediaCard key={item.Id} item={item} showRating />
          ))}
        </MediaCarousel>
      )}

      {/* Recently Added */}
      {latestItems.length > 0 && (
        <MediaCarousel title="Recently Added" viewAllLink="/library">
          {latestItems.map((item) => (
            <MediaThumbnail key={item.Id} item={item} showBadge showTimestamp />
          ))}
        </MediaCarousel>
      )}

      {/* Empty state */}
      {!heroItem && !resumeItems.length && !latestItems.length && (
        <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-8">
          <h2 className="text-2xl font-semibold mb-2">Your library is empty</h2>
          <p className="text-foreground/60 mb-6 max-w-md">
            Start by adding some content to your Jellyfin server, then come back to see it here.
          </p>
          <Link to="/library">
            <Button>Browse Library</Button>
          </Link>
        </div>
      )}
    </div>
  )
}

function WelcomeScreen() {
  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center text-center px-8">
      <div className="max-w-2xl space-y-8">
        <div className="space-y-4">
          <p className="text-xs uppercase tracking-[0.3em] text-primary">Jellyfin Client</p>
          <h1 className="text-5xl font-bold">
            Your media, beautifully organized
          </h1>
          <p className="text-lg text-foreground/70">
            Connect to your Jellyfin server and enjoy your personal media collection
            with a modern, clean interface.
          </p>
        </div>

        <div className="flex items-center justify-center gap-4">
          <Link to="/setup">
            <Button size="lg">Get Started</Button>
          </Link>
          <Link to="/library">
            <Button variant="outline" size="lg">Browse Library</Button>
          </Link>
        </div>

        <div className="grid grid-cols-3 gap-8 pt-8 border-t border-muted/30">
          <div className="text-center">
            <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-primary/10 flex items-center justify-center">
              <svg className="w-6 h-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <p className="text-sm font-medium">Enterprise Security</p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-primary/10 flex items-center justify-center">
              <svg className="w-6 h-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
              </svg>
            </div>
            <p className="text-sm font-medium">Cloud Sync</p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-primary/10 flex items-center justify-center">
              <svg className="w-6 h-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <p className="text-sm font-medium">All Your Devices</p>
          </div>
        </div>
      </div>
    </div>
  )
}
