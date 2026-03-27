import { Outlet, useLocation, useNavigate } from 'react-router';
import { Container, Button, ProgressBar } from 'react-bootstrap';
import { GraduationCap, ArrowLeft } from 'lucide-react';

export function UserLayout() {
  const location = useLocation();
  const navigate = useNavigate();

  const steps = [
    { path: '/parking/user', label: 'Inicio' },
    { path: '/parking/user/datos-personales', label: 'Datos Personales' },
    { path: '/parking/user/vehiculos', label: 'Vehículos' },
    { path: '/parking/user/pago', label: 'Pago' },
    { path: '/parking/user/firma', label: 'Firma' },
  ];

  const currentStepIndex = steps.findIndex((step) => step.path === location.pathname);

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #e3f2fd 0%, #ffffff 50%, #ede7f6 100%)' }}>
      {/* Header */}
      <div style={{ borderBottom: '1px solid #dee2e6', backgroundColor: 'rgba(255, 255, 255, 0.9)', position: 'sticky', top: 0, zIndex: 1000 }}>
        <Container>
          <div className="d-flex align-items-center justify-content-between py-3">
            <div className="d-flex align-items-center gap-3">
              <div style={{ width: 40, height: 40, backgroundColor: '#1976d2', borderRadius: 8 }} className="d-flex align-items-center justify-content-center">
                <GraduationCap size={24} color="white" />
              </div>
              <div>
                <h5 className="mb-0 fw-bold">Universidad Nacional</h5>
                <small className="text-muted">Registro de Parqueo</small>
              </div>
            </div>
            <Button variant="ghost" size="sm" onClick={() => navigate('/parking')}>
              <ArrowLeft size={16} className="me-2" />
              Salir
            </Button>
          </div>
        </Container>
      </div>

      {/* Progress Steps */}
      {currentStepIndex !== -1 && location.pathname !== '/parking/user/confirmacion' && (
        <div style={{ backgroundColor: 'white', borderBottom: '1px solid #dee2e6' }}>
          <Container className="py-4">
            <div className="d-flex align-items-center justify-content-between">
              {steps.map((step, index) => (
                <div key={step.path} className="d-flex align-items-center" style={{ flex: 1 }}>
                  <div className="d-flex flex-column align-items-center" style={{ flex: 1 }}>
                    <div
                      style={{
                        width: 32,
                        height: 32,
                        borderRadius: '50%',
                        backgroundColor: index <= currentStepIndex ? '#1976d2' : '#dee2e6',
                        color: index <= currentStepIndex ? 'white' : '#6c757d',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: 14,
                        fontWeight: 500,
                        transition: 'all 0.3s'
                      }}
                    >
                      {index + 1}
                    </div>
                    <span
                      className="mt-2 text-center"
                      style={{
                        fontSize: 12,
                        color: index <= currentStepIndex ? '#1976d2' : '#6c757d',
                        fontWeight: index <= currentStepIndex ? 500 : 400
                      }}
                    >
                      {step.label}
                    </span>
                  </div>
                  {index < steps.length - 1 && (
                    <div
                      style={{
                        height: 2,
                        flex: 1,
                        backgroundColor: index < currentStepIndex ? '#1976d2' : '#dee2e6',
                        marginBottom: 30,
                        marginLeft: 8,
                        marginRight: 8,
                        transition: 'all 0.3s'
                      }}
                    />
                  )}
                </div>
              ))}
            </div>
          </Container>
        </div>
      )}

      {/* Main Content */}
      <Container className="py-4">
        <Outlet />
      </Container>
    </div>
  );
}
