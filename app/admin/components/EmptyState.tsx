interface EmptyStateProps {
  icon: React.ReactNode
  title: string
  subtitle?: string
  action?: React.ReactNode
}

export function EmptyState({ icon, title, subtitle, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-slate-700/60 flex items-center justify-center mb-4 text-slate-400 dark:text-slate-500">
        {icon}
      </div>
      <p className="text-base font-semibold text-slate-700 dark:text-slate-300">{title}</p>
      {subtitle && <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-xs leading-relaxed">{subtitle}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  )
}
