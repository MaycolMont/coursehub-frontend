import { api } from "@/lib/api";
import type { PaginatedResponse, Recurso } from "@/types";

export interface RecursoListParams {
  materia_id?: number;
  coleccion_id?: number;
  categoria?: string;
  tipo_recurso?: string;
  usuario_id?: number;
  solo_activos?: boolean;
  page?: number;
  search?: string;
}

export interface CrearRecursoPayload {
  materia_id?: number;
  coleccion?: number;
  categoria: string;
  tipo_recurso: string;
  descripcion?: string;
  consejo_estudio?: string;
  archivo?: File;
  storage_key?: string;
}

type RecursoListResponse = PaginatedResponse<Recurso> | Recurso[];

function normalizeListResponse(data: RecursoListResponse): PaginatedResponse<Recurso> {
  if (Array.isArray(data)) {
    return {
      count: data.length,
      next: null,
      previous: null,
      results: data,
    };
  }

  return data;
}

export const recursosService = {
  async list(params?: RecursoListParams) {
    const { data } = await api.get<RecursoListResponse>(
      "/api/recursos/",
      { params }
    );
    return normalizeListResponse(data);
  },

  async create(payload: FormData | CrearRecursoPayload) {
    const { data } = await api.post<Recurso>("/api/recursos/", payload, {
      ...(payload instanceof FormData
        ? { headers: { "Content-Type": "multipart/form-data" } }
        : {}),
    });
    return data;
  },

  async getById(id: number) {
    const { data } = await api.get<Recurso>(`/api/recursos/${id}/`);
    return data;
  },

  async download(id: number) {
    const { data } = await api.get(`/api/recursos/${id}/descargar/`, {
      responseType: "blob",
    });
    return data as Blob;
  },

  async share(id: number) {
    const { data } = await api.post<{ url: string }>(
      `/api/recursos/${id}/compartir/`
    );
    return data;
  },
};
