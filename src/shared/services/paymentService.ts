import { apiRequest, ApiError } from "../api";
import type { BackendCreatePagoPayload, BackendPago, BackendPagoCreationResponse } from "../models/backend";

type BackendPagoCobros = BackendPago & {
  LR_CARNE?: string;
  EMU_USUARIO_MULTA?: number | null;
};

function normalizePago(pago: BackendPagoCobros): BackendPago {
  return {
    ...pago,
    EST_CARNE: pago.EST_CARNE || pago.LR_CARNE || "",
    MUL_MULTA: pago.MUL_MULTA ?? pago.EMU_USUARIO_MULTA ?? null,
  };
}

function normalizeCarneForPayments(carne: string) {
  return carne.replace(/\D/g, "");
}

export const paymentService = {
  async getAll() {
    const pagos = await apiRequest<BackendPagoCobros[]>("/api/pago");
    return pagos.map(normalizePago);
  },

  async getByCarne(carne: string) {
    try {
      const pagos = await apiRequest<BackendPagoCobros[]>(
        `/api/pago/carne/${encodeURIComponent(normalizeCarneForPayments(carne))}`
      );
      return pagos.map(normalizePago);
    } catch (error) {
      if (error instanceof ApiError && error.status === 404) {
        return [];
      }

      throw error;
    }
  },

  async getNextPaymentId(start = 1) {
    try {
      const pagos = await this.getAll();
      const maxPaymentId = pagos.reduce((max, pago) => {
        const currentId = Number(pago.PAG_PAGO);
        return Number.isFinite(currentId) ? Math.max(max, currentId) : max;
      }, start - 1);

      return Math.max(start, maxPaymentId + 1);
    } catch {
      return start;
    }
  },

  async getById(id: number) {
    const pago = await apiRequest<BackendPagoCobros>(`/api/pago/${id}`);
    return normalizePago(pago);
  },

  create(payload: BackendCreatePagoPayload) {
    const normalizedCarne = normalizeCarneForPayments(payload.EST_CARNE || payload.LR_CARNE || "");

    return apiRequest<BackendPagoCreationResponse>("/api/pago", {
      method: "POST",
      body: {
        ...payload,
        EST_CARNE: normalizedCarne || payload.EST_CARNE,
        LR_CARNE: normalizedCarne || payload.LR_CARNE,
      },
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
