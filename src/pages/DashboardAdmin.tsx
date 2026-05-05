import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Table, Badge, Button, Form, InputGroup, Spinner, Nav } from 'react-bootstrap';
import { Search, PencilSquare, Trash, PersonLinesFill, CarFrontFill, Scooter, CashStack, PieChartFill, List, Speedometer2, ArrowRepeat, BoxArrowRight, ChevronLeft, PersonCircle, CarFront } from 'react-bootstrap-icons';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import SidebarAdmin from '../components/SidebarAdmin';

const DashboardAdmin = () => {
  const navigate = useNavigate();
  
  // --- ESTADOS ---
  const [usuarios, setUsuarios] = useState<any[]>([]);
  const [cargando, setCargando] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [vistaActual, setVistaActual] = useState('usuarios'); // Lo dejé en usuarios para que veas rápido los cambios
  const [adminLogueado, setAdminLogueado] = useState<any>({});
  
  // 🔥 NUEVO: Estado para la barra de búsqueda
  const [busqueda, setBusqueda] = useState('');

  // --- EFECTOS DE INICIO ---
  /*
  useEffect(() => {
    const adminGuardado = localStorage.getItem('usuarioAdmin');
    if (adminGuardado) {
      setAdminLogueado(JSON.parse(adminGuardado));
    } else {
      navigate('/login-admin');
    }
    cargarUsuarios();
  }, [navigate]); */

  /*
  const cargarUsuarios = async () => {
    setCargando(true);
    try {
      const respuesta = await fetch('http://localhost:3001/api/admin/usuarios');
      const data = await respuesta.json();
      if (respuesta.ok) {
        setUsuarios(data);
      }
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setCargando(false);
    }
  };*/

  // --- ACCIONES INTERACTIVAS ---
  
  // 🔥 NUEVO: Conexión real a Oracle para cambiar estado
  const handleCambiarEstado = (carne: string, estadoActual: string, nombre: string) => {
    if (carne === adminLogueado.carne) {
      Swal.fire('Acción Denegada', 'Por seguridad, no puedes desactivar tu propia cuenta de Administrador.', 'error');
      return;
    }

    const nuevoEstadoTexto = estadoActual === 'Activo' ? 'Desactivar' : 'Activar';
    const nuevoEstadoNumerico = estadoActual === 'Activo' ? 0 : 1;
    const colorBoton = estadoActual === 'Activo' ? '#d33' : '#28a745';

    Swal.fire({
      title: `¿${nuevoEstadoTexto} a ${nombre}?`,
      text: `El usuario pasará a estar ${estadoActual === 'Activo' ? 'Inactivo' : 'Activo'}.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: colorBoton,
      cancelButtonColor: '#6c757d',
      confirmButtonText: `Sí, ${nuevoEstadoTexto}`,
      cancelButtonText: 'Cancelar'
    }).then(async (result) => {
      if (result.isConfirmed) {
        
        try {
          // Petición al Backend
          const res = await fetch(`http://localhost:3001/api/admin/usuarios/${carne}/estado`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ nuevoEstado: nuevoEstadoNumerico })
          });

          if (res.ok) {
            // Si Oracle dijo que sí, actualizamos la tabla en pantalla
            const usuariosActualizados = usuarios.map(u => {
              if (u.CARNE === carne) {
                return { ...u, ESTADO: estadoActual === 'Activo' ? 'Inactivo' : 'Activo' };
              }
              return u;
            });
            setUsuarios(usuariosActualizados);
            Swal.fire('¡Actualizado!', 'El estado del usuario ha sido modificado en la base de datos.', 'success');
          } else {
            Swal.fire('Error', 'No se pudo actualizar en la base de datos.', 'error');
          }
        } catch (error) {
          Swal.fire('Error', 'No hay conexión con el servidor.', 'error');
        }
      }
    });
  };

  // 🔥 NUEVO: Redirigir al registro
  const handleNuevoUsuario = () => {
    navigate('/registro');
  };


  // 🔥 NUEVO: Lógica de filtrado para la tabla
  const usuariosFiltrados = usuarios.filter(u => 
    u.CARNE.toLowerCase().includes(busqueda.toLowerCase()) || 
    u.NOMBRE.toLowerCase().includes(busqueda.toLowerCase()) ||
    u.CORREO.toLowerCase().includes(busqueda.toLowerCase())
  );

  const StatCard = ({ title, value, icon: Icon, color }: any) => (
    <Col lg={3} sm={6} className="mb-4">
      <Card className="border-0 shadow-sm rounded-4 h-100" style={{ transition: 'transform 0.2s', cursor: 'default' }}
            onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-3px)'}
            onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}>
        <Card.Body className="p-4 d-flex align-items-center">
          <div className="rounded-3 d-flex align-items-center justify-content-center me-3" 
               style={{ width: '60px', height: '60px', backgroundColor: `${color}15`, color: color }}>
            <Icon size={28} />
          </div>
          <div>
            <div className="text-muted small fw-bold mb-1" style={{ letterSpacing: '0.5px' }}>{title.toUpperCase()}</div>
            <h3 className="mb-0 fw-bold" style={{ color: 'var(--azul-oscuro, #002b5c)' }}>{value}</h3>
          </div>
        </Card.Body>
      </Card>
    </Col>
  );

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: 'var(--fondo-general, #f4f7f6)' }}>
      
      {/* ================= BARRA LATERAL (SIDEBAR) ================= */}
     <SidebarAdmin />
      {/* ================= CONTENIDO PRINCIPAL ================= */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        
        <div className="bg-white px-4 py-3 shadow-sm d-flex justify-content-between align-items-center">
          <Button variant="link" className="text-dark p-0" onClick={() => setSidebarOpen(!sidebarOpen)}>
            <List size={28} />
          </Button>
          
          <div className="d-flex align-items-center" style={{ cursor: 'pointer' }}>
            <div className="text-end me-3 d-none d-sm-block">
              <div className="fw-bold" style={{ color: 'var(--azul-oscuro, #002b5c)', fontSize: '0.95rem' }}>
                {adminLogueado.nombres || 'Administrador'}
              </div>
              <div style={{ color: 'var(--color-accion, #0098db)', fontSize: '0.8rem', fontWeight: '500' }}>
                Mi Perfil <PencilSquare size={12} className="ms-1" />
              </div>
            </div>
            <PersonCircle size={40} style={{ color: 'var(--azul-oscuro, #002b5c)' }} />
          </div>
        </div>

        <div className="p-4 p-md-5" style={{ overflowY: 'auto' }}>
          
          {/* VISTA: DASHBOARD */}
          {vistaActual === 'dashboard' && (
            <div className="animate-fade-in">
              <Row className="mb-4">
                <Col>
                  <h2 className="fw-bold" style={{ color: 'var(--color-accion, #0098db)', fontStyle: 'italic' }}>Visión General</h2>
                  <p className="text-muted">Resumen del estado del sistema de parqueo</p>
                </Col>
              </Row>
              <Row className="mb-4">
                <StatCard title="Ocupación" value="78%" icon={PieChartFill} color="#0098db" />
                <StatCard title="Carros" value="850" icon={CarFrontFill} color="#28a745" />
                <StatCard title="Motos" value="342" icon={Scooter} color="#f5a623" />
                <StatCard title="Ingresos" value="Q 1,250" icon={CashStack} color="#6f42c1" />
              </Row>
            </div>
          )}

          {/* VISTA: USUARIOS */}
          {vistaActual === 'usuarios' && (
            <div className="animate-fade-in">
              <Row className="mb-4">
                <Col>
                  <h2 className="fw-bold" style={{ color: 'var(--color-accion, #0098db)', fontStyle: 'italic' }}>Gestión de Usuarios</h2>
                  <p className="text-muted">Control total de accesos y roles del parqueo.</p>
                </Col>
              </Row>

              <Card className="border-0 shadow-sm rounded-4">
                <Card.Body className="p-4">
                  <Row className="mb-4 align-items-center">
                    <Col md={6}>
                      <InputGroup>
                        <InputGroup.Text className="bg-light border-end-0"><Search className="text-muted"/></InputGroup.Text>
                        
                        {/* 🔥 NUEVO: Input conectado al estado de búsqueda */}
                        <Form.Control 
                          placeholder="Buscar carné, nombre o correo..." 
                          className="bg-light border-start-0 ps-0 bg-transparent" 
                          style={{ boxShadow: 'none' }} 
                          value={busqueda}
                          onChange={(e) => setBusqueda(e.target.value)}
                        />
                        
                      </InputGroup>
                    </Col>
                    <Col md={6} className="text-md-end mt-3 mt-md-0">
                      <Button variant="light" className="me-2" /*onClick={cargarUsuarios}*/ title="Recargar datos">
                        <ArrowRepeat size={20} className={cargando ? 'text-muted' : 'text-primary'} />
                      </Button>
                      <Button 
                        onClick={handleNuevoUsuario}
                        style={{ backgroundColor: 'var(--azul-oscuro, #002b5c)', border: 'none', borderRadius: '8px', padding: '0.5rem 1.5rem' }}>
                        + Nuevo Usuario
                      </Button>
                    </Col>
                  </Row>

                  <div className="table-responsive">
                    {cargando ? (
                      <div className="text-center py-5">
                        <Spinner animation="border" style={{ color: 'var(--color-accion, #0098db)' }} />
                      </div>
                    ) : (
                      <Table hover className="align-middle" style={{ borderCollapse: 'separate', borderSpacing: '0 8px' }}>
                        <thead className="text-muted" style={{ fontSize: '0.85rem' }}>
                          <tr>
                            <th className="border-0">Carné</th>
                            <th className="border-0">Nombre Completo</th>
                            <th className="border-0">Correo</th>
                            <th className="border-0">Rol</th>
                            <th className="border-0">Estado</th>
                            <th className="border-0 text-center">Acciones</th>
                          </tr>
                        </thead>
                        <tbody>
                          {/* 🔥 NUEVO: Usamos el array usuariosFiltrados en vez del original */}
                          {usuariosFiltrados.map((usr, index) => (
                            <tr key={index}>
                              <td className="fw-bold border-bottom-0" style={{ color: 'var(--azul-oscuro)' }}>{usr.CARNE}</td>
                              <td className="border-bottom-0">{usr.NOMBRE}</td>
                              <td className="border-bottom-0 text-muted">{usr.CORREO}</td>
                              <td className="border-bottom-0">
                                <Badge bg={usr.ROL === 'ADMINISTRADOR' ? 'danger' : 'primary'} className="rounded-pill px-3">
                                  {usr.ROL}
                                </Badge>
                              </td>
                              <td className="border-bottom-0">
                                <Badge bg={usr.ESTADO === 'Activo' ? 'success' : 'secondary'} className="rounded-pill px-3">
                                  {usr.ESTADO}
                                </Badge>
                              </td>
                              <td className="text-center border-bottom-0">
                                <Button variant="light" size="sm" className="me-2 text-primary border-0 bg-transparent" title="Editar Rol">
                                  <PencilSquare size={18} />
                                </Button>
                                <Button 
                                  variant="light" size="sm" 
                                  className={`border-0 bg-transparent ${usr.ESTADO === 'Activo' ? 'text-danger' : 'text-success'}`} 
                                  title={usr.ESTADO === 'Activo' ? 'Desactivar' : 'Activar'}
                                  onClick={() => handleCambiarEstado(usr.CARNE, usr.ESTADO, usr.NOMBRE)}
                                >
                                  {usr.ESTADO === 'Activo' ? <Trash size={18} /> : <ArrowRepeat size={18} />}
                                </Button>
                              </td>
                            </tr>
                          ))}
                          {/* 🔥 NUEVO: Mensaje si la búsqueda no encuentra a nadie */}
                          {usuariosFiltrados.length === 0 && (
                            <tr>
                              <td colSpan={6} className="text-center py-4 text-muted">
                                No se encontraron usuarios con esa búsqueda.
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </Table>
                    )}
                  </div>
                </Card.Body>
              </Card>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default DashboardAdmin;