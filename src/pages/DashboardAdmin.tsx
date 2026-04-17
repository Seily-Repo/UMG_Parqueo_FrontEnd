import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Table, Badge, Button, Form, InputGroup, Spinner } from 'react-bootstrap';
import { Search, PencilSquare, Trash, PersonLinesFill, ShieldLockFill } from 'react-bootstrap-icons';

const DashboardAdmin = () => {
  // 1. Estados para guardar la data real y controlar la pantalla de carga
  const [usuarios, setUsuarios] = useState<any[]>([]);
  const [cargando, setCargando] = useState(true);

  // 2. useEffect: Se ejecuta una sola vez al abrir la pantalla
  useEffect(() => {
    const cargarUsuarios = async () => {
      try {
        const respuesta = await fetch('http://localhost:3001/api/admin/usuarios');
        const data = await respuesta.json();
        
        if (respuesta.ok) {
          setUsuarios(data); // Guardamos lo que nos mandó Oracle
        } else {
          console.error("Error del servidor:", data);
        }
      } catch (error) {
        console.error("No se pudo conectar al backend:", error);
      } finally {
        setCargando(false); // Apagamos el circulito de carga
      }
    };

    cargarUsuarios();
  }, []);

  return (
    <div style={{ backgroundColor: 'var(--fondo-general, #f4f6f9)', minHeight: '100vh', paddingBottom: '2rem' }}>
      
      {/* HEADER DEL ADMIN */}
      <div style={{ backgroundColor: 'var(--azul-oscuro, #002b5c)', padding: '20px 0', marginBottom: '30px', boxShadow: '0 4px 10px rgba(0,0,0,0.1)' }}>
        <Container>
          <div className="d-flex align-items-center text-white">
            <ShieldLockFill size={30} className="me-3" />
            <h3 className="mb-0 fw-bold" style={{ fontStyle: 'italic' }}>Panel Administrativo UMG</h3>
          </div>
        </Container>
      </div>

      <Container>
        <Row className="mb-4 align-items-end">
          <Col md={8}>
            <h2 className="fw-bold" style={{ color: 'var(--azul-universitario, #004b87)' }}>
              <PersonLinesFill className="me-2" />
              Gestión de Usuarios
            </h2>
            <p className="text-muted mb-0">Control total de accesos, roles y estados del parqueo.</p>
          </Col>
        </Row>

        <Card className="border-0 shadow-sm" style={{ borderRadius: '15px', overflow: 'hidden' }}>
          <Card.Body className="p-4">
            
            <Row className="mb-4 align-items-center">
              <Col md={6}>
                <InputGroup>
                  <InputGroup.Text className="bg-light border-end-0"><Search className="text-muted"/></InputGroup.Text>
                  <Form.Control 
                    placeholder="Buscar por carné, nombre o correo..." 
                    className="bg-light border-start-0 ps-0"
                    style={{ boxShadow: 'none' }}
                  />
                </InputGroup>
              </Col>
              <Col md={6} className="text-md-end mt-3 mt-md-0">
                <Button style={{ backgroundColor: 'var(--azul-universitario, #004b87)', border: 'none', borderRadius: '8px' }}>
                  + Nuevo Usuario
                </Button>
              </Col>
            </Row>

            {/* TABLA DE DATOS DINÁMICA */}
            <div className="table-responsive">
              {cargando ? (
                <div className="text-center py-5">
                  <Spinner animation="border" style={{ color: 'var(--azul-universitario)' }} />
                  <p className="mt-2 text-muted">Cargando usuarios desde Oracle...</p>
                </div>
              ) : (
                <Table hover className="align-middle" style={{ borderCollapse: 'separate', borderSpacing: '0 8px' }}>
                  <thead className="bg-light text-muted" style={{ fontSize: '0.9rem', textTransform: 'uppercase' }}>
                    <tr>
                      <th className="border-0 pb-2">Carné</th>
                      <th className="border-0 pb-2">Nombre Completo</th>
                      <th className="border-0 pb-2">Correo Institucional</th>
                      <th className="border-0 pb-2">Rol</th>
                      <th className="border-0 pb-2">Estado</th>
                      <th className="border-0 pb-2 text-center">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {/* Nota: Oracle devuelve las llaves en MAYÚSCULAS por defecto */}
                    {usuarios.map((usr, index) => (
                      <tr key={index} style={{ backgroundColor: '#fff', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
                        <td className="fw-bold" style={{ color: 'var(--azul-oscuro, #002b5c)' }}>{usr.CARNE}</td>
                        <td>{usr.NOMBRE}</td>
                        <td>{usr.CORREO}</td>
                        <td>
                          <Badge bg={usr.ROL === 'ADMINISTRADOR' ? 'danger' : 'primary'} className="px-3 py-2 rounded-pill">
                            {usr.ROL}
                          </Badge>
                        </td>
                        <td>
                          <Badge bg={usr.ESTADO === 'Activo' ? 'success' : 'secondary'} className="px-3 py-2 rounded-pill">
                            {usr.ESTADO}
                          </Badge>
                        </td>
                        <td className="text-center">
                          <Button variant="light" size="sm" className="me-2 text-primary shadow-sm" title="Editar">
                            <PencilSquare />
                          </Button>
                          <Button variant="light" size="sm" className="text-danger shadow-sm" title="Desactivar">
                            <Trash />
                          </Button>
                        </td>
                      </tr>
                    ))}
                    
                    {/* Mensaje si la base de datos está vacía */}
                    {usuarios.length === 0 && (
                      <tr>
                        <td colSpan={6} className="text-center py-4 text-muted">
                          No hay usuarios registrados en el sistema.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </Table>
              )}
            </div>

          </Card.Body>
        </Card>
      </Container>
    </div>
  );
};

export default DashboardAdmin;