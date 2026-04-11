import { useNavigate } from 'react-router';
import { useEffect } from 'react';
import { Row, Col, Card, Button, Container } from 'react-bootstrap';
import { Car, AlertTriangle, FileText } from 'lucide-react';
import { AppHeader } from '../components/AppHeader';
import { useRegistration } from '../context/RegistrationContext';
import villanueva from '../../../../assets/villanueva.webp';

export function LandingPage() {
  const navigate = useNavigate();
  const { currentRegistration } = useRegistration();

  useEffect(() => {
    // Si no ha iniciado sesión, lo mandamos al Login primero
    if (!currentRegistration || !currentRegistration.carnet) {
      navigate('/parking/login');
    }
  }, [currentRegistration, navigate]);

  // Si no hay datos, no renderizar nada mientras redirige
  if (!currentRegistration || !currentRegistration.carnet) return null;

  return (
    <div style={{
      minHeight: '100vh',
      backgroundImage: `linear-gradient(rgba(0,0,0,0.55), rgba(0,0,0,0.55)), url(${villanueva})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundAttachment: 'fixed',
    }}>
      <AppHeader />

      {/* Hero Section */}
      <Container className="py-5">
        <div className="text-center mb-5">
          <h1 className="display-4 fw-bold mb-3" style={{ color: 'white' }}>
            Portal de Autogestión
          </h1>
          <p className="lead" style={{ maxWidth: 700, margin: '0 auto', color: 'rgba(255,255,255,0.8)' }}>
            Bienvenido, {currentRegistration.fullName || 'Estudiante'}. Elige el trámite que deseas realizar.
          </p>
        </div>

        {/* Module Cards */}
        <Row className="g-4 justify-content-center" style={{ maxWidth: 1000, margin: '0 auto' }}>
          
          {/* Pago de Multas */}
          <Col md={4}>
            <Card className="h-100 shadow-sm" style={{ border: '2px solid #e3f2fd', transition: 'all 0.3s' }}
              onClick={() => navigate('/parking/user/multas')}
              onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.15)';
                e.currentTarget.style.cursor = 'pointer';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.12)';
                e.currentTarget.style.borderColor = '#e3f2fd';
              }}
            >
              <Card.Body className="text-center p-4">
                <div className="d-flex align-items-center justify-content-center mx-auto mb-4">
                  <AlertTriangle size={40} color="#C41230" />
                </div>
                <Card.Title className="h5 mb-2">Pago de Multas</Card.Title>
                <Card.Subtitle className="mb-4 text-muted small">
                  Consulta y paga multas con tu número de placa
                </Card.Subtitle>
                
                <Button variant="outline-danger" className="w-100">Consultar</Button>
              </Card.Body>
            </Card>
          </Col>

          {/* Pago de Parqueo */}
          <Col md={4}>
            <Card className="h-100 shadow-sm" style={{ border: '2px solid #e3f2fd', transition: 'all 0.3s' }}
              onClick={() => navigate('/parking/user')}
              onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.15)';
                e.currentTarget.style.borderColor = '#1976d2';
                e.currentTarget.style.cursor = 'pointer';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.12)';
                e.currentTarget.style.borderColor = '#e3f2fd';
              }}
            >
              <Card.Body className="text-center p-4">
                <div className="d-flex align-items-center justify-content-center mx-auto mb-4">
                  <Car size={40} color="#1976d2" />
                </div>
                <Card.Title className="h5 mb-2">Pagar Parqueo</Card.Title>
                <Card.Subtitle className="mb-4 text-muted small">
                  Inscripción y pago de cuota mensual
                </Card.Subtitle>
                <Button variant="primary" className="w-100">Comprar Plan</Button>
              </Card.Body>
            </Card>
          </Col>

          {/* Estado de Cuenta */}
          <Col md={4}>
            <Card className="h-100 shadow-sm" style={{ border: '2px solid #e3f2fd', transition: 'all 0.3s' }}
              onClick={() => navigate('/parking/user/perfil')}
              onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.15)';
                e.currentTarget.style.borderColor = '#0d47a1';
                e.currentTarget.style.cursor = 'pointer';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.12)';
                e.currentTarget.style.borderColor = '#e3f2fd';
              }}
            >
              <Card.Body className="text-center p-4">
                <div className="d-flex align-items-center justify-content-center mx-auto mb-4">
                  <FileText size={40} color="#0d47a1" />
                </div>
                <Card.Title className="h5 mb-2">Estado de Cuenta</Card.Title>
                <Card.Subtitle className="mb-4 text-muted small">
                  Revisa tu historial y pagos realizados
                </Card.Subtitle>
                <Button variant="outline-primary" className="w-100" style={{ borderColor: '#0d47a1', color: '#0d47a1' }}>Ver Perfil</Button>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
}
