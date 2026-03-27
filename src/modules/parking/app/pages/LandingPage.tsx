import { useNavigate } from 'react-router';
import { Row, Col, Card, Button, Container } from 'react-bootstrap';
import { Car } from 'lucide-react';
import { AppHeader } from '../components/AppHeader';

export function LandingPage() {
  const navigate = useNavigate();

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #e3f2fd 0%, #ffffff 50%, #ede7f6 100%)' }}>
      <AppHeader />

      {/* Hero Section */}
      <Container className="py-5">
        <div className="text-center mb-5">
          <h1 className="display-4 fw-bold mb-3">
            Sistema de Registro de Parqueo Universitario
          </h1>
          <p className="lead text-muted" style={{ maxWidth: 700, margin: '0 auto' }}>
            Gestiona tu parqueo de forma rápida y segura. Elige tu módulo para comenzar.
          </p>
        </div>

        {/* Module Cards */}
        <Row className="g-4 justify-content-center" style={{ maxWidth: 1000, margin: '0 auto' }}>
          {/* Student Module */}
          <Col md={6}>
            <Card className="h-100 shadow-sm" style={{ border: '2px solid #e3f2fd', transition: 'all 0.3s' }}
              onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.15)';
                e.currentTarget.style.borderColor = '#1976d2';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.12)';
                e.currentTarget.style.borderColor = '#e3f2fd';
              }}
            >
              <Card.Body className="text-center p-4">
                <div style={{ width: 80, height: 80, backgroundColor: '#e3f2fd', borderRadius: '50%' }} 
                     className="d-flex align-items-center justify-content-center mx-auto mb-4">
                  <Car size={40} color="#1976d2" />
                </div>
                <Card.Title className="h4 mb-2">Módulo de Usuario</Card.Title>
                <Card.Subtitle className="mb-4 text-muted">
                  Estudiantes y personal universitario
                </Card.Subtitle>
                
                <ul className="list-unstyled text-start text-muted mb-4">
                  <li className="mb-2">
                    <div className="d-flex align-items-center gap-2">
                      <div style={{ width: 6, height: 6, backgroundColor: '#1976d2', borderRadius: '50%' }}></div>
                      <span>Registro de datos personales</span>
                    </div>
                  </li>
                  <li className="mb-2">
                    <div className="d-flex align-items-center gap-2">
                      <div style={{ width: 6, height: 6, backgroundColor: '#1976d2', borderRadius: '50%' }}></div>
                      <span>Registro de vehículos (hasta 3)</span>
                    </div>
                  </li>
                  <li className="mb-2">
                    <div className="d-flex align-items-center gap-2">
                      <div style={{ width: 6, height: 6, backgroundColor: '#1976d2', borderRadius: '50%' }}></div>
                      <span>Selección de plan de parqueo</span>
                    </div>
                  </li>
                  <li className="mb-2">
                    <div className="d-flex align-items-center gap-2">
                      <div style={{ width: 6, height: 6, backgroundColor: '#1976d2', borderRadius: '50%' }}></div>
                      <span>Pago en línea seguro</span>
                    </div>
                  </li>
                  <li className="mb-2">
                    <div className="d-flex align-items-center gap-2">
                      <div style={{ width: 6, height: 6, backgroundColor: '#1976d2', borderRadius: '50%' }}></div>
                      <span>Firma digital del acuerdo</span>
                    </div>
                  </li>
                </ul>
                
                <Button 
                  variant="primary" 
                  size="lg" 
                  className="w-100"
                  onClick={() => navigate('/parking/user')}
                >
                  Comenzar Registro
                </Button>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
}
