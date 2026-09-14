import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { cn, extractErrorMessage } from '@/lib/utils'
import { recursosService } from '@/services/recursos.service'
import { guardadosService } from '@/services/guardados.service'
import { valoracionesService } from '@/services/valoraciones.service'
import { reportesService } from '@/services/reportes.service'
import type { Recurso } from '@/types'

const MOTIVOS = [
  'Contenido inapropiado',
  'Violación de derechos de autor',
  'Material incorrecto o incompleto',
  'Enlace roto o archivo dañado',
  'Otro',
]

const CATEGORY_LABEL: Record<Recurso['categoria'], string> = {
  nota: 'Apunte / Guía',
  prueba: 'Examen / Prueba',
  proyecto: 'Proyecto / Laboratorio',
}

interface ResourcePreviewModalProps {
  recurso: Recurso
  onClose: () => void
  onRequireAuth?: () => void
  onRecursoUpdated?: (recurso: Recurso) => void
}

type Action = 'report'

export function ResourcePreviewModal({
  recurso,
  onClose,
  onRequireAuth,
  onRecursoUpdated,
}: ResourcePreviewModalProps) {
  const { isAuthenticated, user } = useAuth()

  const [isSaved, setIsSaved] = useState(false)
  const [savedId, setSavedId] = useState<number | null>(null)
  const [savedLoading, setSavedLoading] = useState(false)

  const [rating, setRating] = useState(0)
  const [ratingHover, setRatingHover] = useState(0)
  const [ratingLoading, setRatingLoading] = useState(false)

  const [activeAction, setActiveAction] = useState<Action | null>(null)
  const [reportMotivo, setReportMotivo] = useState(MOTIVOS[0])
  const [reportDesc, setReportDesc] = useState('')
  const [reportLoading, setReportLoading] = useState(false)

  const [feedback, setFeedback] = useState<{ kind: 'success' | 'error'; text: string } | null>(null)
  const [downloading, setDownloading] = useState(false)

  const [recursoData, setRecursoData] = useState<Recurso>(recurso)
  const [rated, setRated] = useState(false)

  const isPdf = recurso.tipo_recurso === 'pdf'
  const isZip = recurso.tipo_recurso === 'zip'
  const isLink = recurso.tipo_recurso === 'link'

  useEffect(() => {
    if (!isAuthenticated) return
    let active = true
    guardadosService
      .list()
      .then((data) => {
        if (!active) return
        const match = data.results.find(
          (g) => g.recurso === recurso.id || g.recurso_detalle?.id === recurso.id
        )
        if (match) {
          setIsSaved(true)
          setSavedId(match.id)
        }
      })
      .catch(() => undefined)
    return () => {
      active = false
    }
  }, [isAuthenticated, recurso.id])

  useEffect(() => {
    if (!isAuthenticated || !user) return
    let active = true
    valoracionesService
      .list({ recurso_id: recurso.id, usuario_id: user.id })
      .then((data) => {
        if (!active) return
        const mine = data.results.find((v) => v.usuario === user.id)
        if (mine) {
          setRating(mine.estrellas)
          setRated(true)
        }
      })
      .catch(() => undefined)
    return () => {
      active = false
    }
  }, [isAuthenticated, user, recurso.id])

  const showFeedback = (kind: 'success' | 'error', text: string) => {
    setFeedback({ kind, text })
    window.setTimeout(() => setFeedback(null), 3500)
  }

  const requireAuth = (): boolean => {
    if (isAuthenticated) return true
    onRequireAuth?.()
    return false
  }

  const triggerBlobDownload = (blob: Blob, filename: string) => {
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = filename || 'recurso'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  const downloadFileName = () => {
    let name = recurso.nombre_archivo || 'recurso'
    if (isPdf && !/\.pdf$/i.test(name)) name = `${name}.pdf`
    if (isZip && !/\.zip$/i.test(name)) name = `${name}.zip`
    return name
  }

  const handleDownload = async () => {
    if (isLink) {
      if (recurso.storage_key) window.open(recurso.storage_key, '_blank', 'noopener,noreferrer')
      return
    }

    if (!recurso.archivo_url && !recurso.url) return

    setDownloading(true)
    try {
      const blob = await recursosService.download(recurso.id)
      triggerBlobDownload(blob, downloadFileName())
      showFeedback('success', 'Descarga iniciada.')
    } catch (err: unknown) {
      const status = (err as { response?: { status?: number } })?.response?.status
      if (status === 404) {
        showFeedback('error', 'El archivo no está disponible.')
      } else {
        showFeedback(
          'error',
          extractErrorMessage(err, 'No se pudo descargar el archivo.')
        )
      }
    } finally {
      setDownloading(false)
    }
  }

  const handleShare = async () => {
    let url = isLink ? recurso.storage_key : ''
    if (!url) {
      try {
        const res = await recursosService.share(recurso.id)
        url = res.url
      } catch {
        url = window.location.href
      }
    }
    try {
      await navigator.clipboard.writeText(url)
      showFeedback('success', 'Enlace copiado al portapapeles.')
    } catch {
      showFeedback('success', `Enlace: ${url}`)
    }
  }

  const handleSave = async () => {
    if (!requireAuth()) return
    setSavedLoading(true)
    try {
      if (isSaved && savedId != null) {
        await guardadosService.delete(savedId)
        setIsSaved(false)
        setSavedId(null)
        showFeedback('success', 'Recurso eliminado de tus guardados.')
      } else {
        const created = await guardadosService.create({ recurso: recurso.id })
        setIsSaved(true)
        setSavedId(created.id)
        showFeedback('success', 'Recurso guardado.')
      }
    } catch (err) {
      showFeedback(
        'error',
        extractErrorMessage(err, 'No se pudo actualizar tus guardados.')
      )
    } finally {
      setSavedLoading(false)
    }
  }

  const handleRate = async (stars: number) => {
    if (!requireAuth()) return
    setRatingLoading(true)
    try {
      await valoracionesService.create({ recurso: recurso.id, estrellas: stars })

      const prevCount = recursoData.valoraciones_count ?? 0
      const optimistic = {
        valoraciones_count: prevCount + 1,
        promedio_estrellas:
          recursoData.promedio_estrellas != null
            ? (recursoData.promedio_estrellas * prevCount + stars) / (prevCount + 1)
            : stars,
      }
      setRecursoData((prev) => ({ ...prev, ...optimistic }))
      setRating(stars)
      setRated(true)
      onRecursoUpdated?.({ ...recursoData, ...optimistic })

      try {
        const updated = await recursosService.getById(recurso.id)
        setRecursoData((prev) => ({ ...prev, ...updated }))
        onRecursoUpdated?.(updated)
      } catch {
        // Mantener el valor optimista si falla el refresco.
      }

      showFeedback('success', 'Gracias por tu valoración.')
    } catch (err) {
      showFeedback(
        'error',
        extractErrorMessage(err, 'No se pudo guardar tu valoración. Ya la valoraste?')
      )
    } finally {
      setRatingLoading(false)
    }
  }

  const handleReport = async (e: FormEvent) => {
    e.preventDefault()
    if (!requireAuth()) return
    if (!reportDesc.trim()) {
      showFeedback('error', 'Describe brevemente el motivo del reporte.')
      return
    }
    setReportLoading(true)
    try {
      await reportesService.create({
        recurso: recurso.id,
        motivo: reportMotivo,
        descripcion: reportDesc.trim(),
      })
      setActiveAction(null)
      setReportDesc('')
      showFeedback('success', 'Reporte enviado. ¡Gracias por ayudar a la comunidad!')
    } catch (err) {
      showFeedback(
        'error',
        extractErrorMessage(err, 'No se pudo enviar el reporte.')
      )
    } finally {
      setReportLoading(false)
    }
  }

  const actionButtons: Array<{
    label: string
    icon: string
    onClick: () => void
  }> = [
    {
      label: isSaved ? 'Guardado' : 'Guardar',
      icon: isSaved ? 'bookmark_added' : 'bookmark',
      onClick: handleSave,
    },
    {
      label: 'Compartir',
      icon: 'share',
      onClick: handleShare,
    },
    {
      label: 'Reportar',
      icon: 'flag',
      onClick: () => setActiveAction(activeAction === 'report' ? null : 'report'),
    },
  ]

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-primary-container/60 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl overflow-hidden rounded-2xl bg-surface-card shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-surface-container-high px-5 py-4">
          <div className="flex min-w-0 items-center gap-3">
            <span className="material-symbols-outlined text-[22px] text-error">
              {isLink ? 'link' : isZip ? 'folder_zip' : 'picture_as_pdf'}
            </span>
            <div className="min-w-0">
              <p className="truncate text-body-md font-semibold text-on-surface">
                {recurso.nombre_archivo}
              </p>
              <p className="text-body-sm text-on-surface-variant uppercase">
                {isLink ? 'Enlace web' : isZip ? 'ZIP' : 'PDF'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-9 w-9 items-center justify-center rounded-full text-on-surface-variant transition-colors hover:bg-surface-container-high hover:text-on-surface"
            aria-label="Cerrar"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Body */}
        <div className="max-h-[calc(100vh-16rem)] space-y-6 overflow-y-auto p-6">
          <div>
            <h2 className="font-title font-bold text-on-surface">
              {recurso.nombre_archivo}
            </h2>
            <div className="mt-1 space-y-0.5 text-body-sm text-on-surface-variant">
              {recurso.materia_nombre && <p>{recurso.materia_nombre}</p>}
              {recurso.profesor_nombre && <p>{recurso.profesor_nombre}</p>}
              <p>{CATEGORY_LABEL[recurso.categoria]}</p>
              {recurso.usuario_pseudonimo && (
                <p>Aportado por {recurso.usuario_pseudonimo}</p>
              )}
            </div>
          </div>

          {/* Rating */}
          <div>
            <div className="mb-1 flex items-center gap-1.5">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  disabled={ratingLoading || rated}
                  onClick={() => handleRate(star)}
                  onMouseEnter={() => setRatingHover(star)}
                  onMouseLeave={() => setRatingHover(0)}
                  aria-label={`${star} estrellas`}
                  className="text-[22px] leading-none transition-transform hover:scale-110 disabled:opacity-60"
                >
                  <span
                    className={cn(
                      'material-symbols-outlined',
                      recalcFilled(rating, ratingHover, star)
                        ? 'text-amber-500'
                        : 'text-surface-container-high'
                    )}
                  >
                    star
                  </span>
                </button>
              ))}
            </div>
            <p className="text-body-sm text-on-surface-variant">
              {recursoData.promedio_estrellas != null
                ? `Valoración media: ${Number(recursoData.promedio_estrellas).toFixed(1)}`
                : 'Sin valoraciones aún'}
              <span className="mx-1">·</span>
              {recursoData.valoraciones_count ?? 0} valoraciones
            </p>
            {rated && (
              <p className="mt-1 text-body-sm font-medium text-secondary">
                Tu valoración: {rating} estrellas
              </p>
            )}
          </div>

          {recurso.descripcion && (
            <div>
              <h3 className="mb-1 text-body-md font-semibold text-on-surface">
                Descripción
              </h3>
              <p className="text-body-md text-on-surface-variant">
                {recurso.descripcion}
              </p>
            </div>
          )}

          {recurso.consejo_estudio && (
            <div className="rounded-xl border border-secondary/20 bg-secondary/5 p-4">
              <h3 className="mb-1 flex items-center gap-2 text-body-md font-semibold text-secondary">
                <span className="material-symbols-outlined text-[18px]">
                  lightbulb
                </span>
                Consejo de estudio
              </h3>
              <p className="text-body-sm text-on-surface-variant">
                {recurso.consejo_estudio}
              </p>
            </div>
          )}

          {isLink && recurso.storage_key && (
            <div className="rounded-xl border border-border-subtle bg-surface p-4">
              <p className="mb-1 flex items-center gap-2 text-body-md font-semibold text-secondary">
                <span className="material-symbols-outlined text-[18px]">
                  open_in_new
                </span>
                Enlace externo
              </p>
              <p className="mb-3 break-all text-body-sm text-on-surface-variant">
                {recurso.storage_key}
              </p>
              <a
                href={recurso.storage_key}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-full bg-secondary px-5 py-2.5 font-semibold text-white transition-colors hover:bg-secondary-container"
              >
                <span className="material-symbols-outlined text-[18px]">
                  open_in_new
                </span>
                Abrir enlace
              </a>
            </div>
          )}

          {/* Feedback */}
          {feedback && (
            <div
              className={cn(
                'flex items-start gap-2 rounded-xl px-4 py-3 text-body-sm',
                feedback.kind === 'success'
                  ? 'bg-emerald-50 text-emerald-700'
                  : 'border border-error/20 bg-error/5 text-error'
              )}
            >
              <span className="material-symbols-outlined mt-0.5 text-[18px]">
                {feedback.kind === 'success' ? 'check_circle' : 'error'}
              </span>
              <p>{feedback.text}</p>
            </div>
          )}

          {/* Report form */}
          {activeAction === 'report' && (
            <form onSubmit={handleReport} className="space-y-3 rounded-xl border border-border-subtle bg-surface p-4">
              <h3 className="text-body-md font-semibold text-on-surface">
                Reportar recurso
              </h3>
              <div>
                <label
                  htmlFor="motivo"
                  className="mb-1 block text-label-sm font-medium text-on-surface-variant"
                >
                  Motivo
                </label>
                <select
                  id="motivo"
                  value={reportMotivo}
                  onChange={(e) => setReportMotivo(e.target.value)}
                  className="w-full rounded-lg border border-border-subtle bg-surface-card px-3 py-2 text-body-md outline-none focus:border-secondary"
                >
                  {MOTIVOS.map((m) => (
                    <option key={m} value={m}>
                      {m}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label
                  htmlFor="report-desc"
                  className="mb-1 block text-label-sm font-medium text-on-surface-variant"
                >
                  Descripción
                </label>
                <textarea
                  id="report-desc"
                  value={reportDesc}
                  onChange={(e) => setReportDesc(e.target.value)}
                  rows={3}
                  placeholder="Explica brevemente el problema..."
                  className="w-full resize-none rounded-lg border border-border-subtle bg-surface-card px-3 py-2 text-body-md outline-none focus:border-secondary"
                />
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setActiveAction(null)}
                  className="flex-1 rounded-full border border-border-subtle px-4 py-2 text-body-sm font-medium text-on-surface-variant hover:text-on-surface"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={reportLoading}
                  className="flex-1 rounded-full bg-error px-4 py-2 text-body-sm font-semibold text-white transition-colors hover:bg-error/90 disabled:opacity-60"
                >
                  {reportLoading ? 'Enviando...' : 'Enviar reporte'}
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Actions */}
        <div className="border-t border-surface-container-high p-6">
          <button
            type="button"
            onClick={handleDownload}
            disabled={downloading}
            className="mb-3 flex w-full items-center justify-center gap-2 rounded-full bg-secondary px-4 py-3 font-semibold text-white transition-colors hover:bg-secondary-container disabled:opacity-60"
          >
            <Spinner loading={downloading} />
            <span className="material-symbols-outlined text-[20px]">
              {isLink ? 'open_in_new' : 'download'}
            </span>
            {downloading ? 'Descargando...' : isLink ? 'Abrir enlace' : 'Descargar'}
          </button>
          <div className="grid grid-cols-3 gap-2">
            {actionButtons.map((action) => (
              <button
                key={action.label}
                type="button"
                disabled={action.label === 'Guardado' && savedLoading}
                onClick={action.onClick}
                className={cn(
                  'inline-flex flex-col items-center gap-1.5 rounded-xl border py-2.5 text-body-sm font-medium transition-colors disabled:opacity-50',
                  action.label === 'Reportar' && activeAction === 'report'
                    ? 'border-error/40 text-error'
                    : 'border-surface-container-high text-on-surface-variant hover:border-secondary/40 hover:text-secondary'
                )}
              >
                <span className="material-symbols-outlined text-[20px]">
                  {action.icon}
                </span>
                {action.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

function recalcFilled(
  rating: number,
  hover: number,
  star: number
): boolean {
  const active = hover || rating
  return star <= active
}

function Spinner({ loading }: { loading: boolean }) {
  if (!loading) return null
  return (
    <span className="material-symbols-outlined animate-spin text-[18px]">
      autorenew
    </span>
  )
}

export default ResourcePreviewModal