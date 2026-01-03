import { Link } from '@tanstack/react-router'
import { Search, Bell, User, LogOut } from 'lucide-react'
import { cn } from '../../lib/utils'
import type { Library } from '../../stores/session'

interface HeaderProps {
  isAuthenticated: boolean
  username?: string
  libraries?: Library[]
  onLogout?: () => void
}

export function Header({ isAuthenticated, username, libraries = [], onLogout }: HeaderProps) {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-muted/30">
      <div className="flex items-center justify-between px-8 lg:px-20 py-5">
        {/* Left: Logo + Nav */}
        <div className="flex items-center gap-12">
          <Link to="/" className="flex items-center gap-2">
            <span className="text-xl font-bold text-primary">Jellyfin</span>
          </Link>

          <nav className="hidden md:flex items-center gap-8">
            <Link
              to="/"
              className={cn(
                'text-sm font-medium text-foreground/60 hover:text-foreground transition-colors',
                '[&.active]:text-foreground'
              )}
            >
              Home
            </Link>
            {libraries.map((lib) => (
              <Link
                key={lib.Id}
                to="/library/$libraryId"
                params={{ libraryId: lib.Id }}
                className={cn(
                  'text-sm font-medium text-foreground/60 hover:text-foreground transition-colors',
                  '[&.active]:text-foreground'
                )}
              >
                {lib.Name}
              </Link>
            ))}
          </nav>
        </div>

        {/* Right: Search, Notifications, Avatar */}
        <div className="flex items-center gap-4">
          <Link
            to="/search"
            className="p-2 rounded-full text-foreground/60 hover:text-foreground hover:bg-muted/40 transition-colors"
          >
            <Search className="w-5 h-5" />
          </Link>

          {isAuthenticated && (
            <>
              <button className="p-2 rounded-full text-foreground/60 hover:text-foreground hover:bg-muted/40 transition-colors">
                <Bell className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-primary/20 border border-primary/40 flex items-center justify-center">
                  <User className="w-4 h-4 text-primary" />
                </div>

                {username && (
                  <span className="hidden lg:block text-sm text-foreground/70">{username}</span>
                )}

                <button
                  onClick={onLogout}
                  className="p-2 rounded-full text-foreground/60 hover:text-foreground hover:bg-muted/40 transition-colors"
                  title="Logout"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            </>
          )}

          {!isAuthenticated && (
            <Link
              to="/setup"
              className="px-4 py-2 text-sm font-medium bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
            >
              Sign In
            </Link>
          )}
        </div>
      </div>
    </header>
  )
}
