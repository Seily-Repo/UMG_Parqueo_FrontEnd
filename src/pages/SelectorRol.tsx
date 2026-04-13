import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Modal } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { PersonBadge, PersonGear, PeopleFill, InfoCircle, CheckCircleFill, CreditCard2Back, FileEarmarkCheck, Camera, Wallet2 } from 'react-bootstrap-icons';
import ThemeSwitcher from '../components/ThemeSwitcher';

const HomeSelector = () => {
  const navigate = useNavigate();
  const [showRequisitos, setShowRequisitos] = useState(false);
  const [theme, setTheme] = useState(() => localStorage.getItem('umg-theme') || 'azul');

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('umg-theme', theme);
  }, [theme]);

  const handleClose = () => setShowRequisitos(false);
  const handleShow = () => setShowRequisitos(true);

  return (
    <div className="bg-mesh" style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      flexDirection: 'column',
      fontFamily: 'var(--fuente-principal)',
      position: 'relative',
      overflow: 'hidden'
    }}>
      
      <div className="deco-circle deco-circle-1" />
      <div className="deco-circle deco-circle-2" />
      <div className="deco-circle deco-circle-3" />

      {/* --- HEADER --- */}
      <div className="header-glass" style={{ padding: '12px 0', zIndex: 10 }}>
        <Container className="d-flex justify-content-between align-items-center">
          <div className="d-flex align-items-center">
            <img src="/logo-color.png" alt="UMG" style={{ height: '48px', marginRight: '14px', filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))' }} />
            <h4 className="mb-0 text-white" style={{ fontFamily: 'var(--fuente-titulos)', fontStyle: 'italic', color: 'white' }}>
              Sistema de Control de Parqueo
            </h4>
          </div>
          <div className="d-flex align-items-center gap-3">
            <Button 
              variant="outline-light" 
              onClick={handleShow}
              className="d-flex align-items-center gap-2 btn-liquid"
              style={{ borderRadius: '20px', fontSize: '0.85rem', border: '1px solid rgba(255,255,255,0.3)', background: 'rgba(255,255,255,0.08)' }}
            >
              <InfoCircle /> Requisitos y Pagos
            </Button>
          </div>
        </Container>
      </div>

      {/* --- CONTENIDO PRINCIPAL --- */}
      <Container className="flex-grow-1 d-flex align-items-center justify-content-center py-5" style={{ position: 'relative', zIndex: 1 }}>
        <div style={{ maxWidth: '1000px', width: '100%' }}>
          <div className="text-center mb-5 animate-fade-in">
            <h1 style={{ color: 'var(--color-accion)', fontSize: '2.5rem', marginBottom: '10px' }}>
              Bienvenido al Portal
            </h1>
            <p className="text-muted" style={{ fontSize: '1.1rem' }}>
              Selecciona tu perfil para ingresar al sistema de gestión de parqueos
            </p>
          </div>

          <Row className="g-4 stagger-children">
            <Col md={4}>
              <Card 
                className="h-100 border-0 text-center liquid-card-interactive animate-fade-in" 
                style={{ borderRadius: '20px' }}
                onClick={() => navigate('/login')}
              >
                <Card.Body className="p-4 d-flex flex-column align-items-center">
                  <div className="icon-glass" style={{ marginBottom: '20px' }}>
                    <PersonBadge size={45} style={{ color: 'var(--color-accion)' }} />
                  </div>
                  <h4 className="fw-bold" style={{ color: 'var(--color-primario)', fontSize: '1.25rem' }}>Estudiante / Catedrático</h4>
                  <p className="text-muted small mt-2">Ingresa con carné para alumnos y docentes activos.</p>
                  <Button className="mt-auto w-100 btn-liquid" style={{ backgroundColor: 'var(--color-accion)', border: 'none', borderRadius: '12px' }}>
                    Ingresar
                  </Button>
                </Card.Body>
              </Card>
            </Col>

            <Col md={4}>
              <Card 
                className="h-100 border-0 text-center liquid-card-interactive animate-fade-in" 
                style={{ borderRadius: '20px' }}
                onClick={() => navigate('/login-admin')}
              >
                <Card.Body className="p-4 d-flex flex-column align-items-center">
                  <div className="icon-glass" style={{ marginBottom: '20px', background: `linear-gradient(135deg, var(--color-fondo-suave), color-mix(in srgb, var(--color-fondo-suave) 40%, white))` }}>
                    <PersonGear size={45} style={{ color: 'var(--color-primario)' }} />
                  </div>
                  <h4 className="fw-bold" style={{ color: 'var(--color-primario)', fontSize: '1.25rem' }}>Administrativo</h4>
                  <p className="text-muted small mt-2">Ingreso con correo para colaboradores de parqueo.</p>
                  <Button className="mt-auto w-100 btn-liquid" style={{ backgroundColor: 'var(--color-primario)', border: 'none', borderRadius: '12px' }}>
                    Gestionar
                  </Button>
                </Card.Body>
              </Card>
            </Col>

            <Col md={4}>
              <Card 
                className="h-100 border-0 text-center liquid-card-interactive animate-fade-in"
                style={{ borderRadius: '20px' }}
              >
                <Card.Body className="p-4 d-flex flex-column align-items-center">
                  <div className="icon-glass" style={{ marginBottom: '20px', background: 'linear-gradient(135deg, #e8eaed, rgba(226, 227, 229, 0.4))' }}>
                    <PeopleFill size={45} style={{ color: '#495057' }} />
                  </div>
                  <h4 className="fw-bold" style={{ color: 'var(--color-primario)', fontSize: '1.25rem' }}>Gestión de Usuarios</h4>
                  <p className="text-muted small mt-2">Acceso restringido para creación de cuentas administrativas.</p>
                  <Button className="mt-auto w-100 btn-liquid" variant="secondary" style={{ borderRadius: '12px' }}>
                    Acceder
                  </Button>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </div>
      </Container>

      {/* --- FOOTER --- */}
      <div className="footer-glass" style={{ color: 'white', padding: '20px 0', textAlign: 'center', zIndex: 10 }}>
        <Container>
          <small>&copy; 2026 Universidad Mariano Gálvez de Guatemala - Facultad de Ingeniería</small>
        </Container>
      </div>

      <ThemeSwitcher />

      {/* --- MODAL DE REQUISITOS (PREMIUM) --- */}
      <Modal show={showRequisitos} onHide={handleClose} size="lg" centered>
        <div className="modal-header-premium d-flex justify-content-between align-items-center">
          <div className="d-flex align-items-center gap-3">
            <img src="/logo-color.png" alt="UMG" style={{ height: '40px', filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))' }} />
            <div>
              <h5 className="mb-0" style={{ fontFamily: 'var(--fuente-titulos)', fontStyle: 'italic', color: 'white', fontSize: '1.15rem' }}>
                Requisitos y Pagos
              </h5>
              <small style={{ opacity: 0.7 }}>Sistema de Control de Parqueo UMG</small>
            </div>
          </div>
          <button type="button" className="btn-close" onClick={handleClose}></button>
        </div>
        <div className="p-4">
          <Row>
            <Col md={6} className="mb-3 mb-md-0">
              <h6 className="fw-bold mb-3 d-flex align-items-center gap-2" style={{ color: 'var(--color-primario)' }}>
                <FileEarmarkCheck size={18} /> ¿Cómo crear tu cuenta?
              </h6>
              <div className="requisito-item">
                <div className="requisito-icon requisito-icon-green"><CheckCircleFill /></div>
                <span style={{ fontSize: '0.9rem' }}>Ser estudiante o catedrático <strong>activo</strong> de la UMG.</span>
              </div>
              <div className="requisito-item">
                <div className="requisito-icon requisito-icon-green"><CheckCircleFill /></div>
                <span style={{ fontSize: '0.9rem' }}>Contar con correo institucional <strong>@miumg.edu.gt</strong>.</span>
              </div>
              <div className="requisito-item">
                <div className="requisito-icon requisito-icon-green"><CheckCircleFill /></div>
                <span style={{ fontSize: '0.9rem' }}>Completar formulario con <strong>datos de emergencia</strong>.</span>
              </div>
            </Col>
            <Col md={6}>
              <h6 className="fw-bold mb-3 d-flex align-items-center gap-2" style={{ color: 'var(--color-primario)' }}>
                <CreditCard2Back size={18} /> Requisitos de Marbete
              </h6>
              <div className="requisito-item">
                <div className="requisito-icon requisito-icon-blue"><CreditCard2Back /></div>
                <span style={{ fontSize: '0.9rem' }}>Tarjeta de circulación <strong>vigente</strong> del vehículo.</span>
              </div>
              <div className="requisito-item">
                <div className="requisito-icon requisito-icon-blue"><Camera /></div>
                <span style={{ fontSize: '0.9rem' }}>Fotografía <strong>legible</strong> de la placa.</span>
              </div>
              <div className="requisito-item">
                <div className="requisito-icon requisito-icon-blue"><Wallet2 /></div>
                <span style={{ fontSize: '0.9rem' }}>Comprobante de <strong>pago</strong> del ciclo actual.</span>
              </div>
            </Col>
          </Row>
          <div className="mt-4 p-3 rounded-3" style={{ 
            background: `linear-gradient(135deg, var(--color-fondo-claro), color-mix(in srgb, var(--color-fondo-claro) 40%, white))`,
            border: `1px solid color-mix(in srgb, var(--color-accion) 15%, transparent)`
          }}>
            <small style={{ color: 'var(--color-primario)' }}>
              <strong>📋 Nota:</strong> Los pagos se realizan únicamente a través del portal de pagos oficial de la Universidad o en agencias bancarias autorizadas.
            </small>
          </div>
        </div>
        <div className="px-4 pb-4 d-flex justify-content-end">
          <Button className="btn-liquid px-4" style={{ backgroundColor: 'var(--color-accion)', border: 'none' }} onClick={handleClose}>
            Entendido
          </Button>
        </div>
      </Modal>

    </div>
  );
};

export default HomeSelector;