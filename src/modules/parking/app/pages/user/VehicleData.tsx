import { useState } from 'react';
import { useNavigate } from 'react-router';
import { useRegistration, Vehicle } from '../../context/RegistrationContext';
import { Card, Form, Button, Row, Col, Badge } from 'react-bootstrap';
import { Plus, Trash2, ArrowLeft, Car, CheckCircle } from 'lucide-react';
import { toast } from 'react-toastify';
import { getGuatemalaPlateExample, validateGuatemalaPlate } from '../../utils/plateValidation';

export function VehicleData() {
  const navigate = useNavigate();
  const { currentRegistration, updateRegistration } = useRegistration();
  const [vehicles, setVehicles] = useState<Vehicle[]>(currentRegistration.vehicles || []);
  const [currentVehicle, setCurrentVehicle] = useState({
    color: '',
    brand: '',
    model: '',
    plate: '',
  });

  const currentVehicleType = currentRegistration.vehicleType || 'carro';

  const handleAddVehicle = () => {
    if (!currentVehicle.color || !currentVehicle.brand || !currentVehicle.model || !currentVehicle.plate) {
      toast.error('Por favor complete todos los campos del vehículo');
      return;
    }

    const plateValidation = validateGuatemalaPlate(currentVehicle.plate, currentVehicleType);
    if (!plateValidation.isValid) {
      toast.error(
        `La placa no cumple el formato de Guatemala para ${currentVehicleType === 'carro' ? 'carro' : 'moto'}. Ejemplo: ${getGuatemalaPlateExample(currentVehicleType)}`
      );
      return;
    }

    if (vehicles.length >= 3) {
      toast.error('Solo puede registrar hasta 3 vehículos');
      return;
    }

    const newVehicle: Vehicle = {
      id: Date.now().toString(),
      ...currentVehicle,
      plate: plateValidation.normalizedPlate,
    };

    setVehicles([...vehicles, newVehicle]);
    setCurrentVehicle({ color: '', brand: '', model: '', plate: '' });
    toast.success('Vehículo agregado exitosamente');
  };

  const handleRemoveVehicle = (id: string) => {
    setVehicles(vehicles.filter((v) => v.id !== id));
    toast.success('Vehículo eliminado');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (vehicles.length === 0) {
      toast.error('Debe agregar al menos un vehículo');
      return;
    }

    updateRegistration({ vehicles });
    navigate('/parking/user/pago');
  };

  if (currentRegistration.vehicles && currentRegistration.vehicles.length > 0) {
    return (
      <div style={{ maxWidth: 700, margin: '0 auto' }}>
        <Card className="shadow-sm">
          <Card.Header className="bg-white border-bottom">
            <Card.Title className="mb-1 h4">Verificación de Vehículos</Card.Title>
            <Card.Subtitle className="text-muted">
              Confirme sus vehículos registrados
            </Card.Subtitle>
          </Card.Header>
          <Card.Body className="p-4">
            <div className="d-flex flex-column gap-3">
              {currentRegistration.vehicles.map((vehicle) => (
                <div
                  key={vehicle.id}
                  className="d-flex align-items-center justify-content-between p-3 border rounded"
                  style={{ backgroundColor: '#e3f2fd', borderColor: '#1976d2' }}
                >
                  <div className="d-flex align-items-center gap-3">
                    <CheckCircle size={24} color="#1976d2" />
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
                      <div className="fw-semibold" style={{ color: '#0d47a1' }}>{vehicle.plate}</div>
                      <small style={{ color: '#0d47a1' }}>
                        {vehicle.color} - {vehicle.brand} {vehicle.model}
                      </small>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <Row className="g-3 mt-4">
              <Col xs={6}>
                <Button
                  variant="outline-primary"
                  size="lg"
                  className="w-100 d-flex align-items-center justify-content-center"
                  onClick={() => navigate('/parking/user/datos-personales')}
                >
                  <ArrowLeft size={16} className="me-2" />
                  Atrás
                </Button>
              </Col>
              <Col xs={6}>
                <Button variant="primary" size="lg" className="w-100" onClick={() => navigate('/parking/user/pago')}>
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
      <Card className="shadow-sm mb-4">
        <Card.Header className="bg-white border-bottom">
          <Card.Title className="mb-1 h4">Información de Vehículos</Card.Title>
          <Card.Subtitle className="text-muted">
            Registre sus vehículos (máximo 3)
          </Card.Subtitle>
        </Card.Header>
        <Card.Body className="p-4">
          <Row className="g-3 mb-3">
            <Col md={6}>
              <Form.Group>
                <Form.Label>Color</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Blanco"
                  value={currentVehicle.color}
                  onChange={(e) => setCurrentVehicle({ ...currentVehicle, color: e.target.value })}
                />
              </Form.Group>
            </Col>

            <Col md={6}>
              <Form.Group>
                <Form.Label>Marca</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Toyota"
                  value={currentVehicle.brand}
                  onChange={(e) => setCurrentVehicle({ ...currentVehicle, brand: e.target.value })}
                />
              </Form.Group>
            </Col>

            <Col md={6}>
              <Form.Group>
                <Form.Label>Modelo</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Corolla"
                  value={currentVehicle.model}
                  onChange={(e) => setCurrentVehicle({ ...currentVehicle, model: e.target.value })}
                />
              </Form.Group>
            </Col>

            <Col md={6}>
              <Form.Group>
                <Form.Label>Número de Placa</Form.Label>
                <Form.Control
                  type="text"
                  placeholder={currentVehicleType === 'moto' ? 'M123ABC' : 'P123ABC'}
                  style={{ textTransform: 'uppercase' }}
                  value={currentVehicle.plate}
                  onChange={(e) => setCurrentVehicle({ ...currentVehicle, plate: e.target.value.toUpperCase() })}
                />
                <Form.Text className="text-muted">
                  Formato válido: {getGuatemalaPlateExample(currentVehicleType)}
                </Form.Text>
              </Form.Group>
            </Col>
          </Row>

          <Button
            variant="outline-primary"
            className="w-100"
            onClick={handleAddVehicle}
            disabled={vehicles.length >= 3}
          >
            <Plus size={16} className="me-2" />
            Agregar Vehículo ({vehicles.length}/3)
          </Button>
        </Card.Body>
      </Card>

      {vehicles.length > 0 && (
        <Card className="shadow-sm mb-4">
          <Card.Header className="bg-white border-bottom">
            <Card.Title className="mb-0">Vehículos Registrados</Card.Title>
          </Card.Header>
          <Card.Body className="p-3">
            <div className="d-flex flex-column gap-3">
              {vehicles.map((vehicle) => (
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
                      <div className="fw-semibold">{vehicle.plate}</div>
                      <small className="text-muted">
                        {vehicle.color} - {vehicle.brand} {vehicle.model}
                      </small>
                    </div>
                  </div>
                  <Button
                    variant="link"
                    size="sm"
                    className="text-danger"
                    onClick={() => handleRemoveVehicle(vehicle.id)}
                  >
                    <Trash2 size={16} />
                  </Button>
                </div>
              ))}
            </div>
          </Card.Body>
        </Card>
      )}

      <Form onSubmit={handleSubmit}>
        <Row className="g-3">
          <Col xs={6}>
            <Button
              variant="outline-secondary"
              size="lg"
              className="w-100 d-flex align-items-center justify-content-center"
              onClick={() => navigate('/parking/user/datos-personales')}
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
    </div>
  );
}
