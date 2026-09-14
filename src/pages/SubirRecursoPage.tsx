import { useEffect, useState, useRef, type FormEvent, type DragEvent } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import type { Materia, Coleccion, Recurso } from '@/types'
import { useAuth } from '@/hooks/useAuth'
import { materiasService } from '@/services/materias.service'
import { coleccionesService } from '@/services/colecciones.service'
import { api } from '@/lib/api'
import { cn, extractErrorMessage } from '@/lib/utils'

const MAX_FILE_SIZE = 15 * 1024 * 1024

const CATEGORIAS = [
  { value: 'nota', label: 'Apunte / Guía', icon: 'description' },
  { value: 'prueba', label: 'Examen / Prueba', icon: 'quiz' },
  { value: 'proyecto', label: 'Proyecto / Laboratorio', icon: 'science' },
] as const

const TIPOS_RECURSO = [
  { value: 'pdf', label: 'PDF', accept: '.pdf' },
  { value: 'zip', label: 'ZIP', accept: '.zip,.rar,.7z' },
  { value: 'link', label: 'Enlace', accept: '' },
] as const

interface RecursoCreado extends Recurso {
  karma_ganado?: number
  karma_acumulado?: number
}

const CATEGORIA_LABEL: Record<string, string> = {
  nota: 'Apunte / Guía',
  prueba: 'Examen / Prueba',
  proyecto: 'Proyecto / Laboratorio',
}

export default function SubirRecursoPage() {
  const navigate = useNavigate()
  const { refreshProfile } = useAuth()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [materias, setMaterias] = useState<Materia[]>([])
  const [colecciones, setColecciones] = useState<Coleccion[]>([])
  const [materiasLoading, setMateriasLoading] = useState(true)

  const [materiaId, setMateriaId] = useState('')
  const [coleccionId, setColeccionId] = useState('')
  const [categoria, setCategoria] = useState<string>('nota')
  const [tipoRecurso, setTipoRecurso] = useState<string>('pdf')
  const [descripcion, setDescripcion] = useState('')
  const [consejoEstudio, setConsejoEstudio] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [linkUrl, setLinkUrl] = useState('')

  const [isDragging, setIsDragging] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [recursoCreado, setRecursoCreado] = useState<RecursoCreado | null>(null)

  useEffect(() => {
    let active = true
    materiasService
      .catalogo()
      .then((data) => {
        if (active) setMaterias(data.results)
      })
      .catch(() => {
        if (active) setMaterias([])
      })
      .finally(() => {
        if (active) setMateriasLoading(false)
      })
    return () => {
      active = false
    }
  }, [])

  useEffect(() => {
    if (!materiaId) {
      // Reset derived selection state when the selected materia changes
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setColecciones([])
      setColeccionId('')
      return
    }
    let active = true
    coleccionesService
      .list({ materia_id: Number(materiaId) })
      .then((data) => {
        if (active) setColecciones(data.results)
      })
      .catch(() => {
        if (active) setColecciones([])
      })
    return () => {
      active = false
    }
  }, [materiaId])

  const handleDragOver = (e: DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e: DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleDrop = (e: DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const dropped = e.dataTransfer.files[0]
    if (dropped) handleFileSelect(dropped)
  }

  const handleFileSelect = (selected: File) => {
    setError('')
    if (selected.size > MAX_FILE_SIZE) {
      setError('El archivo supera el límite de 15 MB.')
      return
    }
    setFile(selected)
  }

  const acceptedTypes = TIPOS_RECURSO.find((t) => t.value === tipoRecurso)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess(false)

    if (!materiaId) {
      setError('Selecciona una materia.')
      return
    }

    if (tipoRecurso !== 'link' && !file) {
      setError('Selecciona un archivo para subir.')
      return
    }

    if (tipoRecurso === 'link' && !linkUrl.trim()) {
      setError('Ingresa la URL del enlace.')
      return
    }

    setIsSubmitting(true)
    try {
      const formData = new FormData()
      formData.append('materia', materiaId)
      if (coleccionId) formData.append('coleccion', coleccionId)
      formData.append('categoria', categoria)
      formData.append('tipo_recurso', tipoRecurso)
      if (descripcion) formData.append('descripcion', descripcion)
      if (consejoEstudio) formData.append('consejo_estudio', consejoEstudio)

      if (tipoRecurso === 'link') {
        formData.append('storage_key', linkUrl.trim())
      } else if (file) {
        formData.append('archivo', file)
      }

      const { data: creado } = await api.post<RecursoCreado>(
        '/api/recursos/',
        formData,
        {
          headers: { 'Content-Type': 'multipart/form-data' },
        }
      )

      setRecursoCreado(creado)
      setSuccess(true)
      void refreshProfile().catch(() => undefined)
    } catch (err: unknown) {
      setError(extractErrorMessage(err, 'Error al subir el recurso. Intenta de nuevo.'))
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleSubirOtro = () => {
    setSuccess(false)
    setRecursoCreado(null)
    setMateriaId('')
    setColeccionId('')
    setCategoria('nota')
    setTipoRecurso('pdf')
    setDescripcion('')
    setConsejoEstudio('')
    setFile(null)
    setLinkUrl('')
    setError('')
  }

  return (
    <main className="min-h-screen bg-surface px-4 py-8">
      <div className="mx-auto max-w-2xl space-y-6">
        {/* Header */}
        <div className="mb-2">
          <nav className="mb-4 text-body-sm text-on-surface-variant">
            <Link to="/" className="hover:text-secondary">
              Inicio
            </Link>
            <span className="mx-2">/</span>
            <span className="font-medium text-on-surface">Subir recurso</span>
          </nav>
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-[28px] text-secondary">
              upload_file
            </span>
            <h1 className="font-display text-headline-lg font-bold text-on-surface">
              Subir Recurso
            </h1>
          </div>
          <p className="mt-2 text-body-lg text-on-surface-variant">
            Comparte material de estudio con la comunidad politécnica.
          </p>
        </div>

        {/* Success */}
        {success && recursoCreado && (
          <div className="rounded-2xl border border-emerald-300 bg-emerald-50 p-6 shadow-sm sm:p-8">
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-[28px] text-emerald-600">
                check_circle
              </span>
              <div>
                <h2 className="font-display text-title font-bold text-emerald-800">
                  ¡Recurso publicado!
                </h2>
                <p className="text-body-sm text-emerald-700">
                  Tu aporte ya está disponible para la comunidad politécnica.
                </p>
              </div>
            </div>

            <div className="mt-4 rounded-xl bg-white/70 px-4 py-3 text-body-md text-on-surface-variant">
              <span className="font-semibold text-on-surface">
                {recursoCreado.nombre_archivo}
              </span>{' '}
              · {CATEGORIA_LABEL[recursoCreado.categoria] ?? recursoCreado.categoria}
            </div>

            {recursoCreado.karma_ganado != null && recursoCreado.karma_ganado > 0 && (
              <div className="mt-4 flex items-center gap-3 rounded-xl bg-secondary/10 px-4 py-3">
                <span className="material-symbols-outlined text-[22px] text-secondary">
                  token
                </span>
                <p className="text-body-md text-on-surface">
                  <span className="font-bold text-secondary">
                    +{recursoCreado.karma_ganado} karma
                  </span>{' '}
                  por tu aporte. Ahora tienes {recursoCreado.karma_acumulado} karma.
                </p>
              </div>
            )}

            <div className="mt-6 flex flex-wrap gap-2">
              <Link
                to={`/materia/${materiaId}`}
                className="inline-flex items-center gap-2 rounded-full bg-secondary px-5 py-2.5 text-body-sm font-semibold text-on-primary transition-colors hover:bg-secondary-container"
              >
                <span className="material-symbols-outlined text-[18px]">
                  school
                </span>
                Ver recursos de la materia
              </Link>
              <button
                type="button"
                onClick={handleSubirOtro}
                className="inline-flex items-center gap-2 rounded-full border border-border-subtle bg-surface-card px-5 py-2.5 text-body-sm font-medium text-on-surface-variant transition-colors hover:text-secondary hover:ring-1 hover:ring-secondary/30"
              >
                <span className="material-symbols-outlined text-[18px]">
                  add
                </span>
                Subir otro recurso
              </button>
              <button
                type="button"
                onClick={() => navigate('/')}
                className="inline-flex items-center gap-2 rounded-full border border-border-subtle bg-surface-card px-5 py-2.5 text-body-sm font-medium text-on-surface-variant transition-colors hover:text-secondary hover:ring-1 hover:ring-secondary/30"
              >
                <span className="material-symbols-outlined text-[18px]">
                  home
                </span>
                Ir al inicio
              </button>
            </div>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="flex items-start gap-3 rounded-xl border border-error/20 bg-error/5 px-4 py-3">
            <span className="material-symbols-outlined mt-0.5 text-[18px] text-error">
              error
            </span>
            <p className="text-body-sm text-error">{error}</p>
          </div>
        )}

        {!success && (
          <form onSubmit={handleSubmit} className="space-y-6">
          <div className="rounded-2xl border border-border-subtle bg-surface-card p-6 shadow-sm sm:p-8 space-y-5">
            {/* Materia */}
            <div>
              <label
                htmlFor="materia"
                className="mb-1.5 block text-label-md font-medium text-on-surface"
              >
                Materia <span className="text-error">*</span>
              </label>
              {materiasLoading ? (
                <div className="h-11 animate-pulse rounded-xl bg-surface-container-high" />
              ) : (
                <select
                  id="materia"
                  value={materiaId}
                  onChange={(e) => setMateriaId(e.target.value)}
                  className="w-full rounded-xl border border-border-subtle bg-surface px-4 py-3 text-body-md text-on-surface outline-none transition-colors focus:border-secondary"
                >
                  <option value="">Selecciona una materia</option>
                  {materias.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.codigo ? `${m.codigo} - ` : ''}{m.nombre}
                    </option>
                  ))}
                </select>
              )}
            </div>

            {/* Coleccion */}
            {materiaId && colecciones.length > 0 && (
              <div>
                <label
                  htmlFor="coleccion"
                  className="mb-1.5 block text-label-md font-medium text-on-surface"
                >
                  Colección
                </label>
                <select
                  id="coleccion"
                  value={coleccionId}
                  onChange={(e) => setColeccionId(e.target.value)}
                  className="w-full rounded-xl border border-border-subtle bg-surface px-4 py-3 text-body-md text-on-surface outline-none transition-colors focus:border-secondary"
                >
                  <option value="">Sin colección específica</option>
                  {colecciones.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.titulo}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Categoria */}
            <div>
              <label className="mb-2 block text-label-md font-medium text-on-surface">
                Categoría <span className="text-error">*</span>
              </label>
              <div className="grid grid-cols-3 gap-3">
                {CATEGORIAS.map((cat) => (
                  <button
                    key={cat.value}
                    type="button"
                    onClick={() => setCategoria(cat.value)}
                    className={cn(
                      'flex flex-col items-center gap-2 rounded-xl border p-4 text-body-sm font-medium transition-all',
                      categoria === cat.value
                        ? 'border-secondary bg-secondary/5 text-secondary shadow-sm'
                        : 'border-border-subtle bg-surface text-on-surface-variant hover:border-secondary/40'
                    )}
                  >
                    <span className="material-symbols-outlined text-[24px]">
                      {cat.icon}
                    </span>
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Tipo recurso */}
            <div>
              <label className="mb-2 block text-label-md font-medium text-on-surface">
                Tipo de recurso <span className="text-error">*</span>
              </label>
              <div className="flex gap-3">
                {TIPOS_RECURSO.map((tipo) => (
                  <button
                    key={tipo.value}
                    type="button"
                    onClick={() => {
                      setTipoRecurso(tipo.value)
                      setFile(null)
                      setLinkUrl('')
                    }}
                    className={cn(
                      'flex items-center gap-2 rounded-xl border px-4 py-2.5 text-body-sm font-medium transition-all',
                      tipoRecurso === tipo.value
                        ? 'border-secondary bg-secondary/5 text-secondary shadow-sm'
                        : 'border-border-subtle bg-surface text-on-surface-variant hover:border-secondary/40'
                    )}
                  >
                    <span className="material-symbols-outlined text-[18px]">
                      {tipo.value === 'link' ? 'link' : tipo.value === 'pdf' ? 'picture_as_pdf' : 'folder_zip'}
                    </span>
                    {tipo.label}
                  </button>
                ))}
              </div>
            </div>

            {/* File upload / Link */}
            {tipoRecurso === 'link' ? (
              <div>
                <label
                  htmlFor="link_url"
                  className="mb-1.5 block text-label-md font-medium text-on-surface"
                >
                  URL del enlace <span className="text-error">*</span>
                </label>
                <div className="relative">
                  <span className="material-symbols-outlined pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[20px] text-outline">
                    link
                  </span>
                  <input
                    id="link_url"
                    type="url"
                    value={linkUrl}
                    onChange={(e) => setLinkUrl(e.target.value)}
                    placeholder="https://drive.google.com/..."
                    className="w-full rounded-xl border border-border-subtle bg-surface py-3 pl-10 pr-4 text-body-md text-on-surface outline-none transition-colors placeholder:text-on-surface-variant focus:border-secondary"
                  />
                </div>
              </div>
            ) : (
              <div>
                <label className="mb-1.5 block text-label-md font-medium text-on-surface">
                  Archivo <span className="text-error">*</span>
                </label>
                <div
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={cn(
                    'flex cursor-pointer flex-col items-center gap-3 rounded-xl border-2 border-dashed p-8 transition-all',
                    isDragging
                      ? 'border-secondary bg-secondary/5'
                      : file
                        ? 'border-emerald-300 bg-emerald-50/50'
                        : 'border-border-subtle hover:border-secondary/40'
                  )}
                >
                  {file ? (
                    <>
                      <span className="material-symbols-outlined text-[32px] text-emerald-600">
                        check_circle
                      </span>
                      <div className="text-center">
                        <p className="text-body-md font-medium text-on-surface">
                          {file.name}
                        </p>
                        <p className="text-body-sm text-on-surface-variant">
                          {(file.size / (1024 * 1024)).toFixed(1)} MB
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation()
                          setFile(null)
                        }}
                        className="text-body-sm font-medium text-error hover:text-error/80"
                      >
                        Eliminar
                      </button>
                    </>
                  ) : (
                    <>
                      <span className="material-symbols-outlined text-[32px] text-outline">
                        cloud_upload
                      </span>
                      <div className="text-center">
                        <p className="text-body-md font-medium text-on-surface">
                          Arrastra el archivo aquí o haz clic para seleccionar
                        </p>
                        <p className="text-body-sm text-on-surface-variant">
                          Máximo 15 MB · {acceptedTypes?.label}
                        </p>
                      </div>
                    </>
                  )}
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept={acceptedTypes?.accept}
                  onChange={(e) => {
                    const selected = e.target.files?.[0]
                    if (selected) handleFileSelect(selected)
                  }}
                  className="hidden"
                />
              </div>
            )}

            {/* Descripcion */}
            <div>
              <label
                htmlFor="descripcion"
                className="mb-1.5 block text-label-md font-medium text-on-surface"
              >
                Descripción
              </label>
              <textarea
                id="descripcion"
                value={descripcion}
                onChange={(e) => setDescripcion(e.target.value)}
                placeholder="Describe brevemente el contenido del recurso..."
                rows={3}
                className="w-full resize-none rounded-xl border border-border-subtle bg-surface px-4 py-3 text-body-md text-on-surface outline-none transition-colors placeholder:text-on-surface-variant focus:border-secondary"
              />
            </div>

            {/* Consejo */}
            <div>
              <label
                htmlFor="consejo"
                className="mb-1.5 block text-label-md font-medium text-on-surface"
              >
                Consejo de estudio
              </label>
              <textarea
                id="consejo"
                value={consejoEstudio}
                onChange={(e) => setConsejoEstudio(e.target.value)}
                placeholder="Comparte un consejo para estudiar este tema..."
                rows={2}
                className="w-full resize-none rounded-xl border border-border-subtle bg-surface px-4 py-3 text-body-md text-on-surface outline-none transition-colors placeholder:text-on-surface-variant focus:border-secondary"
              />
            </div>
          </div>

          {/* Submit */}
          <div className="flex items-center justify-between rounded-2xl border border-border-subtle bg-surface-card p-4 shadow-sm">
            <Link
              to="/"
              className="text-body-md font-medium text-on-surface-variant hover:text-on-surface"
            >
              Cancelar
            </Link>
            <button
              type="submit"
              disabled={isSubmitting || success}
              className="flex items-center justify-center gap-2 rounded-full bg-secondary px-6 py-3 text-body-md font-semibold text-on-primary transition-colors hover:bg-secondary-container disabled:opacity-60"
            >
              {isSubmitting ? (
                <span className="material-symbols-outlined animate-spin text-[20px]">
                  autorenew
                </span>
              ) : (
                <>
                  <span className="material-symbols-outlined text-[20px]">
                    upload
                  </span>
                  Publicar Recurso
                </>
              )}
            </button>
          </div>
        </form>
        )}
      </div>
    </main>
  )
}
