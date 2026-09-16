import { cn, formatDate } from '@/lib/utils'
import { Badge } from '@/components/ui/Badge'
import type { Recurso } from '@/types'

const categoryMap: Record<Recurso['categoria'], { label: string; variant: 'exam' | 'lab' | 'note' }> = {
  prueba: { label: 'Examen', variant: 'exam' },
  proyecto: { label: 'Laboratorio', variant: 'lab' },
  nota: { label: 'Apunte', variant: 'note' },
}

interface ResourceCardProps {
  resource?: Recurso
  recurso?: Recurso
  onPreview?: (resource: Recurso) => void
  onSave?: (resource: Recurso) => void
  onOpen?: (resource: Recurso) => void
  materiaNombre?: string
  className?: string
}

function ResourceCardInner({
  resource,
  recurso,
  onPreview,
  onSave,
  onOpen,
  materiaNombre,
  className,
}: ResourceCardProps) {
  const resolved = resource ?? recurso
  if (!resolved) return null

  const category = categoryMap[resolved.categoria]

  const handleAction = onPreview ?? onOpen ?? onSave

  return (
    <div
      className={cn(
        'group rounded-xl border border-border-subtle bg-surface-card p-5',
        'transition-all duration-200 hover:shadow-md hover:border-secondary/30',
        handleAction && 'cursor-pointer',
        className
      )}
      onClick={handleAction ? () => handleAction(resolved) : undefined}
    >
      <div className="flex items-start justify-between gap-3 mb-3">
        <Badge variant={category.variant}>{category.label}</Badge>
        {resolved.promedio_estrellas != null && (
          <div className="flex items-center gap-1 text-label-sm text-on-surface-variant">
            <span className="material-symbols-outlined text-[14px]">star</span>
            <span>{Number(resolved.promedio_estrellas).toFixed(1)}</span>
          </div>
        )}
      </div>

      <h3 className="text-title font-semibold text-on-surface mb-1 truncate">
        {resolved.nombre_archivo}
      </h3>

      {(resolved.materia_nombre ?? materiaNombre) && (
        <p className="text-body-sm text-on-surface-variant mb-1">
          {resolved.materia_nombre ?? materiaNombre}
        </p>
      )}

      {resolved.descripcion && (
        <p className="text-body-sm text-on-surface-variant mb-4 line-clamp-2">
          {resolved.descripcion}
        </p>
      )}

      <div className="flex items-center justify-between text-label-sm text-outline">
        <div className="flex items-center gap-3">
          {resolved.valoraciones_count != null && (
            <span className="flex items-center gap-1">
              <span className="material-symbols-outlined text-[14px]">star</span>
              {resolved.valoraciones_count}
            </span>
          )}
        </div>
        <span>{formatDate(resolved.fecha_subida)}</span>
      </div>

      {(onPreview || onSave) && (
        <div className="flex gap-2 mt-4 pt-4 border-t border-border-subtle">
          {onPreview && (
            <button
              onClick={(e) => {
                e.stopPropagation()
                onPreview(resolved)
              }}
              className={cn(
                'flex-1 flex items-center justify-center gap-2 rounded-lg px-3 py-2',
                'text-label-md font-medium text-secondary bg-secondary/5',
                'transition-colors hover:bg-secondary/10'
              )}
            >
              <span className="material-symbols-outlined text-[18px]">visibility</span>
              Vista previa
            </button>
          )}
          {onSave && (
            <button
              onClick={(e) => {
                e.stopPropagation()
                onSave(resolved)
              }}
              className={cn(
                'flex-1 flex items-center justify-center gap-2 rounded-lg px-3 py-2',
                'text-label-md font-medium text-on-primary bg-secondary',
                'transition-colors hover:bg-secondary/90'
              )}
            >
              <span className="material-symbols-outlined text-[18px]">download</span>
              Descargar
            </button>
          )}
        </div>
      )}
    </div>
  )
}

export { ResourceCardInner as ResourceCard }
export default ResourceCardInner
