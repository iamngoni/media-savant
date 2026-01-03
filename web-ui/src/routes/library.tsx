import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/library')({
  component: Library,
})

const shelves = [
  { title: 'Continue watching', items: 5 },
  { title: 'Recently added', items: 10 },
  { title: 'Movies', items: 12 },
  { title: 'Anime', items: 12 },
  { title: 'Animations', items: 12 },
  { title: 'Series', items: 12 },
]

function Library() {
  return (
    <section className="grid gap-8">
      <div>
        <h2 className="text-3xl font-semibold">Library overview</h2>
        <p className="mt-2 text-sm text-foreground/70">
          Queue, resume, and keep your family profiles in sync.
        </p>
      </div>

      <div className="grid gap-6">
        {shelves.map((shelf) => (
          <div key={shelf.title} className="grid gap-3">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">{shelf.title}</h3>
              <button className="text-xs uppercase tracking-[0.3em] text-foreground/50">
                View all
              </button>
            </div>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {Array.from({ length: shelf.items }).map((_, index) => (
                <div
                  key={`${shelf.title}-${index}`}
                  className="aspect-[3/4] rounded-2xl border border-muted/60 bg-muted/40"
                >
                  <div className="flex h-full items-end p-3 text-xs text-foreground/60">
                    Placeholder {index + 1}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
