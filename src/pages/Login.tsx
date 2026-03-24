import { Container, Row, Col, Card, Form, Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';

export default function Login() {
  const navigate = useNavigate();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Aquí luego conectaremos con el backend para validar el carné...");
  };

  return (
    <div 
      style={{ 
        minHeight: '100vh', 
        background: 'linear-gradient(to bottom, #001224, #003366)',
        display: 'flex', 
        alignItems: 'center' 
      }}
    >
      <Container>
        <Row className="justify-content-center">
          <Col md={6} lg={5}>
            
            {/* Botón para regresar - Ahora en blanco para que resalte en el fondo oscuro */}
            <div className="mb-3">
              <span 
                style={{ cursor: 'pointer', color: '#ffffff', opacity: 0.8, fontSize: '0.9rem' }}
                onClick={() => navigate('/')}
                onMouseEnter={(e) => e.currentTarget.style.opacity = '1'}
                onMouseLeave={(e) => e.currentTarget.style.opacity = '0.8'}
              >
                &larr; Regresar a selección de rol
              </span>
            </div>

            {/* Tarjeta del Formulario (Se mantiene blanca para contraste) */}
            <Card className="shadow-lg border-0" style={{ borderRadius: '15px' }}>
              <Card.Body className="p-5">
                
                {/* Encabezado del Login */}
                <div className="text-center mb-4">
                  <img 
                    src="/logo.png" 
                    alt="Logo UMG" 
                    style={{ width: '80px', marginBottom: '15px' }} 
                  />
                  <h3 className="fw-bold" style={{ color: '#003366' }}>Inicio de Sesión</h3>
                  <p className="text-muted">Estudiantes y Catedráticos</p>
                </div>

                {/* Formulario */}
                <Form onSubmit={handleLogin}>
                  <Form.Group className="mb-3" controlId="formCarne">
                    <Form.Label className="fw-semibold text-dark">Número de Carné</Form.Label>
                    <Form.Control 
                      type="text" 
                      placeholder="Ej: 5190-24-746" 
                      required 
                      className="py-2 bg-light"
                    />
                  </Form.Group>

                  <Form.Group className="mb-4" controlId="formPassword">
                    <Form.Label className="fw-semibold text-dark">Contraseña</Form.Label>
                    <Form.Control 
                      type="password" 
                      placeholder="********" 
                      required 
                      className="py-2 bg-light"
                    />
                  </Form.Group>

                  <Button 
                    variant="primary" 
                    type="submit" 
                    className="w-100 mb-3 py-2 fw-bold"
                    style={{ background: '#003366', border: 'none' }}
                  >
                    Ingresar al Parqueo
                  </Button>

                  {/* Enlace al Registro */}
                  <div className="text-center mt-4 pt-3 border-top">
                    <p className="mb-1 text-muted">¿Aún no tienes cuenta de parqueo?</p>
                    <Button 
                      variant="link" 
                      onClick={() => navigate('/registro')}
                      style={{ color: '#005b9f', fontWeight: 'bold', textDecoration: 'none', padding: 0 }}
                    >
                      Regístrate aquí
                    </Button>
                  </div>
                </Form>

              </Card.Body>
            </Card>

          </Col>
        </Row>
      </Container>
    </div>
  );
}