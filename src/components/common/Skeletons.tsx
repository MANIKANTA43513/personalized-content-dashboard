export function ContentCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-card border border-line bg-surface" aria-hidden="true">
      <div className="skeleton aspect-[16/9] w-full" />
      <div className="space-y-3 p-4">
        <div className="skeleton h-3 w-24 rounded" />
        <div className="skeleton h-5 w-11/12 rounded" />
        <div className="skeleton h-5 w-2/3 rounded" />
        <div className="skeleton h-3 w-full rounded" />
        <div className="skeleton h-9 w-28 rounded-lg" />
      </div>
    </div>
  );
}

export function FeedSkeleton({ count = 6, label }: { count?: number; label: string }) {
  return (
    <div role="status" aria-live="polite" aria-label={label} data-testid="feed-skeleton">
      <span className="sr-only">{label}</span>
      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: count }, (_, i) => (
          <ContentCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}

export function SectionSkeleton({ label }: { label: string }) {
  return (
    <div role="status" aria-label={label} className="space-y-4" aria-live="polite">
      <span className="sr-only">{label}</span>
      <div className="skeleton h-7 w-48 rounded" aria-hidden="true" />
      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3" aria-hidden="true">
        {Array.from({ length: 3 }, (_, i) => (
          <ContentCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}

export function LoadingSkeleton({ lines = 3 }: { lines?: number }) {
  return (
    <div aria-hidden="true" className="space-y-2">
      {Array.from({ length: lines }, (_, i) => (
        <div key={i} className="skeleton h-4 rounded" style={{ width: `${90 - i * 15}%` }} />
      ))}
    </div>
  );
}
