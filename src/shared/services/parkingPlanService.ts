import { apiRequest } from "../api";
import { ApiError } from "../api";
import type { BackendPlanParqueo } from "../models/backend";

const fallbackPlans: BackendPlanParqueo[] = [
  {
    PLA_id_plan_parqueo: 1,
    PLA_nombre: "Entre Semana",
    PLA_precio: 600,
    PLA_descripcion: "Lunes a Viernes",
    PLA_creado_por: "frontend-fallback",
  },
  {
    PLA_id_plan_parqueo: 2,
    PLA_nombre: "Sabado",
    PLA_precio: 600,
    PLA_descripcion: "Solo Sabados",
    PLA_creado_por: "frontend-fallback",
  },
  {
    PLA_id_plan_parqueo: 3,
    PLA_nombre: "Domingo",
    PLA_precio: 600,
    PLA_descripcion: "Solo Domingos",
    PLA_creado_por: "frontend-fallback",
  },
];

export const parkingPlanService = {
  async getAll() {
    try {
      return await apiRequest<BackendPlanParqueo[]>("/api/plan-parqueo");
    } catch (error) {
      if (error instanceof ApiError && error.status === 404) {
        return fallbackPlans;
      }

      throw error;
    }
  },

  async getById(id: number) {
    try {
      return await apiRequest<BackendPlanParqueo>(`/api/plan-parqueo/${id}`);
    } catch (error) {
      if (error instanceof ApiError && error.status === 404) {
        const fallbackPlan = fallbackPlans.find((plan) => plan.PLA_id_plan_parqueo === id);

        if (fallbackPlan) {
          return fallbackPlan;
        }
      }

      throw error;
    }
  },
};
