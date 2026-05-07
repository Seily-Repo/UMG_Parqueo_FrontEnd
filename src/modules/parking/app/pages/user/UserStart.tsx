import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router';
import { useRegistration } from '../../context/RegistrationContext';
import { Card, Form, Button, Row, Col, Alert, Spinner } from 'react-bootstrap';
import { Car, Bike, Calendar, CheckCircle, CreditCard, WalletCards } from 'lucide-react';
import { toast } from 'react-toastify';
import { getReadableApiError } from '../../../../../shared/api';
import type { BackendPago, BackendPlanParqueo } from '../../../../../shared/models/backend';
import { parkingPlanService, paymentService } from '../../../../../shared/services';
import { getGuatemalaPlateExample, validateGuatemalaPlate } from '../../utils/plateValidation';

export function UserStart() {
  const navigate = useNavigate();
  const { updateRegistration, currentRegistration } = useRegistration();
  const [plans, setPlans] = useState<BackendPlanParqueo[]>([]);
  const [backendPayments, setBackendPayments] = useState<BackendPago[]>([]);
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

  useEffect(() => {
    if (!currentRegistration.carnet) {
      return;
    }

    let isMounted = true;

    const loadPayments = async () => {
      try {
        const response = await paymentService.getByCarne(currentRegistration.carnet || '');
        if (isMounted) {
          setBackendPayments(response);
        }
      } catch {
        if (isMounted) {
          setBackendPayments([]);
        }
      }
    };

    void loadPayments();

    return () => {
      isMounted = false;
    };
  }, [currentRegistration.carnet]);

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
  const firstName = (currentRegistration.fullName || 'Cristian Estrada').split(' ')[0] || 'Usuario';
  const registeredVehicles = currentRegistration.vehicles?.length || 0;
  const hasAcceptedPayment = backendPayments.some((payment) => payment.PAG_ESTADO === 'A' && !payment.MUL_MULTA);
  const hasBackendPayment = backendPayments.some((payment) => !payment.MUL_MULTA);
  const paymentStatus = hasAcceptedPayment || currentRegistration.paymentStatus === 'paid'
    ? 'Pagado'
    : hasBackendPayment
      ? 'En proceso'
      : 'Pendiente';

  const dashboardHeader = (
    <>
      <h1 className="parking-user-greeting">Buenas tardes, {firstName}</h1>
      <div className="parking-dashboard-grid">
        <Card className="parking-dashboard-stat">
          <Card.Body>
            <div className="parking-dashboard-stat__icon">
              <Car size={34} />
            </div>
            <div>
              <span>VEHICULOS</span>
              <strong>{registeredVehicles || 1}</strong>
            </div>
          </Card.Body>
        </Card>

        <Card className="parking-dashboard-stat">
          <Card.Body>
            <div className="parking-dashboard-stat__icon">
              <WalletCards size={34} />
            </div>
            <div>
              <span>ESTADO DE PAGO</span>
              <strong className={paymentStatus === 'Pendiente' ? 'parking-dashboard-stat__danger' : ''}>
                {paymentStatus}
              </strong>
            </div>
          </Card.Body>
        </Card>

        <Card className="parking-dashboard-cta">
          <Card.Body>
            <div className="d-flex align-items-center gap-2 mb-2">
              <Car size={25} />
              <h2>Nuevo Vehiculo?</h2>
            </div>
            <p>Registra tu placa y modelo para habilitar tu acceso.</p>
            <Button variant="light" onClick={() => navigate('/parking/user/vehiculos')}>
              Registrar ahora →
            </Button>
          </Card.Body>
        </Card>
      </div>
    </>
  );

  if (currentRegistration.vehicleType && currentRegistration.parkingPlan) {
    const selectedVehicle = vehicleTypes.find((v) => v.value === currentRegistration.vehicleType);
    const VehicleIcon = selectedVehicle?.icon || Car;

    return (
      <div className="parking-user-view">
        {dashboardHeader}
        <Card className="parking-dashboard-panel">
          <Card.Header>
            <div className="d-flex align-items-center justify-content-between flex-wrap gap-3">
              <div>
                <Card.Title className="mb-1 h4">Verificacion de Registro</Card.Title>
                <Card.Subtitle className="text-muted">Confirme sus datos de registro</Card.Subtitle>
              </div>
            </div>
          </Card.Header>
          <Card.Body>
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
              <CreditCard size={18} className="me-2" />
              Continuar
            </Button>
          </Card.Body>
        </Card>
      </div>
    );
  }

  return (
    <div className="parking-user-view">
      {dashboardHeader}
      <Card className="parking-dashboard-panel">
        <Card.Header>
          <div className="d-flex align-items-center justify-content-between flex-wrap gap-3">
            <div>
              <Card.Title className="mb-1 h4">Registro de Parqueo</Card.Title>
              <Card.Subtitle className="text-muted">
                Ingrese sus datos para comenzar el proceso de registro
              </Card.Subtitle>
            </div>
          </div>
        </Card.Header>
        <Card.Body>
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
