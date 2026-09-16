import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import type { Materia, Recurso } from '@/types'
import { materiasService } from '@/services/materias.service'
import { recursosService } from '@/services/recursos.service'
import { cn } from '@/lib/utils'
import ResourceCard from '@/components/ui/ResourceCard'
import ResourcePreviewModal from '@/components/ui/ResourcePreviewModal'
import { usePagination } from '@/hooks/usePagination'
import { useDebounce } from '@/hooks/useDebounce'

const CATEGORY_TABS = [
  { id: 'todos', label: 'Todos los recursos' },
  { id: 'prueba', label: 'Exámenes' },
  { id: 'nota', label: 'Apuntes y Guías' },
  { id: 'proyecto', label: 'Proyectos' },
] as const

type CategoryId = (typeof CATEGORY_TABS)[number]['id']

const SORT_OPTIONS = [
  { id: 'rating', label: 'Mejor valorados' },
  { id: 'recent', label: 'Más recientes' },
] as const

type SortId = (typeof SORT_OPTIONS)[number]['id']

const PER_PAGE = 9

export default function MateriaPage() {
  const { id } = useParams<{ id: string }>()
  const materiaId = Number(id)

  const [materia, setMateria] = useState<Materia | null>(null)
  const [materiaLoading, setMateriaLoading] = useState(true)

  const [search, setSearch] = useState('')
  const debouncedSearch = useDebounce(search, 300)
  const [sort, setSort] = useState<SortId>('rating')
  const [category, setCategory] = useState<CategoryId>('todos')

  const [recursos, setRecursos] = useState<Recurso[]>([])
  const [recursosLoading, setRecursosLoading] = useState(true)
  const [totalCount, setTotalCount] = useState(0)

  const [previewRecurso, setPreviewRecurso] = useState<Recurso | null>(null)

  const { page, nextPage, prevPage, setPage, resetPage } = usePagination(1)

  // Fetch materia
  useEffect(() => {
    if (!materiaId) return
    let active = true
    materiasService
      .getById(materiaId)
      .then((m) => {
        if (active) setMateria(m)
      })
      .catch(() => {
        if (active) setMateria(null)
      })
      .finally(() => {
        if (active) setMateriaLoading(false)
      })
    return () => {
      active = false
    }
  }, [materiaId])

  // Reset page on filter change
  useEffect(() => {
    resetPage()
  }, [debouncedSearch, category, resetPage])

  // Fetch recursos
  useEffect(() => {
    const params: {
      materia_id?: number
      solo_activos?: boolean
      page?: number
      search?: string
    } = {
      materia_id: materiaId,
      solo_activos: true,
      page,
    }

    if (debouncedSearch) params.search = debouncedSearch

    recursosService
      .list(params)
      .then((data) => {
        let results = data.results

        if (category !== 'todos') {
          const categoria: Recurso['categoria'] =
            category === 'nota'
              ? 'nota'
              : category === 'proyecto'
                ? 'proyecto'
                : 'prueba'
          results = results.filter((r) => r.categoria === categoria)
        }

        switch (sort) {
          case 'rating':
            results = [...results].sort(
              (a, b) => (b.promedio_estrellas ?? 0) - (a.promedio_estrellas ?? 0)
            )
            break
          case 'recent':
            results = [...results].sort(
              (a, b) =>
                new Date(b.fecha_subida).getTime() -
                new Date(a.fecha_subida).getTime()
            )
            break
        }

        setRecursos(results)
        setTotalCount(data.count)
      })
      .catch(() => {
        setRecursos([])
        setTotalCount(0)
      })
      .finally(() => setRecursosLoading(false))
  }, [materiaId, page, debouncedSearch, category, sort])

  const activeFiltersCount =
    (debouncedSearch ? 1 : 0) + (category !== 'todos' ? 1 : 0)

  const hasActiveFilters = activeFiltersCount > 0

  const totalPages = Math.max(1, Math.ceil(totalCount / PER_PAGE))

  const handleLoginPrompt = () => {
    window.location.href = '/login'
  }

  const handleResetFilters = () => {
    setSearch('')
    setCategory('todos')
    setSort('rating')
    setRecursosLoading(true)
    resetPage()
    setRecursoPreview(null)
  }

  const setRecursoPreview = (recurso: Recurso | null) => {
    setPreviewRecurso(recurso)
    if (recurso) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
  }

  if (materiaLoading) {
    return (
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="h-6 w-64 animate-pulse rounded bg-surface-container-high" />
        <div className="mt-6 h-24 animate-pulse rounded-xl bg-surface-container-high" />
        <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="h-56 animate-pulse rounded-xl bg-surface-container-high"
            />
          ))}
        </div>
      </main>
    )
  }

  if (!materia) {
    return (
      <main className="mx-auto max-w-7xl px-4 py-24 text-center sm:px-6 lg:px-8">
        <h1 className="font-display text-headline-lg font-bold text-on-surface">
          Materia no encontrada
        </h1>
        <Link
          to="/"
          className="mt-4 inline-flex font-medium text-secondary hover:text-secondary-container"
        >
          Volver al inicio
        </Link>
      </main>
    )
  }

  const facultadNombre = materia.carreras_list?.find(
    (carrera) => carrera.facultad_nombre
  )?.facultad_nombre

  return (
    <main className="min-h-screen bg-surface text-on-surface">
      {/* Breadcrumb */}
      <nav className="mx-auto max-w-7xl px-4 pt-6 sm:px-6 lg:px-8">
        <ol className="flex flex-wrap items-center gap-1.5 text-body-sm text-on-surface-variant">
          <li>
            <Link to="/" className="hover:text-secondary">
              Inicio
            </Link>
          </li>
          {facultadNombre && (
            <>
              <li aria-hidden="true">/</li>
              <li className="text-on-surface">{facultadNombre}</li>
            </>
          )}
          <li aria-hidden="true">/</li>
          <li className="font-medium text-on-surface">{materia.nombre}</li>
        </ol>
      </nav>

      {/* Subject Header */}
      <section className="mx-auto max-w-7xl px-4 pb-8 pt-6 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-6 rounded-2xl border border-surface-container-high bg-surface-card p-6 sm:p-8 lg:flex-row lg:items-start lg:justify-between">
          <div className="max-w-2xl">
            {materia.codigo && (
              <span className="inline-flex items-center rounded-full bg-secondary/10 px-3 py-1 text-body-sm font-semibold text-secondary">
                {materia.codigo}
              </span>
            )}
            <h1 className="mt-3 font-display text-headline-lg font-bold text-on-surface">
              {materia.nombre}
            </h1>
            <p className="mt-2 text-body-lg text-on-surface-variant">
              Encuentra exámenes, talleres, guías y proyectos de{' '}
              {materia.nombre}. Aporta tu material para ayudar a la comunidad
              politécnica.
            </p>
            <div className="mt-4 flex flex-wrap items-center gap-4 text-body-sm text-on-surface-variant">
              <span>{recursos.length} recursos</span>
            </div>
          </div>
          <button
            type="button"
            onClick={handleLoginPrompt}
            className="inline-flex shrink-0 items-center justify-center gap-2 self-start rounded-full bg-secondary px-6 py-3 font-semibold text-white transition-colors hover:bg-secondary-container"
          >
            <svg
              className="h-5 w-5"
              viewBox="0 0 20 20"
              fill="currentColor"
              aria-hidden="true"
            >
              <path
                fillRule="evenodd"
                d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
                clipRule="evenodd"
              />
            </svg>
            Aportar Recurso
          </button>
        </div>
      </section>

      {/* Sticky Filter Bar */}
      <div className="sticky top-0 z-30 border-y border-surface-container-high bg-surface/95 backdrop-blur">
        <div className="mx-auto max-w-7xl px-4 py-3 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
            <div className="relative flex-1">
              <svg
                className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-outline"
                viewBox="0 0 20 20"
                fill="currentColor"
                aria-hidden="true"
              >
                <path
                  fillRule="evenodd"
                  d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
                  clipRule="evenodd"
                />
              </svg>
              <input
                type="text"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value)
                  setRecursosLoading(true)
                }}
                placeholder="Buscar en recursos de esta materia..."
                className="w-full rounded-full border border-surface-container-high bg-surface-card py-2.5 pl-10 pr-4 text-body-md text-on-surface outline-none placeholder:text-on-surface-variant focus:border-secondary"
              />
            </div>
            <div className="flex flex-wrap gap-2">
              <select
                value={sort}
                onChange={(e) => {
                  setSort(e.target.value as SortId)
                  setRecursosLoading(true)
                }}
                className="rounded-full border border-surface-container-high bg-surface-card px-3 py-2.5 text-body-sm font-medium text-on-surface outline-none focus:border-secondary"
              >
                {SORT_OPTIONS.map((opt) => (
                  <option key={opt.id} value={opt.id}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Category Tabs */}
          <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
            {CATEGORY_TABS.map((tab) => {
              const count =
                tab.id === 'todos'
                  ? recursos.length
                  : recursos.filter((r) =>
                      tab.id === 'nota'
                        ? r.categoria === 'nota'
                        : tab.id === 'proyecto'
                          ? r.categoria === 'proyecto'
                          : r.categoria === 'prueba'
                    ).length
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => {
                    setCategory(tab.id)
                    setRecursosLoading(true)
                  }}
                  className={cn(
                    'flex shrink-0 items-center gap-2 rounded-full px-4 py-2 text-body-sm font-medium transition-colors',
                    category === tab.id
                      ? 'bg-secondary text-white'
                      : 'bg-surface-card text-on-surface-variant ring-1 ring-surface-container-high hover:text-secondary'
                  )}
                >
                  {tab.label}
                  <span
                    className={cn(
                      'rounded-full px-1.5 py-0.5 text-xs font-semibold',
                      category === tab.id
                        ? 'bg-white/20 text-white'
                        : 'bg-surface-container-low text-on-surface-variant'
                    )}
                  >
                    {count}
                  </span>
                </button>
              )
            })}
          </div>
        </div>
      </div>

      {/* Resource Grid + Active Filters */}
      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {hasActiveFilters && (
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
            <p className="text-body-md text-on-surface-variant">
              <span className="font-semibold text-on-surface">
                {recursos.length}
              </span>{' '}
              resultado{recursos.length !== 1 ? 's' : ''} con filtros activos
            </p>
            <button
              type="button"
              onClick={handleResetFilters}
              className="inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-body-sm font-medium text-secondary ring-1 ring-secondary/30 transition-colors hover:bg-secondary/10"
            >
              <svg
                className="h-4 w-4"
                viewBox="0 0 20 20"
                fill="currentColor"
                aria-hidden="true"
              >
                <path
                  fillRule="evenodd"
                  d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
              Restablecer filtros
            </button>
          </div>
        )}

        {recursosLoading ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: PER_PAGE }).map((_, i) => (
              <div
                key={i}
                className="h-56 animate-pulse rounded-xl bg-surface-container-high"
              />
            ))}
          </div>
        ) : recursos.length === 0 ? (
          <div className="py-20 text-center">
            <p className="text-body-lg font-medium text-on-surface">
              No se encontraron recursos
            </p>
            <p className="mt-2 text-body-md text-on-surface-variant">
              Ajusta los filtros o aporta material para esta materia.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {recursos.map((recurso) => (
              <ResourceCard
                key={recurso.id}
                recurso={recurso}
                materiaNombre={materia.nombre}
                onOpen={(r) => setRecursoPreview(r)}
              />
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-10 flex flex-col items-center gap-3">
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => {
                  setRecursosLoading(true)
                  prevPage()
                }}
                disabled={page <= 1}
                className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-surface-container-high bg-surface-card text-on-surface transition-colors hover:text-secondary disabled:opacity-40 disabled:hover:text-on-surface"
                aria-label="Página anterior"
              >
                <svg
                  className="h-5 w-5"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <path
                    fillRule="evenodd"
                    d="M12.79 5.23a.75.75 0 01-.02 1.06L8.832 10l3.938 3.71a.75.75 0 11-1.04 1.08l-4.5-4.25a.75.75 0 010-1.08l4.5-4.25a.75.75 0 011.06.02z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
              {Array.from({ length: totalPages }).map((_, i) => {
                const p = i + 1
                return (
                  <button
                    key={p}
                    type="button"
                    onClick={() => {
                      setRecursosLoading(true)
                      setPage(p)
                    }}
                    className={cn(
                      'h-10 w-10 rounded-full text-body-sm font-medium transition-colors',
                      page === p
                        ? 'bg-secondary text-white'
                        : 'bg-surface-card text-on-surface hover:text-secondary ring-1 ring-surface-container-high'
                    )}
                  >
                    {p}
                  </button>
                )
              })}
              <button
                type="button"
                onClick={() => {
                  setRecursosLoading(true)
                  nextPage()
                }}
                disabled={page >= totalPages}
                className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-surface-container-high bg-surface-card text-on-surface transition-colors hover:text-secondary disabled:opacity-40 disabled:hover:text-on-surface"
                aria-label="Página siguiente"
              >
                <svg
                  className="h-5 w-5"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <path
                    fillRule="evenodd"
                    d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
            </div>
            <p className="text-body-sm text-on-surface-variant">
              Página {page} de {totalPages}
            </p>
          </div>
        )}
      </section>

      {/* Preview Modal */}
      {previewRecurso && (
<ResourcePreviewModal
          recurso={previewRecurso}
          onClose={() => setRecursoPreview(null)}
          onRequireAuth={handleLoginPrompt}
          onRecursoUpdated={(updated) =>
            setRecursos((prev) =>
              prev.map((r) => (r.id === updated.id ? updated : r))
            )
          }
        />
      )}
    </main>
  )
}
