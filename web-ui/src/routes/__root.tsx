import { createRootRoute, Outlet } from '@tanstack/react-router'
import { useEffect, useState } from 'react'

import { fetchSession, logout as logoutSession } from '../lib/auth'
import { fetchLibraries } from '../lib/jellyfin'
import { useSessionStore } from '../stores/session'
import { Header } from '../components/layout'

export const Route = createRootRoute({
  component: RootLayout,
})

function RootLayout() {
  const { isAuthenticated, username, libraries, setSession, setLibraries, clearSession } = useSessionStore()
  const [status, setStatus] = useState<'idle' | 'loading'>('loading')

  useEffect(() => {
    let active = true
    setStatus('loading')
    fetchSession()
      .then(async (res) => {
        if (!active) return
        if (res?.data) {
          setSession({
            username: res.data.username,
            serverUrl: res.data.server_url,
            userId: res.data.user_id,
          })
          // Fetch libraries after session is established
          try {
            const librariesRes = await fetchLibraries(res.data.user_id)
            if (active && librariesRes?.Items) {
              setLibraries(librariesRes.Items.map((lib) => ({
                Id: lib.Id,
                Name: lib.Name,
                CollectionType: lib.Type,
              })))
            }
          } catch (err) {
            console.error('Failed to fetch libraries:', err)
          }
        } else {
          clearSession()
        }
      })
      .catch(() => {
        if (active) clearSession()
      })
      .finally(() => {
        if (active) setStatus('idle')
      })

    return () => {
      active = false
    }
  }, [setSession, setLibraries, clearSession])

  const handleLogout = async () => {
    await logoutSession()
    clearSession()
  }

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background text-foreground font-sans antialiased">
      <Header
        isAuthenticated={isAuthenticated}
        username={username}
        libraries={libraries}
        onLogout={handleLogout}
      />
      <main className="pt-20">
        <Outlet />
      </main>
    </div>
  )
}
