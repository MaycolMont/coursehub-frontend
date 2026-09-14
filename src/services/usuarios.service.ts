import { api } from "@/lib/api";
import type {
  PaginatedResponse,
  Rango,
  Recurso,
  Usuario,
} from "@/types";

export const usuariosService = {
  async list() {
    const { data } = await api.get<PaginatedResponse<Usuario>>(
      "/api/usuarios/"
    );
    return data;
  },

  async getById(id: number) {
    const { data } = await api.get<Usuario>(`/api/usuarios/${id}/`);
    return data;
  },

  async getGuardados() {
    const { data } = await api.get<Recurso[]>("/api/usuarios/guardados/");
    return data;
  },

  async getKarma() {
    const { data } = await api.get<{
      karma_acumulado: number;
      rango_actual: Rango;
      siguiente_rango: Rango | null;
      progreso: number;
    }>("/api/usuarios/karma/");
    return data;
  },
};
