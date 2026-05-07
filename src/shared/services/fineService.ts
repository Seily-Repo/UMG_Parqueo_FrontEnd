import { apiRequest, ApiError } from "../api";
import type { BackendEstudianteMulta, BackendMulta } from "../models/backend";

type BackendUsuarioMultaCobros = BackendEstudianteMulta & {
  EMU_USUARIO_MULTA?: number;
  LR_CARNE?: string;
};

function normalizeStudentFine(fine: BackendUsuarioMultaCobros): BackendEstudianteMulta {
  return {
    ...fine,
    EMU_ESTUDIANTE_MULTA: fine.EMU_ESTUDIANTE_MULTA || fine.EMU_USUARIO_MULTA || 0,
    EST_CARNE: fine.EST_CARNE || fine.LR_CARNE || "",
  };
}

export const fineService = {
  getAllFines() {
    return apiRequest<BackendMulta[]>("/api/multa");
  },

  getFineById(id: number) {
    return apiRequest<BackendMulta>(`/api/multa/${id}`);
  },

  async getAllStudentFines() {
    const fines = await apiRequest<BackendUsuarioMultaCobros[]>("/api/usuario_multa");
    return fines.map(normalizeStudentFine);
  },

  async getStudentFinesByCarne(carne: string) {
    try {
      const fines = await apiRequest<BackendUsuarioMultaCobros[]>(`/api/usuario_multa/carne/${encodeURIComponent(carne)}`);
      return fines.map(normalizeStudentFine);
    } catch (error) {
      if (error instanceof ApiError && error.status === 404) {
        return [];
      }

      throw error;
    }
  },

  async getStudentFineById(id: number) {
    const fine = await apiRequest<BackendUsuarioMultaCobros>(`/api/usuario_multa/${id}`);
    return normalizeStudentFine(fine);
  },

  updateStudentFineStatus(id: number, payload: { EMU_ESTADO_MULTA: string; EMU_MODIFICADO_POR: string }) {
    return apiRequest<BackendEstudianteMulta>(`/api/usuario_multa/${id}`, {
      method: "PUT",
      body: payload,
    });
  },
};
