export function SkeletonCard() {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-4 animate-pulse">
      <div className="flex items-center gap-3">
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/3" />
          <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-2/3" />
          <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-1/2" />
        </div>
        <div className="h-8 w-20 bg-slate-200 dark:bg-slate-700 rounded-lg" />
      </div>
    </div>
  )
}

export function SkeletonList({ count = 5 }: { count?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }, (_, i) => <SkeletonCard key={i} />)}
    </div>
  )
}
