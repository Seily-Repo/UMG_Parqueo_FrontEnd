import { useState } from 'react';
import { useNavigate } from 'react-router';
import { useRegistration } from '../../context/RegistrationContext';
import { Card, Form, Button, Row, Col } from 'react-bootstrap';
import { CheckCircle, ArrowLeft } from 'lucide-react';
import { toast } from 'react-toastify';

export function PersonalData() {
  const navigate = useNavigate();
  const { currentRegistration, updateRegistration } = useRegistration();
  
  const [formData, setFormData] = useState({
    carnet: (currentRegistration as any).carnet || '',
    fullName: currentRegistration.fullName || '',
    phone: currentRegistration.phone || '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.carnet || !formData.fullName || !formData.phone) {
      toast.error('Por favor complete todos los campos');
      return;
    }

    updateRegistration(formData);
    navigate('/parking/user/vehiculos');
  };

  // Si hay datos, mostrar en modo verificación
  if (currentRegistration.fullName && currentRegistration.carnet) {
    return (
      <div style={{ maxWidth: 700, margin: '0 auto' }}>
        <Card className="shadow-sm">
          <Card.Header className="bg-white border-bottom">
            <Card.Title className="mb-1 h4">Verificación de Datos Personales</Card.Title>
            <Card.Subtitle className="text-muted">
              Confirme su información personal
            </Card.Subtitle>
          </Card.Header>
          <Card.Body className="p-4">
            {/* Carnet */}
            <div className="mb-3">
              <h5>Número de Carnet</h5>
              <div style={{ padding: 12, border: '2px solid #1976d2', borderRadius: 8, backgroundColor: '#e3f2fd' }}>
                <CheckCircle size={20} color="#1976d2" className="me-2" />
                <span style={{ color: '#0d47a1' }}>{currentRegistration.carnet}</span>
              </div>
            </div>

            {/* Full Name */}
            <div className="mb-3">
              <h5>Nombre Completo</h5>
              <div style={{ padding: 12, border: '2px solid #1976d2', borderRadius: 8, backgroundColor: '#e3f2fd' }}>
                <CheckCircle size={20} color="#1976d2" className="me-2" />
                <span style={{ color: '#0d47a1' }}>{currentRegistration.fullName}</span>
              </div>
            </div>

            {/* Phone */}
            <div className="mb-3">
              <h5>Teléfono</h5>
              <div style={{ padding: 12, border: '2px solid #1976d2', borderRadius: 8, backgroundColor: '#e3f2fd' }}>
                <CheckCircle size={20} color="#1976d2" className="me-2" />
                <span style={{ color: '#0d47a1' }}>{currentRegistration.phone}</span>
              </div>
            </div>

            <Row className="g-3">
              <Col xs={6}>
                <Button
                  variant="outline-primary"
                  size="lg"
                className="w-100 d-flex align-items-center justify-content-center"
                  onClick={() => navigate('/parking/user')}
                >
                <ArrowLeft size={16} className="me-2" />
                  Atrás
                </Button>
              </Col>
              <Col xs={6}>
                <Button variant="primary" size="lg" className="w-100" onClick={() => navigate('/parking/user/vehiculos')}>
                  Siguiente
                </Button>
              </Col>
            </Row>
          </Card.Body>
        </Card>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 700, margin: '0 auto' }}>
      <Card className="shadow-sm">
        <Card.Header className="bg-white border-bottom">
          <Card.Title className="mb-1 h4">Datos Personales</Card.Title>
          <Card.Subtitle className="text-muted">
            Complete su información personal para continuar
          </Card.Subtitle>
        </Card.Header>
        <Card.Body className="p-4">
          <Form onSubmit={handleSubmit}>
            {/* Carnet */}
            <Form.Group className="mb-3">
              <Form.Label>Número de Carnet *</Form.Label>
              <Form.Control
                type="text"
                placeholder="5190-23-XXXXX"
                value={formData.carnet}
                onChange={(e) => setFormData({ ...formData, carnet: e.target.value })}
                maxLength={15}
              />
            </Form.Group>

            {/* Full Name */}
            <Form.Group className="mb-3">
              <Form.Label>Nombre Completo *</Form.Label>
              <Form.Control
                type="text"
                placeholder="Juan Carlos Pérez García"
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
              />
            </Form.Group>

            {/* Phone */}
            <Form.Group className="mb-4">
              <Form.Label>Teléfono *</Form.Label>
              <Form.Control
                type="text"
                placeholder="5555-5555"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
            </Form.Group>

            <Row className="g-3">
              <Col xs={6}>
                <Button
              variant="outline-secondary"
                  size="lg"
              className="w-100 d-flex align-items-center justify-content-center"
                  onClick={() => navigate('/parking/user')}
                >
              <ArrowLeft size={16} className="me-2" />
                  Atrás
                </Button>
              </Col>
              <Col xs={6}>
                <Button variant="primary" type="submit" size="lg" className="w-100">
                  Siguiente
                </Button>
              </Col>
            </Row>
          </Form>
        </Card.Body>
      </Card>
    </div>
  );
}
