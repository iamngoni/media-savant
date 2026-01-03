import { createFileRoute, Link } from '@tanstack/react-router'

export const Route = createFileRoute('/')({
  component: Home,
})

function Home() {
  return (
    <section className="grid gap-8">
      <div className="grid gap-4">
        <p className="text-xs uppercase tracking-[0.3em] text-foreground/60">Jellyfin client</p>
        <h2 className="text-4xl font-semibold leading-tight">
          Your library, curated and tuned for the way you watch.
        </h2>
        <p className="max-w-2xl text-base text-foreground/70">
          mdia savant is a dedicated Jellyfin UI built for a single server and
          multiple family profiles. Configure the server once, then browse and
          play from anywhere on your Tailscale network.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-2xl border border-muted/60 bg-muted/40 p-6">
          <h3 className="text-lg font-semibold">First-time setup</h3>
          <p className="mt-2 text-sm text-foreground/70">
            Connect to your Jellyfin host, authenticate, and save the session in
            Redis.
          </p>
          <Link
            to="/setup"
            className="mt-4 inline-flex items-center rounded-full bg-accent px-4 py-2 text-sm font-semibold text-black"
          >
            Start setup
          </Link>
        </div>
        <div className="rounded-2xl border border-muted/60 bg-muted/40 p-6">
          <h3 className="text-lg font-semibold">Library experience</h3>
          <p className="mt-2 text-sm text-foreground/70">
            Continue watching, browse by collection, and manage play queues.
          </p>
          <Link
            to="/library"
            className="mt-4 inline-flex items-center rounded-full border border-foreground/40 px-4 py-2 text-sm font-semibold text-foreground"
          >
            View library
          </Link>
        </div>
      </div>
    </section>
  )
}
