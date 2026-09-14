import { api } from "@/lib/api";
import type { PaginatedResponse, Recurso } from "@/types";

interface RecursoListParams {
  materia_id?: number;
  coleccion_id?: number;
  categoria?: string;
  tipo_recurso?: string;
  usuario_id?: number;
  solo_activos?: boolean;
  page?: number;
  search?: string;
}

export const recursosService = {
  async list(params?: RecursoListParams) {
    const { data } = await api.get<PaginatedResponse<Recurso>>(
      "/api/recursos/",
      { params }
    );
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
