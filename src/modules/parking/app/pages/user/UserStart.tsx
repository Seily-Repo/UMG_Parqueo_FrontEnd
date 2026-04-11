import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router';
import { useRegistration } from '../../context/RegistrationContext';
import { Card, Form, Button, Row, Col, Alert, Spinner } from 'react-bootstrap';
import { Car, Bike, Calendar, CheckCircle, ArrowLeft } from 'lucide-react';
import { toast } from 'react-toastify';
import { getReadableApiError } from '../../../../../shared/api';
import type { BackendPlanParqueo } from '../../../../../shared/models/backend';
import { parkingPlanService } from '../../../../../shared/services';
import { getGuatemalaPlateExample, validateGuatemalaPlate } from '../../utils/plateValidation';

export function UserStart() {
  const navigate = useNavigate();
  const { updateRegistration, currentRegistration } = useRegistration();
  const [plans, setPlans] = useState<BackendPlanParqueo[]>([]);
  const [loadingPlans, setLoadingPlans] = useState(true);
  const [plansError, setPlansError] = useState('');
  const [formData, setFormData] = useState({
    vehicleType: currentRegistration.vehicleType || ('carro' as 'moto' | 'carro'),
    selectedPlanId: currentRegistration.selectedPlanId || 0,
    plate: currentRegistration.vehicles?.[0]?.plate || '',
  });

  useEffect(() => {
    let isMounted = true;

    const loadPlans = async () => {
      setLoadingPlans(true);
      setPlansError('');

      try {
        const response = await parkingPlanService.getAll();

        if (!isMounted) return;

        setPlans(response);

        if (!formData.selectedPlanId && response.length > 0) {
          setFormData((prev) => ({
            ...prev,
            selectedPlanId: response[0].PLA_id_plan_parqueo,
          }));
        }
      } catch (requestError) {
        if (!isMounted) return;
        setPlansError(getReadableApiError(requestError, 'No fue posible cargar los planes de parqueo.'));
      } finally {
        if (isMounted) setLoadingPlans(false);
      }
    };

    void loadPlans();

    return () => {
      isMounted = false;
    };
  }, []);

  const selectedPlan = useMemo(
    () => plans.find((plan) => plan.PLA_id_plan_parqueo === formData.selectedPlanId),
    [formData.selectedPlanId, plans]
  );

  const currentSelectedPlan = useMemo(() => {
    if (currentRegistration.selectedPlanId) {
      return plans.find((plan) => plan.PLA_id_plan_parqueo === currentRegistration.selectedPlanId);
    }

    return plans.find((plan) => plan.PLA_nombre === currentRegistration.parkingPlan);
  }, [currentRegistration.parkingPlan, currentRegistration.selectedPlanId, plans]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.plate.trim()) {
      toast.error('Por favor ingrese el numero de placa');
      return;
    }

    const plateValidation = validateGuatemalaPlate(formData.plate, formData.vehicleType);
    if (!plateValidation.isValid) {
      toast.error(
        `La placa no cumple el formato de Guatemala para ${formData.vehicleType === 'carro' ? 'carro' : 'moto'}. Ejemplo: ${getGuatemalaPlateExample(formData.vehicleType)}`
      );
      return;
    }

    if (!selectedPlan) {
      toast.error('Seleccione un plan de parqueo');
      return;
    }

    if (currentRegistration.isDelinquent) {
      toast.error(currentRegistration.delinquentReason || 'Tiene una restriccion activa y no puede continuar al pago.');
      return;
    }

    updateRegistration({
      vehicleType: formData.vehicleType,
      parkingPlan: selectedPlan.PLA_nombre,
      selectedPlanId: selectedPlan.PLA_id_plan_parqueo,
      amount: Number(selectedPlan.PLA_precio) || 0,
      vehicles: [
        {
          id: Date.now().toString(),
          color: 'N/A',
          brand: 'N/A',
          model: 'N/A',
          plate: plateValidation.normalizedPlate,
        },
      ],
    });

    navigate('/parking/user/pago');
  };

  const vehicleTypes = [
    { value: 'moto', label: 'Moto', icon: Bike },
    { value: 'carro', label: 'Carro', icon: Car },
  ] as const;

  if (currentRegistration.vehicleType && currentRegistration.parkingPlan) {
    const selectedVehicle = vehicleTypes.find((v) => v.value === currentRegistration.vehicleType);
    const VehicleIcon = selectedVehicle?.icon || Car;

    return (
      <div style={{ maxWidth: 700, margin: '0 auto' }}>
        <Card className="shadow-sm">
          <Card.Header className="bg-white border-bottom">
            <div className="d-flex align-items-center justify-content-between flex-wrap gap-3">
              <div>
                <Card.Title className="mb-1 h4">Verificacion de Registro</Card.Title>
                <Card.Subtitle className="text-muted">Confirme sus datos de registro</Card.Subtitle>
              </div>
              <Button variant="outline-secondary" onClick={() => navigate('/parking')}>
                <ArrowLeft size={16} className="me-2" />
                Volver
              </Button>
            </div>
          </Card.Header>
          <Card.Body className="p-4">
            <div className="mb-4">
              <h5 className="mb-3">Tipo de Vehiculo</h5>
              <div
                style={{
                  padding: 16,
                  border: '2px solid #1976d2',
                  borderRadius: 8,
                  backgroundColor: '#e3f2fd',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 16,
                }}
              >
                <CheckCircle size={24} color="#1976d2" />
                <VehicleIcon size={32} color="#1976d2" />
                <span style={{ fontWeight: 500, color: '#0d47a1' }}>{selectedVehicle?.label}</span>
              </div>
            </div>

            <div className="mb-4">
              <h5 className="mb-3">Numero de Placa</h5>
              <div
                style={{
                  padding: 16,
                  border: '2px solid #1976d2',
                  borderRadius: 8,
                  backgroundColor: '#e3f2fd',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 16,
                }}
              >
                <CheckCircle size={24} color="#1976d2" />
                <span style={{ fontWeight: 500, color: '#0d47a1', fontSize: '1.1rem' }}>
                  {currentRegistration.vehicles?.[0]?.plate}
                </span>
              </div>
            </div>

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
                  alignItems: 'center',
                }}
              >
                <div className="d-flex align-items-center gap-3">
                  <CheckCircle size={20} color="#1976d2" />
                  <Calendar size={20} color="#1976d2" />
                  <div>
                    <div style={{ fontWeight: 500, color: '#0d47a1' }}>
                      {currentSelectedPlan?.PLA_nombre || currentRegistration.parkingPlan}
                    </div>
                    <small style={{ color: '#0d47a1' }}>
                      {currentSelectedPlan?.PLA_descripcion || 'Plan cargado desde el sistema'}
                    </small>
                  </div>
                </div>
                <div className="text-end">
                  <div style={{ fontWeight: 600, color: '#0d47a1' }}>
                    Q{currentRegistration.amount || currentSelectedPlan?.PLA_precio || 0}/mes
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
          <div className="d-flex align-items-center justify-content-between flex-wrap gap-3">
            <div>
              <Card.Title className="mb-1 h4">Registro de Parqueo</Card.Title>
              <Card.Subtitle className="text-muted">
                Ingrese sus datos para comenzar el proceso de registro
              </Card.Subtitle>
            </div>
            <Button variant="outline-secondary" onClick={() => navigate('/parking')}>
              <ArrowLeft size={16} className="me-2" />
              Volver
            </Button>
          </div>
        </Card.Header>
        <Card.Body className="p-4">
          {plansError && (
            <Alert variant="danger" className="mb-4">
              {plansError}
            </Alert>
          )}
          {currentRegistration.isDelinquent && (
            <Alert variant="warning" className="mb-4">
              Tiene una restriccion activa.
              {currentRegistration.delinquentReason ? ` Motivo: ${currentRegistration.delinquentReason}.` : ''}
              {' '}No podra continuar al pago hasta regularizar su estado.
            </Alert>
          )}

          {loadingPlans ? (
            <div className="text-center py-5">
              <Spinner animation="border" />
              <p className="text-muted mt-3 mb-0">Cargando planes de parqueo...</p>
            </div>
          ) : (
            <Form onSubmit={handleSubmit}>
              <Form.Group className="mb-4">
                <Form.Label>Tipo de Vehiculo *</Form.Label>
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
                            gap: 16,
                          }}
                        >
                          <Form.Check type="radio" name="vehicleType" checked={isSelected} onChange={() => {}} style={{ marginTop: 0 }} />
                          <Icon size={32} color={isSelected ? '#1976d2' : '#6c757d'} />
                          <span style={{ fontWeight: 500, color: isSelected ? '#1976d2' : '#212529' }}>{type.label}</span>
                        </div>
                      </Col>
                    );
                  })}
                </Row>
              </Form.Group>

              <Form.Group className="mb-4">
                <Form.Label>Numero de Placa *</Form.Label>
                <Form.Control
                  type="text"
                  placeholder={formData.vehicleType === 'carro' ? 'Ej. P123ABC' : 'Ej. M123ABC'}
                  style={{ textTransform: 'uppercase', padding: '12px' }}
                  value={formData.plate}
                  onChange={(e) => setFormData({ ...formData, plate: e.target.value.toUpperCase() })}
                />
                <Form.Text className="text-muted">
                  Formato valido: {getGuatemalaPlateExample(formData.vehicleType)}
                </Form.Text>
              </Form.Group>

              <Form.Group className="mb-4">
                <Form.Label>Plan de Parqueo *</Form.Label>
                <div className="d-flex flex-column gap-3">
                  {plans.map((plan) => {
                    const isSelected = formData.selectedPlanId === plan.PLA_id_plan_parqueo;
                    return (
                      <div
                        key={plan.PLA_id_plan_parqueo}
                        onClick={() => setFormData({ ...formData, selectedPlanId: plan.PLA_id_plan_parqueo })}
                        style={{
                          padding: 16,
                          border: `2px solid ${isSelected ? '#1976d2' : '#dee2e6'}`,
                          borderRadius: 8,
                          backgroundColor: isSelected ? '#e3f2fd' : 'white',
                          cursor: 'pointer',
                          transition: 'all 0.3s',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                        }}
                      >
                        <div className="d-flex align-items-center gap-3">
                          <Form.Check type="radio" name="parkingPlan" checked={isSelected} onChange={() => {}} />
                          <Calendar size={20} color={isSelected ? '#1976d2' : '#6c757d'} />
                          <div>
                            <div style={{ fontWeight: 500, color: isSelected ? '#1976d2' : '#212529' }}>{plan.PLA_nombre}</div>
                            <small className="text-muted">{plan.PLA_descripcion || 'Plan de parqueo disponible'}</small>
                          </div>
                        </div>
                        <div className="text-end">
                          <div style={{ fontWeight: 600, color: isSelected ? '#1976d2' : '#212529' }}>Q{plan.PLA_precio}/mes</div>
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
          )}
        </Card.Body>
      </Card>
    </div>
  );
}
