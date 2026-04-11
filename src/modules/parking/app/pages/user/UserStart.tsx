import { useState } from 'react';
import { useNavigate } from 'react-router';
import { useRegistration } from '../../context/RegistrationContext';
import { Card, Form, Button, Row, Col } from 'react-bootstrap';
import { Car, Bike, Calendar, CheckCircle } from 'lucide-react';
import { toast } from 'react-toastify';

export function UserStart() {
  const navigate = useNavigate();
  const { updateRegistration, currentRegistration } = useRegistration();
  
  const [formData, setFormData] = useState({
    vehicleType: currentRegistration.vehicleType || ('carro' as 'moto' | 'carro'),
    parkingPlan: currentRegistration.parkingPlan || ('entre-semana' as 'entre-semana' | 'sabado' | 'domingo'),
    plate: currentRegistration.vehicles?.[0]?.plate || '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.plate.trim()) {
      toast.error('Por favor ingrese el número de placa');
      return;
    }

    const newVehicle = {
      id: Date.now().toString(),
      color: 'N/A',
      brand: 'N/A',
      model: 'N/A',
      plate: formData.plate.toUpperCase(),
    };

    updateRegistration({ vehicleType: formData.vehicleType, parkingPlan: formData.parkingPlan, vehicles: [newVehicle] });
    navigate('/parking/user/pago');
  };

  const vehicleTypes = [
    { value: 'moto', label: 'Moto', icon: Bike },
    { value: 'carro', label: 'Carro', icon: Car },
  ] as const;

  const parkingPlans = [
    { value: 'entre-semana', label: 'Entre Semana', price: 'Q600/mes', days: 'Lunes a Viernes' },
    { value: 'sabado', label: 'Sábado', price: 'Q600/mes', days: 'Solo Sábados' },
    { value: 'domingo', label: 'Domingo', price: 'Q600/mes', days: 'Solo Domingos' },
  ] as const;

  // Si hay datos simulados, mostrar en modo verificación
  if (currentRegistration.vehicleType && currentRegistration.parkingPlan) {
    const selectedVehicle = vehicleTypes.find(v => v.value === currentRegistration.vehicleType);
    const selectedPlan = parkingPlans.find(p => p.value === currentRegistration.parkingPlan);
    const VehicleIcon = selectedVehicle?.icon || Car;

    return (
      <div style={{ maxWidth: 700, margin: '0 auto' }}>
        <Card className="shadow-sm">
          <Card.Header className="bg-white border-bottom">
            <Card.Title className="mb-1 h4">Verificación de Registro</Card.Title>
            <Card.Subtitle className="text-muted">
              Confirme sus datos de registro
            </Card.Subtitle>
          </Card.Header>
          <Card.Body className="p-4">
            {/* Vehicle Type */}
            <div className="mb-4">
              <h5 className="mb-3">Tipo de Vehículo</h5>
              <div
                style={{
                  padding: 16,
                  border: '2px solid #1976d2',
                  borderRadius: 8,
                  backgroundColor: '#e3f2fd',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 16
                }}
              >
                <CheckCircle size={24} color="#1976d2" />
                <VehicleIcon size={32} color="#1976d2" />
                <span style={{ fontWeight: 500, color: '#0d47a1' }}>
                  {selectedVehicle?.label}
                </span>
              </div>
            </div>

            {/* Plate Verification */}
            <div className="mb-4">
              <h5 className="mb-3">Número de Placa</h5>
              <div style={{ padding: 16, border: '2px solid #1976d2', borderRadius: 8, backgroundColor: '#e3f2fd', display: 'flex', alignItems: 'center', gap: 16 }}>
                <CheckCircle size={24} color="#1976d2" />
                <span style={{ fontWeight: 500, color: '#0d47a1', fontSize: '1.1rem' }}>
                  {currentRegistration.vehicles?.[0]?.plate}
                </span>
              </div>
            </div>

            {/* Parking Plan */}
            <div className="mb-4">
              <h5 className="mb-3">Plan de Parqueo</h5>
              <div
                style={{
                  padding: 16,
                  border: '2px solid #1976d2',
                  borderRadius: 8,
                  backgroundColor: '#e3f2fd',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}
              >
                <div className="d-flex align-items-center gap-3">
                  <CheckCircle size={20} color="#1976d2" />
                  <Calendar size={20} color="#1976d2" />
                  <div>
                    <div style={{ fontWeight: 500, color: '#0d47a1' }}>
                      {selectedPlan?.label}
                    </div>
                    <small style={{ color: '#0d47a1' }}>{selectedPlan?.days}</small>
                  </div>
                </div>
                <div className="text-end">
                  <div style={{ fontWeight: 600, color: '#0d47a1' }}>
                    {selectedPlan?.price}
                  </div>
                </div>
              </div>
            </div>

            <Button variant="primary" size="lg" className="w-100" onClick={() => navigate('/parking/user/pago')}>
              Continuar
            </Button>
          </Card.Body>
        </Card>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 700, margin: '0 auto' }}>
      <Card className="shadow-sm">
        <Card.Header className="bg-white border-bottom">
          <Card.Title className="mb-1 h4">Registro de Parqueo</Card.Title>
          <Card.Subtitle className="text-muted">
            Ingrese sus datos para comenzar el proceso de registro
          </Card.Subtitle>
        </Card.Header>
        <Card.Body className="p-4">
          <Form onSubmit={handleSubmit}>
            {/* Vehicle Type */}
            <Form.Group className="mb-4">
              <Form.Label>Tipo de Vehículo *</Form.Label>
              <Row className="g-3">
                {vehicleTypes.map((type) => {
                  const Icon = type.icon;
                  const isSelected = formData.vehicleType === type.value;
                  return (
                    <Col xs={6} key={type.value}>
                      <div
                        onClick={() => setFormData({ ...formData, vehicleType: type.value })}
                        style={{
                          padding: 16,
                          border: `2px solid ${isSelected ? '#1976d2' : '#dee2e6'}`,
                          borderRadius: 8,
                          backgroundColor: isSelected ? '#e3f2fd' : 'white',
                          cursor: 'pointer',
                          transition: 'all 0.3s',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 16
                        }}
                      >
                        <Form.Check
                          type="radio"
                          name="vehicleType"
                          checked={isSelected}
                          onChange={() => {}}
                          style={{ marginTop: 0 }}
                        />
                        <Icon size={32} color={isSelected ? '#1976d2' : '#6c757d'} />
                        <span style={{ fontWeight: 500, color: isSelected ? '#1976d2' : '#212529' }}>
                          {type.label}
                        </span>
                      </div>
                    </Col>
                  );
                })}
              </Row>
            </Form.Group>

            {/* Plate Input */}
            <Form.Group className="mb-4">
              <Form.Label>Número de Placa *</Form.Label>
              <Form.Control
                type="text"
                placeholder="Ej. P-123ABC"
                style={{ textTransform: 'uppercase', padding: '12px' }}
                value={formData.plate}
                onChange={(e) => setFormData({ ...formData, plate: e.target.value.toUpperCase() })}
              />
            </Form.Group>

            {/* Parking Plan */}
            <Form.Group className="mb-4">
              <Form.Label>Plan de Parqueo *</Form.Label>
              <div className="d-flex flex-column gap-3">
                {parkingPlans.map((plan) => {
                  const isSelected = formData.parkingPlan === plan.value;
                  return (
                    <div
                      key={plan.value}
                      onClick={() => setFormData({ ...formData, parkingPlan: plan.value })}
                      style={{
                        padding: 16,
                        border: `2px solid ${isSelected ? '#1976d2' : '#dee2e6'}`,
                        borderRadius: 8,
                        backgroundColor: isSelected ? '#e3f2fd' : 'white',
                        cursor: 'pointer',
                        transition: 'all 0.3s',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                      }}
                    >
                      <div className="d-flex align-items-center gap-3">
                        <Form.Check
                          type="radio"
                          name="parkingPlan"
                          checked={isSelected}
                          onChange={() => {}}
                        />
                        <Calendar size={20} color={isSelected ? '#1976d2' : '#6c757d'} />
                        <div>
                          <div style={{ fontWeight: 500, color: isSelected ? '#1976d2' : '#212529' }}>
                            {plan.label}
                          </div>
                          <small className="text-muted">{plan.days}</small>
                        </div>
                      </div>
                      <div className="text-end">
                        <div style={{ fontWeight: 600, color: isSelected ? '#1976d2' : '#212529' }}>
                          {plan.price}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </Form.Group>

            <Button variant="primary" type="submit" size="lg" className="w-100">
              Continuar
            </Button>
          </Form>
        </Card.Body>
      </Card>
    </div>
  );
}
