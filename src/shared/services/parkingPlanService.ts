import { apiRequest } from "../api";
import { ApiError } from "../api";
import type { BackendPlanParqueo } from "../models/backend";

type BackendPlanCobros = BackendPlanParqueo & {
  PLN_PLAN?: number;
  PLN_NOMBRE_PLAN?: string;
  PLN_PRECIO?: number;
  PLN_DESCRIPCION?: string;
  PLN_ESTADO_REGISTRO?: string;
};

function normalizePlan(plan: BackendPlanCobros): BackendPlanParqueo {
  return {
    ...plan,
    PLA_id_plan_parqueo: plan.PLA_id_plan_parqueo || plan.PLN_PLAN || 0,
    PLA_nombre: plan.PLA_nombre || plan.PLN_NOMBRE_PLAN || "",
    PLA_precio: Number(plan.PLA_precio ?? plan.PLN_PRECIO ?? 0),
    PLA_descripcion: plan.PLA_descripcion || plan.PLN_DESCRIPCION,
    PLA_creado_por: plan.PLA_creado_por || "backend-cobros",
  };
}

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
      const plans = await apiRequest<BackendPlanCobros[]>("/api/plan_parqueo");
      return plans.map(normalizePlan);
    } catch (error) {
      if (error instanceof ApiError && error.status === 404) {
        return fallbackPlans;
      }

      throw error;
    }
  },

  async getById(id: number) {
    try {
      const plan = await apiRequest<BackendPlanCobros>(`/api/plan_parqueo/${id}`);
      return normalizePlan(plan);
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
