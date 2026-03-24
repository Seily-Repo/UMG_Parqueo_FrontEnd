import { Container, Row, Col, Card, Form, Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';

export default function LoginAdmin() {
  const navigate = useNavigate();

  const handleLoginAdmin = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Validando correo de administrador en Oracle...");
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

            <Card className="shadow-lg border-0" style={{ borderRadius: '15px' }}>
              <Card.Body className="p-5">
                
                <div className="text-center mb-4">
                  <img 
                    src="/logo.png" 
                    alt="Logo UMG" 
                    style={{ width: '80px', marginBottom: '15px' }} 
                  />
                  <h3 className="fw-bold" style={{ color: '#003366' }}>Acceso Administrativo</h3>
                  <p className="text-muted">Colaboradores del sistema de parqueo</p>
                </div>

                <Form onSubmit={handleLoginAdmin}>
                  <Form.Group className="mb-3" controlId="formCorreoAdmin">
                    <Form.Label className="fw-semibold text-dark">Correo Electrónico Institucional</Form.Label>
                    <Form.Control 
                      type="email" 
                      placeholder="usuario@miumg.edu.gt" 
                      required 
                      className="py-2 bg-light"
                    />
                  </Form.Group>

                  <Form.Group className="mb-4" controlId="formPasswordAdmin">
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
                    Ingresar a Gestión de Parqueo
                  </Button>

                  {/* Nota para administrativos sin cuenta */}
                  <div className="text-center mt-4 pt-3 border-top">
                    <p className="mb-0 text-muted" style={{ fontSize: '0.85rem' }}>
                      * El acceso administrativo es asignado por el departamento de IT. Si no tienes acceso, contacta a soporte.
                    </p>
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