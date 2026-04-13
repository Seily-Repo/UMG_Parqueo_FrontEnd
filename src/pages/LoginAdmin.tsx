import React, { useEffect } from 'react';
import { Container, Row, Col, Card, Form, Button } from 'react-bootstrap';
import { useNavigate, Link } from 'react-router-dom';
import Swal from 'sweetalert2';
import ThemeSwitcher from '../components/ThemeSwitcher';
import '../index.css'; 

const LoginAdmin = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const t = localStorage.getItem('umg-theme') || 'azul';
    document.documentElement.setAttribute('data-theme', t);
  }, []);

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
        if (data.usuario.rol === 1) {
          Swal.fire({
            title: 'Acceso Restringido',
            text: 'Esta área es solo para personal administrativo.',
            icon: 'warning',
            confirmButtonColor: 'var(--rojo-institucional)'
          });
          return;
        }

        localStorage.setItem('usuarioAdmin', JSON.stringify(data.usuario));
        const primerNombre = data.usuario.nombres.split(' ')[0];

        Swal.fire({
          title: `¡Hola de nuevo, ${primerNombre}!`,
          text: 'Acceso concedido al panel de administración.',
          icon: 'success',
          timer: 1500,
          showConfirmButton: false,
          background: 'var(--fondo-blanco)',
          color: 'var(--color-primario)'
        }).then(() => {
          navigate('/dashboard'); 
        });

      } else {
        Swal.fire({
          title: 'Acceso Denegado',
          text: data.error || 'Credenciales administrativas incorrectas.',
          icon: 'error',
          confirmButtonText: 'Reintentar',
          confirmButtonColor: 'var(--rojo-institucional)'
        });
      }
    } catch (error) {
      Swal.fire({
        title: 'Error de Servidor',
        text: 'No se pudo conectar con el servidor central.',
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
              <div className="accent-bar" style={{ backgroundColor: 'var(--color-primario)' }} />
              
              <Card.Body className="p-4 pt-5 pb-5">
                <div className="text-center mb-4">
                  <div className="mb-3 animate-float logo-halo">
                    <img src="/logo.png" alt="Logo UMG" className="logo-panel" style={{ width: '110px', height: 'auto' }} />
                  </div>
                  <h2 className="mb-1" style={{ color: 'var(--color-primario)' }}>
                    Portal Administrativo
                  </h2>
                  <p style={{ color: 'var(--color-accion)', fontSize: '0.88rem', marginBottom: 0 }}>
                    Gestión de Parqueo UMG
                  </p>
                </div>

                <Form onSubmit={handleSubmit} style={{ fontFamily: 'var(--fuente-principal)' }}>
                  <Form.Group className="mb-4">
                    <Form.Label className="fw-bold" style={{ color: 'var(--color-primario)' }}>Correo Electrónico Institucional</Form.Label>
                    <Form.Control 
                      name="correo_electronico"
                      type="email" 
                      required 
                      placeholder="usuario@miumg.edu.gt" 
                      className="py-2"
                    />
                  </Form.Group>

                  <Form.Group className="mb-4">
                    <Form.Label style={{ color: 'var(--color-primario)', fontWeight: 'bold' }}>Contraseña de Seguridad</Form.Label>
                    <Form.Control 
                      name="password" type="password" required 
                      placeholder="Ingresa tu contraseña"
                    />
                  </Form.Group>

                  <div className="d-grid mt-4">
                    <Button type="submit" size="lg" className="btn-liquid" style={{ 
                      backgroundColor: 'var(--color-primario)', 
                      border: 'none',
                      fontSize: '1rem',
                      fontWeight: 'bold',
                      padding: '0.75rem',
                      fontFamily: 'var(--fuente-titulos)',
                      fontStyle: 'italic'
                    }}>
                      Acceder a Gestión
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

export default LoginAdmin;