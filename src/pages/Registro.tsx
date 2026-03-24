import { Container, Row, Col, Card, Form, Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';

export default function Registro() {
  const navigate = useNavigate();

  const handleRegistro = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    // Extraemos todos los datos del formulario automáticamente gracias a los atributos "name"
    const formData = new FormData(e.currentTarget);
    const datosUsuario = Object.fromEntries(formData.entries());

    console.log("🚀 Datos capturados, listos para Oracle:", datosUsuario);

    try {
      // Hacemos la petición POST al backend en Node.js
      const respuesta = await fetch('http://localhost:3001/api/auth/registro', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(datosUsuario),
      });

      const resultado = await respuesta.json();

      if (respuesta.ok) {
        alert('✅ ' + resultado.mensaje);
        navigate('/login'); 
      } else {
        alert('❌ Error: ' + resultado.error);
      }
    } catch (error) {
      alert('⚠️ No se pudo conectar con el servidor Node.js. Asegúrate de que esté encendido.');
    }
  };

  return (
    <div 
      style={{ 
        minHeight: '100vh', 
        background: 'linear-gradient(to bottom, #001224, #003366)', 
        display: 'flex', 
        alignItems: 'center',
        padding: '40px 0'
      }}
    >
      <Container>
        <Row className="justify-content-center">
          <Col md={10} lg={8}>
            
            {/* Botón para regresar */}
            <div className="mb-3">
              <span 
                style={{ cursor: 'pointer', color: '#ffffff', opacity: 0.8, fontSize: '0.9rem' }}
                onClick={() => navigate('/login')}
                onMouseEnter={(e) => e.currentTarget.style.opacity = '1'}
                onMouseLeave={(e) => e.currentTarget.style.opacity = '0.8'}
              >
                &larr; Regresar al Login
              </span>
            </div>

            <Card className="shadow-lg border-0" style={{ borderRadius: '15px' }}>
              <Card.Body className="p-5">
                
                <div className="text-center mb-4">
                  <h3 className="fw-bold" style={{ color: '#003366' }}>Registro de Parqueo</h3>
                  <p className="text-muted">Completa los datos de tu Ficha de Parqueo UMG</p>
                </div>

                <Form onSubmit={handleRegistro}>
                  
                  {/* --- SECCIÓN 1: DATOS DE LA CUENTA --- */}
                  <h5 className="mb-3 fw-bold text-primary border-bottom pb-2">1. Datos de la Cuenta</h5>
                  <Row>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label className="fw-semibold">Número de Carné</Form.Label>
                        <Form.Control 
                          name="carne"
                          type="text" 
                          placeholder="Ej: 5190-24-746" 
                          required 
                          className="bg-light" 
                          pattern="[0-9]{4}-[0-9]{2}-[0-9]{1,6}"
                          maxLength={15}
                          title="El formato debe ser 0000-00-0000 (Incluye los guiones)"
                        />
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label className="fw-semibold">Categoría</Form.Label>
                        {}
                        <Form.Select name="id_rol" required className="bg-light">
                          <option value="">Selecciona...</option>
                          <option value="1">Estudiante</option>
                          <option value="2">Catedrático</option>
                        </Form.Select>
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label className="fw-semibold">Correo Electrónico Institucional</Form.Label>
                        <Form.Control 
                          name="correo_electronico"
                          type="email" 
                          placeholder="correo@miumg.edu.gt" 
                          required 
                          className="bg-light"
                          pattern=".*@miumg\.edu\.gt$"
                          title="Debe ser un correo institucional que termine en @miumg.edu.gt" 
                        />
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label className="fw-semibold">Contraseña para el sistema</Form.Label>
                        <Form.Control 
                          name="password"
                          type="password" 
                          placeholder="Mínimo 8 caracteres" 
                          required 
                          className="bg-light"
                          minLength={8}
                        />
                      </Form.Group>
                    </Col>
                  </Row>

                  {/* --- SECCIÓN 2: DATOS PERSONALES --- */}
                  <h5 className="mb-3 mt-4 fw-bold text-primary border-bottom pb-2">2. Datos Personales</h5>
                  <Row>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label className="fw-semibold">Nombres</Form.Label>
                        <Form.Control 
                          name="nombres"
                          type="text" 
                          placeholder="Tus nombres" 
                          required 
                          className="bg-light"
                          pattern="[a-zA-ZáéíóúÁÉÍÓÚñÑ ]+"
                          minLength={3}
                          maxLength={100}
                          title="Solo se permiten letras y espacios." 
                        />
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label className="fw-semibold">Apellidos</Form.Label>
                        <Form.Control 
                          name="apellidos"
                          type="text" 
                          placeholder="Tus apellidos" 
                          required 
                          className="bg-light"
                          pattern="[a-zA-ZáéíóúÁÉÍÓÚñÑ ]+"
                          minLength={3}
                          maxLength={100}
                          title="Solo se permiten letras y espacios."  
                        />
                      </Form.Group>
                    </Col>
                    <Col md={12}>
                      <Form.Group className="mb-3">
                        <Form.Label className="fw-semibold">Dirección de residencia</Form.Label>
                        <Form.Control 
                          name="direccion_residencia"
                          type="text" 
                          placeholder="Ej: 3ra calle 4-50 Zona 2, Villa Nueva" 
                          required
                          className="bg-light"
                          minLength={15}
                          maxLength={200}
                          title="Por favor ingresa una dirección completa y detallada." 
                        />
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label className="fw-semibold">Teléfono</Form.Label>
                        <Form.Control 
                          name="telefonos"
                          type="text" 
                          placeholder="Ej: 55554444" 
                          required 
                          className="bg-light"
                          pattern="[0-9]{8}"
                          maxLength={8}
                          title="El número debe contener exactamente 8 dígitos numéricos" 
                        />
                      </Form.Group>
                    </Col>
                  </Row>

                  {/* --- SECCIÓN 3: DATOS ACADÉMICOS Y EMERGENCIA --- */}
                  <h5 className="mb-3 mt-4 fw-bold text-primary border-bottom pb-2">3. Datos Académicos y Emergencia</h5>
                  <Row>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label className="fw-semibold">Sede / Campus</Form.Label>
                        <Form.Select name="sede" required className="bg-light">
                          <option value="">Selecciona tu campus...</option>
                          <option value="Villa Nueva">Campus Villa Nueva</option>
                          <option value="Central">Campus Central (Zona 2)</option>
                          <option value="Portales">Sede Portales</option>
                          <option value="Naranjo">Sede Naranjo</option>
                          <option value="Boca del Monte">Sede Boca del Monte</option>
                        </Form.Select>
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label className="fw-semibold">Facultad</Form.Label>
                        <Form.Select name="facultad" required className="bg-light">
                          <option value="">Selecciona tu facultad...</option>
                          <option value="Ingeniería en Sistemas">Ingeniería en Sistemas</option>
                          <option value="Ingeniería Civil">Ingeniería Civil</option>
                          <option value="Ciencias de la Administración">Ciencias de la Administración</option>
                          <option value="Ciencias Jurídicas y Sociales">Ciencias Jurídicas y Sociales</option>
                          <option value="Psicología">Psicología</option>
                          <option value="Arquitectura">Arquitectura</option>
                        </Form.Select>
                      </Form.Group>
                    </Col>
                    <Col md={4}>
                      <Form.Group className="mb-3">
                        <Form.Label className="fw-semibold">Ciclo / Semestre</Form.Label>
                        <Form.Select name="ciclo" required className="bg-light">
                          <option value="">Selecciona...</option>
                          {[...Array(12)].map((_, i) => (
                            <option key={i+1} value={i+1}>Ciclo {i+1}</option>
                          ))}
                        </Form.Select>
                      </Form.Group>
                    </Col>
                    <Col md={4}>
                      <Form.Group className="mb-3">
                        <Form.Label className="fw-semibold">Sección</Form.Label>
                        <Form.Select name="seccion" required className="bg-light">
                          <option value="">Selecciona...</option>
                          <option value="A">A</option>
                          <option value="B">B</option>
                          <option value="C">C</option>
                          <option value="D">D</option>
                          <option value="E">E</option>
                          <option value="U">Única (U)</option>
                        </Form.Select>
                      </Form.Group>
                    </Col>
                    <Col md={4}>
                      <Form.Group className="mb-3">
                        <Form.Label className="fw-semibold">Jornada</Form.Label>
                        <Form.Select name="jornada" required className="bg-light">
                          <option value="">Selecciona...</option>
                          <option value="Matutina">Matutina</option>
                          <option value="Vespertina">Vespertina</option>
                          <option value="Sábado">Sábado</option>
                          <option value="Domingo">Domingo</option>
                        </Form.Select>
                      </Form.Group>
                    </Col>
                  </Row>
                  
                  <Row className="mt-2">
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label className="fw-semibold">Avisar en caso de emergencia a:</Form.Label>
                        <Form.Control 
                          name="emergencia_nombre"
                          type="text" 
                          placeholder="Nombre del contacto" 
                          required
                          className="bg-light"
                          pattern="[a-zA-ZáéíóúÁÉÍÓÚñÑ ]+"
                          title="Solo se permiten letras y espacios."
                        />
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group className="mb-4">
                        <Form.Label className="fw-semibold">Teléfono de emergencia:</Form.Label>
                        <Form.Control 
                          name="emergencia_telefono"
                          type="text" 
                          placeholder="Ej: 55554444" 
                          required
                          className="bg-light"
                          pattern="[0-9]{8}"
                          maxLength={8}
                          title="El número debe contener exactamente 8 dígitos numéricos"
                        />
                      </Form.Group>
                    </Col>
                  </Row>

                  <div className="text-center mt-3">
                    <Button 
                      variant="primary" 
                      type="submit" 
                      className="w-75 py-2 fw-bold"
                      style={{ background: '#003366', border: 'none', fontSize: '1.1rem' }}
                    >
                      Completar Registro
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