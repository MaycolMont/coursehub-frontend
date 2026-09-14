import { api } from "@/lib/api";
import type { Facultad, PaginatedResponse } from "@/types";

export const facultadesService = {
  async list() {
    const { data } = await api.get<PaginatedResponse<Facultad>>(
      "/api/facultades/"
    );
    return data;
  },

  async getById(id: number) {
    const { data } = await api.get<Facultad>(`/api/facultades/${id}/`);
    return data;
  },
};
