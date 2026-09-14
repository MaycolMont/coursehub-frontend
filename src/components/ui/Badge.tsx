import { cn } from '@/lib/utils'
import type { ReactNode } from 'react'

type BadgeVariant = 'exam' | 'lab' | 'note' | 'info'

const variantStyles: Record<BadgeVariant, string> = {
  exam: 'bg-badge-exam-bg text-badge-exam-fg',
  lab: 'bg-badge-lab-bg text-badge-lab-fg',
  note: 'bg-badge-note-bg text-badge-note-fg',
  info: 'bg-surface-container text-on-surface-variant',
}

interface BadgeProps {
  variant: BadgeVariant
  children: ReactNode
  className?: string
}

export function Badge({ variant, children, className }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-label-sm font-medium',
        variantStyles[variant],
        className
      )}
    >
      {children}
    </span>
  )
}
