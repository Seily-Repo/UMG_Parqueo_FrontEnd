import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import { Alert, Badge, Button, Card, Col, ListGroup, Row, Spinner, Table } from 'react-bootstrap';
import { ArrowLeft, CreditCard, Mail, ShieldAlert, User, Receipt } from 'lucide-react';
import { getReadableApiError } from '../../../../../shared/api';
import type {
  BackendEstudiante,
  BackendEstudianteMoroso,
  BackendEstudianteMulta,
  BackendPago,
} from '../../../../../shared/models/backend';
import { delinquentStudentService, fineService, paymentService, studentService } from '../../../../../shared/services';

function formatCurrency(amount: number) {
  return `Q${amount.toFixed(2)}`;
}

function formatDate(value?: string) {
  if (!value) {
    return 'No disponible';
  }

  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? value : parsed.toLocaleString();
}

function getPaymentBadge(status?: string) {
  switch (status) {
    case 'A':
      return { label: 'Aceptado', bg: 'success' };
    case 'P':
      return { label: 'Pendiente', bg: 'warning' };
    case 'C':
      return { label: 'Cancelado', bg: 'secondary' };
    default:
      return { label: 'Sin estado', bg: 'secondary' };
  }
}

function getFineBadge(status?: string) {
  switch (status) {
    case 'A':
      return { label: 'Activa', bg: 'danger' };
    case 'C':
      return { label: 'Cancelada', bg: 'secondary' };
    case 'P':
      return { label: 'Pagada', bg: 'success' };
    default:
      return { label: status || 'Desconocido', bg: 'secondary' };
  }
}

export function RegistrationDetail() {
  const navigate = useNavigate();
  const { id } = useParams();
  const carne = id;
  const [student, setStudent] = useState<BackendEstudiante | null>(null);
  const [payments, setPayments] = useState<BackendPago[]>([]);
  const [fines, setFines] = useState<BackendEstudianteMulta[]>([]);
  const [delinquentRecords, setDelinquentRecords] = useState<BackendEstudianteMoroso[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!carne) {
      return;
    }

    let isMounted = true;

    const loadDetail = async () => {
      setLoading(true);
      setError('');

      try {
        const [studentResponse, paymentsResponse, finesResponse, delinquentResponse] = await Promise.all([
          studentService.getByCarne(carne),
          paymentService.getAll(),
          fineService.getStudentFinesByCarne(carne),
          delinquentStudentService.getByCarne(carne),
        ]);

        if (!isMounted) {
          return;
        }

        setStudent(studentResponse);
        setPayments(paymentsResponse.filter((payment) => payment.EST_CARNE === carne));
        setFines(finesResponse);
        setDelinquentRecords(Array.isArray(delinquentResponse) ? delinquentResponse : delinquentResponse ? [delinquentResponse] : []);
      } catch (requestError) {
        if (!isMounted) {
          return;
        }

        setError(getReadableApiError(requestError, 'No fue posible cargar el detalle del estudiante.'));
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    void loadDetail();

    return () => {
      isMounted = false;
    };
  }, [carne]);

  const activeDelinquentRecord = useMemo(
    () => delinquentRecords.find((record) => record.MOR_ESTADO === 'A'),
    [delinquentRecords]
  );

  const totalPaid = useMemo(
    () => payments.reduce((sum, payment) => sum + Number(payment.PAG_MONTO_TOTAL || 0), 0),
    [payments]
  );

  if (!carne) {
    return (
      <Alert variant="warning">
        No se recibió un identificador válido para el detalle.
      </Alert>
    );
  }

  if (loading) {
    return (
      <div className="text-center py-5">
        <Spinner animation="border" />
        <p className="text-muted mt-3 mb-0">Cargando detalle del estudiante...</p>
      </div>
    );
  }

  if (error || !student) {
    return (
      <div style={{ maxWidth: 900, margin: '0 auto' }}>
        <Card className="shadow-sm">
          <Card.Body className="text-center py-5">
            <p className="text-muted mb-3">{error || 'Registro no encontrado'}</p>
            <Button
              variant="outline-secondary"
              onClick={() => navigate('/parking/admin/dashboard')}
            >
              <ArrowLeft size={16} className="me-2" />
              Volver
            </Button>
          </Card.Body>
        </Card>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-4">
        <Button
          variant="link"
          className="text-decoration-none p-0 mb-3"
          onClick={() => navigate('/parking/admin/dashboard')}
        >
          <ArrowLeft size={16} className="me-2" />
          Volver a la lista
        </Button>
        <div className="d-flex align-items-center justify-content-between flex-wrap gap-3">
          <div>
            <h3 className="fw-bold mb-1">Detalle del Estudiante</h3>
            <p className="text-muted mb-0">Resumen consolidado desde el backend</p>
          </div>
          <div className="d-flex gap-2 flex-wrap">
            <Badge bg={payments.length > 0 ? 'primary' : 'warning'} className="text-white px-3 py-2">
              {payments.length > 0 ? 'Con pagos' : 'Sin pagos'}
            </Badge>
            <Badge bg={activeDelinquentRecord ? 'warning' : 'success'} text={activeDelinquentRecord ? 'dark' : 'white'} className="px-3 py-2">
              {activeDelinquentRecord ? 'Morosidad activa' : 'Sin restricción'}
            </Badge>
          </div>
        </div>
      </div>

      <Row className="g-4">
        <Col lg={4}>
          <Card className="shadow-sm h-100">
            <Card.Header className="bg-white">
              <h6 className="mb-0 d-flex align-items-center gap-2">
                <User size={18} />
                Información Personal
              </h6>
            </Card.Header>
            <Card.Body>
              <ListGroup variant="flush">
                <ListGroup.Item className="px-0 pt-0">
                  <small className="text-muted">Nombre Completo</small>
                  <div className="fw-semibold">{student.EST_NOMBRE_COMPLETO}</div>
                </ListGroup.Item>

                <ListGroup.Item className="px-0">
                  <small className="text-muted">Número de Carnet</small>
                  <div className="fw-semibold">{student.EST_CARNE}</div>
                </ListGroup.Item>

                <ListGroup.Item className="px-0 pb-0">
                  <small className="text-muted d-flex align-items-center gap-2">
                    <Mail size={14} />
                    Correo institucional
                  </small>
                  <div className="fw-medium mt-1">{student.EST_EMAIL}</div>
                </ListGroup.Item>
              </ListGroup>
            </Card.Body>
          </Card>
        </Col>

        <Col lg={8}>
          <div className="d-flex flex-column gap-4">
            <Card className="shadow-sm">
              <Card.Header className="bg-white">
                <h6 className="mb-0 d-flex align-items-center gap-2">
                  <ShieldAlert size={18} />
                  Estado de Morosidad
                </h6>
              </Card.Header>
              <Card.Body>
                {activeDelinquentRecord ? (
                  <Alert variant="warning" className="mb-0">
                    <strong>Motivo:</strong> {activeDelinquentRecord.MOR_MOTIVO}
                    <br />
                    <strong>Fecha:</strong> {activeDelinquentRecord.MOR_FECHA_AGREGADO || 'No disponible'}
                  </Alert>
                ) : (
                  <p className="text-muted mb-0">El estudiante no presenta morosidad activa.</p>
                )}
              </Card.Body>
            </Card>

            <Card className="shadow-sm">
              <Card.Header className="bg-white">
                <h6 className="mb-0 d-flex align-items-center gap-2">
                  <CreditCard size={18} />
                  Información de Pagos
                </h6>
              </Card.Header>
              <Card.Body>
                <div className="mb-3">
                  <small className="text-muted">Total acumulado</small>
                  <div className="h4 fw-bold text-primary mb-0">{formatCurrency(totalPaid)}</div>
                </div>

                {payments.length === 0 ? (
                  <p className="text-muted mb-0">No hay pagos registrados para este estudiante.</p>
                ) : (
                  <div className="table-responsive">
                    <Table hover>
                      <thead className="table-light">
                        <tr>
                          <th>ID Pago</th>
                          <th>Plan</th>
                          <th>Forma</th>
                          <th>Monto</th>
                          <th>Estado</th>
                          <th>Fecha</th>
                        </tr>
                      </thead>
                      <tbody>
                        {payments.map((payment) => {
                          const badge = getPaymentBadge(payment.PAG_ESTADO);
                          return (
                            <tr key={payment.PAG_PAGO}>
                              <td className="fw-medium">{payment.PAG_PAGO}</td>
                              <td>{payment.PLN_PLAN}</td>
                              <td>{payment.FPG_FORMA_PAGO}</td>
                              <td>{formatCurrency(Number(payment.PAG_MONTO_TOTAL || 0))}</td>
                              <td>
                                <Badge bg={badge.bg} text={badge.bg === 'warning' ? 'dark' : 'white'}>
                                  {badge.label}
                                </Badge>
                              </td>
                              <td>{formatDate(payment.PAG_FECHA_PAGO)}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </Table>
                  </div>
                )}
              </Card.Body>
            </Card>

            <Card className="shadow-sm">
              <Card.Header className="bg-white">
                <h6 className="mb-0 d-flex align-items-center gap-2">
                  <Receipt size={18} />
                  Multas Asociadas
                </h6>
              </Card.Header>
              <Card.Body>
                {fines.length === 0 ? (
                  <p className="text-muted mb-0">No hay multas asociadas al estudiante.</p>
                ) : (
                  <div className="table-responsive">
                    <Table hover>
                      <thead className="table-light">
                        <tr>
                          <th>ID Relación</th>
                          <th>ID Multa</th>
                          <th>Estado</th>
                          <th>Creado por</th>
                          <th>Fecha</th>
                        </tr>
                      </thead>
                      <tbody>
                        {fines.map((fine) => {
                          const badge = getFineBadge(fine.EMU_ESTADO_MULTA);
                          return (
                            <tr key={fine.EMU_ESTUDIANTE_MULTA}>
                              <td className="fw-medium">{fine.EMU_ESTUDIANTE_MULTA}</td>
                              <td>{fine.MUL_MULTA}</td>
                              <td>
                                <Badge bg={badge.bg} text={badge.bg === 'warning' ? 'dark' : 'white'}>
                                  {badge.label}
                                </Badge>
                              </td>
                              <td>{fine.EMU_CREADO_POR}</td>
                              <td>{fine.EMU_FECHA_CREACION || 'No disponible'}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </Table>
                  </div>
                )}
              </Card.Body>
            </Card>

            <Alert variant="info" className="mb-0">
              Esta vista ya usa datos reales de estudiante, pagos, multas y morosidad. Los campos de vehículos, firma,
              dirección y contacto de emergencia siguen pendientes de backend.
            </Alert>
          </div>
        </Col>
      </Row>
    </div>
  );
}
