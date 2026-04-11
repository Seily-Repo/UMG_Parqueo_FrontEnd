import { apiRequest } from "../api";
import type { BackendEstudianteMoroso } from "../models/backend";

function normalizeMorosoResponse(
  payload: BackendEstudianteMoroso | BackendEstudianteMoroso[]
): BackendEstudianteMoroso[] {
  return Array.isArray(payload) ? payload : payload ? [payload] : [];
}

export const delinquentStudentService = {
  getAll() {
    return apiRequest<BackendEstudianteMoroso[]>("/api/estudiante_moroso");
  },

  getByCarne(carne: string) {
    return apiRequest<BackendEstudianteMoroso | BackendEstudianteMoroso[]>(
      `/api/estudiante_moroso/carne/${encodeURIComponent(carne)}`
    );
  },

  async getActiveByCarne(carne: string) {
    const response = await this.getByCarne(carne);
    return normalizeMorosoResponse(response).filter((item) => item.MOR_ESTADO === "A");
  },
};
