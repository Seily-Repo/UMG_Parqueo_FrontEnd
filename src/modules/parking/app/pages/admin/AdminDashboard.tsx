import { useState } from 'react';
import { useNavigate } from 'react-router';
import { useRegistration } from '../../context/RegistrationContext';
import { Card, Form, Button, Table, Badge, Row, Col, InputGroup } from 'react-bootstrap';
import { Search, Eye, Users, DollarSign, Car } from 'lucide-react';

export function AdminDashboard() {
  const navigate = useNavigate();
  const { registrations } = useRegistration();
  const [searchTerm, setSearchTerm] = useState('');

  const filteredRegistrations = registrations.filter((reg) =>
    reg.carnet.toLowerCase().includes(searchTerm.toLowerCase()) ||
    reg.fullName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalRevenue = registrations.reduce((sum, reg) => sum + (reg.amount || 0), 0);
  const totalVehicles = registrations.reduce((sum, reg) => sum + reg.vehicles.length, 0);

  const getPlanLabel = (plan: string) => {
    switch (plan) {
      case 'entre-semana':
        return 'Entre Semana';
      case 'sabado':
        return 'Sábado';
      case 'domingo':
        return 'Domingo';
      default:
        return plan;
    }
  };

  const stats = [
    {
      title: 'Total Estudiantes',
      value: registrations.length,
      description: 'Registros activos',
      icon: Users,
      color: '#1976d2',
      bgColor: '#e3f2fd'
    },
    {
      title: 'Ingresos Totales',
      value: `Q${totalRevenue}`,
      description: 'Pagos procesados',
      icon: DollarSign,
      color: '#2e7d32',
      bgColor: '#e8f5e9'
    },
    {
      title: 'Vehículos Registrados',
      value: totalVehicles,
      description: 'Total de vehículos',
      icon: Car,
      color: '#7e57c2',
      bgColor: '#ede7f6'
    },
  ];

  return (
    <div>
      {/* Header */}
      <div className="mb-4">
        <h3 className="fw-bold mb-1">Panel de Administración</h3>
        <p className="text-muted mb-0">Gestión de registros de parqueo universitario</p>
      </div>

      {/* Stats */}
      <Row className="g-4 mb-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Col md={4} key={stat.title}>
              <Card className="shadow-sm h-100">
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

      {/* Search and Table */}
      <Card className="shadow-sm">
        <Card.Header className="bg-white">
          <h5 className="mb-1">Lista de Registros</h5>
          <p className="text-muted small mb-0">
            Busque y gestione los registros de estudiantes
          </p>
        </Card.Header>
        <Card.Body className="p-4">
          {/* Search */}
          <InputGroup className="mb-4">
            <InputGroup.Text>
              <Search size={16} />
            </InputGroup.Text>
            <Form.Control
              placeholder="Buscar por carnet o nombre..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </InputGroup>

          {/* Table */}
          {filteredRegistrations.length === 0 ? (
            <div className="text-center py-5">
              <Users size={64} color="#dee2e6" className="mb-3" />
              <p className="text-muted mb-1">
                {searchTerm ? 'No se encontraron resultados' : 'No hay registros'}
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
                    <th>Plan</th>
                    <th>Vehículos</th>
                    <th>Estado Pago</th>
                    <th className="text-end">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRegistrations.map((registration) => (
                    <tr key={registration.id}>
                      <td className="fw-medium">{registration.carnet}</td>
                      <td>{registration.fullName}</td>
                      <td>{getPlanLabel(registration.parkingPlan)}</td>
                      <td>{registration.vehicles.length}</td>
                      <td>
                        <Badge 
                          bg={registration.paymentStatus === 'paid' ? 'success' : 'warning'}
                          className="text-white"
                        >
                          {registration.paymentStatus === 'paid' ? 'Pagado' : 'Pendiente'}
                        </Badge>
                      </td>
                      <td className="text-end">
                        <Button
                          variant="outline-primary"
                          size="sm"
                          onClick={() => navigate(`/parking/admin/dashboard/registro/${registration.id}`)}
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
