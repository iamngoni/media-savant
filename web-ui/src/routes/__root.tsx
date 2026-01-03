import { createRootRoute, Outlet, Link } from '@tanstack/react-router'
import { HeadContent, Scripts } from '@tanstack/react-start'
import { useEffect, useState } from 'react'

import '../styles.css'
import { fetchSession, logout as logoutSession } from '../lib/auth'
import { useSessionStore } from '../stores/session'

export const Route = createRootRoute({
  component: RootLayout,
})

function RootLayout() {
  const { isAuthenticated, username, serverUrl, setSession, clearSession } = useSessionStore()
  const [status, setStatus] = useState<'idle' | 'loading'>('idle')

  useEffect(() => {
    let active = true
    setStatus('loading')
    fetchSession()
      .then((res) => {
        if (!active) return
        if (res?.data) {
          setSession({
            username: res.data.username,
            serverUrl: res.data.server_url,
            userId: res.data.user_id,
          })
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
  }, [setSession, clearSession])

  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body className="min-h-screen bg-background text-foreground">
        <header className="border-b border-muted/50">
          <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-accent">mdia savant</p>
              <h1 className="text-xl font-semibold">Media Control Center</h1>
            </div>
            <nav className="flex items-center gap-4 text-sm text-foreground/70">
              <Link to="/" className="hover:text-foreground">
                Home
              </Link>
              <Link to="/setup" className="hover:text-foreground">
                Setup
              </Link>
              <Link to="/library" className="hover:text-foreground">
                Library
              </Link>
              <Link to="/search" className="hover:text-foreground">
                Search
              </Link>
            </nav>
          </div>
          <div className="flex items-center gap-3 text-xs text-foreground/60">
            {status === 'loading' ? (
              <span>Checking session...</span>
            ) : isAuthenticated ? (
              <>
                <span>{username}</span>
                <span className="hidden md:inline">•</span>
                <span className="hidden md:inline">{serverUrl}</span>
                <button
                  className="rounded-full border border-muted/60 px-3 py-1 text-xs"
                  onClick={async () => {
                    await logoutSession()
                    clearSession()
                  }}
                >
                  Logout
                </button>
              </>
            ) : (
              <span>Not connected</span>
            )}
          </div>
        </header>
        <main className="mx-auto max-w-6xl px-6 py-10">
          <Outlet />
        </main>
        <Scripts />
      </body>
    </html>
  )
}
