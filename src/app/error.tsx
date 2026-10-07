'use client';

export default function GlobalError({ reset }: { error: Error; reset: () => void }) {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 px-4 text-center" role="alert">
      <h1 className="text-3xl font-semibold">Something went wrong</h1>
      <p className="text-muted">An unexpected error occurred. Your preferences and favorites are safe.</p>
      <button type="button" className="btn-primary" onClick={reset}>Try again</button>
    </main>
  );
}
