import { apiRequest } from "../api";
import type { BackendEstudiante } from "../models/backend";

export const studentService = {
  getAll() {
    return apiRequest<BackendEstudiante[]>("/api/estudiantes");
  },

  getByCarne(carne: string) {
    return apiRequest<BackendEstudiante>(`/api/estudiantes/carne/${encodeURIComponent(carne)}`);
  },

  create(payload: BackendEstudiante) {
    return apiRequest<BackendEstudiante>("/api/estudiantes", {
      method: "POST",
      body: payload,
    });
  },

  update(carne: string, payload: BackendEstudiante) {
    return apiRequest<BackendEstudiante>(`/api/estudiantes/carne/${encodeURIComponent(carne)}`, {
      method: "PUT",
      body: payload,
    });
  },

  remove(carne: string) {
    return apiRequest<void>(`/api/estudiantes/carne/${encodeURIComponent(carne)}`, {
      method: "DELETE",
    });
  },
};
