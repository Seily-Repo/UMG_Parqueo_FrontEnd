import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Form, Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { ShieldLockFill, KeyFill } from 'react-bootstrap-icons';
import Swal from 'sweetalert2';
import ThemeSwitcher from '../components/ThemeSwitcher';

const CambiarPassword = () => {
  const navigate = useNavigate();
  const [usuario, setUsuario] = useState<any>(null);

  useEffect(() => {
    // Verificamos si el usuario fue mandado aquí desde el login
    const usuarioPendiente = localStorage.getItem('usuarioPendiente');
    if (!usuarioPendiente) {
      navigate('/login'); // Si intentan entrar directo a la URL, los pateamos al login
    } else {
      setUsuario(JSON.parse(usuarioPendiente));
    }
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const nuevaPassword = formData.get('nuevaPassword') as string;
    const confirmarPassword = formData.get('confirmarPassword') as string;

    if (nuevaPassword !== confirmarPassword) {
      Swal.fire('Las contraseñas no coinciden', 'Por favor, asegúrate de escribir la misma contraseña en ambos campos.', 'error');
      return;
    }

    if (nuevaPassword.length < 8) {
      Swal.fire('Contraseña muy corta', 'Por seguridad, la contraseña debe tener al menos 8 caracteres.', 'warning');
      return;
    }

    try {
      const response = await fetch('http://localhost:3001/api/auth/cambiar-password', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ carne: usuario.carne, nuevaPassword }),
      });

      if (response.ok) {
        Swal.fire({
          title: '¡Contraseña Actualizada!',
          text: 'Tu cuenta ya está segura. Por favor, inicia sesión de nuevo.',
          icon: 'success',
          confirmButtonColor: 'var(--azul-universitario)'
        }).then(() => {
          localStorage.removeItem('usuarioPendiente'); // Limpiamos el temporal
          navigate('/login'); // Lo mandamos a loguearse con su clave nueva
        });
      } else {
        Swal.fire('Error', 'No se pudo actualizar la contraseña.', 'error');
      }
    } catch (error) {
      Swal.fire('Error de Servidor', 'No se pudo conectar con la base de datos.', 'error');
    }
  };

  if (!usuario) return null; // Evita parpadeos mientras lee el localStorage

  return (
    <div style={{ backgroundColor: 'var(--fondo-general)', minHeight: '100vh', display: 'flex', alignItems: 'center' }}>
      <Container>
        <Row className="justify-content-center">
          <Col md={6} lg={5}>
            <Card className="border-0 shadow-lg" style={{ borderRadius: '20px', overflow: 'hidden' }}>
              <div style={{ backgroundColor: 'var(--color-primario)', padding: '30px', textAlign: 'center', color: 'white' }}>
                <ShieldLockFill size={50} className="mb-2" />
                <h3 className="fw-bold mb-0" style={{ fontStyle: 'italic' }}>Actualización de Seguridad</h3>
              </div>
              
              <Card.Body className="p-4 p-md-5">
                <div className="text-center mb-4">
                  <p className="text-muted">
                    Hola <strong>{usuario.nombres.split(' ')[0]}</strong>, estás usando una contraseña temporal provista por la administración. Por tu seguridad, debes establecer tu propia contraseña antes de continuar.
                  </p>
                </div>

                <Form onSubmit={handleSubmit}>
                  <Form.Group className="mb-3">
                    <Form.Label className="fw-bold" style={{ color: 'var(--azul-oscuro)' }}><KeyFill className="me-2"/>Nueva Contraseña</Form.Label>
                    <Form.Control name="nuevaPassword" type="password" required placeholder="Mínimo 8 caracteres" />
                  </Form.Group>

                  <Form.Group className="mb-4">
                    <Form.Label className="fw-bold" style={{ color: 'var(--azul-oscuro)' }}><KeyFill className="me-2"/>Confirmar Contraseña</Form.Label>
                    <Form.Control name="confirmarPassword" type="password" required placeholder="Vuelve a escribir tu contraseña" />
                  </Form.Group>

                  <div className="d-grid mt-4">
                    <Button type="submit" size="lg" style={{ backgroundColor: 'var(--color-primario)', border: 'none', fontWeight: 'bold' }}>
                      Guardar Contraseña y Continuar
                    </Button>
                  </div>
                </Form>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
      <ThemeSwitcher />
    </div>
  );
};

export default CambiarPassword;