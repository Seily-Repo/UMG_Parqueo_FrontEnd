import { useNavigate, useParams } from 'react-router';
import { useRegistration } from '../../context/RegistrationContext';
import { Card, Button, Badge, Row, Col, ListGroup } from 'react-bootstrap';
import { ArrowLeft, User, Car, CreditCard, FileSignature, Phone, MapPin, Users } from 'lucide-react';

export function RegistrationDetail() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { getRegistrationById } = useRegistration();

  const registration = id ? getRegistrationById(id) : undefined;

  if (!registration) {
    return (
      <div style={{ maxWidth: 900, margin: '0 auto' }}>
        <Card className="shadow-sm">
          <Card.Body className="text-center py-5">
            <p className="text-muted mb-3">Registro no encontrado</p>
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

  const getPlanDetails = () => {
    switch (registration.parkingPlan) {
      case 'entre-semana':
        return { label: 'Entre Semana', description: 'Lunes a Viernes', price: 'Q200/mes' };
      case 'sabado':
        return { label: 'Sábado', description: 'Solo Sábados', price: 'Q80/mes' };
      case 'domingo':
        return { label: 'Domingo', description: 'Solo Domingos', price: 'Q50/mes' };
      default:
        return { label: '', description: '', price: '' };
    }
  };

  const planDetails = getPlanDetails();

  return (
    <div>
      {/* Header */}
      <div className="mb-4">
        <Button
          variant="link"
          className="text-decoration-none p-0 mb-3"
          onClick={() => navigate('/parking/admin/dashboard')}
        >
          <ArrowLeft size={16} className="me-2" />
          Volver a la Lista
        </Button>
        <div className="d-flex align-items-center justify-content-between">
          <div>
            <h3 className="fw-bold mb-1">Detalle del Registro</h3>
            <p className="text-muted mb-0">Información completa del estudiante</p>
          </div>
          <Badge 
            bg={registration.paymentStatus === 'paid' ? 'success' : 'warning'}
            className="text-white px-3 py-2"
          >
            {registration.paymentStatus === 'paid' ? 'Pagado' : 'Pendiente'}
          </Badge>
        </div>
      </div>

      <Row className="g-4">
        {/* Photo and Basic Info */}
        <Col lg={4}>
          <Card className="shadow-sm h-100">
            <Card.Header className="bg-white">
              <h6 className="mb-0 d-flex align-items-center gap-2">
                <User size={18} />
                Información Personal
              </h6>
            </Card.Header>
            <Card.Body>
              {/* Photo */}
              {registration.photo && (
                <div className="text-center mb-4">
                  <div 
                    className="mx-auto border"
                    style={{ 
                      width: 192, 
                      height: 192, 
                      borderRadius: 8, 
                      overflow: 'hidden',
                      borderWidth: 4,
                      borderColor: '#dee2e6'
                    }}
                  >
                    <img
                      src={registration.photo}
                      alt={registration.fullName}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  </div>
                </div>
              )}

              {/* Basic Info */}
              <ListGroup variant="flush">
                <ListGroup.Item className="px-0 pt-0">
                  <small className="text-muted">Nombre Completo</small>
                  <div className="fw-semibold">{registration.fullName}</div>
                </ListGroup.Item>

                <ListGroup.Item className="px-0">
                  <small className="text-muted">Número de Carnet</small>
                  <div className="fw-semibold">{registration.carnet}</div>
                </ListGroup.Item>

                <ListGroup.Item className="px-0">
                  <small className="text-muted">Número de DPI</small>
                  <div className="fw-semibold">{registration.dpi}</div>
                </ListGroup.Item>

                <ListGroup.Item className="px-0">
                  <small className="text-muted d-flex align-items-center gap-2">
                    <MapPin size={14} />
                    Dirección
                  </small>
                  <div className="fw-medium mt-1">{registration.address}</div>
                </ListGroup.Item>

                <ListGroup.Item className="px-0 pb-0">
                  <small className="text-muted d-flex align-items-center gap-2">
                    <Phone size={14} />
                    Teléfono
                  </small>
                  <div className="fw-medium mt-1">{registration.phone}</div>
                </ListGroup.Item>
              </ListGroup>
            </Card.Body>
          </Card>
        </Col>

        {/* Details */}
        <Col lg={8}>
          <div className="d-flex flex-column gap-4">
            {/* Emergency Contact */}
            <Card className="shadow-sm">
              <Card.Header className="bg-white">
                <h6 className="mb-0 d-flex align-items-center gap-2">
                  <Users size={18} />
                  Contacto de Emergencia
                </h6>
              </Card.Header>
              <Card.Body>
                <Row>
                  <Col md={6}>
                    <small className="text-muted">Nombre</small>
                    <div className="fw-semibold">{registration.emergencyContact}</div>
                  </Col>
                  <Col md={6}>
                    <small className="text-muted">Teléfono</small>
                    <div className="fw-semibold">{registration.emergencyPhone}</div>
                  </Col>
                </Row>
              </Card.Body>
            </Card>

            {/* Vehicles */}
            <Card className="shadow-sm">
              <Card.Header className="bg-white">
                <h6 className="mb-1 d-flex align-items-center gap-2">
                  <Car size={18} />
                  Vehículos Registrados
                </h6>
                <small className="text-muted">
                  {registration.vehicles.length} vehículo(s) - Tipo: {registration.vehicleType === 'carro' ? 'Carro' : 'Moto'}
                </small>
              </Card.Header>
              <Card.Body>
                <div className="d-flex flex-column gap-3">
                  {registration.vehicles.map((vehicle, index) => (
                    <div
                      key={vehicle.id}
                      className="d-flex align-items-center justify-content-between p-3 border rounded"
                      style={{ backgroundColor: '#f8f9fa' }}
                    >
                      <div className="d-flex align-items-center gap-3">
                        <div 
                          style={{ 
                            width: 48, 
                            height: 48, 
                            backgroundColor: '#e3f2fd', 
                            borderRadius: 8,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}
                        >
                          <Car size={24} color="#1976d2" />
                        </div>
                        <div>
                          <div className="fw-semibold">Vehículo {index + 1}</div>
                          <small className="text-muted">
                            {vehicle.color} - {vehicle.brand} {vehicle.model}
                          </small>
                        </div>
                      </div>
                      <Badge bg="light" text="dark" className="border">
                        {vehicle.plate}
                      </Badge>
                    </div>
                  ))}
                </div>
              </Card.Body>
            </Card>

            {/* Payment Info */}
            <Card className="shadow-sm">
              <Card.Header className="bg-white">
                <h6 className="mb-0 d-flex align-items-center gap-2">
                  <CreditCard size={18} />
                  Información de Pago
                </h6>
              </Card.Header>
              <Card.Body>
                <Row className="g-4">
                  <Col md={6}>
                    <small className="text-muted">Plan Seleccionado</small>
                    <div className="fw-semibold">{planDetails.label}</div>
                    <small className="text-muted">{planDetails.description}</small>
                  </Col>
                  <Col md={6}>
                    <small className="text-muted">Monto Pagado</small>
                    <div className="h4 fw-bold text-success mb-0">Q{registration.amount}</div>
                    <small className="text-muted">Mensual</small>
                  </Col>
                  <Col md={6}>
                    <small className="text-muted">Titular de Tarjeta</small>
                    <div className="fw-medium">{registration.cardHolder}</div>
                  </Col>
                  <Col md={6}>
                    <small className="text-muted">Tarjeta</small>
                    <div className="fw-medium">
                      **** **** **** {registration.cardNumber.slice(-4)}
                    </div>
                  </Col>
                </Row>
              </Card.Body>
            </Card>

            {/* Signature */}
            <Card className="shadow-sm">
              <Card.Header className="bg-white">
                <h6 className="mb-0 d-flex align-items-center gap-2">
                  <FileSignature size={18} />
                  Firma Digital
                </h6>
              </Card.Header>
              <Card.Body>
                {registration.signature ? (
                  <div className="border rounded p-3 bg-white">
                    <img
                      src={registration.signature}
                      alt="Firma"
                      style={{ maxWidth: '100%', height: 'auto' }}
                    />
                  </div>
                ) : (
                  <p className="text-muted text-center py-5 mb-0">No hay firma disponible</p>
                )}
              </Card.Body>
            </Card>
          </div>
        </Col>
      </Row>
    </div>
  );
}
