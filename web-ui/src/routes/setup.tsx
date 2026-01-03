import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useState } from 'react'
import { Shield, Cloud, Monitor, Eye, EyeOff } from 'lucide-react'

import { login, validateServer } from '../lib/auth'
import { useSessionStore } from '../stores/session'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { Card } from '../components/ui/Card'

export const Route = createFileRoute('/setup')({
  component: Setup,
})

function Setup() {
  const navigate = useNavigate()
  const [form, setForm] = useState({
    serverUrl: '',
    username: '',
    password: '',
  })
  const [rememberMe, setRememberMe] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [status, setStatus] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const setSession = useSessionStore((state) => state.setSession)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setStatus(null)
    setLoading(true)

    try {
      // Validate server first
      setStatus('Validating server...')
      await validateServer(form.serverUrl)

      // Attempt login
      setStatus('Authenticating...')
      const auth = await login({
        server_url: form.serverUrl,
        username: form.username,
        password: form.password,
      })

      if (auth?.data) {
        setSession({
          username: auth.data.username,
          serverUrl: auth.data.server_url,
          userId: auth.data.user_id,
        })
        setStatus('Connected successfully!')
        // Navigate to home after brief delay
        setTimeout(() => navigate({ to: '/' }), 500)
      } else {
        setError(auth?.error ?? 'Login failed. Please check your credentials.')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Connection failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-[calc(100vh-5rem)] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md space-y-8">
        {/* Login Card */}
        <Card className="p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold">Welcome Back</h1>
            <p className="text-foreground/60 mt-2">Sign in to continue to Media Savant</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <Input
              label="Server URL"
              placeholder="https://jellyfin.example.com"
              value={form.serverUrl}
              onChange={(e) => setForm((prev) => ({ ...prev, serverUrl: e.target.value }))}
              required
            />

            <Input
              label="Username"
              placeholder="Enter your username"
              value={form.username}
              onChange={(e) => setForm((prev) => ({ ...prev, username: e.target.value }))}
              required
            />

            <div className="relative">
              <Input
                label="Password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter your password"
                value={form.password}
                onChange={(e) => setForm((prev) => ({ ...prev, password: e.target.value }))}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-[38px] text-foreground/40 hover:text-foreground/60 transition-colors"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>

            {/* Remember me */}
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded border-muted/60 bg-muted/30 text-primary focus:ring-primary/50"
                />
                <span className="text-sm text-foreground/70">Remember me</span>
              </label>
              <button type="button" className="text-sm text-primary hover:text-primary/80 transition-colors">
                Forgot password?
              </button>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={loading}
              className="w-full"
              size="lg"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </Button>

            {/* Status/Error Messages */}
            {status && !error && (
              <p className="text-sm text-center text-accent">{status}</p>
            )}
            {error && (
              <p className="text-sm text-center text-red-400">{error}</p>
            )}
          </form>

          {/* Sign up link */}
          <p className="text-center mt-6 text-sm text-foreground/60">
            Don't have an account?{' '}
            <button className="text-primary hover:text-primary/80 transition-colors">
              Sign up
            </button>
          </p>
        </Card>

        {/* Feature Icons */}
        <div className="flex justify-center gap-12">
          <FeatureIcon icon={Shield} label="Enterprise Security" />
          <FeatureIcon icon={Cloud} label="Cloud Sync" />
          <FeatureIcon icon={Monitor} label="All Your Devices" />
        </div>
      </div>
    </div>
  )
}

function FeatureIcon({ icon: Icon, label }: { icon: typeof Shield; label: string }) {
  return (
    <div className="text-center">
      <div className="w-10 h-10 mx-auto mb-2 rounded-full bg-muted/40 flex items-center justify-center">
        <Icon className="w-5 h-5 text-foreground/60" />
      </div>
      <p className="text-xs text-foreground/50">{label}</p>
    </div>
  )
}
