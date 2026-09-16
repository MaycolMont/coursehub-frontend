import { useEffect, useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import type { Facultad, Materia } from '@/types'
import { facultadesService } from '@/services/facultades.service'
import { materiasService } from '@/services/materias.service'
import { formatNumber } from '@/lib/utils'
import { usePagination } from '@/hooks/usePagination'

const PER_PAGE = 12

export default function MateriasPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const query = searchParams.get('q') ?? ''
  const activeFacultad = searchParams.get('facultad') ?? ''

  const [searchInput, setSearchInput] = useState(query)
  const [facultades, setFacultades] = useState<Facultad[]>([])
  const [data, setData] = useState<Materia[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const { page, prevPage, nextPage, setPage, resetPage } = usePagination()

  useEffect(() => {
    facultadesService
      .list()
      .then((data) => setFacultades(data.results))
      .catch(() => setFacultades([]))
  }, [])

  useEffect(() => {
    let active = true

    materiasService
      .catalogoAll()
      .then((items) => {
        if (active) setData(items)
      })
      .catch(() => {
        if (active) setError('No se pudieron cargar las materias.')
      })
      .finally(() => {
        if (active) setLoading(false)
      })

    return () => {
      active = false
    }
  }, [])

  useEffect(() => {
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev)
        if (searchInput.trim()) {
          next.set('q', searchInput.trim())
        } else {
          next.delete('q')
        }
        return next
      },
      { replace: true }
    )
  }, [searchInput, setSearchParams])

  const materias = useMemo(() => {
    const normalizedSearch = searchInput.trim().toLowerCase()
    return data.filter((materia) => {
      const matchesSearch =
        !normalizedSearch ||
        materia.nombre.toLowerCase().includes(normalizedSearch) ||
        materia.codigo.toLowerCase().includes(normalizedSearch) ||
        (materia.carreras_list ?? []).some((carrera) =>
          carrera.nombre.toLowerCase().includes(normalizedSearch)
        )
      const matchesFacultad =
        !activeFacultad || String(materia.facultad) === activeFacultad
      return matchesSearch && matchesFacultad
    })
  }, [activeFacultad, data, searchInput])

  useEffect(() => {
    resetPage()
  }, [activeFacultad, resetPage, searchInput])

  const totalPages = Math.max(1, Math.ceil(materias.length / PER_PAGE))
  const visibleMaterias = materias.slice((page - 1) * PER_PAGE, page * PER_PAGE)
  const pageNumbers = useMemo(() => {
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, index) => index + 1)
    }

    const start = Math.max(1, Math.min(page - 3, totalPages - 6))
    return Array.from({ length: 7 }, (_, index) => start + index)
  }, [page, totalPages])

  const handleFacultadChange = (value: string) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev)
      if (value) next.set('facultad', value)
      else next.delete('facultad')
      return next
    })
  }

  return (
    <main className="min-h-screen bg-surface px-4 py-8">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="font-display text-headline-lg font-bold text-on-surface">
            Catálogo de Materias
          </h1>
          <p className="mt-2 text-body-lg text-on-surface-variant">
            Explora las materias de la ESPOL y encuentra recursos aportados por
            la comunidad.
          </p>
        </div>

        {/* Search + Filters */}
        <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="relative w-full lg:max-w-md">
            <span className="material-symbols-outlined pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[20px] text-outline">
              search
            </span>
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Buscar por código o nombre..."
              className="w-full rounded-xl border border-border-subtle bg-surface-card py-3 pl-10 pr-4 text-body-md text-on-surface outline-none transition-colors placeholder:text-on-surface-variant focus:border-secondary"
            />
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="relative w-full sm:w-64">
              <span className="material-symbols-outlined pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[20px] text-outline">
                category
              </span>
              <select
                value={activeFacultad}
                onChange={(e) => handleFacultadChange(e.target.value)}
                aria-label="Filtrar por facultad"
                className="w-full appearance-none rounded-xl border border-border-subtle bg-surface-card py-3 pl-10 pr-10 text-body-md text-on-surface outline-none transition-colors focus:border-secondary"
              >
                <option value="">Todas las facultades</option>
                {facultades.map((facultad) => (
                  <option key={facultad.id} value={String(facultad.id)}>
                    {facultad.nombre}
                  </option>
                ))}
              </select>
              {activeFacultad ? (
                <button
                  type="button"
                  onClick={() => handleFacultadChange('')}
                  aria-label="Quitar filtro de facultad"
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-outline transition-colors hover:text-error"
                >
                  <span className="material-symbols-outlined text-[20px]">
                    close
                  </span>
                </button>
              ) : (
                <span className="material-symbols-outlined pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[20px] text-outline">
                  expand_more
                </span>
              )}
            </div>

            <p className="whitespace-nowrap text-body-sm text-on-surface-variant">
              {loading
                ? 'Cargando materias...'
                : `${formatNumber(materias.length)} materia${materias.length === 1 ? '' : 's'}`}
            </p>
          </div>
        </div>

        {/* Grid */}
        {loading ? (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 9 }).map((_, i) => (
              <div
                key={i}
                className="h-40 animate-pulse rounded-2xl bg-surface-container-high"
              />
            ))}
          </div>
        ) : error ? (
          <div className="py-20 text-center text-body-md text-error">{error}</div>
        ) : materias.length === 0 ? (
          <div className="py-20 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-surface-container-low">
              <span className="material-symbols-outlined text-[32px] text-outline">
                search_off
              </span>
            </div>
            <p className="text-title font-semibold text-on-surface">
              No se encontraron materias
            </p>
            <p className="mt-2 text-body-md text-on-surface-variant">
              Prueba con otro término de búsqueda o quita los filtros.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {visibleMaterias.map((materia) => (
              <Link
                key={materia.id}
                to={`/materia/${materia.id}`}
                className="group flex flex-col rounded-2xl border border-surface-container-high bg-surface-card p-5 transition-all hover:-translate-y-0.5 hover:border-secondary/40 hover:shadow-md"
              >
                <div className="mb-3 flex items-start justify-between gap-3">
                  <span className="inline-flex items-center rounded-lg bg-surface-container-low px-2.5 py-1 font-mono text-label-sm font-semibold tracking-tight text-secondary">
                    {materia.codigo}
                  </span>
                  <span className="inline-flex items-center gap-1 rounded-full bg-surface-container-low px-2.5 py-1 text-body-sm font-medium text-on-surface-variant">
                    <span className="material-symbols-outlined text-[16px]">
                      description
                    </span>
                    {formatNumber(materia.recursos_count ?? 0)}
                  </span>
                </div>

                <h3 className="font-title font-bold text-on-surface group-hover:text-secondary">
                  {materia.nombre}
                </h3>

                {(materia.carreras_list?.length ?? 0) > 0 && (
                  <p className="mt-2 line-clamp-2 text-body-sm text-on-surface-variant">
                    {materia.carreras_list!.map((c) => c.nombre).join(' · ')}
                  </p>
                )}

                <span className="mt-4 inline-flex items-center gap-1 text-body-sm font-medium text-secondary">
                  Ver recursos
                  <span className="material-symbols-outlined text-[16px] transition-transform group-hover:translate-x-0.5">
                    arrow_forward
                  </span>
                </span>
              </Link>
            ))}
          </div>
        )}

        {totalPages > 1 && (
          <nav
            aria-label="Paginación de materias"
            className="mt-10 flex flex-col items-center gap-3"
          >
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={prevPage}
                disabled={page === 1}
                aria-label="Página anterior"
                className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-surface-container-high bg-surface-card text-on-surface transition-colors hover:text-secondary disabled:cursor-not-allowed disabled:opacity-40"
              >
                <span className="material-symbols-outlined text-[20px]">
                  chevron_left
                </span>
              </button>
              {pageNumbers.map((pageNumber) => (
                <button
                  key={pageNumber}
                  type="button"
                  onClick={() => setPage(pageNumber)}
                  aria-current={page === pageNumber ? 'page' : undefined}
                  className={
                    page === pageNumber
                      ? 'h-10 w-10 rounded-full bg-secondary text-body-sm font-medium text-white'
                      : 'h-10 w-10 rounded-full bg-surface-card text-body-sm font-medium text-on-surface ring-1 ring-surface-container-high transition-colors hover:text-secondary'
                  }
                >
                  {pageNumber}
                </button>
              ))}
              <button
                type="button"
                onClick={nextPage}
                disabled={page === totalPages}
                aria-label="Página siguiente"
                className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-surface-container-high bg-surface-card text-on-surface transition-colors hover:text-secondary disabled:cursor-not-allowed disabled:opacity-40"
              >
                <span className="material-symbols-outlined text-[20px]">
                  chevron_right
                </span>
              </button>
            </div>
            <p className="text-body-sm text-on-surface-variant">
              Página {page} de {totalPages}
            </p>
          </nav>
        )}
      </div>
    </main>
  )
}
