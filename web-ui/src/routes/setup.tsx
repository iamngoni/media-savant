import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'

import { login, validateServer } from '../lib/auth'
import { useSessionStore } from '../stores/session'

export const Route = createFileRoute('/setup')({
  component: Setup,
})

const steps = [
  {
    title: 'Server details',
    description: 'Protocol, host, port, and base path.',
  },
  {
    title: 'Credentials',
    description: 'Jellyfin username and password.',
  },
  {
    title: 'Verification',
    description: 'Confirm connection and save session.',
  },
]

function Setup() {
  const [activeStep, setActiveStep] = useState(0)
  const [form, setForm] = useState({
    protocol: 'http',
    host: '',
    port: '',
    basePath: '',
    username: '',
    password: '',
  })
  const [status, setStatus] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const setSession = useSessionStore((state) => state.setSession)

  const serverUrl = `${form.protocol}://${form.host}${form.port ? `:${form.port}` : ''}${
    form.basePath ? `/${form.basePath.replace(/^\\//, '')}` : ''
  }`

  const handleVerify = async () => {
    setError(null)
    setStatus(null)
    setLoading(true)

    try {
      await validateServer(serverUrl)
      const auth = await login({
        server_url: serverUrl,
        username: form.username,
        password: form.password,
      })

      if (auth?.data) {
        setSession({ username: auth.data.username, serverUrl: auth.data.server_url })
        setStatus('Connected and session saved.')
      } else {
        setError(auth?.error ?? 'Login failed.')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Setup failed.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="grid gap-8">
      <div>
        <h2 className="text-3xl font-semibold">Connect your Jellyfin server</h2>
        <p className="mt-2 text-sm text-foreground/70">
          This wizard stores your session in Redis and keeps tokens off the
          browser.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
        <aside className="rounded-2xl border border-muted/60 bg-muted/40 p-6">
          <ul className="grid gap-4">
            {steps.map((step, index) => (
              <li
                key={step.title}
                className={`rounded-xl border px-4 py-3 text-sm ${
                  index === activeStep
                    ? 'border-accent bg-accent/10 text-foreground'
                    : 'border-transparent text-foreground/60'
                }`}
              >
                <p className="font-semibold">{step.title}</p>
                <p className="text-xs text-foreground/60">{step.description}</p>
              </li>
            ))}
          </ul>
        </aside>

        <div className="rounded-2xl border border-muted/60 bg-muted/40 p-6">
          {activeStep === 0 && (
            <div className="grid gap-4">
              <h3 className="text-xl font-semibold">Server details</h3>
              <div className="grid gap-3 md:grid-cols-2">
                <input
                  className="rounded-xl border border-muted/70 bg-transparent px-4 py-2"
                  placeholder="Protocol (http/https)"
                  value={form.protocol}
                  onChange={(event) => setForm((prev) => ({ ...prev, protocol: event.target.value }))}
                />
                <input
                  className="rounded-xl border border-muted/70 bg-transparent px-4 py-2"
                  placeholder="Host"
                  value={form.host}
                  onChange={(event) => setForm((prev) => ({ ...prev, host: event.target.value }))}
                />
                <input
                  className="rounded-xl border border-muted/70 bg-transparent px-4 py-2"
                  placeholder="Port"
                  value={form.port}
                  onChange={(event) => setForm((prev) => ({ ...prev, port: event.target.value }))}
                />
                <input
                  className="rounded-xl border border-muted/70 bg-transparent px-4 py-2"
                  placeholder="Base path (optional)"
                  value={form.basePath}
                  onChange={(event) => setForm((prev) => ({ ...prev, basePath: event.target.value }))}
                />
              </div>
              <p className="text-xs text-foreground/60">Computed URL: {serverUrl}</p>
            </div>
          )}

          {activeStep === 1 && (
            <div className="grid gap-4">
              <h3 className="text-xl font-semibold">Credentials</h3>
              <div className="grid gap-3 md:grid-cols-2">
                <input
                  className="rounded-xl border border-muted/70 bg-transparent px-4 py-2"
                  placeholder="Username"
                  value={form.username}
                  onChange={(event) => setForm((prev) => ({ ...prev, username: event.target.value }))}
                />
                <input
                  className="rounded-xl border border-muted/70 bg-transparent px-4 py-2"
                  placeholder="Password"
                  type="password"
                  value={form.password}
                  onChange={(event) => setForm((prev) => ({ ...prev, password: event.target.value }))}
                />
              </div>
            </div>
          )}

          {activeStep === 2 && (
            <div className="grid gap-4">
              <h3 className="text-xl font-semibold">Verification</h3>
              <p className="text-sm text-foreground/70">
                We will validate the server, check credentials, and store the
                token in Redis. Errors will be shown with details.
              </p>
              <button
                className="w-fit rounded-full bg-accent px-4 py-2 text-sm font-semibold text-black"
                onClick={handleVerify}
                disabled={loading}
              >
                {loading ? 'Verifying...' : 'Verify & save'}
              </button>
              {status && <p className="text-sm text-accent">{status}</p>}
              {error && <p className="text-sm text-red-400">{error}</p>}
            </div>
          )}

          <div className="mt-8 flex items-center justify-between">
            <button
              className="rounded-full border border-muted/70 px-4 py-2 text-sm"
              disabled={activeStep === 0}
              onClick={() => setActiveStep((step) => Math.max(0, step - 1))}
            >
              Back
            </button>
            <button
              className="rounded-full bg-foreground px-4 py-2 text-sm font-semibold text-black"
              disabled={activeStep === steps.length - 1}
              onClick={() => setActiveStep((step) => Math.min(steps.length - 1, step + 1))}
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}
