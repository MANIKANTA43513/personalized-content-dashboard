import Link from 'next/link';

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 px-4 text-center">
      <h1 className="text-4xl font-semibold">Page not found</h1>
      <p className="text-muted">That page doesn’t exist. Head back to your dashboard.</p>
      <Link href="/dashboard" className="btn-primary">Go to dashboard</Link>
    </main>
  );
}
