import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router';
import { Card, Form, Button, Table, Badge, Row, Col, InputGroup, Alert, Spinner } from 'react-bootstrap';
import { Search, Eye, Users, DollarSign, ShieldAlert } from 'lucide-react';
import { getReadableApiError } from '../../../../../shared/api';
import type { BackendEstudiante, BackendEstudianteMoroso, BackendPago } from '../../../../../shared/models/backend';
import { delinquentStudentService, paymentService, studentService } from '../../../../../shared/services';

interface AdminStudentRow {
  carne: string;
  fullName: string;
  email: string;
  isDelinquent: boolean;
  delinquentReason?: string;
  paymentStatus: 'paid' | 'pending';
  totalPaid: number;
  latestPaymentDate?: string;
}

function formatCurrency(amount: number) {
  return `Q${amount.toFixed(2)}`;
}

function formatDate(value?: string) {
  if (!value) {
    return 'Sin pagos';
  }

  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? value : parsed.toLocaleDateString();
}

function isAcceptedPayment(payment: BackendPago) {
  return payment.PAG_ESTADO === 'A' || payment.PAG_ESTADO === 'P' || !payment.PAG_ESTADO;
}

export function AdminDashboard() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [students, setStudents] = useState<BackendEstudiante[]>([]);
  const [payments, setPayments] = useState<BackendPago[]>([]);
  const [delinquents, setDelinquents] = useState<BackendEstudianteMoroso[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let isMounted = true;

    const loadDashboard = async () => {
      setLoading(true);
      setError('');

      try {
        const [studentsResponse, paymentsResponse, delinquentsResponse] = await Promise.all([
          studentService.getAll(),
          paymentService.getAll(),
          delinquentStudentService.getAll(),
        ]);

        if (!isMounted) {
          return;
        }

        setStudents(studentsResponse);
        setPayments(paymentsResponse);
        setDelinquents(delinquentsResponse);
      } catch (requestError) {
        if (!isMounted) {
          return;
        }

        setError(getReadableApiError(requestError, 'No fue posible cargar el panel administrativo.'));
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    void loadDashboard();

    return () => {
      isMounted = false;
    };
  }, []);

  const delinquentMap = useMemo(() => {
    return delinquents.reduce<Record<string, BackendEstudianteMoroso>>((accumulator, item) => {
      if (item.MOR_ESTADO === 'A') {
        accumulator[item.EST_CARNE] = item;
      }
      return accumulator;
    }, {});
  }, [delinquents]);

  const paymentMap = useMemo(() => {
    return payments.reduce<Record<string, BackendPago[]>>((accumulator, item) => {
      if (!accumulator[item.EST_CARNE]) {
        accumulator[item.EST_CARNE] = [];
      }

      accumulator[item.EST_CARNE].push(item);
      return accumulator;
    }, {});
  }, [payments]);

  const rows = useMemo<AdminStudentRow[]>(() => {
    return students.map((student) => {
      const studentPayments = paymentMap[student.EST_CARNE] || [];
      const acceptedPayments = studentPayments.filter(isAcceptedPayment);
      const totalPaid = acceptedPayments.reduce((sum, payment) => sum + Number(payment.PAG_MONTO_TOTAL || 0), 0);
      const latestPayment = acceptedPayments
        .slice()
        .sort((a, b) => new Date(b.PAG_FECHA_PAGO).getTime() - new Date(a.PAG_FECHA_PAGO).getTime())[0];
      const delinquentRecord = delinquentMap[student.EST_CARNE];

      return {
        carne: student.EST_CARNE,
        fullName: student.EST_NOMBRE_COMPLETO,
        email: student.EST_EMAIL,
        isDelinquent: !!delinquentRecord,
        delinquentReason: delinquentRecord?.MOR_MOTIVO,
        paymentStatus: acceptedPayments.length > 0 ? 'paid' : 'pending',
        totalPaid,
        latestPaymentDate: latestPayment?.PAG_FECHA_PAGO,
      };
    });
  }, [delinquentMap, paymentMap, students]);

  const filteredRows = useMemo(() => {
    const normalized = searchTerm.trim().toLowerCase();

    if (!normalized) {
      return rows;
    }

    return rows.filter((row) =>
      row.carne.toLowerCase().includes(normalized) ||
      row.fullName.toLowerCase().includes(normalized) ||
      row.email.toLowerCase().includes(normalized)
    );
  }, [rows, searchTerm]);

  const totalRevenue = useMemo(
    () => rows.reduce((sum, row) => sum + row.totalPaid, 0),
    [rows]
  );

  const totalDelinquents = useMemo(
    () => rows.filter((row) => row.isDelinquent).length,
    [rows]
  );

  const stats = [
    {
      title: 'Total Estudiantes',
      value: rows.length,
      description: 'Estudiantes registrados',
      icon: Users,
      color: '#1976d2',
      bgColor: '#e3f2fd'
    },
    {
      title: 'Ingresos Totales',
      value: formatCurrency(totalRevenue),
      description: 'Pagos registrados',
      icon: DollarSign,
      color: '#C41230',
      bgColor: '#ffebee'
    },
    {
      title: 'Morosidad Activa',
      value: totalDelinquents,
      description: 'Estudiantes con restricción',
      icon: ShieldAlert,
      color: '#9a3412',
      bgColor: '#ffedd5'
    },
  ];

  return (
    <div>
      <div className="mb-4">
        <h3 className="fw-bold mb-1">Panel de Administración</h3>
        <p className="text-muted mb-0">Gestión de estudiantes, pagos y morosidad</p>
      </div>

      {error && <Alert variant="danger" className="mb-4">{error}</Alert>}

      <Row className="g-4 mb-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Col md={4} key={stat.title}>
              <Card className="shadow-sm h-100" style={{ borderColor: '#0d47a1' }}>
                <Card.Body>
                  <div className="d-flex align-items-center justify-content-between mb-3">
                    <h6 className="text-muted mb-0 small">{stat.title}</h6>
                    <div
                      style={{
                        width: 40,
                        height: 40,
                        backgroundColor: stat.bgColor,
                        borderRadius: 8,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      <Icon size={20} color={stat.color} />
                    </div>
                  </div>
                  <div className="h4 fw-bold mb-1">{stat.value}</div>
                  <small className="text-muted">{stat.description}</small>
                </Card.Body>
              </Card>
            </Col>
          );
        })}
      </Row>

      <Card className="shadow-sm" style={{ borderColor: '#0d47a1' }}>
        <Card.Header className="bg-white">
          <h5 className="mb-1">Lista de Estudiantes</h5>
          <p className="text-muted small mb-0">
            Búsqueda sobre estudiantes, pagos registrados y morosidad activa
          </p>
        </Card.Header>
        <Card.Body className="p-4">
          <InputGroup className="mb-4">
            <InputGroup.Text>
              <Search size={16} />
            </InputGroup.Text>
            <Form.Control
              placeholder="Buscar por carnet, nombre o correo..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </InputGroup>

          {loading ? (
            <div className="text-center py-5">
              <Spinner animation="border" />
              <p className="text-muted mt-3 mb-0">Cargando información del panel...</p>
            </div>
          ) : filteredRows.length === 0 ? (
            <div className="text-center py-5">
              <Users size={64} color="#dee2e6" className="mb-3" />
              <p className="text-muted mb-1">
                {searchTerm ? 'No se encontraron resultados' : 'No hay estudiantes para mostrar'}
              </p>
              <small className="text-muted">
                {searchTerm ? 'Intenta con otro término de búsqueda' : 'Los registros aparecerán aquí'}
              </small>
            </div>
          ) : (
            <div className="table-responsive">
              <Table hover>
                <thead className="table-light">
                  <tr>
                    <th>Carnet</th>
                    <th>Nombre</th>
                    <th>Correo</th>
                    <th>Morosidad</th>
                    <th>Estado Pago</th>
                    <th>Total Pagado</th>
                    <th>Último Pago</th>
                    <th className="text-end">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRows.map((row) => (
                    <tr key={row.carne}>
                      <td className="fw-medium">{row.carne}</td>
                      <td>{row.fullName}</td>
                      <td>{row.email}</td>
                      <td>
                        <Badge bg={row.isDelinquent ? 'warning' : 'success'} text={row.isDelinquent ? 'dark' : 'white'}>
                          {row.isDelinquent ? row.delinquentReason || 'Activa' : 'Sin restricción'}
                        </Badge>
                      </td>
                      <td>
                        <Badge
                          bg={row.paymentStatus === 'paid' ? 'primary' : 'danger'}
                          className="text-white"
                        >
                          {row.paymentStatus === 'paid' ? 'Pagado' : 'Pendiente'}
                        </Badge>
                      </td>
                      <td>{formatCurrency(row.totalPaid)}</td>
                      <td>{formatDate(row.latestPaymentDate)}</td>
                      <td className="text-end">
                        <Button
                          variant="outline-primary"
                          size="sm"
                          onClick={() => navigate(`/parking/admin/dashboard/registro/${row.carne}`)}
                        >
                          <Eye size={16} className="me-2" />
                          Ver Detalles
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          )}
        </Card.Body>
      </Card>
    </div>
  );
}
