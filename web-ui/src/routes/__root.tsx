import { createRootRoute, Outlet, HeadContent, Scripts } from '@tanstack/react-router'
import { useEffect, useState } from 'react'

import '../styles.css'
import { fetchSession, logout as logoutSession } from '../lib/auth'
import { useSessionStore } from '../stores/session'
import { Header } from '../components/layout'

export const Route = createRootRoute({
  component: RootLayout,
})

function RootLayout() {
  const { isAuthenticated, username, setSession, clearSession } = useSessionStore()
  const [status, setStatus] = useState<'idle' | 'loading'>('loading')

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

  const handleLogout = async () => {
    await logoutSession()
    clearSession()
  }

  return (
    <html lang="en">
      <head>
        <HeadContent />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen bg-background text-foreground font-sans antialiased">
        {status === 'loading' ? (
          <div className="min-h-screen flex items-center justify-center">
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <>
            <Header
              isAuthenticated={isAuthenticated}
              username={username}
              onLogout={handleLogout}
            />
            <main className="pt-20">
              <Outlet />
            </main>
          </>
        )}
        <Scripts />
      </body>
    </html>
  )
}
