import { cn } from '@/lib/utils'

interface LoadingSpinnerProps {
  className?: string
  size?: number
}

export function LoadingSpinner({ className, size = 24 }: LoadingSpinnerProps) {
  return (
    <div className={cn('flex items-center justify-center', className)}>
      <span
        className="material-symbols-outlined animate-spin text-secondary"
        style={{ fontSize: size }}
      >
        autorenew
      </span>
    </div>
  )
}
