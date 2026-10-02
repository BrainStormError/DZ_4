import { cn } from '@/lib/utils';

export function ContentSkeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn('mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8', className)}
      aria-busy="true"
    >
      <span className="sr-only">Загрузка…</span>
      <div className="min-h-[60vh] animate-pulse space-y-4">
        <div className="h-8 w-1/3 rounded-lg bg-muted" />
        <div className="h-4 w-1/2 rounded bg-muted" />
        <div className="h-40 rounded-2xl bg-muted" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div className="h-24 rounded-2xl bg-muted" />
          <div className="h-24 rounded-2xl bg-muted" />
          <div className="h-24 rounded-2xl bg-muted" />
        </div>
      </div>
    </div>
  );
}
