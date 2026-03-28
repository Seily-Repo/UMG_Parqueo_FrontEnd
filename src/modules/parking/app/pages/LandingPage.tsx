import { useNavigate } from 'react-router';
import { useEffect } from 'react';
import { Row, Col, Card, Button, Container, Form } from 'react-bootstrap';
import { Car } from 'lucide-react';
import { AppHeader } from '../components/AppHeader';
import { useRegistration } from '../context/RegistrationContext';

export function LandingPage() {
  const navigate = useNavigate();
  const { simulatedUsers, selectUser, currentRegistration } = useRegistration();

  useEffect(() => {
    if (currentRegistration.id) {
      navigate('/parking/user');
    } else {
      navigate('/parking/login');
    }
  }, [currentRegistration, navigate]);

  const handleUserChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const index = parseInt(e.target.value);
    selectUser(index);
  };

  return (
    <div style={{
      minHeight: '100vh',
      backgroundImage: `linear-gradient(rgba(0,0,0,0.55), rgba(0,0,0,0.55)), url(/assets/villanueva.webp)`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundAttachment: 'fixed',
    }}>
      <AppHeader />

      {/* Hero Section */}
      <Container className="py-5">
        <div className="text-center mb-5">
          <h1 className="display-4 fw-bold mb-3" style={{ color: 'white' }}>
            Sistema de Registro de Parqueo Universitario
          </h1>
          <p className="lead" style={{ maxWidth: 700, margin: '0 auto', color: 'rgba(255,255,255,0.8)' }}>
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
                e.currentTarget.style.borderColor = '#C41230';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.12)';
                e.currentTarget.style.borderColor = '#e3f2fd';
              }}
            >
              <Card.Body className="text-center p-4">
                <div className="d-flex align-items-center justify-content-center mx-auto mb-4">
                  <Car size={40} color="#C41230" />
                </div>
                <Card.Title className="h4 mb-2">Registro De Parqueo</Card.Title>
                <Card.Subtitle className="mb-4 text-muted">
                  Gestiona tu parqueo universitario
                </Card.Subtitle>
                
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
