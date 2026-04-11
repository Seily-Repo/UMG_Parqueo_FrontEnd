import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router';
import { Alert, Button, Card, Col, Form, Row, Spinner } from 'react-bootstrap';
import { ArrowLeft, CreditCard, DollarSign, Receipt } from 'lucide-react';
import { toast } from 'react-toastify';
import { useRegistration } from '../../context/RegistrationContext';
import { getReadableApiError } from '../../../../../shared/api';
import type { BackendEstudianteMulta, BackendFormaPago } from '../../../../../shared/models/backend';
import { fineService, paymentMethodService, paymentService } from '../../../../../shared/services';
import { PaymentReceiptCard, type PaymentReceiptData } from '../../components/PaymentReceiptCard';
import { exportReceiptToPdf } from '../../utils/receiptExport';

interface FinePaymentLocationState {
  fineRelation?: BackendEstudianteMulta;
}

export function UserFinePayment() {
  const navigate = useNavigate();
  const location = useLocation();
  const { relationId } = useParams();
  const { currentRegistration } = useRegistration();
  const locationState = location.state as FinePaymentLocationState | null;
  const [fineRelation, setFineRelation] = useState<BackendEstudianteMulta | null>(locationState?.fineRelation || null);
  const [paymentMethods, setPaymentMethods] = useState<BackendFormaPago[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [receiptData, setReceiptData] = useState<PaymentReceiptData | null>(null);
  const [formData, setFormData] = useState({
    amount: '',
    paymentMethodId: 0,
    cardHolder: currentRegistration.fullName || '',
    cardNumber: '',
    expiryDate: '',
    cvv: '',
  });

  useEffect(() => {
    if (!relationId || !currentRegistration.carnet) {
      return;
    }

    let isMounted = true;

    const loadData = async () => {
      setLoading(true);
      setError('');

      try {
        const [fineResponse, paymentMethodsResponse] = await Promise.all([
          fineRelation ? Promise.resolve(fineRelation) : fineService.getStudentFineById(Number(relationId)),
          paymentMethodService.getAll(),
        ]);

        if (!isMounted) {
          return;
        }

        setFineRelation(fineResponse);
        setPaymentMethods(paymentMethodsResponse.filter((method) => method.FPG_ESTADO === 'A'));
        setFormData((prev) => ({
          ...prev,
          paymentMethodId:
            prev.paymentMethodId || paymentMethodsResponse.find((method) => method.FPG_ESTADO === 'A')?.FPG_FORMA_PAGO || 0,
        }));
      } catch (requestError) {
        if (!isMounted) {
          return;
        }

        setError(getReadableApiError(requestError, 'No fue posible cargar la informacion para pagar la multa.'));
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
  }, [currentRegistration.carnet, fineRelation, relationId]);

  const selectedPaymentMethod = useMemo(
    () => paymentMethods.find((method) => method.FPG_FORMA_PAGO === formData.paymentMethodId),
    [formData.paymentMethodId, paymentMethods]
  );

  const isCardPayment = selectedPaymentMethod?.FPG_NOMBRE_FORMA?.includes('TARJETA');

  const formatCardNumber = (value: string) => {
    const cleaned = value.replace(/\s/g, '');
    const formatted = cleaned.match(/.{1,4}/g)?.join(' ') || cleaned;
    return formatted.substring(0, 19);
  };

  const formatExpiryDate = (value: string) => {
    const cleaned = value.replace(/\D/g, '');
    if (cleaned.length >= 2) {
      return `${cleaned.substring(0, 2)}/${cleaned.substring(2, 4)}`;
    }
    return cleaned;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!fineRelation) {
      toast.error('No se encontro la multa a pagar');
      return;
    }

    if (!formData.amount || Number(formData.amount) <= 0) {
      toast.error('Ingrese un monto valido para la multa');
      return;
    }

    if (!formData.paymentMethodId) {
      toast.error('Seleccione una forma de pago');
      return;
    }

    if (isCardPayment) {
      if (!formData.cardHolder || !formData.cardNumber || !formData.expiryDate || !formData.cvv) {
        toast.error('Complete los datos de tarjeta para continuar');
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
    }

    setSubmitting(true);

    try {
      const paymentResponse = await paymentService.create({
        EST_CARNE: currentRegistration.carnet,
        PLN_PLAN: currentRegistration.selectedPlanId || 1,
        FPG_FORMA_PAGO: formData.paymentMethodId,
        MUL_MULTA: Number(fineRelation.MUL_MULTA),
        PAG_FECHA_PAGO: new Date().toISOString(),
        PAG_MONTO_TOTAL: Number(formData.amount),
      });

      await fineService.updateStudentFineStatus(Number(fineRelation.EMU_ESTUDIANTE_MULTA), {
        EMU_ESTADO_MULTA: 'P',
        EMU_MODIFICADO_POR: currentRegistration.fullName || currentRegistration.carnet || 'estudiante',
      });

      const issuedAt = new Date().toLocaleString();

      setReceiptData({
        receiptNumber: `MUL-${paymentResponse.data?.PAG_PAGO || Date.now()}`,
        title: 'Recibo de pago de multa',
        studentName: currentRegistration.fullName || 'Estudiante',
        carnet: currentRegistration.carnet || 'No disponible',
        concept: `Pago de multa #${fineRelation.MUL_MULTA}`,
        amount: Number(formData.amount),
        paymentMethod: selectedPaymentMethod?.FPG_NOMBRE_FORMA || `Forma ${formData.paymentMethodId}`,
        status: 'Pagado',
        issuedAt,
        detailLines: [
          { label: 'Relacion estudiante-multa', value: `${fineRelation.EMU_ESTUDIANTE_MULTA}` },
          { label: 'Multa', value: `${fineRelation.MUL_MULTA}` },
        ],
      });

      toast.success('Pago de multa registrado correctamente');
    } catch (requestError) {
      setError(getReadableApiError(requestError, 'No fue posible registrar el pago de la multa.'));
    } finally {
      setSubmitting(false);
    }
  };

  if (!currentRegistration.carnet) {
    return <Alert variant="warning">Debe iniciar sesion antes de pagar una multa.</Alert>;
  }

  if (receiptData) {
    return (
      <div style={{ maxWidth: 860, margin: '0 auto' }}>
        <PaymentReceiptCard
          data={receiptData}
          onExportPdf={() => exportReceiptToPdf(receiptData)}
          onContinue={() => navigate('/parking/user/multas')}
          continueLabel="Volver a Multas"
        />
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 800, margin: '0 auto' }}>
      <Card className="shadow-sm">
        <Card.Header className="bg-white border-bottom">
          <div className="d-flex align-items-center justify-content-between flex-wrap gap-3">
            <div>
              <Card.Title className="mb-1 h4">Pago de Multa</Card.Title>
              <Card.Subtitle className="text-muted">Complete el formulario para registrar el pago de la multa seleccionada</Card.Subtitle>
            </div>
            <Button variant="outline-secondary" onClick={() => navigate('/parking/user/multas')}>
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
              <Button variant="outline-secondary" onClick={() => navigate('/parking/user/multas')}>
                <ArrowLeft size={16} className="me-2" />
                Volver a Consulta de Multas
              </Button>
            </>
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
                      <div className="fw-medium">{fineRelation.EST_CARNE}</div>
                      <small style={{ opacity: 0.9 }} className="mt-2 d-block">
                        Relacion #{fineRelation.EMU_ESTUDIANTE_MULTA} | Multa #{fineRelation.MUL_MULTA}
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
                        min="0.01"
                        step="0.01"
                        placeholder="150.00"
                        value={formData.amount}
                        onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
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
                      Ingrese el monto correspondiente a la multa porque el backend actual no entrega ese detalle aqui.
                    </Form.Text>
                  </Form.Group>
                </Col>

                <Col md={6}>
                  <Form.Group>
                    <Form.Label>Forma de Pago *</Form.Label>
                    <Form.Select
                      value={formData.paymentMethodId}
                      onChange={(e) => setFormData({ ...formData, paymentMethodId: Number(e.target.value) })}
                    >
                      <option value={0}>Seleccione una forma de pago</option>
                      {paymentMethods.map((method) => (
                        <option key={method.FPG_FORMA_PAGO} value={method.FPG_FORMA_PAGO}>
                          {method.FPG_NOMBRE_FORMA}
                        </option>
                      ))}
                    </Form.Select>
                  </Form.Group>
                </Col>
              </Row>

              {isCardPayment && (
                <>
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
                      <CreditCard
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
                </>
              )}

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
                  <Button variant="primary" type="submit" size="lg" className="w-100" disabled={submitting}>
                    {submitting ? 'Procesando...' : 'Pagar Multa'}
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
