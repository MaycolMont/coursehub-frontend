import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import type { Recurso } from '@/types'
import { recursosService } from '@/services/recursos.service'
import { cn } from '@/lib/utils'
import ResourceCard from '@/components/ui/ResourceCard'
import ResourcePreviewModal from '@/components/ui/ResourcePreviewModal'

const QUICK_FILTERS = [
  'Cálculo',
  'Estructuras de Datos',
  'Física Mecánica',
  'Estadística',
]

const TRENDING_TABS = [
  { id: 'todos', label: 'Todos' },
  { id: 'prueba', label: 'Exámenes' },
  { id: 'nota', label: 'Guías y Talleres' },
  { id: 'proyecto', label: 'Proyectos' },
] as const

function SearchIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
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
  )
}

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 20 20"
      fill="currentColor"
      aria-hidden="true"
    >
      <path
        fillRule="evenodd"
        d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z"
        clipRule="evenodd"
      />
    </svg>
  )
}

function ArrowRightIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 20 20"
      fill="currentColor"
      aria-hidden="true"
    >
      <path
        fillRule="evenodd"
        d="M3 10a.75.75 0 01.75-.75h10.638L10.23 5.29a.75.75 0 111.04-1.08l5.5 5.25a.75.75 0 010 1.08l-5.5 5.25a.75.75 0 11-1.04-1.08l4.158-3.96H3.75A.75.75 0 013 10z"
        clipRule="evenodd"
      />
    </svg>
  )
}

export default function HomePage() {
  const navigate = useNavigate()
  const [searchQuery, setSearchQuery] = useState('')
  const [trendingTab, setTrendingTab] =
    useState<(typeof TRENDING_TABS)[number]['id']>('todos')

  const [recursos, setRecursos] = useState<Recurso[]>([])
  const [recursosLoading, setRecursosLoading] = useState(true)
  const [previewRecurso, setPreviewRecurso] = useState<Recurso | null>(null)

  const handleLoginPrompt = () => {
    window.location.href = '/login'
  }

  const handleSearch = (term?: string) => {
    const q = (term ?? searchQuery).trim()
    navigate(q ? `/materias?q=${encodeURIComponent(q)}` : '/materias')
  }

  useEffect(() => {
    let active = true
    recursosService
      .list({ solo_activos: true })
      .then((data) => {
        if (active) setRecursos(data.results)
      })
      .catch(() => {
        if (active) setRecursos([])
      })
      .finally(() => {
        if (active) setRecursosLoading(false)
      })
    return () => {
      active = false
    }
  }, [])

  const filteredTrending = useMemo(() => {
    if (trendingTab === 'todos') return recursos
    return recursos.filter((r) => r.categoria === trendingTab)
  }, [recursos, trendingTab])

  return (
    <main className="min-h-screen bg-surface text-on-surface">
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-b from-surface via-surface-container-low to-surface">
        {/* SVG grid pattern */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 opacity-40"
          style={{
            backgroundImage:
              "url(\"data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 40L40 0M-10 50L50 -10M10 50L50 10M-10 30L30 -10M20 60L60 20M-20 40L40 -20M0 20L20 0M20 40L40 20M30 50L50 30' stroke='%23b4c5ff' stroke-opacity='0.25' stroke-width='1'/%3E%3C/svg%3E\")",
          }}
        />
        <div className="relative mx-auto max-w-7xl px-4 pb-16 pt-16 sm:px-6 sm:pt-24 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <p className="mb-4 inline-flex items-center gap-2 rounded-full border border-secondary-container/30 bg-surface-card px-4 py-1.5 text-body-sm font-medium text-secondary">
              <span className="h-2 w-2 rounded-full bg-secondary" />
              Repositorio Abierto Politécnico
            </p>
            <h1 className="font-display text-display font-bold leading-tight tracking-tight text-on-surface sm:text-5xl">
              El conocimiento de la ESPOL,{' '}
              <span className="text-secondary">reunido en un solo lugar.</span>
            </h1>
            <p className="mx-auto mt-5 max-w-2xl text-body-lg text-on-surface-variant">
              Encuentra exámenes, talleres, guías y proyectos aportados por la
              comunidad politécnica. Estudia mejor con material verificado y
              comparte lo que sabes.
            </p>

            {/* Omnibox */}
            <div className="mx-auto mt-8 max-w-2xl">
              <div className="flex items-center gap-2 rounded-full border border-surface-container-high bg-surface-card p-2 shadow-lg shadow-primary-container/5">
                <div className="flex flex-1 items-center gap-3 pl-3">
                  <SearchIcon className="h-5 w-5 shrink-0 text-outline" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault()
                        handleSearch()
                      }
                    }}
                    placeholder="Buscar materia, examen o taller..."
                    className="w-full bg-transparent py-2 text-body-md text-on-surface outline-none placeholder:text-on-surface-variant"
                  />
                </div>
                <span className="hidden rounded-md border border-border-subtle bg-surface-container-low px-2 py-1 text-body-sm font-medium text-on-surface-variant sm:inline-flex">
                  Enter
                </span>
                <button
                  type="button"
                  onClick={() => handleSearch()}
                  className="inline-flex items-center gap-2 rounded-full bg-secondary px-5 py-2.5 text-body-md font-semibold text-white transition-colors hover:bg-secondary-container"
                >
                  Buscar
                </button>
              </div>
              <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
                <span className="text-body-sm text-on-surface-variant">
                  Explorar:
                </span>
                {QUICK_FILTERS.map((filter) => (
                  <button
                    key={filter}
                    type="button"
                    onClick={() => {
                      setSearchQuery(filter)
                      handleSearch(filter)
                    }}
                    className={cn(
                      'rounded-full border px-3 py-1 text-body-sm font-medium transition-colors',
                      searchQuery === filter
                        ? 'border-secondary bg-secondary text-white'
                        : 'border-surface-container-high bg-surface-card text-on-surface-variant hover:border-secondary/40 hover:text-secondary'
                    )}
                  >
                    {filter}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Campus Snapshot */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2">
          <div>
            <p className="mb-3 inline-flex items-center gap-2 rounded-full bg-surface-card px-4 py-1.5 text-body-sm font-medium text-secondary ring-1 ring-surface-container-high">
              Repositorio Abierto Politécnico
            </p>
            <h2 className="font-display text-headline-lg font-bold text-on-surface">
              Impulsado por estudiantes, para estudiantes politécnicos
            </h2>
            <p className="mt-4 text-body-lg text-on-surface-variant">
              CourseHub nació dentro de la ESPOL con una misión clara: que
              ningún politécnico se enfrente solo a una materia difícil. Aquí
              la comunidad comparte y encuentra material real de exámenes,
              talleres y proyectos de cada semestre.
            </p>
            <ul className="mt-6 space-y-3">
              {['Gratuito', 'Material Verificado', 'Solucionarios'].map(
                (item) => (
                  <li key={item} className="flex items-center gap-3">
                    <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-secondary/10 text-secondary">
                      <CheckIcon className="h-4 w-4" />
                    </span>
                    <span className="font-medium text-on-surface">{item}</span>
                  </li>
                )
              )}
            </ul>
          </div>
          <div className="relative">
            <div className="absolute -inset-4 rounded-3xl bg-gradient-to-tr from-secondary/10 to-primary-container/10 blur-2xl" />
            <div className="relative overflow-hidden rounded-3xl bg-surface-container">
              <div className="flex aspect-[4/3] items-center justify-center bg-gradient-to-br from-surface-container-high to-secondary-container/20">
                <svg
                  viewBox="0 0 400 300"
                  className="h-full w-full"
                  aria-hidden="true"
                >
                  <rect width="400" height="300" fill="#e5eeff" />
                  <circle cx="120" cy="150" r="40" fill="#b4c5ff" />
                  <circle cx="200" cy="140" r="42" fill="#00e0c5" />
                  <circle cx="285" cy="160" r="38" fill="#ffb691" />
                  <rect x="60" y="60" width="280" height="14" rx="7" fill="#b4c5ff" />
                  <rect x="60" y="90" width="220" height="10" rx="5" fill="#cbdffc" />
                </svg>
              </div>
              <div className="absolute inset-x-4 bottom-4 flex items-center justify-between rounded-xl bg-surface-card/90 px-4 py-3 backdrop-blur">
                <span className="text-body-sm font-medium text-on-surface">
                  Estudiantes politécnicos compartiendo material
                </span>
                <span className="text-body-sm text-secondary">
                  100% comunidad
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trending Resources */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="font-display text-headline-lg font-bold text-on-surface">
              Recursos tendencia esta semana
            </h2>
            <p className="mt-2 text-body-lg text-on-surface-variant">
              Lo más buscado por la comunidad politécnica
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {TRENDING_TABS.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setTrendingTab(tab.id)}
                className={cn(
                  'rounded-full px-4 py-2 text-body-sm font-medium transition-colors',
                  trendingTab === tab.id
                    ? 'bg-secondary text-white'
                    : 'bg-surface-card text-on-surface-variant ring-1 ring-surface-container-high hover:text-secondary'
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-8">
          {recursosLoading ? (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <div
                  key={i}
                  className="h-56 animate-pulse rounded-xl bg-surface-container-high"
                />
              ))}
            </div>
          ) : filteredTrending.length === 0 ? (
            <p className="py-16 text-center text-body-lg text-on-surface-variant">
              No hay recursos disponibles en esta categoría.
            </p>
          ) : (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {filteredTrending.slice(0, 6).map((recurso) => (
                <ResourceCard
                  key={recurso.id}
                  recurso={recurso}
                  onOpen={(r) => setPreviewRecurso(r)}
                />
              ))}
            </div>
          )}
        </div>

        <div className="mt-10 text-center">
          <a
            href="#"
            className="inline-flex items-center gap-2 font-medium text-secondary hover:text-secondary-container"
          >
            Explorar catálogo completo
            <ArrowRightIcon className="h-4 w-4" />
          </a>
        </div>
      </section>

      {/* Preview Modal */}
      {previewRecurso && (
        <ResourcePreviewModal
          recurso={previewRecurso}
          onClose={() => setPreviewRecurso(null)}
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
