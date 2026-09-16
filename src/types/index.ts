export interface Usuario {
  id: number
  pseudonimo: string
  correo_institucional: string
  karma_acumulado: number
  rol: 'estudiante' | 'moderador' | 'administrador'
  fecha_registro: string
}

export interface AuthTokens {
  access: string
  refresh: string
}

export interface LoginResponse {
  access: string
  refresh: string
  usuario: Usuario
}

export interface LoginPayload {
  correo: string
  password: string
}

export interface RegisterPayload {
  correo: string
  pseudonimo: string
  password: string
}

export interface Rango {
  id: number
  nombre_rango: string
  karma_minimo: number
}

export interface Facultad {
  id: number
  nombre: string
  activo: boolean
}

export interface Carrera {
  id: number
  nombre: string
  facultad: number
  facultad_nombre?: string
}

export interface Materia {
  id: number
  codigo: string
  nombre: string
  activo: boolean
  facultad?: number
  carreras_list?: Array<{ id: number; nombre: string; facultad_nombre?: string }>
  recursos_count?: number
}

export interface Profesor {
  id: number
  nombre: string
  activo: boolean
}

export interface Coleccion {
  id: number
  titulo: string
  materia: number
  profesor: number
  descripcion?: string
  anio_semestre: string
  activo: boolean
  materia_nombre?: string
  profesor_nombre?: string
  recursos_count?: number
}

export interface Recurso {
  id: number
  nombre_archivo: string
  storage_key: string
  materia?: number
  materia_id?: number
  categoria: 'nota' | 'prueba' | 'proyecto'
  tipo_recurso: 'pdf' | 'zip' | 'link'
  usuario?: number
  usuario_pseudonimo?: string
  coleccion?: number
  coleccion_titulo?: string
  materia_nombre?: string
  profesor_nombre?: string
  descripcion?: string
  consejo_estudio?: string
  fecha_subida: string
  activo: boolean
  archivo_url?: string
  url?: string
  valoraciones_count?: number
  promedio_estrellas?: number
}

export interface Valoracion {
  id: number
  usuario: number
  recurso: number
  estrellas: number
}

export interface Guardado {
  id: number
  usuario: number
  recurso: number
  recurso_detalle?: Recurso
}

export interface ReporteRecurso {
  id: number
  recurso: number
  usuario?: number
  anonimo_nombre?: string
  anonimo_correo?: string
  motivo: string
  descripcion: string
  estado: 'pendiente' | 'atendido' | 'desestimado'
  fecha_reporte: string
}

export interface PaginatedResponse<T> {
  count: number
  next: string | null
  previous: string | null
  results: T[]
}
