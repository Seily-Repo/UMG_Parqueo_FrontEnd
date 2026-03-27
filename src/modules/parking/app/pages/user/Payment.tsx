import { useState } from 'react';
import { useNavigate } from 'react-router';
import { useRegistration } from '../../context/RegistrationContext';
import { Card, Form, Button, Row, Col, Alert } from 'react-bootstrap';
import { CreditCard, ArrowLeft, DollarSign } from 'lucide-react';
import { toast } from 'react-toastify';

export function Payment() {
  const navigate = useNavigate();
  const { currentRegistration, updateRegistration } = useRegistration();
  
  // Calculate amount based on parking plan
  const getAmount = () => {
    switch (currentRegistration.parkingPlan) {
      case 'entre-semana':
        return 200;
      case 'sabado':
        return 80;
      case 'domingo':
        return 50;
      default:
        return 0;
    }
  };

  const amount = getAmount();

  const [formData, setFormData] = useState({
    cardHolder: currentRegistration.cardHolder || '',
    cardNumber: currentRegistration.cardNumber || '',
    expiryDate: currentRegistration.expiryDate || '',
    cvv: currentRegistration.cvv || '',
  });

  const formatCardNumber = (value: string) => {
    const cleaned = value.replace(/\s/g, '');
    const formatted = cleaned.match(/.{1,4}/g)?.join(' ') || cleaned;
    return formatted.substring(0, 19); // 16 digits + 3 spaces
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
      toast.error('Número de tarjeta inválido');
      return;
    }

    if (formData.cvv.length !== 3) {
      toast.error('CVV inválido');
      return;
    }

    updateRegistration({ ...formData, amount });
    navigate('/parking/user/firma');
  };

  const getPlanLabel = () => {
    switch (currentRegistration.parkingPlan) {
      case 'entre-semana':
        return 'Entre Semana (Lunes a Viernes)';
      case 'sabado':
        return 'Sábado';
      case 'domingo':
        return 'Domingo';
      default:
        return '';
    }
  };

  return (
    <div style={{ maxWidth: 700, margin: '0 auto' }}>
      <Card className="shadow-sm">
        <Card.Header className="bg-white border-bottom">
          <Card.Title className="mb-1 h4">Información de Pago</Card.Title>
          <Card.Subtitle className="text-muted">
            Complete los datos de su tarjeta para procesar el pago
          </Card.Subtitle>
        </Card.Header>
        <Card.Body className="p-4">
          <Form onSubmit={handleSubmit}>
            {/* Payment Summary */}
            <div 
              className="p-4 rounded mb-4 text-white"
              style={{ 
                background: 'linear-gradient(135deg, #1976d2 0%, #7e57c2 100%)'
              }}
            >
              <div className="d-flex align-items-center gap-2 mb-3" style={{ opacity: 0.9 }}>
                <DollarSign size={16} />
                <small>Resumen de Pago</small>
              </div>
              <Row>
                <Col>
                  <div>
                    <small style={{ opacity: 0.9 }}>Plan seleccionado</small>
                    <div className="fw-medium">{getPlanLabel()}</div>
                    <small style={{ opacity: 0.9 }} className="mt-2 d-block">
                      {currentRegistration.vehicles?.length || 0} vehículo(s) registrado(s)
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

            {/* Card Holder Name */}
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

            {/* Card Number */}
            <Form.Group className="mb-3">
              <Form.Label>Número de Tarjeta *</Form.Label>
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
                    color: '#6c757d'
                  }} 
                />
              </div>
            </Form.Group>

            {/* Expiry and CVV */}
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
                <strong>Nota:</strong> Esta es una simulación de pago. No se realizará ningún cargo real.
              </small>
            </Alert>

            <Row className="g-3">
              <Col xs={6}>
                <Button
                  variant="outline-secondary"
                  size="lg"
                  className="w-100"
                  onClick={() => navigate('/parking/user/vehiculos')}
                >
                  <ArrowLeft size={16} className="me-2" />
                  Atrás
                </Button>
              </Col>
              <Col xs={6}>
                <Button variant="primary" type="submit" size="lg" className="w-100">
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
