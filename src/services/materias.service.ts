import { api } from "@/lib/api";
import type { Materia, PaginatedResponse } from "@/types";

interface MateriaListParams {
  carrera_id?: number;
  facultad_id?: number;
  activo?: boolean;
  search?: string;
}

export const materiasService = {
  async list(params?: MateriaListParams) {
    const { data } = await api.get<PaginatedResponse<Materia>>(
      "/api/materias/",
      { params }
    );
    return data;
  },

  async catalogo() {
    const { data } = await api.get<PaginatedResponse<Materia>>(
      "/api/materias/catalogo/"
    );
    return data;
  },

  async getById(id: number) {
    const { data } = await api.get<Materia>(`/api/materias/${id}/`);
    return data;
  },
};
