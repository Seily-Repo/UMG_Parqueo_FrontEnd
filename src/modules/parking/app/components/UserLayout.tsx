import { Outlet, useLocation, useNavigate } from 'react-router';
import { Container, Button } from 'react-bootstrap';
import { ArrowLeft } from 'lucide-react';
import { AppHeader } from './AppHeader';
import villanueva from '../../../../assets/villanueva.webp';

export function UserLayout() {
  const location = useLocation();
  const navigate = useNavigate();

  const steps = [
    { path: '/parking/user', label: 'Datos del vehiculo' },
    { path: '/parking/user/pago', label: 'Pago' },
    { path: '/parking/user/firma', label: 'Firma' },
  ];

  const currentStepIndex = steps.findIndex((step) => step.path === location.pathname);

  return (
    <div style={{
      minHeight: '100vh',
      backgroundImage: `linear-gradient(rgba(0,0,0,0.55), rgba(0,0,0,0.55)), url(${villanueva})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundAttachment: 'fixed',
    }}>
      <AppHeader
        subtitle="Registro de Parqueo"
        actions={
          <Button variant="ghost" size="sm" onClick={() => navigate('/parking')} style={{ padding: '6px 8px', color: 'white' }}>
            <ArrowLeft size={20} />
          </Button>
        }
      />

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
                        backgroundColor: index <= currentStepIndex ? '#C41230' : '#dee2e6',
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
                        color: index <= currentStepIndex ? '#C41230' : '#6c757d',
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
                        backgroundColor: index < currentStepIndex ? '#C41230' : '#dee2e6',
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
