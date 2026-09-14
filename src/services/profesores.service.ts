import { api } from "@/lib/api";
import type { PaginatedResponse, Profesor } from "@/types";

export const profesoresService = {
  async list() {
    const { data } = await api.get<PaginatedResponse<Profesor>>(
      "/api/profesores/"
    );
    return data;
  },

  async getById(id: number) {
    const { data } = await api.get<Profesor>(`/api/profesores/${id}/`);
    return data;
  },
};
