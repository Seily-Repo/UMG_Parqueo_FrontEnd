import { apiRequest } from "../api";
import type { BackendEstudiante } from "../models/backend";

type BackendUsuarioCobros = BackendEstudiante & {
  LR_CARNE?: string;
  LR_NOMBRES?: string;
  LR_APELLIDOS?: string;
  LR_CORREO_INSTITUCIONAL?: string;
  LR_FECHA_CREACION?: string;
};

function normalizeStudent(student: BackendUsuarioCobros): BackendEstudiante {
  return {
    ...student,
    EST_CARNE: student.EST_CARNE || student.LR_CARNE || "",
    EST_NOMBRE_COMPLETO:
      student.EST_NOMBRE_COMPLETO ||
      `${student.LR_NOMBRES || ""} ${student.LR_APELLIDOS || ""}`.trim(),
    EST_EMAIL: student.EST_EMAIL || student.LR_CORREO_INSTITUCIONAL || "",
    EST_FECHA_CREACION: student.EST_FECHA_CREACION || student.LR_FECHA_CREACION || new Date().toISOString(),
  };
}

function normalizeCarneForOracle(carne: string) {
  return carne.replace(/\D/g, "");
}

export const studentService = {
  async getAll() {
    const students = await apiRequest<BackendUsuarioCobros[]>("/api/usuario");
    return students.map(normalizeStudent);
  },

  async getByCarne(carne: string) {
    const student = await apiRequest<BackendUsuarioCobros>(
      `/api/usuario/carne/${encodeURIComponent(normalizeCarneForOracle(carne))}`
    );
    return normalizeStudent(student);
  },

  create(payload: BackendEstudiante) {
    return apiRequest<BackendEstudiante>("/api/usuario", {
      method: "POST",
      body: payload,
    });
  },

  update(carne: string, payload: BackendEstudiante) {
    return apiRequest<BackendEstudiante>(`/api/usuario/carne/${encodeURIComponent(carne)}`, {
      method: "PUT",
      body: payload,
    });
  },

  remove(carne: string) {
    return apiRequest<void>(`/api/usuario/carne/${encodeURIComponent(carne)}`, {
      method: "DELETE",
    });
  },
};
