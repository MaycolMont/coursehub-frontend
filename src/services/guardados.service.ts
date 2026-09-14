import { api } from "@/lib/api";
import type { Guardado, PaginatedResponse } from "@/types";

export const guardadosService = {
  async list() {
    const { data } = await api.get<PaginatedResponse<Guardado>>(
      "/api/guardados/"
    );
    return data;
  },

  async create(payload: { recurso: number }) {
    const { data } = await api.post<Guardado>("/api/guardados/", payload);
    return data;
  },

  async delete(id: number) {
    await api.delete(`/api/guardados/${id}/`);
  },
};
