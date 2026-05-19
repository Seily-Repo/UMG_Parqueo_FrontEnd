import axios from "axios";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:3000";

const api = axios.create({
  baseURL: API_URL,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export default api;

export interface ApiResponse<T> {
  success: boolean;
  status?: number;
  message: string;
  details: T;
}

export interface TipoEspacioApi {
  TES_ESPACIO: number;
  TES_NOMBRE: string;
  TES_CAPACIDAD_MAX_TIPO?: number;
  TES_ESTADO?: number;
  PQ_Parqueo?: number;
}

export interface EspacioApi {
  ES_Espacio: number;
  ES_Numero?: number;
  ES_Estado: number;
  TES_ESPACIO?: number;
  TipoEspacio?: TipoEspacioApi;
}

export interface AsignacionApi {
  AS_Asignacion: number;
  AS_Estado: number;
  carne_usuario: number;
  ES_Espacio: number;
  id_ciclo: number;
  id_jornada: number;
}

export interface IslaApi {
  IS_ISLA: number;
  PQ_PARQUEO: number;
  IS_NOMBRE: string;
  IS_CAPACIDAD: number;
  IS_DESCRIPCION?: string | null;
  IS_ESTADO: number;
}

export interface DetalleIslaApi {
  id_detalle: number;
  id_espacio: number;
  tipo: number | string;
  estado_fisico: number | null;
}

export interface AsignacionEspacioPayload {
  carne_usuario: number;
  ES_Espacio: number;
  id_ciclo: number;
  id_jornada: number;
  correlativo: string;
}

export const asignarEspacio = (data: AsignacionEspacioPayload) => {
  return api.post<ApiResponse<{ disponible: boolean; voucher?: unknown }>>("/api/asignacion", data);
};

export const obtenerEspaciosLibres = (id_ciclo: number, id_jornada: number) => {
  return api.get<ApiResponse<EspacioApi[]>>("/api/asignacion/disponibilidad/libres", {
    params: { id_ciclo, id_jornada },
  });
};

export const obtenerEspaciosOcupados = (id_ciclo: number, id_jornada: number) => {
  return api.get<ApiResponse<AsignacionApi[]>>("/api/asignacion/disponibilidad/ocupados", {
    params: { id_ciclo, id_jornada },
  });
};

export const obtenerIslas = (id_parqueo?: number, estado = 1) => {
  return api.get<ApiResponse<IslaApi[]>>("/api/islas", {
    params: { id_parqueo, estado },
  });
};

export const obtenerDetalleIsla = (id: number) => {
  return api.get<ApiResponse<DetalleIslaApi[]>>(`/api/islas/${id}/espacios`);
};