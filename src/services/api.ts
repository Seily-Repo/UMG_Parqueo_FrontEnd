import axios, { AxiosError } from "axios";

const rawApiUrl = (process.env.REACT_APP_API_URL || "/api").trim().replace(/^["']|["']$/g, "");
const API_BASE_URL = rawApiUrl.replace(/\/+$/, "").endsWith("/api")
  ? rawApiUrl.replace(/\/api\/?$/, "")
  : rawApiUrl.replace(/\/+$/, "");

const api = axios.create({
  baseURL: API_BASE_URL,
});

export const getAuthToken = () => {
  const tokenKeys = ["token", "jwt", "accessToken", "authToken"];
  return tokenKeys.map((key) => localStorage.getItem(key)).find(Boolean) ?? null;
};

export const hasAuthToken = () => Boolean(getAuthToken());

api.interceptors.request.use((config) => {
  const token = getAuthToken();

  if (token) {
    config.headers.Authorization = token.startsWith("Bearer ") ? token : `Bearer ${token}`;
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      window.dispatchEvent(new CustomEvent("auth:unauthorized"));
    }

    return Promise.reject(error);
  }
);

export default api;

export interface ApiResponse<T> {
  success: boolean;
  status?: number;
  message: string;
  details: T;
  data?: T;
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
  IS_ISLA: number | string;
  PQ_PARQUEO: number | string;
  IS_NOMBRE: string;
  IS_CAPACIDAD: number;
  IS_DESCRIPCION?: string | null;
  IS_ESTADO: number;
}

export interface ParqueoApi {
  PQ_Parqueo: number | string;
  PQ_Nombre: string;
  PQ_Direccion: string;
  PQ_Capacidad: number;
  estado: number;
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

export interface CrearIslaPayload {
  PQ_PARQUEO: number;
  IS_CAPACIDAD: number;
  IS_DESCRIPCION?: string;
  espacios: number[];
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

export const obtenerParqueos = () => {
  return api.get<ApiResponse<ParqueoApi[]>>("/api/parqueos");
};

export const obtenerTiposEspacio = () => {
  return api.get<ApiResponse<TipoEspacioApi[]>>("/api/tipo-espacios");
};

export const obtenerEspacios = () => {
  return api.get<ApiResponse<EspacioApi[]>>("/api/espacios");
};

export const crearIsla = (data: CrearIslaPayload) => {
  return api.post<ApiResponse<{ id_isla: number; nombre: string; descripcion?: string }>>("/api/islas", data);
};

export const anularIsla = (id: number) => {
  return api.put<ApiResponse<null>>(`/api/islas/${id}/anular`);
};

export const habilitarIsla = (id: number) => {
  return api.put<ApiResponse<null>>(`/api/islas/${id}/habilitar`);
};
