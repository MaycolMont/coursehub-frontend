import { api } from '@/lib/api'
import type { Materia, PaginatedResponse } from '@/types'

interface MateriaListParams {
  carrera_id?: number
  facultad_id?: number
  activo?: boolean
  search?: string
  page?: number
}

// Caché local con expiración para el catálogo completo.
// Evita rehacer el fetch inicial (que recorre todas las páginas del endpoint)
// cuando el usuario navega a otra pantalla y regresa.
const CATALOGO_CACHE_KEY = 'coursehub_materias_catalogo_v1'
const CATALOGO_TTL_MS = 30 * 60 * 1000

let memoryCache: { timestamp: number; data: Materia[] } | null = null

function readCatalogCache(): Materia[] | null {
  if (
    memoryCache &&
    Date.now() - memoryCache.timestamp < CATALOGO_TTL_MS
  ) {
    return memoryCache.data
  }
  try {
    const raw = localStorage.getItem(CATALOGO_CACHE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as { timestamp: number; data: Materia[] }
    if (
      !Array.isArray(parsed.data) ||
      Date.now() - parsed.timestamp >= CATALOGO_TTL_MS
    ) {
      localStorage.removeItem(CATALOGO_CACHE_KEY)
      return null
    }
    memoryCache = parsed
    return parsed.data
  } catch {
    return null
  }
}

function writeCatalogCache(data: Materia[]) {
  const entry = { timestamp: Date.now(), data }
  memoryCache = entry
  try {
    localStorage.setItem(CATALOGO_CACHE_KEY, JSON.stringify(entry))
  } catch {
    // Almacenamiento no disponible o lleno: se ignora, solo implica re-fetch.
  }
}

export const materiasService = {
  async list(params?: MateriaListParams) {
    const { data } = await api.get<PaginatedResponse<Materia>>(
      '/api/materias/',
      { params }
    )
    return data
  },

  async catalogo(params?: MateriaListParams) {
    const { data } = await api.get<PaginatedResponse<Materia>>(
      '/api/materias/catalogo/',
      { params }
    )
    return data
  },

  // Trae el dataset completo una única vez (recorriendo la paginación) y lo
  // cachea. El filtrado posterior se hace en memoria del lado del cliente.
  async catalogoAll(params?: Omit<MateriaListParams, 'page'>) {
    if (!params) {
      const cached = readCatalogCache()
      if (cached) return cached
    }

    const all: Materia[] = []
    let page = 1
    let next: string | null
    do {
      const data = await this.catalogo({ ...params, page })
      all.push(...data.results)
      next = data.next
      page += 1
    } while (next && page <= 100)

    if (!params) writeCatalogCache(all)
    return all
  },

  async getById(id: number) {
    const { data } = await api.get<Materia>(`/api/materias/${id}/`)
    return data
  },
}