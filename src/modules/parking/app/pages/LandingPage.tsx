import { useNavigate } from 'react-router';
import { Container, Row, Col, Card, Button } from 'react-bootstrap';
import { GraduationCap, Car, Shield } from 'lucide-react';

export function LandingPage() {
  const navigate = useNavigate();

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
                <small className="text-muted">Sistema de Parqueo</small>
              </div>
            </div>
          </div>
        </Container>
      </div>

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
