import { apiRequest } from "../api";
import type { BackendFormaPago } from "../models/backend";

type BackendFormaPagoCobros = BackendFormaPago & {
  FPG_ESTADO_REGISTRO?: string;
};

function normalizePaymentMethod(method: BackendFormaPagoCobros): BackendFormaPago {
  return {
    ...method,
    FPG_ESTADO: method.FPG_ESTADO || method.FPG_ESTADO_REGISTRO || "",
  };
}

export const paymentMethodService = {
  async getAll() {
    const methods = await apiRequest<BackendFormaPagoCobros[]>("/api/forma_pago");
    return methods.map(normalizePaymentMethod);
  },

  async getById(id: number) {
    const method = await apiRequest<BackendFormaPagoCobros>(`/api/forma_pago/${id}`);
    return normalizePaymentMethod(method);
  },
};
