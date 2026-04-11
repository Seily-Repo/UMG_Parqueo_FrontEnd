import { Outlet, useLocation } from 'react-router';
import { Container } from 'react-bootstrap';
import { AppHeader } from './AppHeader';
import { AppFooter } from './AppFooter';
import villanueva from '../../../../assets/villanueva.webp';

export function UserLayout() {
  const location = useLocation();

  const steps = [
    { path: '/parking/user', label: 'Datos del vehiculo' },
    { path: '/parking/user/pago', label: 'Pago' },
    { path: '/parking/user/firma', label: 'Firma' },
  ];

  const currentStepIndex = steps.findIndex((step) => step.path === location.pathname);

  return (
    <div
      className="parking-shell parking-shell--photo"
      style={{
        backgroundImage: `url(${villanueva})`,
      }}
    >
      <AppHeader subtitle="Registro de Parqueo" />

      <main>
        {currentStepIndex !== -1 && location.pathname !== '/parking/user/confirmacion' && (
          <div className="parking-progress-shell">
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
                          backgroundColor: index <= currentStepIndex ? '#1A6AA6' : '#A7C9D6',
                          color: '#FFFFFF',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: 14,
                          fontWeight: 700,
                          transition: 'all 0.3s',
                          boxShadow: index <= currentStepIndex ? '0 8px 18px rgba(26, 106, 166, 0.22)' : 'none',
                        }}
                      >
                        {index + 1}
                      </div>
                      <span
                        className="mt-2 text-center"
                        style={{
                          fontSize: 12,
                          color: index <= currentStepIndex ? '#003366' : '#4b6478',
                          fontWeight: index <= currentStepIndex ? 700 : 500,
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
                          backgroundColor: index < currentStepIndex ? '#1A6AA6' : '#A7C9D6',
                          marginBottom: 30,
                          marginLeft: 8,
                          marginRight: 8,
                          transition: 'all 0.3s',
                        }}
                      />
                    )}
                  </div>
                ))}
              </div>
            </Container>
          </div>
        )}

        <Container className="parking-content-container py-4">
          <Outlet />
        </Container>
      </main>

      <AppFooter />
    </div>
  );
}
