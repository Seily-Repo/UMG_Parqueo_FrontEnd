import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { useNavigate } from 'react-router';
import { Elements, PaymentElement, useElements, useStripe } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { Card, Form, Button, Row, Col, Alert, Spinner } from 'react-bootstrap';
import { CreditCard, ArrowLeft, DollarSign, CheckCircle } from 'lucide-react';
import { toast } from 'react-toastify';
import { useRegistration } from '../../context/RegistrationContext';
import { getReadableApiError } from '../../../../../shared/api';
import type { BackendCreatePagoPayload, BackendPago, BackendPlanParqueo } from '../../../../../shared/models/backend';
import { parkingPlanService, paymentService } from '../../../../../shared/services';
import { PaymentReceiptCard, type PaymentReceiptData } from '../../components/PaymentReceiptCard';
import { exportReceiptToPdf } from '../../utils/receiptExport';

const stripePublishableKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || '';
const stripePromise = stripePublishableKey ? loadStripe(stripePublishableKey) : Promise.resolve(null);
const paymentIdStart = Number(import.meta.env.VITE_PAYMENT_ID_START || 6);
const paymentFormCardId = Number(import.meta.env.VITE_PAYMENT_FORM_CARD_ID || 1);
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

const fixedAmount = 600;

type PaymentFormState = {
  paymentId: number;
  carnet: string;
  paymentDate: string;
};

function FormLayout({ amount, children }: { amount: number; children: ReactNode }) {
  const { currentRegistration } = useRegistration();

  return (
    <div style={{ maxWidth: 700, margin: '0 auto' }}>
      <Card className="shadow-sm">
        <Card.Header className="bg-white border-bottom">
          <Card.Title className="mb-1 h4">Informacion de Pago</Card.Title>
          <Card.Subtitle className="text-muted">Complete su pago seguro con Stripe</Card.Subtitle>
        </Card.Header>
        <Card.Body className="p-4">
          <div className="p-4 rounded mb-4 text-white" style={{ background: 'linear-gradient(135deg, #0d47a1 0%, #C41230 100%)' }}>
            <div className="d-flex align-items-center gap-2 mb-3" style={{ opacity: 0.9 }}>
              <DollarSign size={16} />
              <small>Resumen de Pago</small>
            </div>
            <Row>
              <Col>
                <div>
                  <small style={{ opacity: 0.9 }}>Plan seleccionado</small>
                  <div className="fw-medium">{currentRegistration.parkingPlan || 'Plan no seleccionado'}</div>
                  <small style={{ opacity: 0.9 }} className="mt-2 d-block">
                    {currentRegistration.vehicles?.length || 0} vehiculo(s) registrado(s)
                  </small>
                </div>
              </Col>
              <Col xs="auto" className="text-end">
                <small style={{ opacity: 0.9 }}>Total a pagar</small>
                <div className="display-5 fw-bold">Q{amount}</div>
                <small style={{ opacity: 0.75 }}>Pago mensual</small>
              </Col>
            </Row>
          </div>

          <div className="d-flex align-items-center gap-3 mb-4 p-3 rounded" style={{ backgroundColor: '#f8f9fa', border: '1px solid #dee2e6' }}>
            <CreditCard size={20} color="#0d47a1" />
            <div>
              <div className="fw-medium">Pago con tarjeta</div>
              <small className="text-muted">Stripe se encarga de capturar y tokenizar los datos bancarios.</small>
            </div>
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
}: {
  amount: number;
  clientSecret: string;
  onPaid: () => void;
}) {
  const navigate = useNavigate();
  const stripe = useStripe();
  const elements = useElements();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      toast.error('Stripe aun no termina de cargar');
      return;
    }

    setIsSubmitting(true);

    const { error, paymentIntent } = await stripe.confirmPayment({
      elements,
      redirect: 'if_required',
    });

    if (error) {
      toast.error(error.message || 'No fue posible confirmar el pago');
      setIsSubmitting(false);
      return;
    }

    const finalIntent = paymentIntent ?? (await stripe.retrievePaymentIntent(clientSecret)).paymentIntent;

    if (finalIntent?.status === 'succeeded') {
      toast.success('Pago realizado correctamente');
      onPaid();
      return;
    }

    if (finalIntent?.status === 'processing') {
      toast.info('El pago esta en proceso. Confirma el estado final en unos segundos.');
    } else {
      toast.error('El pago no fue aprobado');
    }

    setIsSubmitting(false);
  };

  return (
    <FormLayout amount={amount}>
      <form onSubmit={handleSubmit}>
        <div style={{ border: '1px solid #dee2e6', borderRadius: 8, padding: 16, backgroundColor: '#ffffff' }}>
          <PaymentElement options={{ layout: 'tabs' }} />
        </div>

        <Alert variant="warning" className="mt-4 mb-4">
          <small>
            <strong>Nota:</strong> Este flujo usa Stripe en modo de prueba. Puedes usar tarjetas de testing de Stripe.
          </small>
        </Alert>

        <Row className="g-3">
          <Col xs={6}>
            <Button variant="outline-secondary" size="lg" className="w-100" onClick={() => navigate('/parking/user/vehiculos')} disabled={isSubmitting}>
              <ArrowLeft size={16} className="me-2" />
              Atras
            </Button>
          </Col>
          <Col xs={6}>
            <Button variant="primary" type="submit" size="lg" className="w-100" disabled={!stripe || isSubmitting}>
              {isSubmitting ? <Spinner size="sm" className="me-2" /> : null}
              {isSubmitting ? 'Procesando...' : `Pagar Q${amount}`}
            </Button>
          </Col>
        </Row>
      </form>
    </FormLayout>
  );
}

export function Payment() {
  const navigate = useNavigate();
  const { currentRegistration, updateRegistration } = useRegistration();
  const [selectedPlan, setSelectedPlan] = useState<BackendPlanParqueo | null>(null);
  const [loadingPlan, setLoadingPlan] = useState(false);
  const [planError, setPlanError] = useState('');
  const [clientSecret, setClientSecret] = useState('');
  const [loadError, setLoadError] = useState('');
  const [isLoadingIntent, setIsLoadingIntent] = useState(false);
  const [isLoadingNextId, setIsLoadingNextId] = useState(false);
  const [paymentReference, setPaymentReference] = useState('');
  const [paymentData, setPaymentData] = useState<PaymentFormState>({
    paymentId: paymentIdStart,
    carnet: currentRegistration.carnet || '',
    paymentDate: new Date().toISOString().slice(0, 10),
  });

  useEffect(() => {
    if (!currentRegistration.selectedPlanId) {
      return;
    }

    let isMounted = true;

    const loadPlan = async () => {
      setLoadingPlan(true);
      setPlanError('');

      try {
        const plan = await parkingPlanService.getById(currentRegistration.selectedPlanId);

        if (!isMounted) return;

        setSelectedPlan(plan);
        updateRegistration({
          parkingPlan: plan.PLA_nombre,
          amount: fixedAmount,
        });
      } catch (requestError) {
        if (!isMounted) return;
        setPlanError(getReadableApiError(requestError, 'No fue posible cargar el plan seleccionado.'));
      } finally {
        if (isMounted) setLoadingPlan(false);
      }
    };

    void loadPlan();

    return () => {
      isMounted = false;
    };
  }, [currentRegistration.selectedPlanId, updateRegistration]);

  useEffect(() => {
    setPaymentData((prev) => ({
      ...prev,
      carnet: prev.carnet || currentRegistration.carnet || '',
    }));
  }, [currentRegistration.carnet]);

  useEffect(() => {
    if (clientSecret) {
      return;
    }

    let isMounted = true;

    const loadNextId = async () => {
      setIsLoadingNextId(true);

      try {
        const pagos = await paymentService.getAll();
        if (!isMounted) return;

        const maxPaymentId = pagos.reduce((max, pago) => {
          const currentId = Number(pago.PAG_PAGO);
          return Number.isFinite(currentId) ? Math.max(max, currentId) : max;
        }, paymentIdStart - 1);

        setPaymentData((prev) => ({
          ...prev,
          paymentId: Math.max(paymentIdStart, maxPaymentId + 1),
        }));
      } catch {
        if (!isMounted) return;
        setPaymentData((prev) => ({ ...prev, paymentId: paymentIdStart }));
      } finally {
        if (isMounted) setIsLoadingNextId(false);
      }
    };

    void loadNextId();

    return () => {
      isMounted = false;
    };
  }, [clientSecret]);

  const amount = fixedAmount;
  const planLabel = selectedPlan?.PLA_nombre || currentRegistration.parkingPlan || 'Plan no seleccionado';
  const planDescription = selectedPlan?.PLA_descripcion || 'Plan cargado desde el sistema';

  const receiptData = useMemo<PaymentReceiptData | null>(() => {
    if (currentRegistration.paymentStatus !== 'paid') {
      return null;
    }

    const issuedAt = currentRegistration.paymentRecordedAt
      ? new Date(currentRegistration.paymentRecordedAt).toLocaleString()
      : new Date().toLocaleString();

    return {
      receiptNumber: currentRegistration.paymentReference || `PRQ-${Date.now()}`,
      title: 'Recibo de pago de parqueo',
      studentName: currentRegistration.fullName || 'Estudiante',
      carnet: currentRegistration.carnet || 'No disponible',
      concept: `Pago de parqueo - ${planLabel}`,
      amount,
      paymentMethod: 'Pago con Stripe',
      status: 'Pagado',
      issuedAt,
      detailLines: [
        { label: 'Plan seleccionado', value: planLabel },
        { label: 'Descripcion', value: planDescription },
        { label: 'Vehiculos registrados', value: `${currentRegistration.vehicles?.length || 0}` },
        { label: 'Payment Intent', value: paymentReference || 'No disponible' },
      ],
    };
  }, [
    amount,
    currentRegistration.carnet,
    currentRegistration.fullName,
    currentRegistration.paymentRecordedAt,
    currentRegistration.paymentReference,
    currentRegistration.paymentStatus,
    currentRegistration.vehicles,
    paymentReference,
    planDescription,
    planLabel,
  ]);

  const missingRequirements = useMemo(() => {
    if (!stripePublishableKey) {
      return 'Falta VITE_STRIPE_PUBLISHABLE_KEY en el entorno del front.';
    }

    if (!currentRegistration.selectedPlanId && !currentRegistration.parkingPlan) {
      return 'Debe seleccionar un plan de parqueo antes de continuar al pago.';
    }

    if (currentRegistration.isDelinquent) {
      return currentRegistration.delinquentReason || 'El estudiante presenta una restriccion activa por morosidad.';
    }

    return '';
  }, [
    currentRegistration.delinquentReason,
    currentRegistration.isDelinquent,
    currentRegistration.parkingPlan,
    currentRegistration.selectedPlanId,
  ]);

  const handleCreateIntent = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!paymentData.carnet || !paymentData.paymentDate) {
      const message = 'Completa el carnet y la fecha antes de continuar.';
      setLoadError(message);
      toast.error(message);
      return;
    }

    setLoadError('');
    setIsLoadingIntent(true);

    try {
      const payload: BackendCreatePagoPayload = {
        PAG_PAGO: paymentData.paymentId,
        EST_CARNE: paymentData.carnet,
        PLN_PLAN: currentRegistration.selectedPlanId || fallbackPlanIds[(currentRegistration.parkingPlan as keyof typeof fallbackPlanIds) || 'entre-semana'],
        FPG_FORMA_PAGO: paymentFormCardId,
        PAG_FECHA_PAGO: paymentData.paymentDate,
        PAG_MONTO_TOTAL: amount,
      };

      const result = await paymentService.create(payload) as PaymentIntentResponse;

      if (!result.clientSecret) {
        throw new Error(result.message || 'No se recibio clientSecret desde el backend.');
      }

      setPaymentReference(result.data?.STRIPE_PAYMENT_INTENT_ID || '');
      setClientSecret(result.clientSecret);
      setPaymentData((prev) => ({ ...prev, paymentId: prev.paymentId + 1 }));
    } catch (error) {
      const message = getReadableApiError(error, 'No se pudo iniciar el pago con Stripe.');
      setLoadError(message);
      toast.error(message);
    } finally {
      setIsLoadingIntent(false);
    }
  };

  const handlePaymentConfirmed = () => {
    const paymentRecordedAt = new Date().toISOString();
    const paymentReferenceValue = paymentReference || `PRQ-${Date.now()}`;

    updateRegistration({
      amount,
      carnet: paymentData.carnet,
      paymentStatus: 'paid',
      paymentRecordedAt,
      paymentReference: paymentReferenceValue,
      cardHolder: '',
      cardNumber: '',
      expiryDate: '',
      cvv: '',
    });
  };

  if (missingRequirements) {
    return (
      <div style={{ maxWidth: 700, margin: '0 auto' }}>
        <Alert variant={currentRegistration.isDelinquent ? 'danger' : 'warning'} className="mb-4">
          {currentRegistration.isDelinquent ? <strong>No puede realizar el pago.</strong> : null} {missingRequirements}
        </Alert>
        <Button variant="outline-primary" onClick={() => navigate('/parking/user')}>
          Volver
        </Button>
      </div>
    );
  }

  if (receiptData) {
    return (
      <div style={{ maxWidth: 860, margin: '0 auto' }}>
        <PaymentReceiptCard
          data={receiptData}
          onExportPdf={() => exportReceiptToPdf(receiptData)}
          onContinue={() => navigate('/parking/user/firma')}
          continueLabel="Continuar a Firma"
        />
      </div>
    );
  }

  if (clientSecret) {
    return (
      <Elements stripe={stripePromise} options={{ clientSecret }}>
        <StripePaymentForm amount={amount} clientSecret={clientSecret} onPaid={handlePaymentConfirmed} />
      </Elements>
    );
  }

  return (
    <FormLayout amount={amount}>
      {planError && <Alert variant="danger" className="mb-4">{planError}</Alert>}

      {loadError && <Alert variant="danger" className="mb-4">{loadError}</Alert>}

      {(loadingPlan || isLoadingIntent) && (
        <div className="text-center py-4">
          <Spinner animation="border" />
          <p className="text-muted mt-3 mb-0">
            {loadingPlan ? 'Cargando informacion del plan...' : 'Preparando el formulario de pago seguro...'}
          </p>
        </div>
      )}

      <Form onSubmit={handleCreateIntent}>
        <Row className="g-3 mb-4">
          <Col md={4}>
            <Form.Group>
              <Form.Label>ID de Pago</Form.Label>
              <Form.Control type="number" value={paymentData.paymentId} readOnly />
              <Form.Text className="text-muted">
                {isLoadingNextId ? 'Consultando siguiente correlativo...' : 'Se propone automaticamente el siguiente ID disponible.'}
              </Form.Text>
            </Form.Group>
          </Col>
          <Col md={8}>
            <Form.Group>
              <Form.Label>Carnet</Form.Label>
              <Form.Control
                type="text"
                value={paymentData.carnet}
                onChange={(e) => setPaymentData((prev) => ({ ...prev, carnet: e.target.value }))}
                placeholder="5190-23-10007"
              />
            </Form.Group>
          </Col>
          <Col md={6}>
            <Form.Group>
              <Form.Label>Fecha de Pago</Form.Label>
              <Form.Control
                type="date"
                value={paymentData.paymentDate}
                onChange={(e) => setPaymentData((prev) => ({ ...prev, paymentDate: e.target.value }))}
              />
            </Form.Group>
          </Col>
          <Col md={6}>
            <Form.Group>
              <Form.Label>Monto</Form.Label>
              <Form.Control type="text" value={`Q${amount}`} readOnly />
            </Form.Group>
          </Col>
        </Row>

        <Alert variant="info" className="mb-4">
          El sistema usara monto fijo de Q600 y dejara el siguiente ID listo automaticamente despues de crear el pago.
        </Alert>

        <Row className="g-3">
          <Col xs={6}>
            <Button variant="outline-secondary" size="lg" className="w-100 d-flex align-items-center justify-content-center" onClick={() => navigate('/parking/user')}>
              <ArrowLeft size={16} className="me-2" />
              Atras
            </Button>
          </Col>
          <Col xs={6}>
            <Button variant="primary" type="submit" size="lg" className="w-100" disabled={loadingPlan || !!planError || isLoadingIntent || isLoadingNextId}>
              Crear Pago
            </Button>
          </Col>
        </Row>
      </Form>
    </FormLayout>
  );
}
