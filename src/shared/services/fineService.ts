import { apiRequest } from "../api";
import type { BackendEstudianteMulta, BackendMulta } from "../models/backend";

export const fineService = {
  getAllFines() {
    return apiRequest<BackendMulta[]>("/api/multa");
  },

  getFineById(id: number) {
    return apiRequest<BackendMulta>(`/api/multa/${id}`);
  },

  getAllStudentFines() {
    return apiRequest<BackendEstudianteMulta[]>("/api/estudiante_multa");
  },

  getStudentFinesByCarne(carne: string) {
    return apiRequest<BackendEstudianteMulta[]>(`/api/estudiante_multa/carne/${encodeURIComponent(carne)}`);
  },

  getStudentFineById(id: number) {
    return apiRequest<BackendEstudianteMulta>(`/api/estudiante_multa/${id}`);
  },

  updateStudentFineStatus(id: number, payload: { EMU_ESTADO_MULTA: string; EMU_MODIFICADO_POR: string }) {
    return apiRequest<BackendEstudianteMulta>(`/api/estudiante_multa/${id}`, {
      method: "PUT",
      body: payload,
    });
  },
};
