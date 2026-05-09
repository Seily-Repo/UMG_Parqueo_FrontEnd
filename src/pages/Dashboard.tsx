import { useEffect, useState } from 'react';
import { Container, Row, Col, Card, Nav, Button, Modal, Form, Badge, Alert } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { 
  House, CarFront, Wallet2, DoorOpen, List, PersonCircle, 
  ChevronLeft, ChevronRight, PencilSquare, Tools, PlusCircle, Building, Envelope, Telephone,
  ExclamationCircleFill, CreditCardFill, InfoCircleFill
} from 'react-bootstrap-icons';
import Swal from 'sweetalert2';
import ThemeSwitcher from '../components/ThemeSwitcher';

const API_BASE = '/api';
const COBROS_URL = 'http://10.0.40.10:4000';

const Dashboard = () => {
  const navigate = useNavigate();
  const [usuario, setUsuario] = useState<any>(null); 
  const [nombreUsuario, setNombreUsuario] = useState('');
  const [apellidoUsuario, setApellidoUsuario] = useState('');
  const [carneUsuario, setCarneUsuario] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeSection, setActiveSection] = useState('inicio');
  
  const [showProfile, setShowProfile] = useState(false);

  const [vehiculos, setVehiculos] = useState<any[]>([]);
  const [planes, setPlanes] = useState<any[]>([]);
  const [listaDeuda, setListaDeuda] = useState<any[]>([]); 
  const [showVehiculoModal, setShowVehiculoModal] = useState(false);
  const [nuevoVehiculo, setNuevoVehiculo] = useState({ tipo_vehiculo: 'AUTOMOVIL', placa: '', marca: '', modelo: '', color: '', plan_id: '' });

  useEffect(() => {
    const t = localStorage.getItem('umg-theme') || 'azul';
    document.documentElement.setAttribute('data-theme', t);

    const usuarioLogueadoStr = localStorage.getItem('usuarioParqueo');
    if (!usuarioLogueadoStr) {
      navigate('/login');
      return;
    }
    const usuarioLogueado = JSON.parse(usuarioLogueadoStr);
    setUsuario(usuarioLogueado);
    setNombreUsuario(usuarioLogueado.nombres.split(' ')[0]);
    setApellidoUsuario(usuarioLogueado.apellidos?.split(' ')[0] || '');
    setCarneUsuario(usuarioLogueado.carne);

    cargarPlanes();
  }, [navigate]);

  useEffect(() => {
    if ((activeSection === 'vehiculos' || activeSection === 'inicio' || activeSection === 'pago') && carneUsuario) {
      cargarVehiculos();
      cargarDeuda(); 
    }
  }, [activeSection, carneUsuario]);

  const cargarVehiculos = async () => {
    try {
      const carneLimpio = carneUsuario.replace(/-/g, '');
      const response = await fetch(`${API_BASE}/vehiculos/${carneLimpio}`);
      if (response.ok) {
        setVehiculos(await response.json());
      }
    } catch (error) {
      console.error("Error al cargar vehículos:", error);
    }
  };

  const cargarPlanes = async () => {
    try {
      const response = await fetch(`${API_BASE}/planes`);
      if (response.ok) {
        setPlanes(await response.json());
      }
    } catch (error) {
      console.error("Error al cargar planes:", error);
    }
  };

  const cargarDeuda = async () => {
    try {
      const carneLimpio = carneUsuario.replace(/-/g, '');
      const response = await fetch(`${API_BASE}/pagos/lista-pendiente/${carneLimpio}`);
      if (response.ok) {
        setListaDeuda(await response.json());
      }
    } catch (error) {
      console.error("Error al cargar deuda:", error);
    }
  };

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

  const esPrimerVehiculo = vehiculos.length === 0;

  const handleGuardarVehiculo = async () => {
    if (!nuevoVehiculo.placa) {
      Swal.fire('Error', 'La placa es obligatoria', 'error');
      return;
    }

    if (esPrimerVehiculo && !nuevoVehiculo.plan_id) {
      Swal.fire('Error', 'Debes seleccionar un plan de parqueo para tu primer vehículo', 'warning');
      return;
    }

    try {
      const response = await fetch(`${API_BASE}/vehiculos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...nuevoVehiculo, carne_usuario: carneUsuario.replace(/-/g, '') })
      });

      if (response.ok) {
        const resData = await response.json();
        const planIdParaCobros = resData.plan_id || nuevoVehiculo.plan_id;

        Swal.fire({
          title: '¡Vehículo Registrado!',
          text: planIdParaCobros
            ? 'Tu vehículo se guardó exitosamente. Serás redirigido al portal de pagos.'
            : 'Tu vehículo se guardó exitosamente.',
          icon: 'success',
          showCancelButton: !!planIdParaCobros,
          confirmButtonColor: 'var(--color-accion)',
          cancelButtonColor: '#6c757d',
          confirmButtonText: planIdParaCobros ? 'Ir a pagar ahora' : 'Aceptar',
          cancelButtonText: 'Ver mis vehículos'
        }).then((result) => {
          setShowVehiculoModal(false);
          setNuevoVehiculo({ tipo_vehiculo: 'AUTOMOVIL', placa: '', marca: '', modelo: '', color: '', plan_id: '' });
          cargarVehiculos(); 
          cargarDeuda();
          
          if (result.isConfirmed && planIdParaCobros) {
            // Opción B: Redirigir al portal de cobros-dev con parámetros por URL
            window.location.href = `${COBROS_URL}/parking/user?carne=${carneUsuario.replace(/-/g, '')}&plan_id=${planIdParaCobros}&vehiculo=nuevo`;
          } else {
            setActiveSection('vehiculos');
          }
        });
      } else {
        const errorData = await response.json();
        Swal.fire('Atención', errorData.error || 'No se pudo guardar el vehículo', 'warning');
      }
    } catch (error) {
      Swal.fire('Error de Conexión', 'No se pudo conectar con el servidor', 'error');
    }
  };

  const sidebarWidth = sidebarOpen ? 260 : 72;

  const menuItems = [
    { key: 'inicio', icon: <House size={18} />, label: 'Inicio' },
    { key: 'vehiculos', icon: <CarFront size={18} />, label: 'Mis Vehículos' },
    { key: 'pago', icon: <Wallet2 size={18} />, label: 'Pago' },
    { key: 'disponibilidad', icon: <Building size={18} />, label: 'Disponibilidad' },
  ];

  const renderPlaceholder = (title: string) => (
    <div className="d-flex flex-column align-items-center justify-content-center animate-fade-in" style={{ minHeight: '50vh' }}>
      <div className="icon-glass mb-4" style={{ padding: '30px' }}>
        <Tools size={48} style={{ color: 'var(--color-accion)' }} />
      </div>
      <h3 style={{ color: 'var(--color-primario)', fontFamily: 'var(--fuente-titulos)', fontStyle: 'italic' }}>{title}</h3>
      <p className="text-muted text-center" style={{ maxWidth: '400px' }}>Este módulo se encuentra actualmente en <strong>programación en curso</strong>.</p>
    </div>
  );

  const renderVehiculosSection = () => (
    <div className="animate-fade-in">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="mb-1" style={{ fontFamily: 'var(--fuente-titulos)', fontStyle: 'italic', color: 'var(--color-accion)' }}>Mis Vehículos</h2>
          <p className="text-muted">Administra los carros o motocicletas asociados a tu carné.</p>
        </div>
        <Button className="btn-liquid d-flex align-items-center gap-2" style={{ backgroundColor: 'var(--color-accion)', border: 'none', borderRadius: '12px', padding: '10px 20px', fontWeight: 'bold' }} onClick={() => setShowVehiculoModal(true)}>
          <PlusCircle size={18} /> Registrar Vehículo
        </Button>
      </div>

      {vehiculos.length === 0 ? (
        <Card className="border-0 shadow-sm text-center p-5 rounded-4 liquid-card">
          <CarFront size={60} className="text-muted mb-3 mx-auto" style={{ opacity: 0.5 }} />
          <h4 className="text-muted">No tienes vehículos registrados</h4>
        </Card>
      ) : (
        <Row className="g-4">
          {vehiculos.map((v) => (
            <Col md={6} lg={4} key={v.ID_VEHICULO}>
              <Card className="border-0 shadow-sm h-100 liquid-card rounded-4 overflow-hidden">
                <div style={{ height: '4px', backgroundColor: 'var(--color-accion)' }} />
                <Card.Body className="p-4">
                  <div className="d-flex justify-content-between align-items-start mb-3">
                    <div className="icon-glass p-3"><CarFront size={24} style={{ color: 'var(--color-primario)' }} /></div>
                    <Badge bg={v.TIPO_VEHICULO === 'AUTOMOVIL' ? 'primary' : 'success'}>{v.TIPO_VEHICULO}</Badge>
                  </div>
                  <h4 className="fw-bold mb-1" style={{ color: 'var(--color-primario)' }}>{v.PLACA}</h4>
                  <p className="text-muted mb-0">{v.MARCA || 'Sin marca'} {v.MODELO ? `- ${v.MODELO}` : ''}</p>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      )}
    </div>
  );

  const renderPagoSection = () => {
    const tieneDeuda = listaDeuda.length > 0;
    const tieneDeudaNormal = listaDeuda.some(d => d.TIPO === 'PLAN');
    const tieneMultas = listaDeuda.some(d => d.TIPO === 'MULTA');

    return (
      <div className="animate-fade-in">
        <div className="mb-4">
          <h2 className="mb-1" style={{ fontFamily: 'var(--fuente-titulos)', fontStyle: 'italic', color: 'var(--color-accion)' }}>Módulo de Pagos</h2>
          <p className="text-muted">Consulta tu estado de cuenta y realiza los pagos de tus planes de parqueo.</p>
        </div>

        {tieneDeuda ? (
          <div className="d-flex flex-column gap-4">
            
            {tieneDeudaNormal && (
              <Alert variant="warning" className="d-flex align-items-center border-0 shadow-sm rounded-3 mb-0">
                <InfoCircleFill size={24} className="me-3" />
                <div><strong>Aviso de Sistema:</strong> Tienes un pago pendiente por registro de vehículo. Si no se registra en los próximos <strong>10 días hábiles</strong>, el acceso será bloqueado.</div>
              </Alert>
            )}

            {tieneMultas && (
              <Alert variant="danger" className="d-flex align-items-center border-0 shadow-sm rounded-3 mb-0">
                <ExclamationCircleFill size={24} className="me-3" />
                <div><strong>¡Infracción Detectada!</strong> Tienes multas disciplinarias pendientes de pago. Evita la suspensión de tu acceso al parqueo.</div>
              </Alert>
            )}

            <Card className="border-0 shadow-sm rounded-4 overflow-hidden liquid-card mt-2">
              <div style={{ backgroundColor: '#f8f9fa', padding: '15px 20px', borderBottom: '2px solid #e0e0e0' }}>
                <h5 className="mb-0 fw-bold" style={{ color: 'var(--color-primario)' }}>Cargos Pendientes en Cuenta</h5>
              </div>
              <Card.Body className="p-0">
                <div className="table-responsive">
                  <table className="table table-hover align-middle mb-0">
                    <thead className="text-muted" style={{ fontSize: '0.85rem' }}>
                      <tr>
                        <th className="border-0 px-4">Concepto del Cargo</th>
                        <th className="border-0">Estado</th>
                        <th className="border-0 text-end">Monto</th>
                        <th className="border-0 text-center">Acción</th>
                      </tr>
                    </thead>
                    <tbody>
                      {listaDeuda.map((cargo, index) => (
                        <tr key={index}>
                          <td className="px-4">
                            <div className="fw-bold" style={{ color: cargo.TIPO === 'MULTA' ? '#dc3545' : 'inherit' }}>{cargo.DESCRIPCION}</div>
                            <small className="text-muted">Cargo generado por el sistema</small>
                          </td>
                          <td><Badge bg={cargo.TIPO === 'MULTA' ? 'danger' : 'warning'} text={cargo.TIPO === 'MULTA' ? 'white' : 'dark'}>Pendiente</Badge></td>
                          <td className="text-end fw-bold">Q.{cargo.MONTO}.00</td>
                          <td className="text-center">
                            <Button size="sm" style={{ backgroundColor: 'var(--color-accion)', border: 'none' }} onClick={() => {
                              window.location.href = `${COBROS_URL}/parking/user?carne=${carneUsuario.replace(/-/g, '')}`;
                            }}>
                              <CreditCardFill className="me-1"/> Pagar
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card.Body>
            </Card>
          </div>
        ) : (
          <Card className="border-0 shadow-sm text-center p-5 rounded-4 liquid-card">
            <Wallet2 size={60} className="text-muted mb-3 mx-auto" style={{ opacity: 0.5 }} />
            <h4 className="text-success fw-bold">¡Estás Solvente!</h4>
          </Card>
        )}
      </div>
    );
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: 'var(--fondo-general)', fontFamily: 'var(--fuente-principal)' }}>
      {/* SIDEBAR */}
      <div style={{ width: `${sidebarWidth}px`, minWidth: `${sidebarWidth}px`, background: 'linear-gradient(180deg, var(--color-primario) 0%, var(--color-primario-profundo) 100%)', color: 'white', display: 'flex', flexDirection: 'column', zIndex: 10, transition: 'width 0.3s ease', overflow: 'hidden' }}>
        <div className="text-center py-4 border-bottom border-white border-opacity-10">
          <img src="/logo.png" alt="UMG" style={{ width: sidebarOpen ? '85px' : '60px', transition: '0.3s' }} />
          {sidebarOpen && <h4 className="mt-2 mb-0" style={{ color: 'var(--color-acento-2)', fontStyle: 'italic' }}>MiUMG</h4>}
        </div>
        
        <Nav className="flex-column mt-3 flex-grow-1">
          {menuItems.map((item) => (
            <Nav.Link key={item.key} onClick={() => setActiveSection(item.key)} className={`text-white d-flex align-items-center mb-1 sidebar-link ${activeSection === item.key ? 'sidebar-link-active' : ''}`} style={{ padding: '12px 16px', opacity: activeSection === item.key ? 1 : 0.65 }}>
              {item.icon} {sidebarOpen && <span className="ms-3">{item.label}</span>}
            </Nav.Link>
          ))}
        </Nav>

        {/* 🔥 EL BOTÓN DE MINIMIZAR ESTÁ DE VUELTA */}
        <div style={{ padding: '8px', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
          <Button variant="link" className="d-flex align-items-center w-100 text-decoration-none p-2 sidebar-link" onClick={() => setSidebarOpen(!sidebarOpen)} style={{ color: 'rgba(255,255,255,0.5)', justifyContent: sidebarOpen ? 'flex-start' : 'center' }}>
            {sidebarOpen ? <><ChevronLeft size={16} className="me-3" /> Minimizar</> : <ChevronRight size={16} />}
          </Button>
        </div>

        <div style={{ padding: '8px 8px 16px', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
          <Button variant="link" className="d-flex align-items-center w-100 text-decoration-none p-2 sidebar-link" onClick={handleLogout} style={{ color: '#ff6b6b', justifyContent: sidebarOpen ? 'flex-start' : 'center' }}>
            <DoorOpen size={18} /> {sidebarOpen && <span className="ms-3">Cerrar Sesión</span>}
          </Button>
        </div>
      </div>

      {/* MAIN AREA */}
      <div style={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
        <div style={{ backgroundColor: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(12px)', padding: '12px 30px', borderBottom: '1px solid rgba(0,0,0,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <List size={24} style={{ color: 'var(--color-primario)', cursor: 'pointer' }} onClick={() => setSidebarOpen(!sidebarOpen)} />
          <div className="d-flex align-items-center gap-2" style={{ cursor: 'pointer' }} onClick={() => setShowProfile(true)}>
            <div className="text-end">
              <div className="fw-bold" style={{ fontSize: '0.9rem' }}>{nombreUsuario} {apellidoUsuario}</div>
              <small className="text-muted">Mi Perfil</small>
            </div>
            <PersonCircle size={34} style={{ color: 'var(--color-accion)' }} />
          </div>
        </div>

        <Container fluid style={{ padding: '30px 40px', flexGrow: 1 }}>
          {activeSection === 'inicio' && (
            <>
              <h2 className="mb-4" style={{ fontFamily: 'var(--fuente-titulos)', fontStyle: 'italic', color: 'var(--color-accion)' }}>{getGreeting()}, {nombreUsuario}</h2>
              <Row className="g-4">
                <Col lg={4} md={6}>
                  <Card className="border-0 h-100 stat-card" onClick={() => setActiveSection('vehiculos')} style={{ cursor: 'pointer' }}>
                    <Card.Body className="p-4 d-flex align-items-center">
                      <div className="icon-glass"><CarFront size={28} style={{ color: 'var(--color-accion)' }} /></div>
                      <div className="ms-4"><small className="text-muted fw-bold text-uppercase">Vehículos</small><h2 className="mb-0 fw-bold">{vehiculos.length}</h2></div>
                    </Card.Body>
                  </Card>
                </Col>
                <Col lg={4} md={6}>
                  <Card className="border-0 h-100 stat-card" onClick={() => setActiveSection('pago')} style={{ cursor: 'pointer' }}>
                    <Card.Body className="p-4 d-flex align-items-center">
                      <div className="icon-glass"><Wallet2 size={28} style={{ color: 'var(--color-accion)' }} /></div>
                      <div className="ms-4"><small className="text-muted fw-bold text-uppercase">Estado de Pago</small><h4 className={`mb-0 fw-bold ${listaDeuda.length > 0 ? 'text-danger' : 'text-success'}`}>{listaDeuda.length > 0 ? 'Pendiente' : 'Solvente'}</h4></div>
                    </Card.Body>
                  </Card>
                </Col>
                
                {/* 🔥 LA TERCERA TARJETA ESTÁ DE VUELTA */}
                <Col lg={4} md={12}>
                  <Card 
                    className="border-0 h-100 animate-fade-in" 
                    style={{ background: 'linear-gradient(135deg, #1a3a5c 0%, #0d253f 100%)', borderRadius: '18px', cursor: 'pointer', overflow: 'hidden', position: 'relative', boxShadow: '0 8px 30px rgba(13, 37, 63, 0.25)' }}
                    onClick={() => setShowVehiculoModal(true)}
                  >
                    <div style={{ position: 'absolute', top: '-30px', right: '-30px', width: '120px', height: '120px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,255,255,0.08) 0%, transparent 70%)', pointerEvents: 'none' }} />
                    <Card.Body className="p-4 d-flex flex-column justify-content-center" style={{ position: 'relative', zIndex: 1 }}>
                      <div className="d-flex align-items-center gap-2 mb-2">
                        <CarFront size={22} color="#ffffff" />
                        <h5 className="mb-0" style={{ fontFamily: 'var(--fuente-titulos)', fontStyle: 'italic', color: '#ffffff', fontSize: '1.15rem' }}>¿Nuevo Vehículo?</h5>
                      </div>
                      <p className="mb-3" style={{ color: 'rgba(255,255,255,0.85)', fontSize: '0.86rem', lineHeight: 1.55 }}>Registra tu placa y modelo para habilitar tu acceso.</p>
                      <Button size="sm" className="btn-liquid" style={{ backgroundColor: '#ffffff', color: '#1a3a5c', border: 'none', fontWeight: 'bold', width: 'fit-content', borderRadius: '10px', padding: '8px 20px', fontSize: '0.85rem' }} onClick={(e) => { e.stopPropagation(); setShowVehiculoModal(true); }}>
                        Registrar ahora →
                      </Button>
                    </Card.Body>
                  </Card>
                </Col>

              </Row>
            </>
          )}
          {activeSection === 'vehiculos' && renderVehiculosSection()}
          {activeSection === 'pago' && renderPagoSection()}
          {activeSection === 'disponibilidad' && renderPlaceholder('Disponibilidad de Parqueos')}
        </Container>
      </div>

      <ThemeSwitcher />

      {/* 🔥 MODAL PERFIL EN AZUL DE NUEVO */}
      <Modal show={showProfile} onHide={() => setShowProfile(false)} centered>
        <div style={{ borderRadius: '22px', overflow: 'hidden', backgroundColor: 'var(--fondo-blanco)' }}>
          <div style={{ background: 'linear-gradient(135deg, var(--color-primario), var(--color-primario-profundo))', padding: '30px', textAlign: 'center', position: 'relative' }}>
            <button type="button" className="btn-close btn-close-white" onClick={() => setShowProfile(false)} style={{ position: 'absolute', top: '15px', right: '15px', opacity: 0.7 }}></button>
            <PersonCircle size={70} color="white" className="mb-2 opacity-75" />
            <h4 className="mb-0" style={{ color: 'white', fontFamily: 'var(--fuente-titulos)', fontStyle: 'italic' }}>Mi Perfil</h4>
            <Badge bg="light" text="dark" className="mt-2 px-3 py-1 rounded-pill">Estudiante UMG</Badge>
          </div>

          <div style={{ padding: '30px' }}>
            <div className="mb-4">
              <h6 className="text-uppercase text-muted fw-bold mb-3" style={{ fontSize: '0.8rem', letterSpacing: '1px' }}>Información Académica</h6>
              <div className="d-flex align-items-center mb-2">
                <span className="text-muted" style={{ width: '120px' }}>Carné:</span>
                <strong style={{ color: 'var(--color-primario)' }}>{usuario?.carne}</strong>
              </div>
              <div className="d-flex align-items-center">
                <span className="text-muted" style={{ width: '120px' }}>Nombre:</span>
                <strong style={{ color: 'var(--color-primario)' }}>{usuario?.nombres} {usuario?.apellidos}</strong>
              </div>
            </div>

            <hr style={{ borderColor: 'rgba(0,0,0,0.1)' }} />

            <div className="mt-4">
              <h6 className="text-uppercase text-muted fw-bold mb-3" style={{ fontSize: '0.8rem', letterSpacing: '1px' }}>Información de Contacto</h6>
              <div className="d-flex align-items-center mb-3">
                <Envelope className="me-3 text-muted" size={18} />
                <span style={{ color: 'var(--color-primario)' }}>{usuario?.correo_institucional || usuario?.correo_electronico || 'No registrado'}</span>
              </div>
              <div className="d-flex align-items-center">
                <Telephone className="me-3 text-muted" size={18} />
                <span style={{ color: 'var(--color-primario)' }}>{usuario?.telefonos || usuario?.telefono || '+502 (No registrado)'}</span>
              </div>
            </div>

            <div className="mt-4 text-center">
              <small className="text-muted">Si necesitas actualizar tus datos, contacta a administración.</small>
            </div>
          </div>
        </div>
      </Modal>

      {/* MODAL REGISTRO VEHICULO */}
      <Modal show={showVehiculoModal} onHide={() => setShowVehiculoModal(false)} centered>
        <div style={{ borderRadius: '22px', overflow: 'hidden' }}>
          <div style={{ background: 'linear-gradient(135deg, var(--color-primario), var(--color-primario-profundo))', padding: '24px 28px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div className="d-flex align-items-center gap-3">
              <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <CarFront size={26} color="white" />
              </div>
              <div>
                <h5 className="mb-0" style={{ color: 'white', fontFamily: 'var(--fuente-titulos)', fontStyle: 'italic' }}>Añadir Vehículo</h5>
              </div>
            </div>
            <button type="button" className="btn-close btn-close-white" onClick={() => setShowVehiculoModal(false)} style={{ opacity: 0.7 }}></button>
          </div>

          <div style={{ padding: '28px' }}>
            
            {esPrimerVehiculo ? (
              <Form.Group className="mb-4">
                <Form.Label className="fw-bold" style={{ color: 'var(--color-primario)' }}>Selecciona tu Plan de Parqueo <span className="text-danger">*</span></Form.Label>
                <Form.Select 
                  required
                  value={nuevoVehiculo.plan_id}
                  onChange={(e) => setNuevoVehiculo({...nuevoVehiculo, plan_id: e.target.value})}
                  style={{ border: '2px solid var(--color-accion)' }}
                >
                  <option value="" disabled hidden>Elige un plan de la lista...</option>
                  {planes.map((p) => (
                    <option key={p.PLN_PLAN} value={p.PLN_PLAN}>
                      {p.PLN_NOMBRE_PLAN} - Q.{p.PLN_PRECIO}.00
                    </option>
                  ))}
                </Form.Select>
                <Form.Text className="text-muted"><InfoCircleFill className="me-1" /> Este plan se asociará a tu cuenta principal.</Form.Text>
              </Form.Group>
            ) : (
              <Alert variant="info" className="d-flex align-items-center border-0 shadow-sm rounded-3 py-2 px-3 mb-4">
                <InfoCircleFill size={20} className="me-3" />
                <div style={{ fontSize: '0.85rem' }}>
                  <strong>Vehículo Adicional:</strong> Al guardar este vehículo se aplicará únicamente la tarifa administrativa de <strong>Q.50.00</strong> a tu estado de cuenta.
                </div>
              </Alert>
            )}

            <Form.Group className="mb-3">
              <Form.Label className="fw-bold" style={{ color: 'var(--color-primario)' }}>Tipo de Vehículo</Form.Label>
              <Form.Select value={nuevoVehiculo.tipo_vehiculo} onChange={(e) => setNuevoVehiculo({...nuevoVehiculo, tipo_vehiculo: e.target.value})}>
                <option value="AUTOMOVIL">Automóvil</option>
                <option value="MOTOCICLETA">Motocicleta</option>
              </Form.Select>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label className="fw-bold" style={{ color: 'var(--color-primario)' }}>Placa <span className="text-danger">*</span></Form.Label>
              <Form.Control type="text" placeholder="Ej. P123ABC" required value={nuevoVehiculo.placa} onChange={(e) => setNuevoVehiculo({...nuevoVehiculo, placa: e.target.value})} style={{ textTransform: 'uppercase' }} />
            </Form.Group>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label className="fw-bold" style={{ color: 'var(--color-primario)' }}>Marca</Form.Label>
                  <Form.Control type="text" placeholder="Ej. Toyota" value={nuevoVehiculo.marca} onChange={(e) => setNuevoVehiculo({...nuevoVehiculo, marca: e.target.value})} />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label className="fw-bold" style={{ color: 'var(--color-primario)' }}>Modelo</Form.Label>
                  <Form.Control type="text" placeholder="Ej. Yaris 2020" value={nuevoVehiculo.modelo} onChange={(e) => setNuevoVehiculo({...nuevoVehiculo, modelo: e.target.value})} />
                </Form.Group>
              </Col>
            </Row>

            <Form.Group className="mb-4">
              <Form.Label className="fw-bold" style={{ color: 'var(--color-primario)' }}>Color</Form.Label>
              <Form.Control type="text" placeholder="Ej. Azul Oscuro" value={nuevoVehiculo.color} onChange={(e) => setNuevoVehiculo({...nuevoVehiculo, color: e.target.value})} />
            </Form.Group>

            <div className="d-flex gap-2 mt-4">
              <Button variant="outline-secondary" onClick={() => setShowVehiculoModal(false)} style={{ flex: 1, borderRadius: '12px' }}>Cancelar</Button>
              <Button className="btn-liquid" onClick={handleGuardarVehiculo} style={{ flex: 2, backgroundColor: 'var(--color-accion)', border: 'none', borderRadius: '12px' }}>Guardar Vehículo</Button>
            </div>
          </div>
        </div>
      </Modal>

    </div>
  );
};

export default Dashboard;