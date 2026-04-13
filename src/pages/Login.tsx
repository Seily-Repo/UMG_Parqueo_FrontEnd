import React, { useEffect } from 'react';
import { Container, Row, Col, Card, Form, Button } from 'react-bootstrap';
import { useNavigate, Link } from 'react-router-dom';
import Swal from 'sweetalert2';
import ThemeSwitcher from '../components/ThemeSwitcher';
import '../index.css'; 

const Login = () => {
  // Apply saved theme
  useEffect(() => {
    const t = localStorage.getItem('umg-theme') || 'azul';
    document.documentElement.setAttribute('data-theme', t);
  }, []);

  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    const formData = new FormData(e.currentTarget);
    const credenciales = Object.fromEntries(formData.entries());

    try {
      const response = await fetch('http://localhost:3001/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credenciales),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('usuarioParqueo', JSON.stringify(data.usuario));
        const primerNombre = data.usuario.nombres.split(' ')[0];

        Swal.fire({
          title: `¡Bienvenido, ${primerNombre}!`,
          text: 'Autenticación exitosa. Redirigiendo al sistema...',
          icon: 'success',
          timer: 1500,
          showConfirmButton: false,
          background: 'var(--fondo-blanco)',
          color: 'var(--azul-universitario)'
        }).then(() => {
          navigate('/dashboard');
        });

      } else {
        Swal.fire({
          title: 'Acceso Denegado',
          text: data.error || 'Carné o contraseña incorrectos.',
          icon: 'error',
          confirmButtonText: 'Reintentar',
          confirmButtonColor: 'var(--rojo-institucional)'
        });
      }
    } catch (error) {
      console.error("Error de conexión:", error);
      Swal.fire({
        title: 'Error de Servidor',
        text: 'No se pudo conectar con la base de datos Oracle.',
        icon: 'error',
        confirmButtonText: 'Entendido',
        confirmButtonColor: 'var(--rojo-institucional)'
      });
    }
  };

  return (
    <div className="bg-mesh" style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      alignItems: 'center',
      position: 'relative',
      overflow: 'hidden'
    }}>
      
      {/* Decorative glass circles */}
      <div className="deco-circle deco-circle-1" />
      <div className="deco-circle deco-circle-2" />
      <div className="deco-circle deco-circle-3" />

      <Container style={{ position: 'relative', zIndex: 1 }}>
        <Row className="justify-content-center">
          <Col md={5} lg={4}>
            
            <div className="text-center mb-3 animate-fade-in">
              <Link to="/" className="text-decoration-none" style={{ 
                color: 'var(--color-primario)', 
                fontSize: '0.9rem',
                fontWeight: 'bold'
              }}>
                &larr; Regresar a selección de rol
              </Link>
            </div>

            <Card className="border-0 liquid-card animate-fade-in" style={{ 
              borderRadius: '20px', 
              overflow: 'hidden'
            }}>
              {/* Barra de acento con Azul Celeste Brillante 2 [cite: 6] */}
              <div className="accent-bar" style={{ backgroundColor: 'var(--azul-celeste-v2)' }} />
              
              <Card.Body className="p-4 pt-5 pb-5">
                <div className="text-center mb-4">
                  <div className="mb-3 animate-float logo-halo">
                    <img src="/logo.png" alt="Logo UMG" className="logo-panel" style={{ width: '120px', height: 'auto' }} />
                  </div>
                  <h2 className="mb-1" style={{ color: 'var(--color-accion)' }}>
                    MiUMG Parqueo
                  </h2>
                  <p style={{ color: 'var(--color-primario)', fontSize: '0.88rem', marginBottom: 0 }}>
                    Portal de acceso para estudiantes
                  </p>
                </div>

                <Form onSubmit={handleSubmit} style={{ fontFamily: 'var(--fuente-principal)' }}>
                  <Form.Group className="mb-3">
                    <Form.Label style={{ color: 'var(--color-accion)', fontWeight: 'bold' }}>Número de Carné</Form.Label>
                    <Form.Control 
                      name="carne" type="text" required 
                      placeholder="Ej: 5190-24-1234" 
                      pattern="[0-9]{4}-[0-9]{2}-[0-9]{1,6}" 
                    />
                  </Form.Group>

                  <Form.Group className="mb-4">
                    <Form.Label style={{ color: 'var(--color-accion)', fontWeight: 'bold' }}>Contraseña</Form.Label>
                    <Form.Control 
                      name="password" type="password" required 
                      placeholder="Ingresa tu contraseña"
                    />
                  </Form.Group>

                  <div className="d-grid mt-4">
                    <Button type="submit" size="lg" className="btn-liquid" style={{ 
                      backgroundColor: 'var(--color-accion)', 
                      border: 'none',
                      fontSize: '1rem',
                      fontWeight: 'bold',
                      padding: '0.75rem',
                      fontFamily: 'var(--fuente-titulos)',
                      fontStyle: 'italic'
                    }}>
                      Iniciar Sesión
                    </Button>
                  </div>
                  
                  <div className="text-center mt-4">
                    <span style={{ color: 'var(--color-primario)', fontSize: '0.88rem' }}>¿Aún no tienes tu acceso? </span>
                    <Link to="/registro" className="text-decoration-none" style={{ 
                      color: 'var(--color-acento-1)', 
                      fontSize: '0.9rem',
                      fontWeight: 'bold' 
                    }}>
                      Regístrate aquí
                    </Link>
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

export default Login;