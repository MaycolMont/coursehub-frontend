import { api } from "@/lib/api";
import type { Materia, PaginatedResponse } from "@/types";

interface MateriaListParams {
  carrera_id?: number;
  facultad_id?: number;
  activo?: boolean;
  search?: string;
  page?: number;
}

export const materiasService = {
  async list(params?: MateriaListParams) {
    const { data } = await api.get<PaginatedResponse<Materia>>(
      "/api/materias/",
      { params }
    );
    return data;
  },

  async catalogo(params?: MateriaListParams) {
    const { data } = await api.get<PaginatedResponse<Materia>>(
      "/api/materias/catalogo/",
      { params }
    );
    return data;
  },

  async catalogoAll(params?: Omit<MateriaListParams, "page">) {
    const all: Materia[] = [];
    let page = 1;
    let next: string | null;
    do {
      const data = await this.catalogo({ ...params, page });
      all.push(...data.results);
      next = data.next;
      page += 1;
    } while (next && page <= 100);
    return all;
  },

  async getById(id: number) {
    const { data } = await api.get<Materia>(`/api/materias/${id}/`);
    return data;
  },
};
