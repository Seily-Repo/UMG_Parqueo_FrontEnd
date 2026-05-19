import axios from "axios";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:3000";

const api = axios.create({
  baseURL: API_URL,
});

export default api;

export interface AsignacionEspacioPayload {
  carne_usuario: number;
  ES_Espacio: number;
  id_ciclo: number;
  id_jornada: number;
  correlativo: string;
}

export const asignarEspacio = (data: AsignacionEspacioPayload) => {
  return api.post("/api/asignacion", data);
};
