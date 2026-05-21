import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { Elements, PaymentElement, useElements, useStripe } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { Button, Card, Col, Row, Spinner } from 'react-bootstrap';
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
const fallbackPlanIds = {
  'entre-semana': Number(import.meta.env.VITE_PAYMENT_PLAN_WEEKDAY_ID || 1),
  sabado: Number(import.meta.env.VITE_PAYMENT_PLAN_SATURDAY_ID || 2),
  domingo: Number(import.meta.env.VITE_PAYMENT_PLAN_SUNDAY_ID || 3),
} as const;

type PaymentIntentResponse = {
  message: string;
  data: BackendPago;
  clientSecret?: string;
};

function normalizeCarnet(carnet: string) {
  return carnet.replace(/\D/g, '');
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

function getPlanIdError(directPayment: ReturnType<typeof getDirectPaymentParams>) {
  if (!directPayment.enabled || directPayment.planId) {
    return '';
  }

  return 'Falta enviar el planId del plan de parqueo para iniciar Stripe.';
}

function StripeShell({ amount, children }: { amount: number; children: ReactNode }) {
  return (
    <div className="parking-payment-flow">
      <Card className="parking-payment-card">
        <Card.Header>
          <Card.Title className="mb-1 h4">Informacion de Pago</Card.Title>
          <Card.Subtitle>Complete su pago seguro con Stripe</Card.Subtitle>
        </Card.Header>
        <Card.Body>
          <div className="parking-payment-summary">
            <small style={{ opacity: 0.9 }}>Total a pagar</small>
            <div className="display-5 fw-bold">Q{amount.toFixed(2)}</div>
          </div>
          {children}
        </Card.Body>
      </Card>
    </div>
  );
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
    <StripeShell amount={amount}>
      <form onSubmit={handleSubmit}>
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
    </StripeShell>
  );
}

export function Payment() {
  const { currentRegistration, updateRegistration } = useRegistration();
  const directPayment = useMemo(getDirectPaymentParams, []);
  const directPaymentStarted = useRef(false);
  const [clientSecret, setClientSecret] = useState('');
  const [activePayment, setActivePayment] = useState<BackendPago | null>(null);
  const [loadingStripe, setLoadingStripe] = useState(false);
  const [showReceipt, setShowReceipt] = useState(false);
  const [paymentError, setPaymentError] = useState('');

  const planLabel = directPayment.concept || currentRegistration.parkingPlan || 'ENTRE-SEMANA';
  const vehicleCount = currentRegistration.vehicles?.length || 0;
  const amount = Number(directPayment.amount || currentRegistration.amount || 600);
  const payerCarnet = directPayment.carne || currentRegistration.carnet || '';
  const isPaid = currentRegistration.paymentStatus === 'paid';
  const planId =
    directPayment.planId ||
    currentRegistration.selectedPlanId ||
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

    const planError = getPlanIdError(directPayment);
    if (planError) {
      setPaymentError(planError);
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
    if (!directPayment.enabled || directPaymentStarted.current || clientSecret || loadingStripe) {
      return;
    }

    directPaymentStarted.current = true;
    void handleStartStripePayment();
  }, [clientSecret, directPayment.enabled, loadingStripe]);

  const handlePaymentConfirmed = () => {
    const reference = activePayment?.STRIPE_PAYMENT_INTENT_ID || `STRIPE-${Date.now()}`;
    updateRegistration({
      paymentStatus: 'paid',
      paymentRecordedAt: new Date().toISOString(),
      paymentReference: reference,
    });
    setClientSecret('');
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

  if (clientSecret) {
    return (
      <Elements stripe={stripePromise} options={{ clientSecret }}>
        <StripePaymentForm
          amount={amount}
          clientSecret={clientSecret}
          onPaid={handlePaymentConfirmed}
          onCancel={() => setClientSecret('')}
        />
      </Elements>
    );
  }

  if (directPayment.enabled) {
    return (
      <div className="parking-payments-page">
        <div className="parking-payments-page__heading">
          <h1>Modulo de Pagos</h1>
          <p>{planLabel}</p>
        </div>

        {paymentError ? (
          <div className="alert alert-danger">{paymentError}</div>
        ) : (
          <div className="text-center py-5">
            <Spinner animation="border" />
            <p className="text-muted mt-3 mb-0">Abriendo Stripe...</p>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="parking-payments-page">
      <div className="parking-payments-page__heading">
        <h1>Modulo de Pagos</h1>
        <p>Consulta tu estado de cuenta y realiza los pagos de tus planes de parqueo.</p>
      </div>

      <div className="parking-pending-charges">
        <Card className="parking-pending-charges__card">
          <Card.Header>
            <Card.Title>Cobros Disponibles</Card.Title>
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
                  <small>{vehicleCount} vehiculo(s) registrado(s) en el portal.</small>
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
                    <Button variant="primary" className="parking-charge-table__pay" onClick={handleStartStripePayment} disabled={loadingStripe}>
                      {loadingStripe ? <Spinner size="sm" className="me-2" /> : <CreditCard size={16} className="me-2" />}
                      {loadingStripe ? 'Abriendo Stripe...' : 'Pagar'}
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </Card.Body>
        </Card>
      </div>
    </div>
  );
}
