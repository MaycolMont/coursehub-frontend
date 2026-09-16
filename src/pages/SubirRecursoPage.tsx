import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type FormEvent,
  type DragEvent,
} from 'react'
import { useNavigate, Link } from 'react-router-dom'
import type { Materia, Recurso } from '@/types'
import { useAuth } from '@/hooks/useAuth'
import { materiasService } from '@/services/materias.service'
import { recursosService } from '@/services/recursos.service'
import { cn, extractErrorMessage, matchesSearch } from '@/lib/utils'
import {
  loadDraftFile,
  removeDraftFile,
  saveDraftFile,
} from '@/lib/draftFile'

const MAX_FILE_SIZE = 15 * 1024 * 1024

const CATEGORIAS = [
  { value: 'nota', label: 'Apunte / Guía', icon: 'description' },
  { value: 'prueba', label: 'Examen / Prueba', icon: 'quiz' },
  { value: 'proyecto', label: 'Proyecto / Laboratorio', icon: 'science' },
] as const

const TIPOS_RECURSO = [
  { value: 'pdf', label: 'PDF', accept: '.pdf' },
  { value: 'link', label: 'Enlace', accept: '' },
] as const

interface RecursoCreado extends Recurso {
  karma_ganado?: number
  karma_acumulado?: number
}

type FieldErrorKey = 'materia_id' | 'archivo' | 'storage_key'
type FieldErrors = Partial<Record<FieldErrorKey, string>>

function firstError(value: unknown): string | undefined {
  if (typeof value === 'string') return value
  if (Array.isArray(value) && value.length > 0) return firstError(value[0])
  return undefined
}

function getFieldErrors(err: unknown): FieldErrors {
  const body = (err as { response?: { data?: unknown } })?.response?.data
  if (!body || typeof body !== 'object' || Array.isArray(body)) return {}

  const errors: FieldErrors = {}
  for (const key of ['materia_id', 'archivo', 'storage_key'] as const) {
    const message = firstError((body as Record<string, unknown>)[key])
    if (message) errors[key] = message
  }
  return errors
}

const CATEGORIA_LABEL: Record<string, string> = {
  nota: 'Apunte / Guía',
  prueba: 'Examen / Prueba',
  proyecto: 'Proyecto / Laboratorio',
}

const DRAFT_KEY = 'coursehub_subir_draft'

interface SubirDraft {
  materiaId: string
  categoria: string
  tipoRecurso: string
  descripcion: string
  consejoEstudio: string
  linkUrl: string
  materiaQuery: string
  materiaSeleccionada: Materia | null
}

const EMPTY_DRAFT: SubirDraft = {
  materiaId: '',
  categoria: 'nota',
  tipoRecurso: 'pdf',
  descripcion: '',
  consejoEstudio: '',
  linkUrl: '',
  materiaQuery: '',
  materiaSeleccionada: null,
}

function readDraft(): SubirDraft {
  try {
    const raw = sessionStorage.getItem(DRAFT_KEY)
    if (!raw) return EMPTY_DRAFT
    const d = JSON.parse(raw) as Partial<SubirDraft>
    const materiaSeleccionada = d.materiaSeleccionada ?? null
    return {
      materiaId: d.materiaId ?? '',
      categoria: d.categoria ?? 'nota',
      tipoRecurso: d.tipoRecurso ?? 'pdf',
      descripcion: d.descripcion ?? '',
      consejoEstudio: d.consejoEstudio ?? '',
      linkUrl: d.linkUrl ?? '',
      materiaQuery: materiaSeleccionada
        ? (d.materiaQuery ??
          `${materiaSeleccionada.codigo} — ${materiaSeleccionada.nombre}`)
        : (d.materiaQuery ?? ''),
      materiaSeleccionada,
    }
  } catch {
    return EMPTY_DRAFT
  }
}

export default function SubirRecursoPage() {
  const navigate = useNavigate()
  const { isAuthenticated, refreshProfile } = useAuth()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [draft] = useState<SubirDraft>(readDraft)

  const [data, setData] = useState<Materia[]>([])
  const [loading, setLoading] = useState(true)
  const [materiasError, setMateriasError] = useState('')

  const [searchTerm, setSearchTerm] = useState(draft.materiaQuery)
  const [materiaSeleccionada, setMateriaSeleccionada] =
    useState<Materia | null>(draft.materiaSeleccionada)
  const [materiaOpen, setMateriaOpen] = useState(false)
  const materiaRef = useRef<HTMLDivElement>(null)

  const [materiaId, setMateriaId] = useState(draft.materiaId)
  const [categoria, setCategoria] = useState<string>(draft.categoria)
  const [tipoRecurso, setTipoRecurso] = useState<string>(draft.tipoRecurso)
  const [descripcion, setDescripcion] = useState(draft.descripcion)
  const [consejoEstudio, setConsejoEstudio] = useState(draft.consejoEstudio)
  const [file, setFile] = useState<File | null>(null)
  const [linkUrl, setLinkUrl] = useState(draft.linkUrl)

  const [isDragging, setIsDragging] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({})
  const [success, setSuccess] = useState(false)
  const [recursoCreado, setRecursoCreado] = useState<RecursoCreado | null>(null)
  const submitInFlightRef = useRef(false)

  const persistDraft = useCallback(async () => {
    sessionStorage.setItem(
      DRAFT_KEY,
      JSON.stringify({
        materiaId,
        categoria,
        tipoRecurso,
        descripcion,
        consejoEstudio,
        linkUrl,
        materiaQuery: searchTerm,
        materiaSeleccionada,
      })
    )

    // El archivo no cabe en sessionStorage: se guarda en IndexedDB para que
    // no se pierda al iniciar sesión, registrarse o refrescar la página.
    if (tipoRecurso === 'link') {
      await removeDraftFile().catch(() => undefined)
    } else if (file) {
      await saveDraftFile(file).catch(() => undefined)
    } else {
      await removeDraftFile().catch(() => undefined)
    }
  }, [
    materiaId,
    categoria,
    tipoRecurso,
    descripcion,
    consejoEstudio,
    linkUrl,
    searchTerm,
    materiaSeleccionada,
    file,
  ])

  const clearDraft = useCallback(() => {
    sessionStorage.removeItem(DRAFT_KEY)
    void removeDraftFile().catch(() => undefined)
  }, [])

  // Autosave con debounce: el progreso del formulario persiste solo, cubriendo
  // navegación, refresh o cierre parcial de la sesión.
  useEffect(() => {
    const timer = setTimeout(() => {
      void persistDraft()
    }, 500)
    return () => clearTimeout(timer)
  }, [persistDraft])

  // Restaura el archivo del borrador (IndexedDB) solo si existe el borrador de
  // texto en sessionStorage (evita traer archivos huérfanos de otras sesiones).
  useEffect(() => {
    if (sessionStorage.getItem(DRAFT_KEY) == null) return
    let active = true
    loadDraftFile()
      .then((storedFile) => {
        if (active && storedFile) setFile(storedFile)
      })
      .catch(() => undefined)
    return () => {
      active = false
    }
  }, [])

  // Cierra el dropdown de materias al hacer clic fuera.
  useEffect(() => {
    const handleOutside = (e: MouseEvent) => {
      if (materiaRef.current && !materiaRef.current.contains(e.target as Node)) {
        setMateriaOpen(false)
      }
    }
    document.addEventListener('mousedown', handleOutside)
    return () => document.removeEventListener('mousedown', handleOutside)
  }, [])

  useEffect(() => {
    let active = true
    // Carga única del dataset en segundo plano; no bloquea el formulario.
    materiasService
      .catalogoAll()
      .then((result) => {
        if (active) setData(result)
      })
      .catch(() => {
        if (active) setMateriasError('No se pudieron cargar las materias.')
      })
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => {
      active = false
    }
  }, [])

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
    if (submitInFlightRef.current) return
    setError('')
    setFieldErrors({})
    setSuccess(false)

    if (!isAuthenticated) {
      await persistDraft()
      navigate('/login', { state: { from: '/subir' } })
      return
    }

    if (!materiaId) {
      setFieldErrors({ materia_id: 'Selecciona una materia.' })
      return
    }

    const selectedMateriaId = Number(materiaId)
    if (tipoRecurso !== 'link' && !file) {
      setFieldErrors({ archivo: 'Selecciona un archivo para subir.' })
      return
    }

    if (tipoRecurso === 'link' && !linkUrl.trim()) {
      setFieldErrors({ storage_key: 'Ingresa la URL del enlace.' })
      return
    }

    submitInFlightRef.current = true
    setIsSubmitting(true)
    try {
      const formData = new FormData()
      formData.append('materia_id', String(selectedMateriaId))
      formData.append('categoria', categoria)
      formData.append('tipo_recurso', tipoRecurso)
      if (descripcion) formData.append('descripcion', descripcion)
      if (consejoEstudio) formData.append('consejo_estudio', consejoEstudio)

      if (tipoRecurso === 'link') {
        formData.append('storage_key', linkUrl.trim())
      } else if (file) {
        formData.append('archivo', file)
      }

      const creado = await recursosService.create(formData)

      await recursosService.list({ materia_id: selectedMateriaId })

      setRecursoCreado(creado as RecursoCreado)
      setSuccess(true)
      clearDraft()
      void refreshProfile().catch(() => undefined)
    } catch (err: unknown) {
      const nextFieldErrors = getFieldErrors(err)
      setFieldErrors(nextFieldErrors)
      if (Object.keys(nextFieldErrors).length === 0) {
        setError(extractErrorMessage(err, 'Error al subir el recurso. Intenta de nuevo.'))
      }
    } finally {
      submitInFlightRef.current = false
      setIsSubmitting(false)
    }
  }

  const handleSubirOtro = () => {
    setSuccess(false)
    setRecursoCreado(null)
    clearDraft()
    setMateriaId('')
    setSearchTerm('')
    setMateriaSeleccionada(null)
    setMateriaOpen(false)
    setCategoria('nota')
    setTipoRecurso('pdf')
    setDescripcion('')
    setConsejoEstudio('')
    setFile(null)
    setLinkUrl('')
    setError('')
    setFieldErrors({})
  }

  const handleMateriaQueryChange = (value: string) => {
    setSearchTerm(value)
    setMateriaId('')
    setMateriaSeleccionada(null)
    setMateriaOpen(true)
  }

  const handleSelectMateria = (m: Materia) => {
    setMateriaSeleccionada(m)
    setMateriaId(String(m.id))
    setSearchTerm(`${m.codigo} — ${m.nombre}`)
    setMateriaOpen(false)
  }

  const clearMateria = () => {
    setSearchTerm('')
    setMateriaId('')
    setMateriaSeleccionada(null)
    setMateriaOpen(false)
  }

  const filteredMaterias = useMemo(() => {
    return data.filter((materia) =>
      matchesSearch(searchTerm, [
        materia.nombre,
        materia.codigo,
        ...(materia.carreras_list ?? []).map((carrera) => carrera.nombre),
      ])
    )
  }, [data, searchTerm])

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
              <div ref={materiaRef} className="relative">
                <div className="relative">
                  <span className="material-symbols-outlined pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[20px] text-outline">
                    search
                  </span>
                  <input
                    id="materia"
                    type="text"
                    role="combobox"
                    aria-expanded={materiaOpen}
                    aria-autocomplete="list"
                    autoComplete="off"
                    value={searchTerm}
                    onChange={(e) => handleMateriaQueryChange(e.target.value)}
                    onFocus={() => setMateriaOpen(true)}
                    placeholder="Buscar materia por código o nombre..."
                    className="w-full rounded-xl border border-border-subtle bg-surface py-3 pl-10 pr-10 text-body-md text-on-surface outline-none transition-colors placeholder:text-on-surface-variant focus:border-secondary"
                  />
                  {loading ? (
                    <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2">
                      <span className="material-symbols-outlined animate-spin text-[20px] text-secondary">
                        autorenew
                      </span>
                    </span>
                  ) : searchTerm && !materiaSeleccionada ? (
                    <button
                      type="button"
                      onClick={clearMateria}
                      aria-label="Limpiar búsqueda de materia"
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-outline transition-colors hover:text-on-surface"
                    >
                      <span className="material-symbols-outlined text-[20px]">
                        close
                      </span>
                    </button>
                  ) : null}
                </div>

                {materiaOpen && !materiaSeleccionada && (
                  <div className="absolute z-10 mt-2 max-h-72 w-full overflow-y-auto rounded-xl border border-border-subtle bg-surface-card shadow-lg">
                    {loading && data.length === 0 ? (
                      <p className="flex items-center gap-2 px-4 py-3 text-body-sm text-on-surface-variant">
                        <span className="material-symbols-outlined animate-spin text-[18px] text-secondary">
                          autorenew
                        </span>
                        Cargando catálogo de materias...
                      </p>
                    ) : materiasError && data.length === 0 ? (
                      <p className="px-4 py-3 text-body-sm text-error">
                        {materiasError}
                      </p>
                    ) : filteredMaterias.length === 0 ? (
                      <p className="px-4 py-3 text-body-sm text-on-surface-variant">
                        No se encontraron materias
                        {searchTerm.trim() ? ` para "${searchTerm.trim()}"` : ''}.
                      </p>
                    ) : (
                      <ul>
                        {filteredMaterias.map((m) => (
                          <li key={m.id}>
                            <button
                              type="button"
                              onClick={() => handleSelectMateria(m)}
                              className="flex w-full items-baseline justify-between gap-3 px-4 py-2.5 text-left transition-colors hover:bg-surface"
                            >
                              <span className="min-w-0 truncate text-body-md font-medium text-on-surface">
                                {m.nombre}
                              </span>
                              <span className="shrink-0 text-label-sm text-outline">
                                {m.codigo}
                              </span>
                            </button>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                )}
              </div>
              {materiaSeleccionada && (
                <p className="mt-1.5 text-body-sm text-secondary">
                  <span className="font-semibold">{materiaSeleccionada.codigo}</span>{' '}
                  · {materiaSeleccionada.nombre}
                </p>
              )}
              {fieldErrors.materia_id && (
                <p className="mt-1.5 text-body-sm text-error">{fieldErrors.materia_id}</p>
              )}
            </div>

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
                      {tipo.value === 'link' ? 'link' : 'picture_as_pdf'}
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
                    onChange={(e) => {
                      setLinkUrl(e.target.value)
                      setFieldErrors((current) => ({ ...current, storage_key: undefined }))
                    }}
                    placeholder="https://drive.google.com/..."
                    className="w-full rounded-xl border border-border-subtle bg-surface py-3 pl-10 pr-4 text-body-md text-on-surface outline-none transition-colors placeholder:text-on-surface-variant focus:border-secondary"
                  />
                </div>
                {fieldErrors.storage_key && (
                  <p className="mt-1.5 text-body-sm text-error">{fieldErrors.storage_key}</p>
                )}
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
                    if (selected) {
                      setFieldErrors((current) => ({ ...current, archivo: undefined }))
                      handleFileSelect(selected)
                    }
                  }}
                  className="hidden"
                />
                {fieldErrors.archivo && (
                  <p className="mt-1.5 text-body-sm text-error">{fieldErrors.archivo}</p>
                )}
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
