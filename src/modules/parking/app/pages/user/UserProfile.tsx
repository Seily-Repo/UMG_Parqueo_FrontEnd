import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router';
import { Alert, Button, Card, Col, Row, Spinner, Table } from 'react-bootstrap';
import { ArrowLeft, BadgeCheck, CreditCard, FileText, ShieldAlert } from 'lucide-react';
import { useRegistration } from '../../context/RegistrationContext';
import { getReadableApiError } from '../../../../../shared/api';
import type {
  BackendEstudiante,
  BackendEstudianteMulta,
  BackendEstudianteMoroso,
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

function getPaymentStatus(status?: string) {
  switch (status) {
    case 'A':
      return { label: 'Aceptado', variant: 'success' as const };
    case 'P':
      return { label: 'Pendiente', variant: 'warning' as const };
    case 'C':
        return { label: 'Cancelado', variant: 'secondary' as const };
    default:
      return { label: 'Sin estado', variant: 'secondary' as const };
  }
}

function getFineStatus(status?: string) {
  switch (status) {
    case 'A':
      return { label: 'Activa', variant: 'danger' as const };
    case 'P':
      return { label: 'Pagada', variant: 'success' as const };
    case 'C':
      return { label: 'Cancelada', variant: 'secondary' as const };
    default:
      return { label: status || 'Desconocido', variant: 'secondary' as const };
  }
}

function UserProfile() {
  const { currentRegistration, updateRegistration } = useRegistration();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [student, setStudent] = useState<BackendEstudiante | null>(null);
  const [payments, setPayments] = useState<BackendPago[]>([]);
  const [fines, setFines] = useState<BackendEstudianteMulta[]>([]);
  const [delinquentRecords, setDelinquentRecords] = useState<BackendEstudianteMoroso[]>([]);

  useEffect(() => {
    if (!currentRegistration.carnet) {
      return;
    }

    let isMounted = true;

    const loadAccountStatement = async () => {
      setLoading(true);
      setProfileError(null);

      try {
        const [studentResponse, paymentsResponse, finesResponse, delinquentResponse] = await Promise.all([
          studentService.getByCarne(currentRegistration.carnet),
          paymentService.getAll(),
          fineService.getStudentFinesByCarne(currentRegistration.carnet),
          delinquentStudentService.getByCarne(currentRegistration.carnet),
        ]);

        if (!isMounted) {
          return;
        }

        setStudent(studentResponse);
        setPayments(paymentsResponse.filter((payment) => payment.EST_CARNE === currentRegistration.carnet));
        setFines(finesResponse);
        setDelinquentRecords(
          Array.isArray(delinquentResponse) ? delinquentResponse : delinquentResponse ? [delinquentResponse] : []
        );

        updateRegistration({
          id: currentRegistration.id || studentResponse.EST_CARNE,
          carnet: studentResponse.EST_CARNE,
          fullName: studentResponse.EST_NOMBRE_COMPLETO,
          institutionalEmail: studentResponse.EST_EMAIL,
          createdAt: currentRegistration.createdAt || new Date(studentResponse.EST_FECHA_CREACION),
        });
      } catch (requestError) {
        if (!isMounted) {
          return;
        }

        setProfileError(getReadableApiError(requestError, 'No fue posible cargar el estado de cuenta.'));
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    void loadAccountStatement();

    return () => {
      isMounted = false;
    };
  }, [currentRegistration.carnet, currentRegistration.createdAt, currentRegistration.id, updateRegistration]);

  const activeDelinquency = useMemo(
    () => delinquentRecords.find((record) => record.MOR_ESTADO === 'A'),
    [delinquentRecords]
  );

  const totalPaid = useMemo(
    () => payments.reduce((sum, payment) => sum + Number(payment.PAG_MONTO_TOTAL || 0), 0),
    [payments]
  );

  const activeFines = useMemo(() => fines.filter((fine) => fine.EMU_ESTADO_MULTA === 'A').length, [fines]);
  const latestPayment = payments[0];

  if (!currentRegistration.carnet) {
    return <div>No hay datos de usuario.</div>;
  }

  return (
    <div
      className="parking-shell parking-shell--photo"
      style={{
        backgroundImage: 'url(/assets/villanueva.webp)',
      }}
    >
      <div className="container py-4">
        <div className="d-flex align-items-center justify-content-between flex-wrap gap-3 mb-4">
          <div>
            <p className="parking-finance-heading text-uppercase fw-semibold mb-2" style={{ letterSpacing: '0.12em', fontSize: 12 }}>
              Modulo Financiero
            </p>
            <h1 className="parking-finance-heading mb-1" style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', fontWeight: 800 }}>
              Estado de Cuenta
            </h1>
            <p className="parking-finance-subheading mb-0">
              Resumen consolidado de pagos, multas y estado administrativo.
            </p>
          </div>
          <Button variant="outline-secondary" onClick={() => navigate('/parking')}>
            <ArrowLeft size={16} className="me-2" />
            Volver
          </Button>
        </div>

        {profileError && <Alert variant="warning">{profileError}</Alert>}

        {loading && (
          <div className="text-center py-5">
            <Spinner animation="border" role="status" />
          </div>
        )}

        <Card className="parking-student-panel shadow-sm mb-4">
          <Card.Body className="parking-student-panel__body p-4 p-lg-5">
              <Row className="g-4 align-items-end">
                <Col lg={7}>
                  <div className="d-flex align-items-center gap-3 mb-4">
                    <div
                      className="parking-student-panel__icon d-flex align-items-center justify-content-center"
                    >
                      <FileText size={28} />
                    </div>
                    <div>
                      <div className="parking-student-panel__eyebrow small">Titular de la cuenta</div>
                      <div className="parking-student-panel__text fs-3 fw-bold">
                        {student?.EST_NOMBRE_COMPLETO || currentRegistration.fullName || 'No disponible'}
                      </div>
                    </div>
                  </div>

                  <Row className="g-3">
                    <Col md={4}>
                      <div className="parking-student-panel__muted small">Carnet</div>
                      <div className="parking-student-panel__text fw-semibold">{student?.EST_CARNE || currentRegistration.carnet}</div>
                    </Col>
                    <Col md={5}>
                      <div className="parking-student-panel__muted small">Correo institucional</div>
                      <div className="parking-student-panel__text fw-semibold">
                        {student?.EST_EMAIL || currentRegistration.institutionalEmail || 'No disponible'}
                      </div>
                    </Col>
                    <Col md={3}>
                      <div className="parking-student-panel__muted small">Estado</div>
                      <div className="parking-student-panel__text fw-semibold">{activeDelinquency ? 'Con restriccion' : 'Al dia'}</div>
                    </Col>
                  </Row>
                </Col>

                <Col lg={5}>
                  <div className="parking-student-panel__balance p-4 rounded-4">
                    <div className="parking-student-panel__muted small mb-2">Balance registrado</div>
                    <div className="parking-student-panel__text display-5 fw-bold mb-2">{formatCurrency(totalPaid)}</div>
                    <div className="parking-student-panel__muted small">
                      Ultimo movimiento: {latestPayment ? formatDate(latestPayment.PAG_FECHA_PAGO) : 'Sin pagos registrados'}
                    </div>
                  </div>
                </Col>
              </Row>
          </Card.Body>
        </Card>

        <Row className="g-4 mb-4">
          <Col md={4}>
            <Card className="h-100 shadow-sm">
              <Card.Body className="p-4">
                <div className="d-flex align-items-center gap-3 mb-3">
                  <div
                    className="d-flex align-items-center justify-content-center"
                    style={{ width: 52, height: 52, borderRadius: 16, background: 'rgba(13,71,161,0.1)' }}
                  >
                    <CreditCard color="#0d47a1" />
                  </div>
                  <div>
                    <div className="small text-muted">Total Pagado</div>
                    <div className="fs-3 fw-bold text-dark">{formatCurrency(totalPaid)}</div>
                  </div>
                </div>
                <p className="mb-0 text-muted">Acumulado de pagos registrados en el sistema.</p>
              </Card.Body>
            </Card>
          </Col>

          <Col md={4}>
            <Card className="h-100 shadow-sm">
              <Card.Body className="p-4">
                <div className="d-flex align-items-center gap-3 mb-3">
                  <div
                    className="d-flex align-items-center justify-content-center"
                    style={{ width: 52, height: 52, borderRadius: 16, background: 'rgba(196,18,48,0.12)' }}
                  >
                    <ShieldAlert color="#C41230" />
                  </div>
                  <div>
                    <div className="small text-muted">Multas Activas</div>
                    <div className="fs-3 fw-bold text-dark">{activeFines}</div>
                  </div>
                </div>
                <p className="mb-0 text-muted">Multas pendientes o vigentes asociadas al estudiante.</p>
              </Card.Body>
            </Card>
          </Col>

          <Col md={4}>
            <Card className="h-100 shadow-sm">
              <Card.Body className="p-4">
                <div className="d-flex align-items-center gap-3 mb-3">
                  <div
                    className="d-flex align-items-center justify-content-center"
                    style={{ width: 52, height: 52, borderRadius: 16, background: 'rgba(22,163,74,0.12)' }}
                  >
                    <BadgeCheck color="#15803d" />
                  </div>
                  <div>
                    <div className="small text-muted">Condicion Actual</div>
                    <div className="fs-4 fw-bold text-dark">{activeDelinquency ? 'Restringido' : 'Habilitado'}</div>
                  </div>
                </div>
                <p className="mb-0 text-muted">
                  {activeDelinquency ? activeDelinquency.MOR_MOTIVO : 'No se reportan restricciones activas.'}
                </p>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        <Row className="g-4">
          <Col lg={7}>
            <Card className="shadow-sm h-100">
              <Card.Header className="d-flex align-items-center justify-content-between">
                <div>
                  <Card.Title className="mb-1">Historial de Pagos</Card.Title>
                  <Card.Subtitle>Movimientos registrados para el estudiante</Card.Subtitle>
                </div>
              </Card.Header>
              <Card.Body>
                {payments.length === 0 ? (
                  <p className="mb-0 text-muted">No hay pagos registrados.</p>
                ) : (
                  <div className="table-responsive">
                    <Table hover>
                      <thead>
                        <tr>
                          <th>ID Pago</th>
                          <th>Plan</th>
                          <th>Forma de Pago</th>
                          <th>Monto</th>
                          <th>Estado</th>
                          <th>Fecha</th>
                        </tr>
                      </thead>
                      <tbody>
                        {payments.map((payment) => {
                          const status = getPaymentStatus(payment.PAG_ESTADO);
                          return (
                            <tr key={payment.PAG_PAGO}>
                              <td className="fw-semibold">{payment.PAG_PAGO}</td>
                              <td>{payment.PLN_PLAN}</td>
                              <td>{payment.FPG_FORMA_PAGO}</td>
                              <td>{formatCurrency(Number(payment.PAG_MONTO_TOTAL || 0))}</td>
                              <td>
                                <span className={`badge text-bg-${status.variant}`}>{status.label}</span>
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
          </Col>

          <Col lg={5}>
            <Card className="shadow-sm mb-4">
              <Card.Header>
                <Card.Title className="mb-1">Estado Administrativo</Card.Title>
                <Card.Subtitle>Resumen de observaciones y restricciones</Card.Subtitle>
              </Card.Header>
              <Card.Body>
                {activeDelinquency ? (
                  <Alert variant="warning" className="mb-0">
                    <strong>Restriccion activa:</strong> {activeDelinquency.MOR_MOTIVO}
                  </Alert>
                ) : (
                  <Alert variant="success" className="mb-0">
                    El estudiante se encuentra habilitado y sin restricciones activas.
                  </Alert>
                )}
              </Card.Body>
            </Card>

            <Card className="shadow-sm">
              <Card.Header>
                <Card.Title className="mb-1">Multas Registradas</Card.Title>
                <Card.Subtitle>Estado actual de multas vinculadas</Card.Subtitle>
              </Card.Header>
              <Card.Body>
                {fines.length === 0 ? (
                  <p className="mb-0 text-muted">No hay multas asociadas al estudiante.</p>
                ) : (
                  <div className="d-flex flex-column gap-3">
                    {fines.map((fine) => {
                      const status = getFineStatus(fine.EMU_ESTADO_MULTA);
                      return (
                        <div
                          key={fine.EMU_ESTUDIANTE_MULTA}
                          className="p-3 rounded-4"
                          style={{ border: '1px solid rgba(15,38,64,0.08)', background: 'rgba(248,250,252,0.85)' }}
                        >
                          <div className="d-flex align-items-start justify-content-between gap-3 mb-2">
                            <div>
                              <div className="fw-semibold">Relacion #{fine.EMU_ESTUDIANTE_MULTA}</div>
                              <div className="small text-muted">Multa #{fine.MUL_MULTA}</div>
                            </div>
                            <span className={`badge text-bg-${status.variant}`}>{status.label}</span>
                          </div>
                          <div className="small text-muted">Creado por: {fine.EMU_CREADO_POR}</div>
                          <div className="small text-muted">Fecha: {fine.EMU_FECHA_CREACION || 'No disponible'}</div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </div>
    </div>
  );
}

export { UserProfile };
