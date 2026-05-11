export interface BackendPlanParqueo {
  PLA_id_plan_parqueo: number;
  PLA_nombre: string;
  PLA_precio: number;
  PLA_descripcion?: string;
  PLA_creado_por: string;
  PLA_fecha_creacion?: string;
}

export interface BackendEstudiante {
  EST_CARNE: string;
  EST_NOMBRE_COMPLETO: string;
  EST_EMAIL: string;
  EST_FECHA_CREACION: string;
}

export interface BackendEstudianteMoroso {
  MOR_BLACKLIST_LOG?: number;
  EST_CARNE: string;
  MOR_FECHA_AGREGADO?: string;
  MOR_MOTIVO: string;
  MOR_ESTADO: "A" | "I" | "S";
}

export interface BackendFormaPago {
  FPG_FORMA_PAGO: number;
  FPG_NOMBRE_FORMA: string;
  FPG_ESTADO: string;
}

export interface BackendPago {
  PAG_PAGO: number;
  EST_CARNE: string;
  PLN_PLAN: number;
  FPG_FORMA_PAGO: number;
  MUL_MULTA?: number | null;
  PAG_FECHA_PAGO: string;
  PAG_MONTO_TOTAL: number;
  PAG_ESTADO?: string;
  PAG_FECHA_CREACION?: string;
  STRIPE_PAYMENT_INTENT_ID?: string;
}

export interface BackendCreatePagoPayload {
  PAG_PAGO?: number;
  EST_CARNE?: string;
  LR_CARNE?: string;
  PLN_PLAN: number;
  FPG_FORMA_PAGO: number;
  MUL_MULTA?: number | null;
  EMU_USUARIO_MULTA?: number | null;
  PAG_FECHA_PAGO: string;
  PAG_MONTO_TOTAL: number;
}

export interface BackendPagoCreationResponse {
  message: string;
  data: BackendPago;
  clientSecret?: string;
}

export interface BackendMulta {
  MUL_MULTA?: number;
  MUL_id_multa?: number;
  MUL_MONTO_TOTAL?: number;
  MUL_monto_total?: number;
  MUL_DESCRIPCION?: string;
  MUL_descripcion?: string;
  MUL_DIAS_VENCIMIENTO?: number;
  MUL_dias_vencimiento?: number;
  MUL_CREADO_POR?: string;
  MUL_creado_por?: string;
  MUL_FECHA_CREACION?: string;
  MUL_fecha_creacion?: string;
  MUL_MODIFICADO_POR?: string;
  MUL_modificado_por?: string;
  MUL_FECHA_MODIFICACION?: string;
  MUL_fecha_modificacion?: string;
  MUL_ESTADO_REGISTRO?: string;
}

export interface BackendCreateMultaPayload {
  MUL_DESCRIPCION: string;
  MUL_MONTO_TOTAL: number;
  MUL_DIAS_VENCIMIENTO: number;
  MUL_CREADO_POR?: string;
}

export interface BackendUpdateMultaPayload {
  MUL_DESCRIPCION?: string;
  MUL_MONTO_TOTAL?: number;
  MUL_DIAS_VENCIMIENTO?: number;
  MUL_MODIFICADO_POR?: string;
  MUL_ESTADO_REGISTRO?: string;
}

export interface BackendEstudianteMulta {
  EMU_ESTUDIANTE_MULTA: number;
  EMU_USUARIO_MULTA?: number;
  MUL_MULTA: number;
  EST_CARNE?: string;
  LR_CARNE?: string;
  VEH_ID_VEHICULO?: number | string;
  VEH_PLACA?: string;
  EMU_ESTADO_MULTA?: string;
  EMU_CREADO_POR: string;
  EMU_FECHA_CREACION?: string;
  EMU_MODIFICADO_POR?: string;
  EMU_FECHA_MODIFICACION?: string;
}

export interface BackendCreateEstudianteMultaPayload {
  MUL_MULTA: number;
  VEH_ID_VEHICULO?: number | string;
  VEH_PLACA?: string;
  EMU_ESTADO_MULTA: "A" | "P" | "C";
  EMU_CREADO_POR?: string;
}
