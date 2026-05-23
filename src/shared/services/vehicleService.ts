import { apiRequest } from "../api";

export interface BackendVehicleLookup {
  ID_VEHICULO?: number;
  VEH_ID_VEHICULO?: number;
  CARNE?: string;
  LR_CARNE?: string;
  TIPO_VEHICULO?: string;
  PLACA?: string;
  VEH_PLACA?: string;
  MARCA?: string;
  MODELO?: string;
  COLOR?: string;
  ACTIVO?: number;
  ESTUDIANTE_NOMBRE?: string;
  ESTUDIANTE_APELLIDO?: string;
  ESTUDIANTE_CORREO?: string;
}

function normalizePlate(plate: string) {
  return plate.trim().toUpperCase().replace(/\s+/g, "");
}

export const vehicleService = {
  getByPlate(plate: string) {
    return apiRequest<BackendVehicleLookup>(`/api/usuario/vehiculo/placa/${encodeURIComponent(normalizePlate(plate))}`);
  },
};
