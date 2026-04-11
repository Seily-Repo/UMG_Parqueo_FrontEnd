import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router';
import { useRegistration } from '../../context/RegistrationContext';
import { Card, Form, Button, Row, Col, Alert, Spinner } from 'react-bootstrap';
import { CreditCard, ArrowLeft, DollarSign } from 'lucide-react';
import { toast } from 'react-toastify';
import { getReadableApiError } from '../../../../../shared/api';
import type { BackendPlanParqueo } from '../../../../../shared/models/backend';
import { parkingPlanService } from '../../../../../shared/services';
import { PaymentReceiptCard, type PaymentReceiptData } from '../../components/PaymentReceiptCard';
import { exportReceiptToPdf } from '../../utils/receiptExport';

export function Payment() {
  const navigate = useNavigate();
  const { currentRegistration, updateRegistration } = useRegistration();
  const [selectedPlan, setSelectedPlan] = useState<BackendPlanParqueo | null>(null);
  const [loadingPlan, setLoadingPlan] = useState(false);
  const [planError, setPlanError] = useState('');
  const [formData, setFormData] = useState({
    cardHolder: currentRegistration.cardHolder || '',
    cardNumber: currentRegistration.cardNumber || '',
    expiryDate: currentRegistration.expiryDate || '',
    cvv: currentRegistration.cvv || '',
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
          amount: Number(plan.PLA_precio) || 0,
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

  const amount = useMemo(() => {
    if (selectedPlan) {
      return Number(selectedPlan.PLA_precio) || 0;
    }

    return currentRegistration.amount || 0;
  }, [currentRegistration.amount, selectedPlan]);

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
      paymentMethod: `Tarjeta terminada en ${currentRegistration.cardNumber?.slice(-4) || '0000'}`,
      status: 'Pagado',
      issuedAt,
      detailLines: [
        { label: 'Plan seleccionado', value: planLabel },
        { label: 'Descripcion', value: planDescription },
        { label: 'Vehiculos registrados', value: `${currentRegistration.vehicles?.length || 0}` },
      ],
    };
  }, [
    amount,
    currentRegistration.cardNumber,
    currentRegistration.carnet,
    currentRegistration.fullName,
    currentRegistration.parkingPlan,
    currentRegistration.paymentRecordedAt,
    currentRegistration.paymentReference,
    currentRegistration.paymentStatus,
    currentRegistration.vehicles,
    planDescription,
    planLabel,
  ]);

  const formatCardNumber = (value: string) => {
    const cleaned = value.replace(/\s/g, '');
    const formatted = cleaned.match(/.{1,4}/g)?.join(' ') || cleaned;
    return formatted.substring(0, 19);
  };

  const formatExpiryDate = (value: string) => {
    const cleaned = value.replace(/\D/g, '');
    if (cleaned.length >= 2) {
      return cleaned.substring(0, 2) + '/' + cleaned.substring(2, 4);
    }
    return cleaned;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.cardHolder || !formData.cardNumber || !formData.expiryDate || !formData.cvv) {
      toast.error('Por favor complete todos los campos');
      return;
    }

    if (formData.cardNumber.replace(/\s/g, '').length !== 16) {
      toast.error('Numero de tarjeta invalido');
      return;
    }

    if (formData.cvv.length !== 3) {
      toast.error('CVV invalido');
      return;
    }

    const paymentRecordedAt = new Date().toISOString();
    const paymentReference = `PRQ-${Date.now()}`;

    updateRegistration({
      ...formData,
      amount,
      paymentStatus: 'paid',
      paymentRecordedAt,
      paymentReference,
    });
    toast.success('Pago realizado correctamente');
  };

  if (!currentRegistration.selectedPlanId && !currentRegistration.parkingPlan) {
    return (
      <div style={{ maxWidth: 700, margin: '0 auto' }}>
        <Alert variant="warning">Debe seleccionar un plan de parqueo antes de continuar al pago.</Alert>
        <Button variant="outline-primary" onClick={() => navigate('/parking/user')}>
          Volver
        </Button>
      </div>
    );
  }

  if (currentRegistration.isDelinquent) {
    return (
      <div style={{ maxWidth: 700, margin: '0 auto' }}>
        <Alert variant="danger" className="mb-4">
          <strong>No puede realizar el pago.</strong> {currentRegistration.delinquentReason || 'El estudiante presenta una restriccion activa por morosidad.'}
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

  return (
    <div style={{ maxWidth: 700, margin: '0 auto' }}>
      <Card className="shadow-sm">
        <Card.Header className="bg-white border-bottom">
          <Card.Title className="mb-1 h4">Informacion de Pago</Card.Title>
          <Card.Subtitle className="text-muted">Complete los datos de su tarjeta para procesar el pago</Card.Subtitle>
        </Card.Header>
        <Card.Body className="p-4">
          {planError && <Alert variant="danger" className="mb-4">{planError}</Alert>}

          {loadingPlan && (
            <div className="text-center py-4">
              <Spinner animation="border" />
              <p className="text-muted mt-3 mb-0">Cargando informacion del plan...</p>
            </div>
          )}

          <Form onSubmit={handleSubmit}>
            <div className="p-4 rounded mb-4 text-white" style={{ background: 'linear-gradient(135deg, #0d47a1 0%, #C41230 100%)' }}>
              <div className="d-flex align-items-center gap-2 mb-3" style={{ opacity: 0.9 }}>
                <DollarSign size={16} />
                <small>Resumen de Pago</small>
              </div>
              <Row>
                <Col>
                  <div>
                    <small style={{ opacity: 0.9 }}>Plan seleccionado</small>
                    <div className="fw-medium">{planLabel}</div>
                    <small style={{ opacity: 0.9 }} className="mt-2 d-block">{planDescription}</small>
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

            <Form.Group className="mb-3">
              <Form.Label>Nombre del Titular *</Form.Label>
              <Form.Control
                type="text"
                placeholder="JUAN CARLOS PEREZ"
                style={{ textTransform: 'uppercase' }}
                value={formData.cardHolder}
                onChange={(e) => setFormData({ ...formData, cardHolder: e.target.value.toUpperCase() })}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Numero de Tarjeta *</Form.Label>
              <div className="position-relative">
                <Form.Control
                  type="text"
                  placeholder="1234 5678 9012 3456"
                  value={formData.cardNumber}
                  onChange={(e) => setFormData({ ...formData, cardNumber: formatCardNumber(e.target.value) })}
                  maxLength={19}
                />
                <CreditCard size={20} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', color: '#6c757d' }} />
              </div>
            </Form.Group>

            <Row className="mb-4">
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Fecha de Vencimiento *</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="MM/AA"
                    value={formData.expiryDate}
                    onChange={(e) => setFormData({ ...formData, expiryDate: formatExpiryDate(e.target.value) })}
                    maxLength={5}
                  />
                </Form.Group>
              </Col>

              <Col md={6}>
                <Form.Group>
                  <Form.Label>CVV *</Form.Label>
                  <Form.Control
                    type="password"
                    placeholder="123"
                    maxLength={3}
                    value={formData.cvv}
                    onChange={(e) => setFormData({ ...formData, cvv: e.target.value.replace(/\D/g, '') })}
                  />
                </Form.Group>
              </Col>
            </Row>

            <Alert variant="warning" className="mb-4">
              <small>
                <strong>Nota:</strong> Esta es una simulacion de pago. Al confirmar se generara un recibo listo para exportar a PDF.
              </small>
            </Alert>

            <Row className="g-3">
              <Col xs={6}>
                <Button variant="outline-secondary" size="lg" className="w-100 d-flex align-items-center justify-content-center" onClick={() => navigate('/parking/user')}>
                  <ArrowLeft size={16} className="me-2" />
                  Atras
                </Button>
              </Col>
              <Col xs={6}>
                <Button variant="primary" type="submit" size="lg" className="w-100" disabled={loadingPlan || !!planError}>
                  Pagar Q{amount}
                </Button>
              </Col>
            </Row>
          </Form>
        </Card.Body>
      </Card>
    </div>
  );
}
