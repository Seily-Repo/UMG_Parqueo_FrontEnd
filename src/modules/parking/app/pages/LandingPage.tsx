import { useNavigate } from 'react-router';
import { useEffect } from 'react';
import { Row, Col, Card, Button, Container } from 'react-bootstrap';
import { Car, AlertTriangle, FileText, LogOut } from 'lucide-react';
import { AppHeader } from '../components/AppHeader';
import { AppFooter } from '../components/AppFooter';
import { useRegistration } from '../context/RegistrationContext';
import villanueva from '../../../../assets/villanueva.webp';

export function LandingPage() {
  const navigate = useNavigate();
  const { currentRegistration, logout } = useRegistration();

  useEffect(() => {
    if (!currentRegistration || !currentRegistration.carnet) {
      navigate('/parking/login');
    }
  }, [currentRegistration, navigate]);

  if (!currentRegistration || !currentRegistration.carnet) return null;

  const handleLogout = () => {
    logout();
    navigate('/parking/login');
  };

  return (
    <div
      className="parking-shell parking-shell--photo"
      style={{
        backgroundImage: `url(${villanueva})`,
      }}
    >
      <AppHeader />

      <main>
        <Container className="py-5">
          <div className="text-center mb-5">
            <h1 className="display-4 fw-bold mb-3" style={{ color: '#003366' }}>
              Portal de Autogestion
            </h1>
            <p className="lead" style={{ maxWidth: 700, margin: '0 auto', color: '#1F4E79' }}>
              Bienvenid@, {currentRegistration.fullName || 'Estudiante'}. Elige el tramite que deseas realizar.
            </p>
          </div>

          <Row className="g-4 justify-content-center" style={{ maxWidth: 1000, margin: '0 auto' }}>
            <Col md={4}>
              <Card
                className="h-100 shadow-sm"
                style={{ border: '2px solid #A7C9D6', transition: 'all 0.3s' }}
                onClick={() => navigate('/parking/user/multas')}
                onMouseEnter={(e) => {
                  e.currentTarget.style.boxShadow = '0 8px 24px rgba(0, 51, 102, 0.12)';
                  e.currentTarget.style.cursor = 'pointer';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.boxShadow = '0 1px 3px rgba(0, 51, 102, 0.08)';
                  e.currentTarget.style.borderColor = '#A7C9D6';
                }}
              >
                <Card.Body className="text-center p-4">
                  <div className="d-flex align-items-center justify-content-center mx-auto mb-4">
                    <AlertTriangle size={40} color="#C7352E" />
                  </div>
                  <Card.Title className="h5 mb-2">Consultas y Pago Multas</Card.Title>
                  <Card.Subtitle className="mb-4 text-muted small">
                    Consulta tus multas activas y registra su pago desde el portal
                  </Card.Subtitle>
                  <Button variant="danger" className="w-100">
                    Consultar y Pagar
                  </Button>
                </Card.Body>
              </Card>
            </Col>

            <Col md={4}>
              <Card
                className="h-100 shadow-sm"
                style={{ border: '2px solid #A7C9D6', transition: 'all 0.3s' }}
                onClick={() => navigate('/parking/user')}
                onMouseEnter={(e) => {
                  e.currentTarget.style.boxShadow = '0 8px 24px rgba(0, 51, 102, 0.12)';
                  e.currentTarget.style.borderColor = '#1A6AA6';
                  e.currentTarget.style.cursor = 'pointer';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.boxShadow = '0 1px 3px rgba(0, 51, 102, 0.08)';
                  e.currentTarget.style.borderColor = '#A7C9D6';
                }}
              >
                <Card.Body className="text-center p-4">
                  <div className="d-flex align-items-center justify-content-center mx-auto mb-4">
                    <Car size={40} color="#1A6AA6" />
                  </div>
                  <Card.Title className="h5 mb-2">Pagar Parqueo</Card.Title>
                  <Card.Subtitle className="mb-4 text-muted small">
                    Inscripcion y pago de cuota mensual
                  </Card.Subtitle>
                  <Button variant="primary" className="w-100">
                    Pagar
                  </Button>
                </Card.Body>
              </Card>
            </Col>

            <Col md={4}>
              <Card
                className="h-100 shadow-sm"
                style={{ border: '2px solid #A7C9D6', transition: 'all 0.3s' }}
                onClick={() => navigate('/parking/user/perfil')}
                onMouseEnter={(e) => {
                  e.currentTarget.style.boxShadow = '0 8px 24px rgba(0, 51, 102, 0.12)';
                  e.currentTarget.style.borderColor = '#003366';
                  e.currentTarget.style.cursor = 'pointer';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.boxShadow = '0 1px 3px rgba(0, 51, 102, 0.08)';
                  e.currentTarget.style.borderColor = '#A7C9D6';
                }}
              >
                <Card.Body className="text-center p-4">
                  <div className="d-flex align-items-center justify-content-center mx-auto mb-4">
                    <FileText size={40} color="#003366" />
                  </div>
                  <Card.Title className="h5 mb-2">Estado de Cuenta</Card.Title>
                  <Card.Subtitle className="mb-4 text-muted small">
                    Revisa tu historial y pagos realizados
                  </Card.Subtitle>
                  <Button variant="outline-primary" className="w-100">
                    Ver
                  </Button>
                </Card.Body>
              </Card>
            </Col>
          </Row>

          <div className="d-flex justify-content-center mt-5">
            <Button variant="light" onClick={handleLogout} className="px-4">
              <LogOut size={16} className="me-2" />
              Cerrar Sesion
            </Button>
          </div>
        </Container>
      </main>

      <AppFooter />
    </div>
  );
}
