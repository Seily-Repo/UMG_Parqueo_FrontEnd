import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router';
import { Elements, PaymentElement, useElements, useStripe } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { Alert, Button, Card, Col, Form, Row, Spinner } from 'react-bootstrap';
import { ArrowLeft, CreditCard, DollarSign, Receipt } from 'lucide-react';
import { toast } from 'react-toastify';
import { useRegistration } from '../../context/RegistrationContext';
import { getReadableApiError } from '../../../../../shared/api';
import type { BackendEstudianteMulta } from '../../../../../shared/models/backend';
import { fineService, paymentService } from '../../../../../shared/services';
import { PaymentReceiptCard, type PaymentReceiptData } from '../../components/PaymentReceiptCard';
import { exportReceiptToPdf } from '../../utils/receiptExport';

interface FinePaymentLocationState {
  fineRelation?: BackendEstudianteMulta;
}

type PaymentIntentResponse = {
  message: string;
  data: {
    PAG_PAGO: number;
    PLN_PLAN?: number;
    FPG_FORMA_PAGO: number;
    PAG_FECHA_PAGO: string;
    PAG_MONTO_TOTAL: number;
    PAG_ESTADO?: string;
    STRIPE_PAYMENT_INTENT_ID?: string;
  };
  clientSecret?: string;
};

const stripePublishableKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || '';
const stripePromise = stripePublishableKey ? loadStripe(stripePublishableKey) : Promise.resolve(null);
const cardPaymentMethodId = Number(import.meta.env.VITE_PAYMENT_FORM_CARD_ID || 1);
const dashboardUrl = 'http://10.0.40.10/dashboard';

function normalizeCarnet(carnet: string) {
  return carnet.replace(/\D/g, '');
}

function FineStripeForm({
  amount,
  clientSecret,
  submitting,
  onBack,
  onPaid,
}: {
  amount: number;
  clientSecret: string;
  submitting: boolean;
  onBack: () => void;
  onPaid: () => Promise<void>;
}) {
  const stripe = useStripe();
  const elements = useElements();

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements) {
      toast.error('Stripe aun no termina de cargar');
      return;
    }

    const { error, paymentIntent } = await stripe.confirmPayment({
      elements,
      redirect: 'if_required',
    });

    if (error) {
      toast.error(error.message || 'No fue posible confirmar el pago de la multa');
      return;
    }

    const finalIntent = paymentIntent ?? (await stripe.retrievePaymentIntent(clientSecret)).paymentIntent;

    if (finalIntent?.status === 'succeeded') {
      await onPaid();
      toast.success('Pago de multa realizado correctamente');
      return;
    }

    toast.error('El pago de la multa no fue aprobado');
  };

  return (
    <Form onSubmit={handleSubmit}>
      <div style={{ border: '1px solid #dee2e6', borderRadius: 8, padding: 16, backgroundColor: '#ffffff' }}>
        <PaymentElement options={{ layout: 'tabs' }} />
      </div>

      <Row className="g-3">
        <Col xs={6}>
          <Button
            variant="outline-secondary"
            size="lg"
            className="w-100 d-flex align-items-center justify-content-center"
            onClick={onBack}
            disabled={submitting}
          >
            <ArrowLeft size={16} className="me-2" />
            Atras
          </Button>
        </Col>
        <Col xs={6}>
          <Button variant="primary" type="submit" size="lg" className="w-100" disabled={!stripe || submitting}>
            {submitting ? 'Procesando...' : `Pagar Q${amount}`}
          </Button>
        </Col>
      </Row>
    </Form>
  );
}

export function UserFinePayment() {
  const navigate = useNavigate();
  const location = useLocation();
  const { relationId } = useParams();
  const { currentRegistration, updateRegistration } = useRegistration();
  const locationState = location.state as FinePaymentLocationState | null;

  const carnetFromUrl = useMemo(() => {
    const params = new URLSearchParams(location.search);
    return normalizeCarnet(params.get('carne') || '');
  }, [location.search]);
  const isEmbedded = Boolean(carnetFromUrl);
  const activeCarnet = carnetFromUrl || currentRegistration.carnet || '';

  const [fineRelation, setFineRelation] = useState<BackendEstudianteMulta | null>(locationState?.fineRelation || null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [receiptData, setReceiptData] = useState<PaymentReceiptData | null>(null);
  const [clientSecret, setClientSecret] = useState('');
  const [activePayment, setActivePayment] = useState<PaymentIntentResponse['data'] | null>(null);
  const [formData, setFormData] = useState({
    amount: '',
    paymentMethodId: cardPaymentMethodId,
  });

  useEffect(() => {
    if (carnetFromUrl && carnetFromUrl !== currentRegistration.carnet) {
      updateRegistration({ carnet: carnetFromUrl, id: carnetFromUrl });
    }
  }, [carnetFromUrl, currentRegistration.carnet, updateRegistration]);

  const backToFinesList = () => {
    const search = isEmbedded ? `?carne=${encodeURIComponent(activeCarnet)}` : '';
    navigate(`/parking/user/multas${search}`);
  };

  const finishFlow = () => {
    if (isEmbedded) {
      window.location.href = dashboardUrl;
    } else {
      navigate('/parking/user/multas');
    }
  };

  useEffect(() => {
    if (!relationId || !activeCarnet) {
      return;
    }

    let isMounted = true;

    const loadData = async () => {
      setLoading(true);
      setError('');

      try {
        const fineResponse = fineRelation
          ? await Promise.resolve(fineRelation)
          : await fineService.getStudentFineById(Number(relationId));

        if (!isMounted) {
          return;
        }

        setFineRelation(fineResponse);
        const monto = Number(fineResponse.MUL_MONTO_TOTAL ?? 0);
        setFormData((prev) => ({
          ...prev,
          amount: monto > 0 ? `${monto}` : '',
          paymentMethodId: prev.paymentMethodId || cardPaymentMethodId,
        }));
      } catch (requestError) {
        if (!isMounted) {
          return;
        }
        setError(getReadableApiError(requestError, 'No fue posible cargar la informacion de la multa.'));
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    void loadData();

    return () => {
      isMounted = false;
    };
  }, [activeCarnet, fineRelation, relationId]);

  const fineAmount = Number(fineRelation?.MUL_MONTO_TOTAL ?? formData.amount ?? 0);
  const fineDescription = fineRelation?.MUL_DESCRIPCION || `Multa #${fineRelation?.MUL_MULTA || ''}`;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!fineRelation) {
      toast.error('No se encontro la multa a pagar');
      return;
    }

    if (!fineAmount || fineAmount <= 0) {
      toast.error('La multa no tiene un monto valido configurado');
      return;
    }

    if (!formData.paymentMethodId) {
      toast.error('Seleccione una forma de pago');
      return;
    }

    setSubmitting(true);

    try {
      const paymentResponse = await paymentService.create({
        EST_CARNE: activeCarnet,
        LR_CARNE: activeCarnet,
        FPG_FORMA_PAGO: formData.paymentMethodId,
        EMU_USUARIO_MULTA: Number(fineRelation.EMU_ESTUDIANTE_MULTA),
        PAG_FECHA_PAGO: new Date().toISOString(),
        PAG_MONTO_TOTAL: fineAmount,
      }) as PaymentIntentResponse;

      if (!paymentResponse.clientSecret) {
        throw new Error(paymentResponse.message || 'No fue posible preparar el pago con Stripe.');
      }

      setActivePayment(paymentResponse.data);
      setClientSecret(paymentResponse.clientSecret);
    } catch (requestError) {
      setError(getReadableApiError(requestError, 'No fue posible iniciar el pago de la multa.'));
    } finally {
      setSubmitting(false);
    }
  };

  const handleFinePaid = async () => {
    if (!fineRelation || !activePayment) {
      return;
    }

    setSubmitting(true);

    try {
      const paidAt = new Date().toISOString();

      await paymentService.update(activePayment.PAG_PAGO, {
        ...activePayment,
        EST_CARNE: activeCarnet,
        PAG_ESTADO: 'A',
        PAG_FECHA_PAGO: paidAt,
      } as unknown as Parameters<typeof paymentService.update>[1]);

      await fineService.updateStudentFineStatus(Number(fineRelation.EMU_ESTUDIANTE_MULTA), {
        EMU_ESTADO_MULTA: 'P',
        EMU_MODIFICADO_POR: currentRegistration.fullName || activeCarnet || 'estudiante',
      });

      setReceiptData({
        receiptNumber: `MUL-${activePayment.PAG_PAGO || Date.now()}`,
        title: 'Recibo de pago de multa',
        studentName: currentRegistration.fullName || 'Estudiante',
        carnet: activeCarnet || 'No disponible',
        concept: fineDescription,
        amount: fineAmount,
        paymentMethod: `Tarjeta (${formData.paymentMethodId})`,
        status: 'Pago exitoso',
        issuedAt: new Date(paidAt).toLocaleString(),
        detailLines: [
          { label: 'Relacion estudiante-multa', value: `${fineRelation.EMU_ESTUDIANTE_MULTA}` },
          { label: 'Multa', value: `${fineRelation.MUL_MULTA}` },
          { label: 'Descripcion', value: fineDescription },
        ],
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (!activeCarnet) {
    return <Alert variant="warning">Debe iniciar sesion antes de pagar una multa.</Alert>;
  }

  if (receiptData) {
    return (
      <div style={{ maxWidth: 860, margin: '0 auto', padding: isEmbedded ? 24 : 0 }}>
        <PaymentReceiptCard
          data={receiptData}
          onExportPdf={() => exportReceiptToPdf(receiptData)}
          onContinue={finishFlow}
          continueLabel={isEmbedded ? 'Volver al Dashboard' : 'Volver a Multas'}
        />
      </div>
    );
  }

  const containerStyle: React.CSSProperties = isEmbedded
    ? { minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #f5f7fa 0%, #e4ecf3 100%)', padding: 24 }
    : { maxWidth: 800, margin: '0 auto' };
  const cardStyle: React.CSSProperties = isEmbedded
    ? { maxWidth: 720, width: '100%', boxShadow: '0 12px 40px rgba(0,0,0,0.12)', border: 'none' }
    : {};

  return (
    <div style={containerStyle}>
      <Card className="shadow-sm" style={cardStyle}>
        <Card.Header className="bg-white border-bottom">
          <div className="d-flex align-items-center justify-content-between flex-wrap gap-3">
            <div>
              <Card.Title className="mb-1 h4">Pago de Multa</Card.Title>
              <Card.Subtitle className="text-muted">Complete el formulario para registrar el pago de la multa seleccionada</Card.Subtitle>
            </div>
            <Button variant="outline-secondary" onClick={backToFinesList}>
              <ArrowLeft size={16} className="me-2" />
              Volver
            </Button>
          </div>
        </Card.Header>
        <Card.Body className="p-4">
          {error && <Alert variant="danger">{error}</Alert>}

          {loading ? (
            <div className="text-center py-5">
              <Spinner animation="border" />
              <p className="text-muted mt-3 mb-0">Cargando informacion de la multa...</p>
            </div>
          ) : !fineRelation ? (
            <Alert variant="warning">No se pudo identificar la multa seleccionada.</Alert>
          ) : fineRelation.EMU_ESTADO_MULTA && fineRelation.EMU_ESTADO_MULTA !== 'A' ? (
            <>
              <Alert variant="warning" className="mb-4">
                Esta multa ya no esta activa para pago. Su estado actual es <strong>{fineRelation.EMU_ESTADO_MULTA}</strong>.
              </Alert>
              <Button variant="outline-secondary" onClick={backToFinesList}>
                <ArrowLeft size={16} className="me-2" />
                Volver a Consulta de Multas
              </Button>
            </>
          ) : clientSecret ? (
            <Elements stripe={stripePromise} options={{ clientSecret }}>
              <FineStripeForm
                amount={fineAmount}
                clientSecret={clientSecret}
                submitting={submitting}
                onBack={() => {
                  setClientSecret('');
                  setActivePayment(null);
                }}
                onPaid={handleFinePaid}
              />
            </Elements>
          ) : (
            <Form onSubmit={handleSubmit}>
              <div className="p-4 rounded mb-4 text-white" style={{ background: 'linear-gradient(135deg, #C41230 0%, #0d47a1 100%)' }}>
                <div className="d-flex align-items-center gap-2 mb-3" style={{ opacity: 0.9 }}>
                  <Receipt size={16} />
                  <small>Resumen de Multa</small>
                </div>
                <Row>
                  <Col>
                    <div>
                      <small style={{ opacity: 0.9 }}>Carne</small>
                      <div className="fw-medium">{fineRelation.EST_CARNE || activeCarnet || 'No disponible'}</div>
                      <small style={{ opacity: 0.9 }} className="mt-2 d-block">
                        {fineDescription}
                      </small>
                    </div>
                  </Col>
                  <Col xs="auto" className="text-end">
                    <small style={{ opacity: 0.9 }}>Estado actual</small>
                    <div className="fw-bold">{fineRelation.EMU_ESTADO_MULTA === 'A' ? 'Activa' : fineRelation.EMU_ESTADO_MULTA}</div>
                    <small style={{ opacity: 0.75 }}>{fineRelation.EMU_FECHA_CREACION || 'Fecha no disponible'}</small>
                  </Col>
                </Row>
              </div>

              <Row className="mb-3">
                <Col md={6}>
                  <Form.Group>
                    <Form.Label>Monto a Pagar *</Form.Label>
                    <div className="position-relative">
                      <Form.Control
                        type="number"
                        value={fineAmount || ''}
                        readOnly
                      />
                      <DollarSign
                        size={20}
                        style={{
                          position: 'absolute',
                          right: 12,
                          top: '50%',
                          transform: 'translateY(-50%)',
                          color: '#6c757d',
                        }}
                      />
                    </div>
                    <Form.Text className="text-muted">
                      El monto se toma automaticamente del catalogo de multas.
                    </Form.Text>
                  </Form.Group>
                </Col>

                <Col md={6}>
                  <Form.Group>
                    <Form.Label>Forma de Pago *</Form.Label>
                    <Form.Control value={`Tarjeta (${formData.paymentMethodId})`} readOnly />
                  </Form.Group>
                </Col>
              </Row>

              <Alert variant="warning" className="mb-4">
                <small>
                  <strong>Nota:</strong> al confirmar el pago se generara un recibo listo para exportar como PDF.
                </small>
              </Alert>

              <Row className="g-3">
                <Col xs={6}>
                  <Button
                    variant="outline-secondary"
                    size="lg"
                    className="w-100 d-flex align-items-center justify-content-center"
                    onClick={() => navigate('/parking/user/multas')}
                  >
                    <ArrowLeft size={16} className="me-2" />
                    Atras
                  </Button>
                </Col>
                <Col xs={6}>
                  <Button variant="primary" type="submit" size="lg" className="w-100" disabled={submitting || !fineAmount || fineAmount <= 0}>
                    {submitting ? 'Procesando...' : !fineAmount ? 'Monto no disponible' : 'Pagar Multa'}
                  </Button>
                </Col>
              </Row>
            </Form>
          )}
        </Card.Body>
      </Card>
    </div>
  );
}
