import { apiRequest } from "../api";
import type { BackendCreatePagoPayload, BackendPago, BackendPagoCreationResponse } from "../models/backend";

export const paymentService = {
  getAll() {
    return apiRequest<BackendPago[]>("/api/pago");
  },

  getById(id: number) {
    return apiRequest<BackendPago>(`/api/pago/${id}`);
  },

  create(payload: BackendCreatePagoPayload) {
    return apiRequest<BackendPagoCreationResponse>("/api/pago", {
      method: "POST",
      body: payload,
    });
  },

  update(id: number, payload: BackendPago) {
    return apiRequest<BackendPago>(`/api/pago/${id}`, {
      method: "PUT",
      body: payload,
    });
  },

  remove(id: number) {
    return apiRequest<void>(`/api/pago/${id}`, {
      method: "DELETE",
    });
  },
};
