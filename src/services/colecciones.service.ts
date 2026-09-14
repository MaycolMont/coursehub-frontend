import { api } from "@/lib/api";
import type { Coleccion, PaginatedResponse } from "@/types";

interface ColeccionListParams {
  materia_id?: number;
  profesor_id?: number;
}

export const coleccionesService = {
  async list(params?: ColeccionListParams) {
    const { data } = await api.get<PaginatedResponse<Coleccion>>(
      "/api/colecciones/",
      { params }
    );
    return data;
  },

  async getById(id: number) {
    const { data } = await api.get<Coleccion>(`/api/colecciones/${id}/`);
    return data;
  },
};
