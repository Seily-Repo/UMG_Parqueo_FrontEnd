import { useEffect, useMemo, useRef, useState } from 'react';
import { Elements, PaymentElement, useElements, useStripe } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { Button, Card, Col, Modal, Row, Spinner } from 'react-bootstrap';
import { CreditCard, Trash2 } from 'lucide-react';
import { toast } from 'react-toastify';
import { useRegistration } from '../../context/RegistrationContext';
import { getReadableApiError } from '../../../../../shared/api';
import type { BackendCreatePagoPayload, BackendPago } from '../../../../../shared/models/backend';
import { paymentService } from '../../../../../shared/services';
import { PaymentReceiptCard, type PaymentReceiptData } from '../../components/PaymentReceiptCard';
import { exportReceiptToPdf } from '../../utils/receiptExport';

const stripePublishableKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || '';
const stripePromise = stripePublishableKey ? loadStripe(stripePublishableKey) : Promise.resolve(null);
const loginApiBaseUrl = (import.meta.env.VITE_LOGIN_API_BASE_URL || 'http://10.0.40.10/api').replace(/\/$/, '');
const fallbackPlanIds = {
  'entre-semana': Number(import.meta.env.VITE_PAYMENT_PLAN_WEEKDAY_ID || 1),
  sabado: Number(import.meta.env.VITE_PAYMENT_PLAN_SATURDAY_ID || 2),
  domingo: Number(import.meta.env.VITE_PAYMENT_PLAN_SUNDAY_ID || 3),
} as const;

const directPlanIdByConcept: Record<string, number> = {
  'plan matutino carro': Number(import.meta.env.VITE_PAYMENT_PLAN_MATUTINO_CARRO_ID || import.meta.env.VITE_PAYMENT_PLAN_WEEKDAY_ID || 1),
  'plan matutino moto': Number(import.meta.env.VITE_PAYMENT_PLAN_MATUTINO_MOTO_ID || import.meta.env.VITE_PAYMENT_PLAN_WEEKDAY_ID || 1),
  'plan vespertino carro': Number(import.meta.env.VITE_PAYMENT_PLAN_VESPERTINO_CARRO_ID || import.meta.env.VITE_PAYMENT_PLAN_WEEKDAY_ID || 1),
  'plan vespertino moto': Number(import.meta.env.VITE_PAYMENT_PLAN_VESPERTINO_MOTO_ID || import.meta.env.VITE_PAYMENT_PLAN_WEEKDAY_ID || 1),
  'entre semana': Number(import.meta.env.VITE_PAYMENT_PLAN_WEEKDAY_ID || 1),
  sabado: Number(import.meta.env.VITE_PAYMENT_PLAN_SATURDAY_ID || 2),
  domingo: Number(import.meta.env.VITE_PAYMENT_PLAN_SUNDAY_ID || 3),
};

type PaymentIntentResponse = {
  message: string;
  data: BackendPago;
  clientSecret?: string;
};

type LoginPendingCharge = {
  ID_A_PAGAR?: number | string;
  DESCRIPCION?: string;
  MONTO?: number | string;
  TIPO?: string;
};

function normalizeCarnet(carnet: string) {
  return carnet.replace(/\D/g, '');
}

function normalizeConcept(concept: string) {
  return concept
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[-_]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function getDirectPaymentParams() {
  const params = new URLSearchParams(window.location.search);
  const carne = normalizeCarnet(params.get('carne') || '');
  const amount = Number(params.get('monto') || '');
  const concept = (params.get('concepto') || '').trim();
  const planId = Number(params.get('planId') || params.get('pln_plan') || params.get('plan') || '');
  const token = params.get('token') || '';

  return {
    carne,
    amount: Number.isFinite(amount) && amount > 0 ? amount : 0,
    concept,
    planId: Number.isFinite(planId) && planId > 0 ? planId : 0,
    token,
    enabled: Boolean(carne && amount > 0 && concept),
  };
}

function inferDirectPlanId(directPayment: ReturnType<typeof getDirectPaymentParams>) {
  if (directPayment.planId) {
    return directPayment.planId;
  }

  const normalizedConcept = normalizeConcept(directPayment.concept);
  const mappedPlanId = directPlanIdByConcept[normalizedConcept];

  return Number.isFinite(mappedPlanId) && mappedPlanId > 0 ? mappedPlanId : fallbackPlanIds['entre-semana'];
}

function StripePaymentForm({
  amount,
  clientSecret,
  onPaid,
  onCancel,
}: {
  amount: number;
  clientSecret: string;
  onPaid: () => void;
  onCancel: () => void;
}) {
  const stripe = useStripe();
  const elements = useElements();
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements) {
      toast.error('Stripe aun no termina de cargar');
      return;
    }

    setSubmitting(true);

    const { error, paymentIntent } = await stripe.confirmPayment({
      elements,
      redirect: 'if_required',
    });

    if (error) {
      toast.error(error.message || 'No fue posible confirmar el pago');
      setSubmitting(false);
      return;
    }

    const finalIntent = paymentIntent ?? (await stripe.retrievePaymentIntent(clientSecret)).paymentIntent;

    if (finalIntent?.status === 'succeeded') {
      onPaid();
      toast.success('Pago completado correctamente');
      return;
    }

    toast.info('El pago quedo en proceso. Verifique el estado en unos segundos.');
    setSubmitting(false);
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="parking-payment-summary mb-4">
        <small style={{ opacity: 0.9 }}>Total a pagar</small>
        <div className="display-5 fw-bold">Q{amount.toFixed(2)}</div>
      </div>

      <div style={{ border: '1px solid #dee2e6', borderRadius: 8, padding: 16, backgroundColor: '#ffffff' }}>
        <PaymentElement options={{ layout: 'tabs' }} />
      </div>

      <Row className="g-3 mt-4">
        <Col xs={6}>
          <Button variant="outline-secondary" size="lg" className="w-100" onClick={onCancel} disabled={submitting}>
            Volver
          </Button>
        </Col>
        <Col xs={6}>
          <Button variant="primary" type="submit" size="lg" className="w-100" disabled={!stripe || submitting}>
            {submitting ? <Spinner size="sm" className="me-2" /> : <CreditCard size={16} className="me-2" />}
            {submitting ? 'Procesando...' : `Pagar Q${amount.toFixed(2)}`}
          </Button>
        </Col>
      </Row>
    </form>
  );
}

export function Payment() {
  const { currentRegistration, updateRegistration } = useRegistration();
  const directPayment = useMemo(getDirectPaymentParams, []);
  const directPaymentStarted = useRef(false);
  const [clientSecret, setClientSecret] = useState('');
  const [activePayment, setActivePayment] = useState<BackendPago | null>(null);
  const [loadingStripe, setLoadingStripe] = useState(false);
  const [stripeModalOpen, setStripeModalOpen] = useState(false);
  const [showReceipt, setShowReceipt] = useState(false);
  const [paymentError, setPaymentError] = useState('');
  const [resolvedPlanId, setResolvedPlanId] = useState(0);
  const [resolvingPlanId, setResolvingPlanId] = useState(false);
  const [planLookupDone, setPlanLookupDone] = useState(false);

  const planLabel = directPayment.concept || currentRegistration.parkingPlan || 'ENTRE-SEMANA';
  const vehicleCount = currentRegistration.vehicles?.length || 0;
  const amount = Number(directPayment.amount || currentRegistration.amount || 600);
  const payerCarnet = directPayment.carne || currentRegistration.carnet || '';
  const isPaid = currentRegistration.paymentStatus === 'paid';
  const planId =
    directPayment.enabled
      ? directPayment.planId || resolvedPlanId
      : currentRegistration.selectedPlanId ||
        fallbackPlanIds[(currentRegistration.parkingPlan as keyof typeof fallbackPlanIds) || 'entre-semana'] ||
        1;

  useEffect(() => {
    if (directPayment.token) {
      localStorage.setItem('token', directPayment.token);
    }

    if (!directPayment.enabled) {
      return;
    }

    updateRegistration({
      id: directPayment.carne,
      carnet: directPayment.carne,
      parkingPlan: directPayment.concept,
      selectedPlanId: planId,
      amount,
      paymentStatus: 'pending',
    });
  }, [amount, directPayment, planId, updateRegistration]);

  useEffect(() => {
    if (!directPayment.enabled || directPayment.planId || !payerCarnet || planLookupDone) {
      return;
    }

    let isMounted = true;

    const resolvePlanFromLogin = async () => {
      setResolvingPlanId(true);
      setPaymentError('');

      try {
        const response = await fetch(`${loginApiBaseUrl}/pagos/lista-pendiente/${encodeURIComponent(payerCarnet)}`);

        if (!response.ok) {
          throw new Error(`No se pudo consultar el cargo pendiente (${response.status}).`);
        }

        const charges = await response.json() as LoginPendingCharge[];
        const normalizedConcept = normalizeConcept(directPayment.concept);
        const matchedCharge = charges.find((charge) => {
          return charge.TIPO === 'PLAN' && normalizeConcept(charge.DESCRIPCION || '') === normalizedConcept;
        }) || charges.find((charge) => {
          return charge.TIPO === 'PLAN' && Number(charge.MONTO) === amount;
        });

        const nextPlanId = Number(matchedCharge?.ID_A_PAGAR || 0);

        if (!isMounted) {
          return;
        }

        if (Number.isFinite(nextPlanId) && nextPlanId > 0) {
          setResolvedPlanId(nextPlanId);
        } else {
          setPaymentError('No se pudo identificar el plan pendiente para este cargo.');
        }
      } catch (error) {
        if (isMounted) {
          setPaymentError(getReadableApiError(error, 'No se pudo consultar el plan pendiente del usuario.'));
        }
      } finally {
        if (isMounted) {
          setPlanLookupDone(true);
          setResolvingPlanId(false);
        }
      }
    };

    void resolvePlanFromLogin();

    return () => {
      isMounted = false;
    };
  }, [amount, directPayment, payerCarnet, planLookupDone]);

  const receiptData: PaymentReceiptData = {
    receiptNumber: currentRegistration.paymentReference || activePayment?.STRIPE_PAYMENT_INTENT_ID || `PAG-${Date.now()}`,
    title: 'Recibo de pago de parqueo',
    studentName: currentRegistration.fullName || 'Estudiante',
    carnet: payerCarnet || 'No disponible',
    concept: `Pago de parqueo - ${planLabel}`,
    amount,
    paymentMethod: 'Stripe',
    status: 'Completado',
    issuedAt: currentRegistration.paymentRecordedAt
      ? new Date(currentRegistration.paymentRecordedAt).toLocaleString()
      : new Date().toLocaleString(),
    detailLines: [
      { label: 'Plan seleccionado', value: planLabel },
      { label: 'Vehiculos registrados', value: `${vehicleCount}` },
      { label: 'Referencia', value: currentRegistration.paymentReference || activePayment?.STRIPE_PAYMENT_INTENT_ID || 'No disponible' },
    ],
  };

  const handleStartStripePayment = async () => {
    if (!stripePublishableKey) {
      toast.error('Falta configurar VITE_STRIPE_PUBLISHABLE_KEY.');
      return;
    }

    if (!payerCarnet) {
      toast.error('Debe iniciar sesion antes de pagar.');
      return;
    }

    setStripeModalOpen(true);

    if (!planId) {
      setPaymentError('No se pudo identificar el plan de parqueo para iniciar Stripe.');
      return;
    }

    setLoadingStripe(true);
    setPaymentError('');

    try {
      const payload: BackendCreatePagoPayload = {
        EST_CARNE: payerCarnet,
        LR_CARNE: payerCarnet,
        PLN_PLAN: planId,
        FPG_FORMA_PAGO: Number(import.meta.env.VITE_PAYMENT_FORM_CARD_ID || 1),
        PAG_FECHA_PAGO: new Date().toISOString().slice(0, 10),
        PAG_MONTO_TOTAL: amount,
      };

      const result = await paymentService.create(payload) as PaymentIntentResponse;

      if (!result.clientSecret) {
        throw new Error(result.message || 'No fue posible preparar el pago con Stripe.');
      }

      setActivePayment(result.data);
      setClientSecret(result.clientSecret);
    } catch (error) {
      const message = getReadableApiError(error, 'No se pudo iniciar el pago con Stripe.');
      setPaymentError(message);
      toast.error(message);
    } finally {
      setLoadingStripe(false);
    }
  };

  useEffect(() => {
    if (!directPayment.enabled || directPaymentStarted.current || clientSecret || loadingStripe || resolvingPlanId || !planId) {
      return;
    }

    directPaymentStarted.current = true;
    void handleStartStripePayment();
  }, [clientSecret, directPayment.enabled, loadingStripe, planId, resolvingPlanId]);

  const handlePaymentConfirmed = () => {
    const reference = activePayment?.STRIPE_PAYMENT_INTENT_ID || `STRIPE-${Date.now()}`;
    updateRegistration({
      paymentStatus: 'paid',
      paymentRecordedAt: new Date().toISOString(),
      paymentReference: reference,
    });
    setClientSecret('');
    setStripeModalOpen(false);
    setShowReceipt(true);
  };

  const handleDeletePayment = () => {
    setShowReceipt(false);
    setClientSecret('');
    setActivePayment(null);
    updateRegistration({
      paymentStatus: 'pending',
      paymentRecordedAt: undefined,
      paymentReference: undefined,
    });
  };

  if (showReceipt && isPaid) {
    return (
      <div style={{ maxWidth: 860, margin: '0 auto' }}>
        <PaymentReceiptCard
          data={receiptData}
          onExportPdf={() => exportReceiptToPdf(receiptData)}
          onContinue={() => setShowReceipt(false)}
          continueLabel="Volver a Cobros"
        />
      </div>
    );
  }

  return (
    <div className="parking-payments-page">
      <div className="parking-payments-page__heading">
        <h1>Modulo de Pagos</h1>
        <p>{directPayment.enabled ? planLabel : 'Consulta tu estado de cuenta y realiza los pagos de tus planes de parqueo.'}</p>
      </div>

      {paymentError && <div className="alert alert-danger">{paymentError}</div>}

      <div className="parking-pending-charges">
        <Card className="parking-pending-charges__card">
          <Card.Header>
            <Card.Title>{directPayment.enabled ? 'Cargo Pendiente' : 'Cobros Disponibles'}</Card.Title>
          </Card.Header>
          <Card.Body>
            <div className="parking-charge-table">
              <div className="parking-charge-table__head">
                <span>Concepto del Cargo</span>
                <span>Estado</span>
                <span>Monto</span>
                <span>Accion</span>
              </div>
              <div className="parking-charge-table__row">
                <div>
                  <strong>{planLabel}</strong>
                  <small>{directPayment.enabled ? `Carne ${payerCarnet}` : `${vehicleCount} vehiculo(s) registrado(s) en el portal.`}</small>
                </div>
                <div>
                  <span className={`parking-charge-table__badge ${isPaid ? 'parking-charge-table__badge--paid' : 'parking-charge-table__badge--available'}`}>
                    {isPaid ? 'Completado' : 'Disponible'}
                  </span>
                </div>
                <div className="parking-charge-table__amount">Q.{amount.toFixed(2)}</div>
                <div>
                  {isPaid ? (
                    <div className="d-flex flex-wrap gap-2">
                      <Button variant="outline-primary" className="parking-charge-table__pay" onClick={() => setShowReceipt(true)}>
                        Ver Recibo
                      </Button>
                      <Button variant="outline-danger" className="parking-charge-table__pay" onClick={handleDeletePayment}>
                        <Trash2 size={16} className="me-2" />
                        Eliminar
                      </Button>
                    </div>
                  ) : (
                    <Button variant="primary" className="parking-charge-table__pay" onClick={handleStartStripePayment} disabled={loadingStripe || resolvingPlanId}>
                      {loadingStripe || resolvingPlanId ? <Spinner size="sm" className="me-2" /> : <CreditCard size={16} className="me-2" />}
                      {resolvingPlanId ? 'Preparando...' : loadingStripe ? 'Abriendo Stripe...' : 'Pagar'}
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </Card.Body>
        </Card>
      </div>

      <Modal
        show={stripeModalOpen}
        onHide={() => {
          setStripeModalOpen(false);
          setClientSecret('');
        }}
        centered
        size="lg"
      >
        <Modal.Header closeButton>
          <div>
            <Modal.Title>Pago con Stripe</Modal.Title>
            <div className="text-muted small">{planLabel}</div>
          </div>
        </Modal.Header>
        <Modal.Body>
          {paymentError ? (
            <div className="alert alert-danger mb-0">{paymentError}</div>
          ) : loadingStripe || resolvingPlanId ? (
            <div className="text-center py-5">
              <Spinner animation="border" />
              <p className="text-muted mt-3 mb-0">Preparando Stripe...</p>
            </div>
          ) : clientSecret ? (
            <Elements stripe={stripePromise} options={{ clientSecret }}>
              <StripePaymentForm
                amount={amount}
                clientSecret={clientSecret}
                onPaid={handlePaymentConfirmed}
                onCancel={() => {
                  setStripeModalOpen(false);
                  setClientSecret('');
                }}
              />
            </Elements>
          ) : (
            <div className="text-center py-5">
              <Button variant="primary" onClick={handleStartStripePayment}>
                <CreditCard size={16} className="me-2" />
                Preparar pago
              </Button>
            </div>
          )}
        </Modal.Body>
      </Modal>
    </div>
  );
}
