import { useState } from 'react';
import { useNavigate } from 'react-router';
import { useRegistration } from '../../context/RegistrationContext';
import { Card, Form, Button, Row, Col } from 'react-bootstrap';
import { CheckCircle } from 'lucide-react';
import { toast } from 'react-toastify';

export function PersonalData() {
  const navigate = useNavigate();
  const { currentRegistration, updateRegistration } = useRegistration();
  
  const [formData, setFormData] = useState({
    carnet: (currentRegistration as any).carnet || '',
    dpi: (currentRegistration as any).dpi || '',
    fullName: currentRegistration.fullName || '',
    address: currentRegistration.address || '',
    phone: currentRegistration.phone || '',
    emergencyContact: currentRegistration.emergencyContact || '',
    emergencyPhone: currentRegistration.emergencyPhone || '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.carnet || !formData.dpi || !formData.fullName || !formData.address || !formData.phone ||
        !formData.emergencyContact || !formData.emergencyPhone) {
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
              <div style={{ padding: 12, border: '2px solid #28a745', borderRadius: 8, backgroundColor: '#d4edda' }}>
                <CheckCircle size={20} color="#28a745" className="me-2" />
                <span style={{ color: '#155724' }}>{currentRegistration.carnet}</span>
              </div>
            </div>

            {/* DPI */}
            <div className="mb-3">
              <h5>Número de DPI</h5>
              <div style={{ padding: 12, border: '2px solid #28a745', borderRadius: 8, backgroundColor: '#d4edda' }}>
                <CheckCircle size={20} color="#28a745" className="me-2" />
                <span style={{ color: '#155724' }}>{currentRegistration.dpi}</span>
              </div>
            </div>

            {/* Full Name */}
            <div className="mb-3">
              <h5>Nombre Completo</h5>
              <div style={{ padding: 12, border: '2px solid #28a745', borderRadius: 8, backgroundColor: '#d4edda' }}>
                <CheckCircle size={20} color="#28a745" className="me-2" />
                <span style={{ color: '#155724' }}>{currentRegistration.fullName}</span>
              </div>
            </div>

            {/* Address */}
            <div className="mb-3">
              <h5>Dirección</h5>
              <div style={{ padding: 12, border: '2px solid #28a745', borderRadius: 8, backgroundColor: '#d4edda' }}>
                <CheckCircle size={20} color="#28a745" className="me-2" />
                <span style={{ color: '#155724' }}>{currentRegistration.address}</span>
              </div>
            </div>

            {/* Phone */}
            <div className="mb-3">
              <h5>Teléfono</h5>
              <div style={{ padding: 12, border: '2px solid #28a745', borderRadius: 8, backgroundColor: '#d4edda' }}>
                <CheckCircle size={20} color="#28a745" className="me-2" />
                <span style={{ color: '#155724' }}>{currentRegistration.phone}</span>
              </div>
            </div>

            {/* Emergency Contact */}
            <div className="mb-3">
              <h5>Contacto de Emergencia</h5>
              <div style={{ padding: 12, border: '2px solid #28a745', borderRadius: 8, backgroundColor: '#d4edda' }}>
                <CheckCircle size={20} color="#28a745" className="me-2" />
                <span style={{ color: '#155724' }}>{currentRegistration.emergencyContact}</span>
              </div>
            </div>

            {/* Emergency Phone */}
            <div className="mb-4">
              <h5>Teléfono de Emergencia</h5>
              <div style={{ padding: 12, border: '2px solid #28a745', borderRadius: 8, backgroundColor: '#d4edda' }}>
                <CheckCircle size={20} color="#28a745" className="me-2" />
                <span style={{ color: '#155724' }}>{currentRegistration.emergencyPhone}</span>
              </div>
            </div>

            <Row className="g-3">
              <Col xs={6}>
                <Button
                  variant="outline-primary"
                  size="lg"
                  className="w-100"
                  onClick={() => navigate('/parking/user')}
                >
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

            {/* DPI */}
            <Form.Group className="mb-3">
              <Form.Label>Número de DPI *</Form.Label>
              <Form.Control
                type="text"
                placeholder="XXXX XXXXX XXXX"
                value={formData.dpi}
                onChange={(e) => setFormData({ ...formData, dpi: e.target.value })}
                maxLength={20}
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

            {/* Address */}
            <Form.Group className="mb-3">
              <Form.Label>Dirección *</Form.Label>
              <Form.Control
                type="text"
                placeholder="Zona 1, Guatemala, Guatemala"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              />
            </Form.Group>

            {/* Phone */}
            <Form.Group className="mb-3">
              <Form.Label>Teléfono *</Form.Label>
              <Form.Control
                type="text"
                placeholder="5555-5555"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
            </Form.Group>

            {/* Emergency Contact */}
            <Form.Group className="mb-3">
              <Form.Label>Contacto de Emergencia *</Form.Label>
              <Form.Control
                type="text"
                placeholder="María Pérez"
                value={formData.emergencyContact}
                onChange={(e) => setFormData({ ...formData, emergencyContact: e.target.value })}
              />
            </Form.Group>

            {/* Emergency Phone */}
            <Form.Group className="mb-4">
              <Form.Label>Teléfono de Emergencia *</Form.Label>
              <Form.Control
                type="text"
                placeholder="5555-5555"
                value={formData.emergencyPhone}
                onChange={(e) => setFormData({ ...formData, emergencyPhone: e.target.value })}
              />
            </Form.Group>

            <Row className="g-3">
              <Col xs={6}>
                <Button
                  variant="outline-primary"
                  size="lg"
                  className="w-100"
                  onClick={() => navigate('/parking/user')}
                >
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
