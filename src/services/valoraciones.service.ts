import { api } from "@/lib/api";
import type { PaginatedResponse, Valoracion } from "@/types";

interface ValoracionListParams {
  recurso_id?: number;
  usuario_id?: number;
}

export const valoracionesService = {
  async list(params?: ValoracionListParams) {
    const { data } = await api.get<PaginatedResponse<Valoracion>>(
      "/api/valoraciones/",
      { params }
    );
    return data;
  },

  async create(payload: { recurso: number; estrellas: number }) {
    const { data } = await api.post<Valoracion>(
      "/api/valoraciones/",
      payload
    );
    return data;
  },

  async delete(id: number) {
    await api.delete(`/api/valoraciones/${id}/`);
  },
};
