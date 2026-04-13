import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Form, Button } from 'react-bootstrap';
import { useNavigate, Link } from 'react-router-dom';
import Swal from 'sweetalert2';
import ThemeSwitcher from '../components/ThemeSwitcher';

const API_BASE = 'http://localhost:3001/api';

const Registro = () => {
  const navigate = useNavigate();

  // Apply saved theme
  useEffect(() => {
    const t = localStorage.getItem('umg-theme') || 'azul';
    document.documentElement.setAttribute('data-theme', t);
  }, []);

  // --- ESTADOS PARA CATÁLOGOS DINÁMICOS ---
  const [facultades, setFacultades] = useState<any[]>([]);
  const [sedes, setSedes] = useState<any[]>([]);
  const [ciclos, setCiclos] = useState<any[]>([]);
  const [secciones, setSecciones] = useState<any[]>([]);
  const [jornadas, setJornadas] = useState<any[]>([]);
  const [departamentos, setDepartamentos] = useState<any[]>([]);
  const [municipios, setMunicipios] = useState<any[]>([]);
  const [cargando, setCargando] = useState(true);
  const [deptoSeleccionado, setDeptoSeleccionado] = useState('');

  // --- CARGA PARALELA DE TODOS LOS CATÁLOGOS (Promise.all nativo) ---
  useEffect(() => {
    const cargarCatalogos = async () => {
      try {
        const [resFac, resSedes, resCiclos, resSec, resJor, resDepto] = await Promise.all([
          fetch(`${API_BASE}/facultades`),
          fetch(`${API_BASE}/sedes`),
          fetch(`${API_BASE}/ciclos`),
          fetch(`${API_BASE}/secciones`),
          fetch(`${API_BASE}/jornadas`),
          fetch(`${API_BASE}/departamentos`),
        ]);

        const [facData, sedesData, ciclosData, secData, jorData, deptoData] = await Promise.all([
          resFac.json(), resSedes.json(), resCiclos.json(),
          resSec.json(), resJor.json(), resDepto.json(),
        ]);

        setFacultades(facData);
        setSedes(sedesData);
        setCiclos(ciclosData);
        setSecciones(secData);
        setJornadas(jorData);
        setDepartamentos(deptoData);
      } catch (error) {
        console.error("Error al conectar con la API:", error);
      } finally {
        setCargando(false);
      }
    };
    cargarCatalogos();
  }, []);

  // --- CASCADA: Departamento → Municipios ---
  useEffect(() => {
    if (!deptoSeleccionado) {
      setMunicipios([]);
      return;
    }
    const cargarMunicipios = async () => {
      try {
        const res = await fetch(`${API_BASE}/municipios/${deptoSeleccionado}`);
        if (res.ok) {
          const data = await res.json();
          setMunicipios(data);
        }
      } catch (error) {
        console.error("Error al cargar municipios:", error);
      }
    };
    cargarMunicipios();
  }, [deptoSeleccionado]);

  // --- ENVÍO DEL FORMULARIO ---
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const datosUsuario = Object.fromEntries(formData.entries());

    try {
      const response = await fetch(`${API_BASE}/auth/registro`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(datosUsuario),
      });

      const data = await response.json();

      if (response.ok) {
        Swal.fire({
          title: '¡Registro Exitoso!',
          text: 'Tu perfil ha sido creado. Ya puedes iniciar sesión con tu carné.',
          icon: 'success',
          confirmButtonText: 'Ir al Login',
          confirmButtonColor: 'var(--azul-universitario)',
          background: 'var(--fondo-blanco)',
          color: 'var(--azul-oscuro)'
        }).then((result) => {
          if (result.isConfirmed) navigate('/login');
        });
      } else {
        Swal.fire({
          title: 'Error de Validación',
          text: data.error || 'Verifica que el carné o correo no estén duplicados.',
          icon: 'error',
          confirmButtonColor: 'var(--rojo-institucional)'
        });
      }
    } catch (error) {
      Swal.fire({
        title: 'Error de Conexión',
        text: 'El servidor de base de datos no responde.',
        icon: 'error',
        confirmButtonColor: 'var(--rojo-institucional)'
      });
    }
  };

  return (
    <div style={{ backgroundColor: 'var(--fondo-general)', minHeight: '100vh', padding: '40px 0' }}>
      <Container>
        <Row className="justify-content-center">
          <Col md={10} lg={9}>
            <Card className="border-0 shadow-lg liquid-card" style={{ borderRadius: '20px' }}>
              {/* Acento visual según Guía de Diseño */}
              <div style={{ height: '5px', backgroundColor: 'var(--azul-celeste-v2)' }} />
              
              <Card.Body className="p-5">
                <div className="text-center mb-5">
                  <h2 className="fw-bold" style={{ color: 'var(--azul-universitario)', fontStyle: 'italic', fontFamily: 'var(--fuente-titulos)' }}>
                    Registro de Parqueo UMG
                  </h2>
                  <p className="text-muted" style={{ fontFamily: 'var(--fuente-principal)' }}>
                    Ingresa tus datos para la asignación de marbete y acceso vehicular
                  </p>
                </div>

                <Form onSubmit={handleSubmit} style={{ fontFamily: 'var(--fuente-principal)' }}>
                  {/* Rol oculto: 1 = Estudiante */}
                  <input type="hidden" name="id_rol" value="1" />

                  {/* --- SECCIÓN 1: IDENTIDAD --- */}
                  <h5 className="mb-3 fw-bold border-bottom pb-2" style={{ color: 'var(--azul-universitario)', fontStyle: 'italic', fontFamily: 'var(--fuente-titulos)' }}>
                    1. Información Personal
                  </h5>
                  <Row className="mb-4">
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label className="fw-bold">Nombres</Form.Label>
                        <Form.Control name="nombres" type="text" required placeholder="Nombres completos" />
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label className="fw-bold">Apellidos</Form.Label>
                        <Form.Control name="apellidos" type="text" required placeholder="Apellidos completos" />
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label className="fw-bold">Número de Carné</Form.Label>
                        <Form.Control name="carne" type="text" required placeholder="XXXX-XX-XXXXX" pattern="[0-9]{4}-[0-9]{2}-[0-9]{1,6}" />
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label className="fw-bold">Correo Institucional</Form.Label>
                        <Form.Control name="correo_electronico" type="email" required placeholder="usuario@miumg.edu.gt" />
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label className="fw-bold">Teléfono</Form.Label>
                        <Form.Control name="telefonos" type="tel" required placeholder="8 dígitos" pattern="[0-9]{8}" />
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label className="fw-bold">Contraseña de Acceso</Form.Label>
                        <Form.Control name="password" type="password" required placeholder="Mínimo 8 caracteres" />
                      </Form.Group>
                    </Col>
                  </Row>

                  {/* --- SECCIÓN 2: UBICACIÓN (CASCADA DINÁMICA) --- */}
                  <h5 className="mb-3 fw-bold border-bottom pb-2" style={{ color: 'var(--azul-universitario)', fontStyle: 'italic', fontFamily: 'var(--fuente-titulos)' }}>
                    2. Dirección de Residencia
                  </h5>
                  <Row className="mb-4">
                    <Col md={4}>
                      <Form.Group className="mb-3">
                        <Form.Label className="fw-bold">Departamento</Form.Label>
                        <Form.Select
                          value={deptoSeleccionado}
                          onChange={(e) => setDeptoSeleccionado(e.target.value)}
                          required
                          disabled={cargando}
                        >
                          <option value="">Selecciona...</option>
                          {departamentos.map((d) => (
                            <option key={d.ID_DEPARTAMENTO} value={d.ID_DEPARTAMENTO}>
                              {d.NOMBRE_DEPARTAMENTO}
                            </option>
                          ))}
                        </Form.Select>
                      </Form.Group>
                    </Col>
                    <Col md={4}>
                      <Form.Group className="mb-3">
                        <Form.Label className="fw-bold">Municipio</Form.Label>
                        <Form.Select name="id_municipio" required disabled={!deptoSeleccionado}>
                          <option value="">{deptoSeleccionado ? 'Selecciona municipio...' : 'Elige departamento primero'}</option>
                          {municipios.map((m) => (
                            <option key={m.ID_MUNICIPIO} value={m.ID_MUNICIPIO}>
                              {m.NOMBRE_MUNICIPIO}
                            </option>
                          ))}
                        </Form.Select>
                      </Form.Group>
                    </Col>
                    <Col md={2}>
                      <Form.Group className="mb-3">
                        <Form.Label className="fw-bold">Zona</Form.Label>
                        <Form.Select name="zona">
                          <option value="">N/A</option>
                          {[...Array(25)].map((_, i) => (
                            <option key={i + 1} value={i + 1}>{i + 1}</option>
                          ))}
                        </Form.Select>
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label className="fw-bold">(Casa/Apto/Calle)</Form.Label>
                        <Form.Control name="nomenclatura" type="text" required placeholder="Ej: Umg Casa C10" />
                      </Form.Group>
                    </Col>
                  </Row>

                  {/* --- SECCIÓN 3: ACADÉMICO (100% DINÁMICO) --- */}
                  <h5 className="mb-3 fw-bold border-bottom pb-2" style={{ color: 'var(--azul-universitario)', fontStyle: 'italic', fontFamily: 'var(--fuente-titulos)' }}>
                    3. Datos Académicos
                  </h5>
                  <Row className="mb-4">
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label className="fw-bold">Facultad</Form.Label>
                        <Form.Select name="id_facultad" required disabled={cargando}>
                          <option value="" disabled hidden>Selecciona tu facultad...</option>
                          {facultades.map((f) => (
                            <option key={f.ID_FACULTAD} value={f.ID_FACULTAD}>
                              {f.NOMBRE_FACULTAD}
                            </option>
                          ))}
                        </Form.Select>
                      </Form.Group>
                    </Col>
                    <Col md={3}>
                      <Form.Group className="mb-3">
                        <Form.Label className="fw-bold">Sede</Form.Label>
                        <Form.Select name="id_sede" required disabled={cargando}>
                          <option value="">Selecciona...</option>
                          {sedes.map((s) => (
                            <option key={s.ID_SEDE} value={s.ID_SEDE}>
                              {s.NOMBRE_SEDE}
                            </option>
                          ))}
                        </Form.Select>
                      </Form.Group>
                    </Col>
                    <Col md={3}>
                      <Form.Group className="mb-3">
                        <Form.Label className="fw-bold">Ciclo</Form.Label>
                        <Form.Select name="id_ciclo" required disabled={cargando}>
                          <option value="">Selecciona...</option>
                          {ciclos.map((c) => (
                            <option key={c.ID_CICLO} value={c.ID_CICLO}>
                              {c.NOMBRE_CICLO}
                            </option>
                          ))}
                        </Form.Select>
                      </Form.Group>
                    </Col>
                    <Col md={3}>
                      <Form.Group className="mb-3">
                        <Form.Label className="fw-bold">Sección</Form.Label>
                        <Form.Select name="id_seccion" required disabled={cargando}>
                          <option value="">Selecciona...</option>
                          {secciones.map((s) => (
                            <option key={s.ID_SECCION} value={s.ID_SECCION}>
                              {s.NOMBRE_SECCION}
                            </option>
                          ))}
                        </Form.Select>
                      </Form.Group>
                    </Col>
                    <Col md={3}>
                      <Form.Group className="mb-3">
                        <Form.Label className="fw-bold">Jornada</Form.Label>
                        <Form.Select name="id_jornada" required disabled={cargando}>
                          <option value="">Selecciona...</option>
                          {jornadas.map((j) => (
                            <option key={j.ID_JORNADA} value={j.ID_JORNADA}>
                              {j.NOMBRE_JORNADA}
                            </option>
                          ))}
                        </Form.Select>
                      </Form.Group>
                    </Col>
                  </Row>

                  {/* --- SECCIÓN 4: EMERGENCIA --- */}
                  <h5 className="mb-3 fw-bold border-bottom pb-2 mt-2" style={{ color: 'var(--azul-universitario)', fontStyle: 'italic', fontFamily: 'var(--fuente-titulos)' }}>
                    4. Contacto de Emergencia
                  </h5>
                  <Row className="mb-4">
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label className="fw-bold text-danger">Nombre de Contacto</Form.Label>
                        <Form.Control name="emergencia_nombre" type="text" required placeholder="Familiar o Contacto" />
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label className="fw-bold text-danger">Teléfono de Emergencia</Form.Label>
                        <Form.Control name="emergencia_telefono" type="tel" required placeholder="8 dígitos" pattern="[0-9]{8}" />
                      </Form.Group>
                    </Col>
                  </Row>

                  <div className="d-grid gap-2 mt-5">
                    <Button type="submit" size="lg" className="btn-liquid" style={{ 
                      backgroundColor: 'var(--azul-universitario)', 
                      border: 'none',
                      fontFamily: 'var(--fuente-titulos)',
                      fontStyle: 'italic',
                      fontWeight: 'bold',
                      padding: '12px'
                    }}>
                      Finalizar Registro de Estudiante
                    </Button>
                  </div>
                  
                  <div className="text-center mt-4">
                    <Link to="/login" className="text-decoration-none fw-bold" style={{ color: 'var(--azul-celeste-v1)' }}>
                      ¿Ya tienes cuenta? Inicia Sesión aquí
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

export default Registro;