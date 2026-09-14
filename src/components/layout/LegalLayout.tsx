import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'

interface LegalLayoutProps {
  breadcrumb: string
  title: string
  updatedAt: string
  icon?: string
  children: ReactNode
}

export function LegalLayout({
  breadcrumb,
  title,
  updatedAt,
  icon = 'gavel',
  children,
}: LegalLayoutProps) {
  return (
    <main className="min-h-screen bg-surface px-4 py-8">
      <div className="mx-auto max-w-3xl">
        <nav className="mb-4 text-body-sm text-on-surface-variant">
          <Link to="/" className="hover:text-secondary">
            Inicio
          </Link>
          <span className="mx-2">/</span>
          <span className="font-medium text-on-surface">{breadcrumb}</span>
        </nav>

        <div className="mb-2 flex items-center gap-3">
          <span className="material-symbols-outlined text-[28px] text-secondary">
            {icon}
          </span>
          <h1 className="font-display text-headline-lg font-bold text-on-surface">
            {title}
          </h1>
        </div>
        <p className="mb-8 text-body-sm text-outline">
          Última actualización: {updatedAt}
        </p>

        <div className="space-y-8">{children}</div>
      </div>
    </main>
  )
}