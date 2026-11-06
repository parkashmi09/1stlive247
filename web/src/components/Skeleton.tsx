export const Skeleton = ({ className }: { className: string }) => (
  <div aria-hidden className={`animate-pulse rounded-2xl bg-surface-2 ${className}`} />
);

export const ListSkeleton = ({ rows = 3, h = "h-28" }: { rows?: number; h?: string }) => (
  <div className="flex flex-col gap-2" role="status" aria-label="Loading">
    {Array.from({ length: rows }, (_, i) => <Skeleton key={i} className={h} />)}
  </div>
);
