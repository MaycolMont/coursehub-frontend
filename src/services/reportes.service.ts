import { api } from "@/lib/api";
import type { ReporteRecurso } from "@/types";

interface ReporteCreatePayload {
  recurso: number;
  motivo: string;
  descripcion: string;
  anonimo_nombre?: string;
  anonimo_correo?: string;
}

export const reportesService = {
  async create(payload: ReporteCreatePayload) {
    const { data } = await api.post<ReporteRecurso>(
      "/api/reportes/",
      payload
    );
    return data;
  },
};
