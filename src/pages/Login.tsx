import React, { useEffect } from 'react';
import { Container, Row, Col, Card, Form, Button } from 'react-bootstrap';
import { useNavigate, Link, useLocation } from 'react-router-dom'; // 🔥 Agregamos useLocation
import Swal from 'sweetalert2';
import ThemeSwitcher from '../components/ThemeSwitcher';
import '../index.css'; 

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation(); 
  
  // 🔥 LEEMOS EL MENSAJE OCULTO (Si no hay mensaje, asume que es estudiante)
  const tipoPerfil = location.state?.tipoPerfil || 'estudiante';

  // 🔥 CONFIGURAMOS LOS TEXTOS DINÁMICOS
  const tituloPortal = tipoPerfil === 'admin' ? 'Portal Administrativo' : 'Portal de Acceso';
  const labelUsuario = tipoPerfil === 'admin' ? 'Correo Institucional' : 'Usuario Institucional';
  const placeholderUsuario = tipoPerfil === 'admin' ? 'admin@miumg.edu.gt' : 'Carné o correo@miumg.edu.gt';

  useEffect(() => {
    const t = localStorage.getItem('umg-theme') || 'azul';
    document.documentElement.setAttribute('data-theme', t);
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const identificadorCrudo = formData.get('identificador')?.toString().trim() || '';
    const password = formData.get('password')?.toString() || '';

    // El detector inteligente sigue trabajando igual por debajo
    const payload: any = { password: password };
    if (identificadorCrudo.includes('@')) {
      payload.correo_institucional = identificadorCrudo;
    } else {
      payload.carne = identificadorCrudo;
    }

    try {
      const response = await fetch('http://localhost:3001/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('token', data.token);

        if (data.usuario.rol === 'ADMINISTRADOR') {
          localStorage.setItem('usuarioAdmin', JSON.stringify(data.usuario));
          const primerNombre = data.usuario.nombres.split(' ')[0];
          Swal.fire({ title: `¡Hola, ${primerNombre}!`, text: 'Acceso administrativo concedido.', icon: 'success', timer: 1500, showConfirmButton: false, background: 'var(--fondo-blanco)', color: 'var(--color-primario)' }).then(() => navigate('/dashboard-admin'));
          return;
        }

        if (data.usuario.requiereCambioPass === true) {
          localStorage.setItem('usuarioPendiente', JSON.stringify(data.usuario));
          Swal.fire({ title: 'Atención requerida', text: 'Estás usando una contraseña temporal. Por seguridad, debes cambiarla ahora mismo.', icon: 'info', confirmButtonColor: 'var(--azul-universitario)' }).then(() => navigate('/cambiar-password'));
          return;
        }

        localStorage.setItem('usuarioParqueo', JSON.stringify(data.usuario));
        const primerNombre = data.usuario.nombres.split(' ')[0];
        Swal.fire({ title: `¡Bienvenido, ${primerNombre}!`, text: 'Acceso concedido al sistema de parqueo.', icon: 'success', timer: 1500, showConfirmButton: false, background: 'var(--fondo-blanco)', color: 'var(--color-primario)' }).then(() => navigate('/dashboard'));

      } else {
        Swal.fire({ title: 'Acceso Denegado', text: data.error || 'Usuario o contraseña incorrectos.', icon: 'error', confirmButtonText: 'Reintentar', confirmButtonColor: 'var(--rojo-institucional)' });
      }
    } catch (error) {
      Swal.fire({ title: 'Error de Servidor', text: 'No se pudo conectar con la base de datos central.', icon: 'error', confirmButtonColor: 'var(--rojo-institucional)' });
    }
  };

  return (
    <div className="bg-mesh" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', position: 'relative', overflow: 'hidden' }}>
      <div className="deco-circle deco-circle-1" />
      <div className="deco-circle deco-circle-2" />
      <div className="deco-circle deco-circle-3" />

      <Container style={{ position: 'relative', zIndex: 1 }}>
        <Row className="justify-content-center">
          <Col md={5} lg={4}>
            
            <div className="text-center mb-3 animate-fade-in">
              <Link to="/" className="text-decoration-none" style={{ color: 'var(--color-primario)', fontSize: '0.9rem', fontWeight: 'bold' }}>
                &larr; Regresar al inicio
              </Link>
            </div>

            <Card className="border-0 liquid-card animate-fade-in" style={{ borderRadius: '20px', overflow: 'hidden' }}>
              <div className="accent-bar" style={{ backgroundColor: 'var(--color-primario)' }} />
              
              <Card.Body className="p-4 pt-5 pb-5">
                <div className="text-center mb-4">
                  <div className="mb-3 animate-float logo-halo">
                    <img src="/logo.png" alt="Logo UMG" className="logo-panel" style={{ width: '110px', height: 'auto' }} />
                  </div>
                  <h2 className="mb-1" style={{ color: 'var(--color-primario)' }}>
                    {tituloPortal} {/* 🔥 TÍTULO DINÁMICO */}
                  </h2>
                  <p style={{ color: 'var(--color-accion)', fontSize: '0.88rem', marginBottom: 0 }}>
                    Sistema de Parqueo UMG
                  </p>
                </div>

                <Form onSubmit={handleSubmit} style={{ fontFamily: 'var(--fuente-principal)' }}>
                  <Form.Group className="mb-4">
                    <Form.Label className="fw-bold" style={{ color: 'var(--color-primario)' }}>
                      {labelUsuario} {/* 🔥 ETIQUETA DINÁMICA */}
                    </Form.Label>
                    <Form.Control 
                      name="identificador"
                      type={tipoPerfil === 'admin' ? "email" : "text"} // Si es admin fuerza teclado de email
                      required 
                      placeholder={placeholderUsuario} // 🔥 PLACEHOLDER DINÁMICO
                      className="py-2"
                    />
                  </Form.Group>

                  <Form.Group className="mb-4">
                    <Form.Label style={{ color: 'var(--color-primario)', fontWeight: 'bold' }}>
                      Contraseña de Seguridad
                    </Form.Label>
                    <Form.Control name="password" type="password" required placeholder="Ingresa tu contraseña" />
                  </Form.Group>

                  <div className="d-grid mt-4">
                    <Button type="submit" size="lg" className="btn-liquid" style={{ backgroundColor: 'var(--color-primario)', border: 'none', fontSize: '1rem', fontWeight: 'bold', padding: '0.75rem', fontFamily: 'var(--fuente-titulos)', fontStyle: 'italic' }}>
                      Iniciar Sesión
                    </Button>
                  </div>
                  
                  {/* Solo le mostramos el link de registro a los estudiantes/catedráticos */}
                  {tipoPerfil !== 'admin' && (
                    <div className="text-center mt-4">
                      <Link to="/registro" className="text-decoration-none fw-bold" style={{ color: 'var(--color-accion)' }}>
                        ¿No tienes cuenta? Regístrate aquí
                      </Link>
                    </div>
                  )}
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