import { Container, Row, Col, Card } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';

export default function SelectorRol() {
  const navigate = useNavigate();

  return (
    <div 
      style={{ 
        minHeight: '100vh', 
        background: 'linear-gradient(to bottom, #001224, #003366)', 
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        color: 'white'
      }}
    >
      <Container className="py-5">
        <Row className="mb-5 text-center">
          <Col>
            <img 
              src="/logo.png" 
              alt="Logo UMG" 
              style={{ width: '120px', marginBottom: '20px', backgroundColor: 'white', borderRadius: '50%', padding: '5px' }} 
            />
            <h2 className="fw-bold">Selecciona tipo de Usuario</h2>
            <p className="text-light opacity-75">Sistema de Parqueo UMG</p>
          </Col>
        </Row>

        <Row className="justify-content-center gap-3">
          
          {/* Tarjeta 1: Estudiante / Catedrático */}
          <Col md={4} lg={3}>
            <Card 
              className="h-100 shadow-lg text-white border-0" 
              style={{ background: 'rgba(255, 255, 255, 0.1)', cursor: 'pointer', transition: 'transform 0.2s' }}
              onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-10px)'}
              onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
              onClick={() => navigate('/login')}
            >
              <Card.Body className="p-4 d-flex flex-column justify-content-center text-center">
                <h1 className="display-4 mb-3">👤</h1>
                <h5 className="fw-bold">Estudiante / Catedrático</h5>
                <p className="mt-2" style={{ fontSize: '0.85rem', color: '#e0e0e0' }}>
                  Ingreso con carné para alumnos y docentes activos.
                </p>
              </Card.Body>
            </Card>
          </Col>

          {/* Tarjeta 2: Administrativo */}
          <Col md={4} lg={3}>
            <Card 
              className="h-100 shadow-lg text-white border-0" 
              style={{ background: 'rgba(255, 255, 255, 0.1)', cursor: 'pointer', transition: 'transform 0.2s' }}
              onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-10px)'}
              onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
              onClick={() => navigate('/login-admin')}
            >
              <Card.Body className="p-4 d-flex flex-column justify-content-center text-center">
                <h1 className="display-4 mb-3">🏢</h1>
                <h5 className="fw-bold">Administrativo</h5>
                <p className="mt-2" style={{ fontSize: '0.85rem', color: '#e0e0e0' }}>
                  Ingreso con correo para colaboradores de parqueo.
                </p>
              </Card.Body>
            </Card>
          </Col>

          {/* Tarjeta 3: Gestión de Usuarios (RRHH) - Funcionalidad Simulada */}
          <Col md={4} lg={3}>
            <Card 
              className="h-100 text-white" 
              style={{ 
                background: 'rgba(0, 0, 0, 0.2)', 
                border: '2px dashed rgba(255,255,255,0.3)', 
                cursor: 'not-allowed' 
              }}
              onClick={() => alert('🔒 Este módulo corresponde a RRHH. Fuera del alcance del Sprint 1, pero contemplado en la arquitectura.')}
            >
              <Card.Body className="p-4 d-flex flex-column justify-content-center text-center opacity-75">
                <h1 className="display-4 mb-3">⚙️</h1>
                <h5 className="fw-bold">Gestión de Usuarios</h5>
                <p className="mt-2" style={{ fontSize: '0.85rem', color: '#adb5bd' }}>
                  Acceso restringido para creación de cuentas administrativas.
                </p>
              </Card.Body>
            </Card>
          </Col>

        </Row>
      </Container>
    </div>
  );
}