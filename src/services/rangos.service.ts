import { api } from "@/lib/api";
import type { PaginatedResponse, Rango } from "@/types";

export const rangosService = {
  async list() {
    const { data } = await api.get<PaginatedResponse<Rango>>("/api/rangos/");
    return data;
  },
};
