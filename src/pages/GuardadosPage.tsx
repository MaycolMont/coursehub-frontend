import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import type { Recurso } from '@/types'
import { usuariosService } from '@/services/usuarios.service'
import ResourceCard from '@/components/ui/ResourceCard'
import ResourcePreviewModal from '@/components/ui/ResourcePreviewModal'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'

export default function GuardadosPage() {
  const [guardados, setGuardados] = useState<Recurso[]>([])
  const [loading, setLoading] = useState(true)
  const [previewRecurso, setPreviewRecurso] = useState<Recurso | null>(null)

  const fetchGuardados = useCallback(() => {
    let active = true
    usuariosService
      .getGuardados()
      .then((data) => {
        if (active) setGuardados(data)
      })
      .catch(() => {
        if (active) setGuardados([])
      })
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => {
      active = false
    }
  }, [])

  useEffect(() => {
    return fetchGuardados()
  }, [fetchGuardados])

  const handleClosePreview = () => {
    setPreviewRecurso(null)
    fetchGuardados()
  }

  return (
    <main className="min-h-screen bg-surface px-4 py-8">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-[28px] text-secondary">
              bookmark
            </span>
            <h1 className="font-display text-headline-lg font-bold text-on-surface">
              Mis Recursos Guardados
            </h1>
          </div>
          <p className="mt-2 text-body-lg text-on-surface-variant">
            Accede rápidamente a los recursos que has guardado.
          </p>
        </div>

        {/* Content */}
        {loading ? (
          <div className="py-20">
            <LoadingSpinner size={40} />
          </div>
        ) : guardados.length === 0 ? (
          <div className="py-20 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-surface-container-low">
              <span className="material-symbols-outlined text-[32px] text-outline">
                bookmark_border
              </span>
            </div>
            <p className="text-title font-semibold text-on-surface">
              No tienes recursos guardados
            </p>
            <p className="mt-2 text-body-md text-on-surface-variant">
              Explora el catálogo y guarda los recursos que más te interesen.
            </p>
            <Link
              to="/"
              className="mt-6 inline-flex items-center gap-2 rounded-full bg-secondary px-5 py-2.5 text-body-md font-semibold text-on-primary transition-colors hover:bg-secondary-container"
            >
              <span className="material-symbols-outlined text-[20px]">explore</span>
              Explorar recursos
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {guardados.map((recurso) => (
              <ResourceCard
                key={recurso.id}
                recurso={recurso}
                onOpen={(r) => setPreviewRecurso(r)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Preview Modal */}
      {previewRecurso && (
        <ResourcePreviewModal
          recurso={previewRecurso}
          onClose={handleClosePreview}
          onRequireAuth={() => undefined}
        />
      )}
    </main>
  )
}
