import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Card, Nav, Button, Modal, Form } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { House, CarFront, Wallet2, DoorOpen, List, PersonCircle, ChevronLeft, ChevronRight, PencilSquare, Tools } from 'react-bootstrap-icons';
import Swal from 'sweetalert2';
import ThemeSwitcher from '../components/ThemeSwitcher';

const Dashboard = () => {
  const navigate = useNavigate();
  const [nombreUsuario, setNombreUsuario] = useState('');
  const [apellidoUsuario, setApellidoUsuario] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeSection, setActiveSection] = useState('inicio');
  const [showProfile, setShowProfile] = useState(false);
  const [profileData, setProfileData] = useState({ telefono: '', emergencia_nombre: '', emergencia_telefono: '' });
  const [profileErrors, setProfileErrors] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    const t = localStorage.getItem('umg-theme') || 'azul';
    document.documentElement.setAttribute('data-theme', t);

    const usuarioLogueadoStr = localStorage.getItem('usuarioParqueo');
    if (!usuarioLogueadoStr) {
      navigate('/login');
      return;
    }
    const usuarioLogueado = JSON.parse(usuarioLogueadoStr);
    setNombreUsuario(usuarioLogueado.nombres.split(' ')[0]);
    setApellidoUsuario(usuarioLogueado.apellidos?.split(' ')[0] || '');
  }, [navigate]);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Buenos días';
    if (hour < 18) return 'Buenas tardes';
    return 'Buenas noches';
  };

  const handleLogout = () => {
    Swal.fire({
      title: '¿Cerrar Sesión?',
      text: "Tendrás que volver a ingresar tus credenciales.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: 'var(--color-accion)',
      cancelButtonColor: 'var(--rojo-institucional)',
      confirmButtonText: 'Sí, salir',
      cancelButtonText: 'Cancelar',
      background: 'var(--fondo-blanco)',
      color: 'var(--color-primario)'
    }).then((result) => {
      if (result.isConfirmed) {
        localStorage.removeItem('usuarioParqueo');
        localStorage.removeItem('usuarioAdmin');
        navigate('/login');
      }
    });
  };

  const handleProfileSave = () => {
    const errors: { [key: string]: string } = {};

    if (!profileData.telefono.trim()) {
      errors.telefono = 'El teléfono es obligatorio';
    } else if (!/^[0-9]{8}$/.test(profileData.telefono.trim())) {
      errors.telefono = 'Debe contener exactamente 8 dígitos';
    }

    if (!profileData.emergencia_nombre.trim()) {
      errors.emergencia_nombre = 'El nombre de contacto es obligatorio';
    } else if (profileData.emergencia_nombre.trim().length < 3) {
      errors.emergencia_nombre = 'Mínimo 3 caracteres';
    }

    if (!profileData.emergencia_telefono.trim()) {
      errors.emergencia_telefono = 'El teléfono de emergencia es obligatorio';
    } else if (!/^[0-9]{8}$/.test(profileData.emergencia_telefono.trim())) {
      errors.emergencia_telefono = 'Debe contener exactamente 8 dígitos';
    }

    setProfileErrors(errors);

    if (Object.keys(errors).length > 0) {
      return; // Don't save if errors
    }

    setShowProfile(false);
    Swal.fire({
      title: 'Perfil Actualizado',
      text: 'Tus datos han sido guardados correctamente.',
      icon: 'success',
      timer: 1500,
      showConfirmButton: false
    });
  };

  const sidebarWidth = sidebarOpen ? 260 : 72;

  const menuItems = [
    { key: 'inicio', icon: <House size={18} />, label: 'Inicio' },
    { key: 'vehiculos', icon: <CarFront size={18} />, label: 'Mis Vehículos' },
    { key: 'pago', icon: <Wallet2 size={18} />, label: 'Pago' },
  ];

  // Placeholder content for sections that aren't "inicio"
  const renderPlaceholder = (title: string) => (
    <div className="d-flex flex-column align-items-center justify-content-center animate-fade-in" style={{ minHeight: '50vh' }}>
      <div className="icon-glass mb-4" style={{ padding: '30px' }}>
        <Tools size={48} style={{ color: 'var(--color-accion)' }} />
      </div>
      <h3 style={{ color: 'var(--color-primario)', fontFamily: 'var(--fuente-titulos)', fontStyle: 'italic' }}>
        {title}
      </h3>
      <p className="text-muted text-center" style={{ maxWidth: '400px' }}>
        Este módulo se encuentra actualmente en <strong>programación en curso</strong>. Estará disponible próximamente.
      </p>
      <div style={{ 
        display: 'inline-block', 
        padding: '8px 20px', 
        borderRadius: '20px',
        background: 'var(--color-fondo-claro)',
        color: 'var(--color-accion)',
        fontSize: '0.82rem',
        fontWeight: 600,
        letterSpacing: '0.03em'
      }}>
        🚧 En desarrollo
      </div>
    </div>
  );

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: 'var(--fondo-general)', fontFamily: 'var(--fuente-principal)' }}>
      
      {/* SIDEBAR — COLLAPSIBLE */}
      <div style={{ 
        width: `${sidebarWidth}px`, 
        minWidth: `${sidebarWidth}px`,
        background: 'linear-gradient(180deg, var(--color-primario) 0%, var(--color-primario-profundo) 100%)',
        color: 'white', 
        display: 'flex', 
        flexDirection: 'column',
        zIndex: 10,
        borderRight: '1px solid rgba(255,255,255,0.06)',
        transition: 'width 0.35s cubic-bezier(0.4, 0, 0.2, 1), min-width 0.35s cubic-bezier(0.4, 0, 0.2, 1)',
        overflow: 'hidden'
      }}>
        
        {/* Logo + Title */}
        <div style={{ padding: sidebarOpen ? '20px' : '16px 8px', borderBottom: '1px solid rgba(255,255,255,0.08)', transition: 'padding 0.3s ease' }} className="text-center">
          <img 
            src="/logo-color.png" 
            alt="UMG" 
            style={{ 
              width: sidebarOpen ? '85px' : '60px', 
              height: 'auto', 
              filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.4))',
              transition: 'width 0.3s ease',
              marginBottom: sidebarOpen ? '8px' : '0'
            }} 
          />
          {sidebarOpen && (
            <>
              <h4 className="mb-0" style={{ fontFamily: 'var(--fuente-titulos)', fontStyle: 'italic', color: 'var(--color-acento-2)', fontSize: '1.1rem' }}>
                MiUMG
              </h4>
              <span style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.45)', letterSpacing: '2px', textTransform: 'uppercase' }}>Control de Parqueo</span>
            </>
          )}
        </div>

        {/* Menu Items */}
        <Nav className="flex-column mt-3" style={{ flexGrow: 1, padding: '0 8px' }}>
          {menuItems.map((item) => (
            <Nav.Link
              key={item.key}
              onClick={() => setActiveSection(item.key)}
              className={`text-white d-flex align-items-center mb-1 sidebar-link ${activeSection === item.key ? 'sidebar-link-active' : ''}`}
              style={{ 
                padding: sidebarOpen ? '12px 16px' : '12px 0', 
                opacity: activeSection === item.key ? 1 : 0.65,
                justifyContent: sidebarOpen ? 'flex-start' : 'center',
                transition: 'all 0.3s ease'
              }}
              title={item.label}
            >
              <span style={{ color: activeSection === item.key ? 'var(--color-acento-2)' : 'inherit', minWidth: '18px', textAlign: 'center' }}>
                {item.icon}
              </span>
              {sidebarOpen && <span className="ms-3">{item.label}</span>}
            </Nav.Link>
          ))}
        </Nav>

        {/* Collapse toggle */}
        <div style={{ padding: '8px', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
          <Button 
            variant="link" 
            className="d-flex align-items-center w-100 text-decoration-none p-2 sidebar-link"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            style={{ color: 'rgba(255,255,255,0.5)', justifyContent: sidebarOpen ? 'flex-start' : 'center' }}
          >
            {sidebarOpen ? <><ChevronLeft size={16} className="me-3" /> Minimizar</> : <ChevronRight size={16} />}
          </Button>
        </div>

        {/* Logout */}
        <div style={{ padding: '8px 8px 16px', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
          <Button 
            variant="link" 
            className="d-flex align-items-center w-100 text-decoration-none p-2 sidebar-link" 
            onClick={handleLogout}
            style={{ color: '#ff6b6b', justifyContent: sidebarOpen ? 'flex-start' : 'center' }}
          >
            <DoorOpen size={18} />
            {sidebarOpen && <span className="ms-3">Cerrar Sesión</span>}
          </Button>
        </div>
      </div>

      {/* MAIN AREA */}
      <div style={{ flexGrow: 1, display: 'flex', flexDirection: 'column', transition: 'margin-left 0.3s ease' }}>
        
        {/* Topbar — No bell, user name + profile */}
        <div style={{ 
          backgroundColor: 'rgba(255,255,255,0.85)', 
          backdropFilter: 'blur(12px)',
          padding: '12px 30px', 
          borderBottom: '1px solid rgba(0,0,0,0.05)',
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center' 
        }}>
          <div>
            <List 
              size={24} 
              style={{ color: 'var(--color-primario)', cursor: 'pointer' }} 
              onClick={() => setSidebarOpen(!sidebarOpen)}
            />
          </div>
          <div 
            className="d-flex align-items-center gap-2" 
            style={{ cursor: 'pointer', padding: '6px 14px', borderRadius: '12px', transition: 'background 0.2s' }}
            onClick={() => setShowProfile(true)}
            onMouseOver={(e) => e.currentTarget.style.background = 'rgba(0,0,0,0.04)'}
            onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}
          >
            <div className="text-end">
              <div className="fw-bold" style={{ color: 'var(--color-primario)', fontSize: '0.9rem', lineHeight: 1.2 }}>
                {nombreUsuario} {apellidoUsuario}
              </div>
              <small style={{ color: 'var(--color-acento-1)', fontSize: '0.72rem' }}>Mi Perfil</small>
            </div>
            <PersonCircle size={34} style={{ color: 'var(--color-accion)' }} />
            <PencilSquare size={14} style={{ color: 'var(--color-acento-1)', opacity: 0.6 }} />
          </div>
        </div>

        {/* Content Area */}
        <Container fluid style={{ padding: '30px 40px', flexGrow: 1 }}>
          
          {activeSection === 'inicio' && (
            <>
              <div className="mb-4 animate-fade-in">
                <h2 className="mb-1" style={{ fontFamily: 'var(--fuente-titulos)', fontStyle: 'italic', color: 'var(--color-accion)' }}>
                  {getGreeting()}, {nombreUsuario}
                </h2>
                <p className="text-muted">Resumen de tu cuenta de parqueo en Campus Villa Nueva</p>
              </div>

              <Row className="g-4 stagger-children">
                {/* Tarjeta 1: Vehículos */}
                <Col lg={4} md={6}>
                  <Card className="border-0 h-100 stat-card animate-fade-in">
                    <div className="stat-accent" style={{ backgroundColor: 'var(--color-accion)' }}></div>
                    <Card.Body className="p-4 d-flex align-items-center">
                      <div className="icon-glass">
                        <CarFront size={28} style={{ color: 'var(--color-accion)' }} />
                      </div>
                      <div className="ms-4">
                        <p className="text-muted mb-1" style={{ fontSize: '0.8rem', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.03em' }}>Vehículos Registrados</p>
                        <h2 className="mb-0 fw-bold" style={{ color: 'var(--color-primario)' }}>0</h2>
                      </div>
                    </Card.Body>
                  </Card>
                </Col>

                {/* Tarjeta 2: Pago */}
                <Col lg={4} md={6}>
                  <Card className="border-0 h-100 stat-card animate-fade-in" style={{ cursor: 'pointer' }} onClick={() => setActiveSection('pago')}>
                    <div className="stat-accent" style={{ backgroundColor: 'var(--color-acento-2)' }}></div>
                    <Card.Body className="p-4 d-flex align-items-center">
                      <div className="icon-glass" style={{ background: 'linear-gradient(135deg, var(--color-fondo-claro), white)' }}>
                        <Wallet2 size={28} style={{ color: 'var(--color-accion)' }} />
                      </div>
                      <div className="ms-4">
                        <p className="text-muted mb-1" style={{ fontSize: '0.8rem', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.03em' }}>Pago de Parqueo</p>
                        <h4 className="mb-0 fw-bold" style={{ color: 'var(--color-acento-1)' }}>Ver estado</h4>
                      </div>
                    </Card.Body>
                  </Card>
                </Col>

                {/* Tarjeta CTA: Registro de vehículo */}
                <Col lg={4} md={12}>
                  <Card 
                    className="border-0 h-100 animate-fade-in" 
                    style={{ 
                      background: 'linear-gradient(135deg, #1a3a5c 0%, #0d253f 100%)',
                      borderRadius: '18px', 
                      cursor: 'pointer',
                      overflow: 'hidden',
                      position: 'relative',
                      boxShadow: '0 8px 30px rgba(13, 37, 63, 0.25)'
                    }}
                    onClick={() => setActiveSection('vehiculos')}
                  >
                    {/* Decorative glow */}
                    <div style={{
                      position: 'absolute', top: '-30px', right: '-30px',
                      width: '120px', height: '120px', borderRadius: '50%',
                      background: 'radial-gradient(circle, rgba(255,255,255,0.08) 0%, transparent 70%)',
                      pointerEvents: 'none'
                    }} />
                    <Card.Body className="p-4 d-flex flex-column justify-content-center" style={{ position: 'relative', zIndex: 1 }}>
                      <div className="d-flex align-items-center gap-2 mb-2">
                        <CarFront size={22} color="#ffffff" />
                        <h5 className="mb-0" style={{ fontFamily: 'var(--fuente-titulos)', fontStyle: 'italic', color: '#ffffff', fontSize: '1.15rem' }}>
                          ¿Nuevo Vehículo?
                        </h5>
                      </div>
                      <p className="mb-3" style={{ color: 'rgba(255,255,255,0.85)', fontSize: '0.86rem', lineHeight: 1.55 }}>
                        Registra tu placa y sube tu tarjeta de circulación para habilitar tu acceso.
                      </p>
                      <Button 
                        size="sm" 
                        className="btn-liquid" 
                        style={{ 
                          backgroundColor: '#ffffff', 
                          color: '#1a3a5c', 
                          border: 'none', 
                          fontWeight: 'bold', 
                          width: 'fit-content',
                          borderRadius: '10px',
                          padding: '8px 20px',
                          fontSize: '0.85rem'
                        }}
                        onClick={(e) => { e.stopPropagation(); setActiveSection('vehiculos'); }}
                      >
                        Registrar ahora →
                      </Button>
                    </Card.Body>
                  </Card>
                </Col>
              </Row>
            </>
          )}

          {activeSection === 'vehiculos' && renderPlaceholder('Mis Vehículos')}
          {activeSection === 'pago' && renderPlaceholder('Módulo de Pago')}

        </Container>
      </div>

      <ThemeSwitcher />

      {/* MODAL — PERFIL */}
      <Modal show={showProfile} onHide={() => setShowProfile(false)} centered>
        <div style={{ borderRadius: '22px', overflow: 'hidden' }}>
          {/* Header */}
          <div style={{
            background: 'linear-gradient(135deg, var(--color-primario), var(--color-primario-profundo))',
            padding: '24px 28px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <div className="d-flex align-items-center gap-3">
              <div style={{
                width: '48px', height: '48px', borderRadius: '50%',
                background: 'rgba(255,255,255,0.15)',
                border: '2px solid rgba(255,255,255,0.3)',
                display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}>
                <PersonCircle size={26} color="white" />
              </div>
              <div>
                <h5 className="mb-0" style={{ color: 'white', fontFamily: 'var(--fuente-titulos)', fontStyle: 'italic', fontSize: '1.1rem' }}>Editar Perfil</h5>
                <small style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.8rem' }}>{nombreUsuario} {apellidoUsuario}</small>
              </div>
            </div>
            <button type="button" className="btn-close btn-close-white" onClick={() => setShowProfile(false)} style={{ opacity: 0.7 }}></button>
          </div>

          {/* Body */}
          <div style={{ padding: '28px' }}>
            {/* Título: Contacto Personal */}
            <div className="mb-4">
              <h6 style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--color-primario)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '8px', textAlign: 'left' }}>Contacto Personal</h6>
              <div style={{ height: '2px', width: '40px', background: 'var(--color-primario)', borderRadius: '2px' }} />
            </div>

            {/* Teléfono Personal */}
            <Form.Group className="mb-4 text-start">
              <Form.Label style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--color-primario)', marginBottom: '8px' }}>Teléfono</Form.Label>
              <Form.Control 
                type="tel" 
                placeholder="Ingresa tu número (8 dígitos)"
                maxLength={8}
                value={profileData.telefono}
                onChange={(e) => { setProfileData({...profileData, telefono: e.target.value.replace(/\D/g, '')}); setProfileErrors({...profileErrors, telefono: ''}); }}
                isInvalid={!!profileErrors.telefono}
                style={{ padding: '12px 16px', fontSize: '0.95rem' }}
              />
              <Form.Control.Feedback type="invalid">{profileErrors.telefono}</Form.Control.Feedback>
            </Form.Group>

            {/* Título: Contacto de Emergencia */}
            <div className="mb-4 mt-2">
              <h6 style={{ fontSize: '0.82rem', fontWeight: 700, color: '#C7352E', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '8px', textAlign: 'left' }}>Contacto de Emergencia</h6>
              <div style={{ height: '2px', width: '40px', background: '#C7352E', borderRadius: '2px' }} />
            </div>

            {/* Nombre de contacto */}
            <Form.Group className="mb-4">
              <Form.Label style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--color-primario)', marginBottom: '8px' }}>Nombre del Contacto</Form.Label>
              <Form.Control 
                type="text" 
                placeholder="Nombre completo del familiar"
                value={profileData.emergencia_nombre}
                onChange={(e) => { setProfileData({...profileData, emergencia_nombre: e.target.value}); setProfileErrors({...profileErrors, emergencia_nombre: ''}); }}
                isInvalid={!!profileErrors.emergencia_nombre}
                style={{ padding: '12px 16px', fontSize: '0.95rem' }}
              />
              <Form.Control.Feedback type="invalid">{profileErrors.emergencia_nombre}</Form.Control.Feedback>
            </Form.Group>

            {/* Teléfono de emergencia */}
            <Form.Group className="mb-2">
              <Form.Label style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--color-primario)', marginBottom: '8px' }}>Teléfono de Emergencia</Form.Label>
              <Form.Control 
                type="tel" 
                placeholder="Número del contacto (8 dígitos)"
                maxLength={8}
                value={profileData.emergencia_telefono}
                onChange={(e) => { setProfileData({...profileData, emergencia_telefono: e.target.value.replace(/\D/g, '')}); setProfileErrors({...profileErrors, emergencia_telefono: ''}); }}
                isInvalid={!!profileErrors.emergencia_telefono}
                style={{ padding: '12px 16px', fontSize: '0.95rem' }}
              />
              <Form.Control.Feedback type="invalid">{profileErrors.emergencia_telefono}</Form.Control.Feedback>
            </Form.Group>
          </div>

          {/* Footer */}
          <div style={{ padding: '0 28px 24px', display: 'flex', gap: '12px' }}>
            <Button 
              variant="outline-secondary" 
              onClick={() => { setShowProfile(false); setProfileErrors({}); }} 
              style={{ borderRadius: '12px', flex: 1, padding: '10px' }}
            >
              Cancelar
            </Button>
            <Button 
              className="btn-liquid" 
              onClick={handleProfileSave}
              style={{ backgroundColor: 'var(--color-accion)', border: 'none', flex: 2, padding: '10px', borderRadius: '12px' }}
            >
              Guardar Cambios
            </Button>
          </div>
        </div>
      </Modal>

    </div>
  );
};

export default Dashboard;