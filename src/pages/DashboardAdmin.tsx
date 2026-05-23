import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Table, Badge, Button, Form, InputGroup, Spinner, Nav, Modal, Tabs, Tab } from 'react-bootstrap';
import { Search, PencilSquare, Trash, PersonLinesFill, CarFrontFill, Scooter, CashStack, PieChartFill, List, Speedometer2, ArrowRepeat, BoxArrowRight, ChevronLeft, PersonCircle, Envelope, Telephone, Save, CheckCircleFill, ExclamationOctagonFill, Receipt, ExclamationTriangleFill, Download, Building } from 'react-bootstrap-icons';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as ChartTooltip, Legend, PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

// 🔥 IMPORTAMOS LAS LIBRERÍAS DEL PDF
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const API_BASE = '/api';

const DashboardAdmin = () => {
  const navigate = useNavigate();

  // --- ESTADOS PRINCIPALES ---
  const [cargando, setCargando] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [vistaActual, setVistaActual] = useState('dashboard');
  const [adminLogueado, setAdminLogueado] = useState<any>({});

  const [usuarios, setUsuarios] = useState<any[]>([]);
  const [busquedaUsuarios, setBusquedaUsuarios] = useState('');

  const [showProfile, setShowProfile] = useState(false);
  const [stats, setStats] = useState({ carros: 0, motos: 0, ingresos: 0, ocupacion: 0 });

  const [showEditModal, setShowEditModal] = useState(false);
  const [roles, setRoles] = useState<any[]>([]);
  const [editForm, setEditForm] = useState({ carne: '', nombres: '', apellidos: '', correo_institucional: '', telefono: '', id_rol: '' });

  const [pagosAdmin, setPagosAdmin] = useState<any[]>([]);
  const [multasCatalogo, setMultasCatalogo] = useState<any[]>([]);
  const [busquedaPagos, setBusquedaPagos] = useState('');


  const [reportes, setReportes] = useState<any>({ distribucion: [], ingresosMensuales: [], dashboard: null });

  // --- EFECTOS ---
  useEffect(() => {
    const adminGuardado = localStorage.getItem('usuarioAdmin');
    const token = localStorage.getItem('token');
    if (adminGuardado && token) {
      setAdminLogueado(JSON.parse(adminGuardado));
    } else {
      navigate('/login-admin');
    }
    cargarTodo();
  }, [navigate]);

  useEffect(() => {
    if (vistaActual === 'pagos') cargarPagosYMultas();
    if (vistaActual === 'reportes') cargarReportes();
  }, [vistaActual]);

  const obtenerHeaders = (conJson = false) => {
    const token = localStorage.getItem('token');
    const headers: any = { 'Authorization': `Bearer ${token}` };
    if (conJson) headers['Content-Type'] = 'application/json';
    return headers;
  };

  const cargarTodo = () => {
    cargarUsuarios();
    cargarEstadisticas();
    cargarRoles();
    cargarPagosYMultas();
  };

  const cargarRoles = async () => { try { const res = await fetch(`${API_BASE}/roles`); if (res.ok) setRoles(await res.json()); } catch (error) { } };

  const cargarUsuarios = async () => {
    setCargando(true);
    try {
      const respuesta = await fetch(`${API_BASE}/admin/usuarios`, { headers: obtenerHeaders() });
      if (respuesta.ok) setUsuarios(await respuesta.json());
      else if (respuesta.status === 401 || respuesta.status === 403) { Swal.fire('Sesión Expirada', 'Por favor inicia sesión de nuevo', 'warning'); handleLogout(); }
    } catch (error) { } finally { setCargando(false); }
  };

  const cargarEstadisticas = async () => { try { const respuesta = await fetch(`${API_BASE}/admin/estadisticas`, { headers: obtenerHeaders() }); if (respuesta.ok) setStats(await respuesta.json()); } catch (error) { } };

  // 🔥 CARGA DE PAGOS Y MULTAS (MODO SIGILO)
  const cargarPagosYMultas = async () => {
    try {
      const resPagos = await fetch(`${API_BASE}/admin/pagos`, { headers: obtenerHeaders() });
      if (resPagos.ok) setPagosAdmin(await resPagos.json());
    } catch (error) {
      console.error(error);
    }

    try {
      const resMultas = await fetch(`${API_BASE}/admin/multas-catalogo`, { headers: obtenerHeaders() });
      if (resMultas.ok) {
        const dataMultas = await resMultas.json();
        let arraySeguro = Array.isArray(dataMultas) ? dataMultas : (dataMultas.data || dataMultas.multas || []);

        setMultasCatalogo(arraySeguro);
      } else {
        console.error("Error HTTP al traer multas:", resMultas.status);
      }
    } catch (error) {
      console.error("Error al cargar multas:", error);
    }
  };

  const cargarReportes = async () => {
    setCargando(true);
    try {
      const token = localStorage.getItem('token');
      // Asegurar que si en backend no usan "Bearer" no haya problema, o ajustamos headers.
      const headers = { 'Authorization': `Bearer ${token}` };

      // Llamadas al microservicio de reportes
      const resIngresos = await fetch(`/api/reportes/ingresos-mensuales`, { headers });
      const resDist = await fetch(`/api/reportes/distribucion-facultades`, { headers });
      const resDash = await fetch(`/api/reportes/dashboard`, { headers });

      const ingresosData = resIngresos.ok ? await resIngresos.json() : { data: [] };
      const distData = resDist.ok ? await resDist.json() : { data: [] };
      const dashData = resDash.ok ? await resDash.json() : { data: null };

      setReportes({
        ingresosMensuales: ingresosData.data || [],
        distribucion: distData.data || [],
        dashboard: dashData.data || null
      });
    } catch (error) {
      console.error(error);
    } finally {
      setCargando(false);
    }
  };

  const abrirModalEdicion = (usr: any) => { setEditForm({ carne: usr.CARNE, nombres: usr.NOMBRES, apellidos: usr.APELLIDOS, correo_institucional: usr.CORREO, telefono: usr.TELEFONO || '', id_rol: usr.ID_ROL }); setShowEditModal(true); };

  const handleGuardarEdicion = async () => {
    try {
      const res = await fetch(`${API_BASE}/admin/usuarios/${editForm.carne}`, { method: 'PUT', headers: obtenerHeaders(true), body: JSON.stringify(editForm) });
      if (res.ok) { Swal.fire({ title: '¡Actualizado!', icon: 'success', timer: 1500, showConfirmButton: false }); setShowEditModal(false); cargarUsuarios(); } else Swal.fire('Error', 'No se pudo guardar.', 'error');
    } catch (error) { Swal.fire('Error', 'Sin conexión al servidor.', 'error'); }
  };

  const handleCambiarEstado = (carne: string, estadoActual: string, nombre: string) => {
    if (carne === adminLogueado.carne) return Swal.fire('Denegado', 'No puedes desactivar tu propia cuenta.', 'error');
    const nuevoEstado = estadoActual === 'Activo' ? 0 : 1;
    Swal.fire({ title: `¿${estadoActual === 'Activo' ? 'Desactivar' : 'Activar'} a ${nombre}?`, icon: 'warning', showCancelButton: true, confirmButtonColor: estadoActual === 'Activo' ? '#d33' : '#28a745', confirmButtonText: 'Sí, proceder' }).then(async (result) => {
      if (result.isConfirmed) { try { const res = await fetch(`${API_BASE}/admin/usuarios/${carne}/estado`, { method: 'PUT', headers: obtenerHeaders(true), body: JSON.stringify({ nuevoEstado }) }); if (res.ok) { cargarUsuarios(); Swal.fire({ title: '¡Estado Modificado!', icon: 'success', timer: 1500, showConfirmButton: false }); } } catch (error) { Swal.fire('Error', 'Sin conexión al servidor.', 'error'); } }
    });
  };

  const handleAprobarPago = (id_pago: number, nombre: string) => {
    Swal.fire({ title: '⚠️ MODO DE EMERGENCIA', html: `Estás a punto de forzar el pago de <b>${nombre}</b>.<br/><br/><small>Solo debes usar esta opción si el sistema del banco falló.</small>`, icon: 'warning', showCancelButton: true, confirmButtonColor: '#dc3545', confirmButtonText: 'Sí, Forzar Aprobación' }).then(async (result) => {
      if (result.isConfirmed) { try { const res = await fetch(`${API_BASE}/admin/pagos/${id_pago}/aprobar`, { method: 'PUT', headers: obtenerHeaders() }); if (res.ok) { cargarPagosYMultas(); cargarEstadisticas(); cargarReportes(); Swal.fire('¡Forzado!', 'El pago ha sido aprobado manualmente.', 'success'); } } catch (error) { Swal.fire('Error', 'No se pudo conectar.', 'error'); } }
    });
  };


  const handleLogout = () => {
    Swal.fire({ title: '¿Cerrar Sesión?', icon: 'question', showCancelButton: true, confirmButtonColor: 'var(--azul-universitario)', confirmButtonText: 'Sí, salir' }).then((result) => {
      if (result.isConfirmed) {
        localStorage.removeItem('usuarioAdmin');
        localStorage.removeItem('token');
        navigate('/login-admin');
      }
    });
  };

  const generarPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.setTextColor(0, 43, 92);
    doc.text('Reporte de Inteligencia de Negocios - Parqueo UMG', 14, 22);
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Generado el: ${new Date().toLocaleDateString()} a las ${new Date().toLocaleTimeString()}`, 14, 30);
    doc.text(`Administrador responsable: ${adminLogueado.nombres} ${adminLogueado.apellidos}`, 14, 36);
    doc.setFontSize(14);
    doc.setTextColor(0, 0, 0);
    doc.text('Resumen Ejecutivo', 14, 50);
    doc.setFontSize(11);
    doc.text(`• Total de Ingresos Recaudados: Q. ${stats.ingresos}.00`, 20, 60);
    doc.text(`• Vehículos Registrados (Automóviles): ${stats.carros}`, 20, 68);
    doc.text(`• Vehículos Registrados (Motocicletas): ${stats.motos}`, 20, 76);
    doc.setFontSize(14);
    doc.text('Métricas del Módulo de Reportes', 14, 95);
    const tableColumn = ["Métrica", "Valor"];
    const tableRows = [
      ["Usuarios Totales", reportes.dashboard?.usuarios?.total || 0],
      ["Espacios Libres", reportes.dashboard?.espacios?.libres || 0],
      ["Usuarios Morosos", reportes.dashboard?.morosidad?.usuarios_morosos || 0],
      ["Total Ingresos (Cobros)", `Q. ${reportes.dashboard?.finanzas?.total_ingresos || 0}.00`]
    ];

    autoTable(doc, { head: [tableColumn], body: tableRows, startY: 102, theme: 'striped', headStyles: { fillColor: [0, 152, 219] } });
    doc.save(`Reporte_Parqueo_UMG_${new Date().getTime()}.pdf`);
    Swal.fire({ title: '¡Reporte Generado!', text: 'Tu documento PDF ha sido descargado exitosamente.', icon: 'success', timer: 2000, showConfirmButton: false });
  };

  const usuariosFiltrados = usuarios.filter(u => u.CARNE.toLowerCase().includes(busquedaUsuarios.toLowerCase()) || u.NOMBRE.toLowerCase().includes(busquedaUsuarios.toLowerCase()) || u.CORREO.toLowerCase().includes(busquedaUsuarios.toLowerCase()));
  const pagosFiltrados = pagosAdmin.filter(p => p.CARNE_USUARIO.toLowerCase().includes(busquedaPagos.toLowerCase()) || p.NOMBRE.toLowerCase().includes(busquedaPagos.toLowerCase()));
  const COLORES_PASTEL = ['#0098db', '#f5a623', '#28a745', '#dc3545'];

  const SidebarItem = ({ icon: Icon, label, vista }: any) => {
    const isActive = vistaActual === vista;
    return (
      <Nav.Link onClick={() => setVistaActual(vista)} className={`d-flex align-items-center px-4 py-3 text-white mb-1`} style={{ cursor: 'pointer', transition: '0.2s', backgroundColor: isActive ? 'rgba(255,255,255,0.05)' : 'transparent', borderLeft: isActive ? '4px solid var(--color-accion, #00d2ff)' : '4px solid transparent' }}>
        <Icon size={20} className="me-3" style={{ color: isActive ? 'var(--color-accion, #00d2ff)' : 'rgba(255,255,255,0.7)' }} />
        <span style={{ display: sidebarOpen ? 'block' : 'none', fontWeight: isActive ? 'bold' : 'normal', color: isActive ? '#fff' : 'rgba(255,255,255,0.8)', whiteSpace: 'nowrap' }}>{label}</span>
      </Nav.Link>
    );
  };

  const StatCard = ({ title, value, icon: Icon, color }: any) => (
    <Col lg={3} sm={6} className="mb-4">
      <Card className="border-0 shadow-sm rounded-4 h-100" style={{ transition: 'transform 0.2s', cursor: 'default' }} onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-3px)'} onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}>
        <Card.Body className="p-4 d-flex align-items-center">
          <div className="rounded-3 d-flex align-items-center justify-content-center me-3" style={{ width: '60px', height: '60px', backgroundColor: `${color}15`, color: color }}><Icon size={28} /></div>
          <div><div className="text-muted small fw-bold mb-1" style={{ letterSpacing: '0.5px' }}>{title.toUpperCase()}</div><h3 className="mb-0 fw-bold" style={{ color: 'var(--azul-oscuro, #002b5c)' }}>{value}</h3></div>
        </Card.Body>
      </Card>
    </Col>
  );


  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: 'var(--fondo-general, #f4f7f6)' }}>
      {/* ================= BARRA LATERAL ================= */}
      <div style={{ width: sidebarOpen ? '260px' : '80px', backgroundColor: 'var(--azul-oscuro, #002b5c)', transition: 'width 0.3s ease', zIndex: 1000 }} className="d-flex flex-column">
        <div className="text-center py-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', overflow: 'hidden' }}>
          <img src="/logo.png" alt="UMG" style={{ width: sidebarOpen ? '55px' : '40px', transition: '0.3s' }} />
          {sidebarOpen && (
            <div className="mt-2 animate-fade-in">
              <h4 className="mb-0 fw-bold" style={{ color: 'var(--color-accion, #00d2ff)', fontStyle: 'italic' }}>MiUMG</h4>
              <small style={{ color: 'rgba(255,255,255,0.5)', letterSpacing: '1px', fontSize: '0.65rem' }}>CONTROL DE PARQUEO</small>
            </div>
          )}
        </div>
        <Nav className="flex-column mt-3 flex-grow-1">
          <SidebarItem icon={Speedometer2} label="Inicio" vista="dashboard" />
          <SidebarItem icon={PersonLinesFill} label="Gestión de Usuarios" vista="usuarios" />
          <SidebarItem icon={CashStack} label="Pagos y Cobros" vista="pagos" />
          <Nav.Link onClick={() => { 
                const token = localStorage.getItem('token');
                window.location.href = `http://10.0.40.10:3002/reportes?token=${token}`; 
              }} className="d-flex align-items-center px-4 py-3 text-white mb-1 admin-logout-hover" style={{ cursor: 'pointer', transition: '0.2s' }}>
            <PieChartFill size={20} className="me-3" style={{ color: 'rgba(255,255,255,0.7)' }} />
            <span style={{ display: sidebarOpen ? 'block' : 'none', color: 'rgba(255,255,255,0.8)', whiteSpace: 'nowrap' }}>Reportes</span>
          </Nav.Link>
          <Nav.Link onClick={() => { 
                const token = localStorage.getItem('token');
                window.location.href = `http://10.0.40.10:3001/disponibilidad/admin?token=${token}`; 
              }} className="d-flex align-items-center px-4 py-3 text-white mb-1 admin-logout-hover" style={{ cursor: 'pointer', transition: '0.2s' }}>
            <Building size={20} className="me-3" style={{ color: 'rgba(255,255,255,0.7)' }} />
            <span style={{ display: sidebarOpen ? 'block' : 'none', color: 'rgba(255,255,255,0.8)', whiteSpace: 'nowrap' }}>Gestión de Islas</span>
          </Nav.Link>
        </Nav>
        <div className="mt-auto" style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
          <Nav.Link onClick={() => setSidebarOpen(!sidebarOpen)} className="d-flex align-items-center px-4 py-3 text-white" style={{ cursor: 'pointer', color: 'rgba(255,255,255,0.6)' }}>
            <ChevronLeft size={20} className="me-3" style={{ transform: sidebarOpen ? 'rotate(0deg)' : 'rotate(180deg)', transition: '0.3s' }} />
            <span style={{ display: sidebarOpen ? 'block' : 'none', whiteSpace: 'nowrap' }}>Minimizar</span>
          </Nav.Link>
          <Nav.Link onClick={handleLogout} className="d-flex align-items-center px-4 py-3 admin-logout-hover" style={{ cursor: 'pointer', transition: '0.2s', color: '#ff6b6b' }}>
            <BoxArrowRight size={20} className="me-3" />
            <span style={{ display: sidebarOpen ? 'block' : 'none', fontWeight: 'bold', whiteSpace: 'nowrap' }}>Cerrar Sesión</span>
          </Nav.Link>
        </div>
      </div>

      {/* ================= CONTENIDO PRINCIPAL ================= */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <div className="bg-white px-4 py-3 shadow-sm d-flex justify-content-between align-items-center">
          <Button variant="link" className="text-dark p-0" onClick={() => setSidebarOpen(!sidebarOpen)}><List size={28} /></Button>
          <div className="d-flex align-items-center" style={{ cursor: 'pointer' }} onClick={() => setShowProfile(true)}>
            <div className="text-end me-3 d-none d-sm-block">
              <div className="fw-bold" style={{ color: 'var(--azul-oscuro, #002b5c)', fontSize: '0.95rem' }}>{adminLogueado.nombres || 'Administrador'}</div>
              <div style={{ color: 'var(--color-accion, #0098db)', fontSize: '0.8rem', fontWeight: '500' }}>Mi Perfil <PencilSquare size={12} className="ms-1" /></div>
            </div>
            <PersonCircle size={40} style={{ color: 'var(--azul-oscuro, #002b5c)' }} />
          </div>
        </div>

        <div className="p-4 p-md-5" style={{ overflowY: 'auto' }}>

          {/* VISTA 1: DASHBOARD */}
          {vistaActual === 'dashboard' && (
            <div className="animate-fade-in">
              <Row className="mb-4"><Col><h2 className="fw-bold" style={{ color: 'var(--color-accion, #0098db)', fontStyle: 'italic' }}>Visión General</h2><p className="text-muted">Resumen del estado del sistema</p></Col></Row>
              <Row className="mb-4">
                <StatCard title="Ocupación" value={`${stats.ocupacion || 0}%`} icon={PieChartFill} color="#0098db" />
                <StatCard title="Carros" value={stats.carros} icon={CarFrontFill} color="#28a745" />
                <StatCard title="Motos" value={stats.motos} icon={Scooter} color="#f5a623" />
                <StatCard title="Ingresos" value={`Q ${stats.ingresos}`} icon={CashStack} color="#6f42c1" />
              </Row>
            </div>
          )}

          {/* VISTA 2: USUARIOS */}
          {vistaActual === 'usuarios' && (
            <div className="animate-fade-in">
              <Row className="mb-4"><Col><h2 className="fw-bold" style={{ color: 'var(--color-accion, #0098db)', fontStyle: 'italic' }}>Gestión de Usuarios</h2><p className="text-muted">Control total de accesos y roles del parqueo.</p></Col></Row>
              <Card className="border-0 shadow-sm rounded-4">
                <Card.Body className="p-4">
                  <Row className="mb-4 align-items-center">
                    <Col md={6}>
                      <InputGroup>
                        <InputGroup.Text className="bg-light border-end-0"><Search className="text-muted" /></InputGroup.Text>
                        <Form.Control placeholder="Buscar carné, nombre o correo..." className="bg-light border-start-0 ps-0 bg-transparent" style={{ boxShadow: 'none' }} value={busquedaUsuarios} onChange={(e) => setBusquedaUsuarios(e.target.value)} />
                      </InputGroup>
                    </Col>
                    <Col md={6} className="text-md-end mt-3 mt-md-0">
                      <Button variant="light" className="me-2" onClick={cargarUsuarios} title="Recargar datos"><ArrowRepeat size={20} className={cargando ? 'text-muted' : 'text-primary'} /></Button>
                      <Button onClick={() => navigate('/registro')} style={{ backgroundColor: 'var(--azul-oscuro, #002b5c)', border: 'none', borderRadius: '8px', padding: '0.5rem 1.5rem' }}>+ Nuevo Usuario</Button>
                    </Col>
                  </Row>
                  <div className="table-responsive">
                    {cargando ? <div className="text-center py-5"><Spinner animation="border" style={{ color: 'var(--color-accion, #0098db)' }} /></div> : (
                      <Table hover className="align-middle" style={{ borderCollapse: 'separate', borderSpacing: '0 8px' }}>
                        <thead className="text-muted" style={{ fontSize: '0.85rem' }}><tr><th className="border-0">Carné</th><th className="border-0">Nombre Completo</th><th className="border-0">Correo</th><th className="border-0">Rol</th><th className="border-0">Estado</th><th className="border-0 text-center">Acciones</th></tr></thead>
                        <tbody>
                          {usuariosFiltrados.map((usr, index) => (
                            <tr key={index}>
                              <td className="fw-bold border-bottom-0" style={{ color: 'var(--azul-oscuro)' }}>{usr.CARNE}</td><td className="border-bottom-0">{usr.NOMBRE}</td><td className="border-bottom-0 text-muted">{usr.CORREO}</td>
                              <td className="border-bottom-0"><Badge bg={usr.ROL === 'ADMINISTRADOR' ? 'danger' : 'primary'} className="rounded-pill px-3">{usr.ROL}</Badge></td>
                              <td className="border-bottom-0"><Badge bg={usr.ESTADO === 'Activo' ? 'success' : 'secondary'} className="rounded-pill px-3">{usr.ESTADO}</Badge></td>
                              <td className="text-center border-bottom-0">
                                <Button variant="light" size="sm" className="me-2 text-primary border-0 bg-transparent" onClick={() => abrirModalEdicion(usr)}><PencilSquare size={18} /></Button>
                                <Button variant="light" size="sm" className={`border-0 bg-transparent ${usr.ESTADO === 'Activo' ? 'text-danger' : 'text-success'}`} onClick={() => handleCambiarEstado(usr.CARNE, usr.ESTADO, usr.NOMBRE)}>
                                  {usr.ESTADO === 'Activo' ? <Trash size={18} /> : <ArrowRepeat size={18} />}
                                </Button>
                              </td>
                            </tr>
                          ))}
                          {usuariosFiltrados.length === 0 && <tr><td colSpan={6} className="text-center py-4 text-muted">No se encontraron usuarios.</td></tr>}
                        </tbody>
                      </Table>
                    )}
                  </div>
                </Card.Body>
              </Card>
            </div>
          )}

          {/* VISTA 3: PAGOS Y MULTAS */}
          {vistaActual === 'pagos' && (
            <div className="animate-fade-in">
              <Row className="mb-4"><Col><h2 className="fw-bold" style={{ color: 'var(--color-accion, #0098db)', fontStyle: 'italic' }}>Centro de Control Financiero</h2><p className="text-muted">Auditoría de pagos automáticos y panel de emergencias.</p></Col></Row>
              <Tabs defaultActiveKey="auditoria" className="mb-4 custom-tabs">

                {/* Pestaña: Auditoría */}
                <Tab eventKey="auditoria" title={<><Receipt className="me-2" /> Auditoría de Pagos</>}>
                  <Card className="border-0 shadow-sm rounded-4 mt-3">
                    <Card.Body className="p-4">
                      <Row className="mb-4 align-items-center">
                        <Col md={6}><InputGroup><InputGroup.Text className="bg-light border-end-0"><Search className="text-muted" /></InputGroup.Text><Form.Control placeholder="Buscar por carné o nombre..." className="bg-light border-start-0 ps-0 bg-transparent" style={{ boxShadow: 'none' }} value={busquedaPagos} onChange={(e) => setBusquedaPagos(e.target.value)} /></InputGroup></Col>
                        <Col md={6} className="text-md-end mt-3 mt-md-0"><Button variant="light" onClick={cargarPagosYMultas} title="Recargar"><ArrowRepeat size={20} className={cargando ? 'text-muted' : 'text-primary'} /></Button></Col>
                      </Row>
                      <div className="table-responsive">
                        {cargando ? <div className="text-center py-5"><Spinner animation="border" style={{ color: 'var(--color-accion, #0098db)' }} /></div> : (
                          <Table hover className="align-middle">
                            <thead className="text-muted" style={{ fontSize: '0.85rem' }}><tr><th className="border-0">Fecha</th><th className="border-0">Usuario</th><th className="border-0">Concepto</th><th className="border-0">Monto</th><th className="border-0">Estado</th><th className="border-0 text-center">Intervención (Emergencia)</th></tr></thead>
                            <tbody>
                              {pagosFiltrados.map((p, index) => (
                                <tr key={index}>
                                  <td className="text-muted small">{p.FECHA}</td><td><strong>{p.CARNE_USUARIO}</strong><br /><small className="text-muted">{p.NOMBRE}</small></td><td>{p.CONCEPTO}</td><td className="fw-bold">Q.{p.PAG_MONTO_TOTAL}.00</td>
                                  <td><Badge bg={p.PAG_ESTADO === 'C' ? 'success' : 'warning'} text={p.PAG_ESTADO === 'C' ? 'light' : 'dark'}>{p.PAG_ESTADO === 'C' ? 'Completado' : 'Pendiente'}</Badge></td>
                                  <td className="text-center">{p.PAG_ESTADO === 'P' ? (<Button variant="outline-danger" size="sm" title="Usar solo si el cobro automático falló" onClick={() => handleAprobarPago(p.PAG_PAGO, p.NOMBRE)}><ExclamationTriangleFill className="me-1" /> Forzar Aprobación</Button>) : (<span className="text-success small fw-bold"><CheckCircleFill className="me-1" /> Procesado Auto.</span>)}</td>
                                </tr>
                              ))}
                              {pagosFiltrados.length === 0 && <tr><td colSpan={6} className="text-center py-4 text-muted">No hay transacciones registradas.</td></tr>}
                            </tbody>
                          </Table>
                        )}
                      </div>
                    </Card.Body>
                  </Card>
                </Tab>

                {/* Pestaña: Asignar Multa */}
                <Tab eventKey="multas" title={<><ExclamationOctagonFill className="me-2" /> Asignar Multa</>}>
                  <Row className="mt-5 justify-content-center">
                    <Col md={8} className="text-center">
                      <Card className="border-0 shadow-sm rounded-4" style={{ borderTop: '5px solid #dc3545' }}>
                        <Card.Body className="p-4 p-md-5">
                          <ExclamationOctagonFill size={50} className="text-danger mb-3" />
                          <h4 className="fw-bold text-danger">Módulo de Multas</h4>
                          <p className="text-muted mb-4">
                            La creación y asignación de multas disciplinarias se gestiona a través del módulo de Cobros y Finanzas.
                          </p>
                          <Button
                            variant="danger"
                            size="lg"
                            className="fw-bold rounded-3 shadow-sm px-5"
                            onClick={() => {
                              const token = localStorage.getItem('token');
                              window.location.href = `http://10.0.40.10:3000/parking/admin/dashboard/multas?token=${token}`;
                            }}
                          >
                            Ir a Asignar Multa
                          </Button>
                        </Card.Body>
                      </Card>
                    </Col>
                  </Row>
                </Tab>

              </Tabs>
            </div>
          )}

          {/* VISTA 4: REPORTES */}
          {vistaActual === 'reportes' && (
            <div className="animate-fade-in">
              <Row className="mb-4">
                <Col md={8}>
                  <h2 className="fw-bold" style={{ color: 'var(--color-accion, #0098db)', fontStyle: 'italic' }}>Inteligencia de Negocios</h2>
                  <p className="text-muted">Análisis en tiempo real de ingresos, morosidad y demografía de vehículos.</p>
                </Col>
                <Col md={4} className="text-md-end mt-3 mt-md-0">
                  <Button variant="light" className="me-2 shadow-sm border-0" onClick={cargarReportes} title="Recargar"><ArrowRepeat size={20} className={cargando ? 'text-muted' : 'text-primary'} /></Button>
                  <Button variant="outline-primary" className="shadow-sm border-0 bg-white" onClick={generarPDF}><Download className="me-2" /> Descargar PDF Oficial</Button>
                </Col>
              </Row>
              {cargando ? (
                <div className="text-center py-5"><Spinner animation="border" style={{ color: 'var(--color-accion, #0098db)' }} /></div>
              ) : (
                <Row className="g-4">
                  <Col lg={8}>
                    <Card className="border-0 shadow-sm rounded-4 h-100">
                      <Card.Body className="p-4">
                        <h5 className="fw-bold mb-4" style={{ color: 'var(--azul-oscuro)' }}><CashStack className="me-2 text-success" /> Ingresos Mensuales</h5>
                        <div style={{ width: '100%', height: 300 }}>
                          {reportes.ingresosMensuales && reportes.ingresosMensuales.length > 0 ? (
                            <ResponsiveContainer>
                              <BarChart data={reportes.ingresosMensuales} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
                                <XAxis dataKey="mes" tick={{ fill: '#666' }} axisLine={false} tickLine={false} />
                                <YAxis tickFormatter={(val) => `Q${val}`} tick={{ fill: '#666' }} axisLine={false} tickLine={false} />
                                <ChartTooltip formatter={(value) => [`Q ${value}`, 'Total Recaudado']} cursor={{ fill: '#f8f9fa' }} />
                                <Bar dataKey="total" fill="var(--color-accion, #0098db)" radius={[6, 6, 0, 0]} barSize={50} />
                              </BarChart>
                            </ResponsiveContainer>
                          ) : (
                            <div className="d-flex h-100 align-items-center justify-content-center text-muted">No hay ingresos procesados aún.</div>
                          )}
                        </div>
                      </Card.Body>
                    </Card>
                  </Col>
                  <Col lg={4}>
                    <Card className="border-0 shadow-sm rounded-4 h-100">
                      <Card.Body className="p-4">
                        <h5 className="fw-bold mb-4 text-center" style={{ color: 'var(--azul-oscuro)' }}><PieChartFill className="me-2 text-warning" /> Estudiantes por Facultad</h5>
                        <div style={{ width: '100%', height: 250 }}>
                          {reportes.distribucion && reportes.distribucion.length > 0 ? (
                            <ResponsiveContainer>
                              <PieChart>
                                <Pie data={reportes.distribucion} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={5} dataKey="cantidad" nameKey="facultad">
                                  {reportes.distribucion.map((entry: any, index: number) => (
                                    <Cell key={`cell-${index}`} fill={COLORES_PASTEL[index % COLORES_PASTEL.length]} />
                                  ))}
                                </Pie>
                                <ChartTooltip formatter={(value) => [value, 'Estudiantes']} />
                                <Legend verticalAlign="bottom" height={36} />
                              </PieChart>
                            </ResponsiveContainer>
                          ) : (
                            <div className="d-flex h-100 align-items-center justify-content-center text-muted">No hay registros aún.</div>
                          )}
                        </div>
                      </Card.Body>
                    </Card>
                  </Col>
                  <Col lg={12}>
                    <Card className="border-0 shadow-sm rounded-4 border-top-primary" style={{ borderTop: '4px solid var(--color-accion, #0098db)' }}>
                      <Card.Body className="p-4">
                        <div className="d-flex justify-content-between align-items-center mb-4">
                          <h5 className="fw-bold mb-0" style={{ color: 'var(--azul-oscuro)' }}><Speedometer2 className="me-2" /> KPIs Gerenciales (Módulo de Reportes)</h5>
                        </div>
                        <Row>
                          <Col md={3} className="text-center mb-3">
                            <h2 className="fw-bold text-primary">{reportes.dashboard?.usuarios?.total || 0}</h2>
                            <span className="text-muted small text-uppercase">Total Usuarios</span>
                          </Col>
                          <Col md={3} className="text-center mb-3">
                            <h2 className="fw-bold text-success">{reportes.dashboard?.espacios?.libres || 0}</h2>
                            <span className="text-muted small text-uppercase">Espacios Libres</span>
                          </Col>
                          <Col md={3} className="text-center mb-3">
                            <h2 className="fw-bold text-warning">{reportes.dashboard?.accesos?.tasa_exito || 0}%</h2>
                            <span className="text-muted small text-uppercase">Tasa Éxito Accesos</span>
                          </Col>
                          <Col md={3} className="text-center mb-3">
                            <h2 className="fw-bold text-danger">{reportes.dashboard?.morosidad?.usuarios_morosos || 0}</h2>
                            <span className="text-muted small text-uppercase">Usuarios Morosos</span>
                          </Col>
                        </Row>
                      </Card.Body>
                    </Card>
                  </Col>
                </Row>
              )}
            </div>
          )}
        </div>
      </div>

      {/* MODAL EDICIÓN */}
      <Modal show={showEditModal} onHide={() => setShowEditModal(false)} centered>
        <div style={{ borderRadius: '22px', overflow: 'hidden', backgroundColor: '#fff' }}>
          <div style={{ background: 'var(--azul-oscuro, #002b5c)', padding: '24px 28px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h5 className="mb-0 text-white fw-bold" style={{ fontStyle: 'italic' }}>Editar Usuario</h5>
            <button type="button" className="btn-close btn-close-white" onClick={() => setShowEditModal(false)}></button>
          </div>
          <div style={{ padding: '28px' }}>
            <Form.Group className="mb-3"><Form.Label className="fw-bold text-muted small">Carné (No editable)</Form.Label><Form.Control type="text" value={editForm.carne} disabled style={{ backgroundColor: '#f4f7f6' }} /></Form.Group>
            <Row>
              <Col md={6}><Form.Group className="mb-3"><Form.Label className="fw-bold text-muted small">Nombres</Form.Label><Form.Control type="text" value={editForm.nombres} onChange={(e) => setEditForm({ ...editForm, nombres: e.target.value })} /></Form.Group></Col>
              <Col md={6}><Form.Group className="mb-3"><Form.Label className="fw-bold text-muted small">Apellidos</Form.Label><Form.Control type="text" value={editForm.apellidos} onChange={(e) => setEditForm({ ...editForm, apellidos: e.target.value })} /></Form.Group></Col>
            </Row>
            <Form.Group className="mb-3"><Form.Label className="fw-bold text-muted small">Correo Institucional</Form.Label><Form.Control type="email" value={editForm.correo_institucional} onChange={(e) => setEditForm({ ...editForm, correo_institucional: e.target.value })} /></Form.Group>
            <Row>
              <Col md={6}><Form.Group className="mb-4"><Form.Label className="fw-bold text-muted small">Teléfono</Form.Label><Form.Control type="tel" value={editForm.telefono} onChange={(e) => setEditForm({ ...editForm, telefono: e.target.value })} /></Form.Group></Col>
              <Col md={6}><Form.Group className="mb-4"><Form.Label className="fw-bold text-muted small">Rol del Sistema</Form.Label><Form.Select value={editForm.id_rol} onChange={(e) => setEditForm({ ...editForm, id_rol: e.target.value })}>{roles.map(r => (<option key={r.ID_ROL} value={r.ID_ROL}>{r.NOMBRE_ROL}</option>))}</Form.Select></Form.Group></Col>
            </Row>
            <div className="d-flex gap-2">
              <Button variant="outline-secondary" onClick={() => setShowEditModal(false)} style={{ flex: 1, borderRadius: '8px' }}>Cancelar</Button>
              <Button onClick={handleGuardarEdicion} style={{ flex: 2, backgroundColor: 'var(--color-accion, #0098db)', border: 'none', borderRadius: '8px' }}><Save size={18} className="me-2" /> Guardar Cambios</Button>
            </div>
          </div>
        </div>
      </Modal>

      {/* MODAL PERFIL */}
      <Modal show={showProfile} onHide={() => setShowProfile(false)} centered>
        <div style={{ borderRadius: '22px', overflow: 'hidden', backgroundColor: 'var(--fondo-blanco)' }}>
          <div style={{ background: 'var(--azul-oscuro, #002b5c)', padding: '30px', textAlign: 'center', position: 'relative' }}>
            <button type="button" className="btn-close btn-close-white" onClick={() => setShowProfile(false)} style={{ position: 'absolute', top: '15px', right: '15px', opacity: 0.7 }}></button>
            <PersonCircle size={70} color="white" className="mb-2 opacity-75" />
            <h4 className="mb-0" style={{ color: 'white', fontFamily: 'var(--fuente-titulos)', fontStyle: 'italic' }}>Perfil Administrativo</h4>
            <Badge bg="danger" text="white" className="mt-2 px-3 py-1 rounded-pill">Administrador del Sistema</Badge>
          </div>
          <div style={{ padding: '30px' }}>
            <div className="mb-4">
              <h6 className="text-uppercase text-muted fw-bold mb-3" style={{ fontSize: '0.8rem', letterSpacing: '1px' }}>Información Interna</h6>
              <div className="d-flex align-items-center mb-2"><span className="text-muted" style={{ width: '120px' }}>ID / Carné:</span><strong style={{ color: 'var(--azul-oscuro)' }}>{adminLogueado?.carne}</strong></div>
              <div className="d-flex align-items-center"><span className="text-muted" style={{ width: '120px' }}>Nombre:</span><strong style={{ color: 'var(--azul-oscuro)' }}>{adminLogueado?.nombres} {adminLogueado?.apellidos}</strong></div>
            </div>
            <hr style={{ borderColor: 'rgba(0,0,0,0.1)' }} />
            <div className="mt-4">
              <h6 className="text-uppercase text-muted fw-bold mb-3" style={{ fontSize: '0.8rem', letterSpacing: '1px' }}>Información de Contacto</h6>
              <div className="d-flex align-items-center mb-3"><Envelope className="me-3 text-muted" size={18} /><span style={{ color: 'var(--azul-oscuro)' }}>{adminLogueado?.correo_institucional || adminLogueado?.correo_electronico || 'No registrado'}</span></div>
              <div className="d-flex align-items-center"><Telephone className="me-3 text-muted" size={18} /><span style={{ color: 'var(--azul-oscuro)' }}>{adminLogueado?.telefonos || adminLogueado?.telefono || '+502 (No registrado)'}</span></div>
            </div>
          </div>
        </div>
      </Modal>

    </div>
  );
};

export default DashboardAdmin;