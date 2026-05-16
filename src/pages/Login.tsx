import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Card, Form, Button, Modal } from 'react-bootstrap';
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

  const [showRecoverModal, setShowRecoverModal] = useState(false);

  const handleRecoverPassword = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const correo_electronico = formData.get('correo_electronico')?.toString().trim();

    try {
      const response = await fetch('/api/auth/recuperar-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ correo_electronico }),
      });

      if (response.ok) {
        Swal.fire({ title: '¡Solicitud Enviada!', text: 'Si el correo está registrado, recibirás un enlace para recuperar tu contraseña.', icon: 'success', confirmButtonColor: 'var(--color-accion)' });
        setShowRecoverModal(false);
      } else {
        const data = await response.json();
        Swal.fire({ title: 'Error', text: data.error || 'No se pudo procesar la solicitud.', icon: 'error', confirmButtonColor: 'var(--rojo-institucional)' });
      }
    } catch (error) {
      Swal.fire({ title: 'Error', text: 'No se pudo conectar con el servidor.', icon: 'error', confirmButtonColor: 'var(--rojo-institucional)' });
    }
  };

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
      const response = await fetch('/api/auth/login', {
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

                <Form onSubmit={handleSubmit} autoComplete="off" style={{ fontFamily: 'var(--fuente-principal)' }}>
                  <Form.Group className="mb-4">
                    <Form.Label className="fw-bold" style={{ color: 'var(--color-primario)' }}>
                      {labelUsuario} {/* 🔥 ETIQUETA DINÁMICA */}
                    </Form.Label>
                    <Form.Control 
                      name="identificador"
                      type={tipoPerfil === 'admin' ? "email" : "text"} // Si es admin fuerza teclado de email
                      required 
                      autoComplete="off"
                      placeholder={placeholderUsuario} // 🔥 PLACEHOLDER DINÁMICO
                      className="py-2"
                    />
                  </Form.Group>

                  <Form.Group className="mb-4">
                    <Form.Label style={{ color: 'var(--color-primario)', fontWeight: 'bold' }}>
                      Contraseña de Seguridad
                    </Form.Label>
                    <Form.Control name="password" type="password" required autoComplete="new-password" placeholder="Ingresa tu contraseña" />
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

                  <div className="text-center mt-3">
                    <Button variant="link" className="text-decoration-none" style={{ color: 'var(--color-primario)', fontSize: '0.85rem' }} onClick={() => setShowRecoverModal(true)}>
                      ¿Olvidaste tu contraseña?
                    </Button>
                  </div>
                </Form>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
      <ThemeSwitcher />

      {/* Modal Recuperar Contraseña */}
      <Modal show={showRecoverModal} onHide={() => setShowRecoverModal(false)} centered>
        <div style={{ borderRadius: '22px', overflow: 'hidden' }}>
          <div style={{ background: 'linear-gradient(135deg, var(--color-primario), var(--color-primario-profundo))', padding: '24px 28px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h5 className="mb-0" style={{ color: 'white', fontFamily: 'var(--fuente-titulos)', fontStyle: 'italic' }}>Recuperar Contraseña</h5>
            <button type="button" className="btn-close btn-close-white" onClick={() => setShowRecoverModal(false)} style={{ opacity: 0.7 }}></button>
          </div>
          <Form onSubmit={handleRecoverPassword}>
            <Modal.Body className="p-4" style={{ backgroundColor: 'var(--fondo-blanco)' }}>
              <p className="text-muted mb-4" style={{ fontSize: '0.9rem' }}>
                Ingresa tu correo electrónico y te enviaremos las instrucciones para restablecer tu contraseña de acceso.
              </p>
              <Form.Group>
                <Form.Label className="fw-bold" style={{ color: 'var(--color-primario)' }}>Correo Electrónico</Form.Label>
                <Form.Control name="correo_electronico" type="email" required placeholder="usuario@miumg.edu.gt" />
              </Form.Group>
            </Modal.Body>
            <div style={{ padding: '0 24px 24px', backgroundColor: 'var(--fondo-blanco)', display: 'flex', gap: '10px' }}>
              <Button variant="outline-secondary" onClick={() => setShowRecoverModal(false)} style={{ flex: 1, borderRadius: '12px' }}>Cancelar</Button>
              <Button type="submit" className="btn-liquid" style={{ flex: 2, backgroundColor: 'var(--color-accion)', border: 'none', borderRadius: '12px' }}>Enviar Instrucciones</Button>
            </div>
          </Form>
        </div>
      </Modal>
    </div>
  );
};

export default Login;