import { apiRequest } from "../api";
import type { BackendFormaPago } from "../models/backend";

export const paymentMethodService = {
  getAll() {
    return apiRequest<BackendFormaPago[]>("/api/forma_pago");
  },

  getById(id: number) {
    return apiRequest<BackendFormaPago>(`/api/forma_pago/${id}`);
  },
};
