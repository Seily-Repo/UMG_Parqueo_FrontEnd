import React, { useState } from 'react';
import { Container, Row, Col, Card, Form, Button } from 'react-bootstrap';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Swal from 'sweetalert2';
import ThemeSwitcher from '../components/ThemeSwitcher';

const API_BASE = '/api';

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const navigate = useNavigate();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!token) {
      Swal.fire('Error', 'Token de recuperación no válido o faltante.', 'error');
      return;
    }

    if (password !== confirmPassword) {
      Swal.fire('Error', 'Las contraseñas no coinciden.', 'error');
      return;
    }

    if (password.length < 8) {
      Swal.fire('Error', 'La contraseña debe tener al menos 8 caracteres.', 'warning');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/auth/update-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, nuevaPassword: password })
      });

      if (response.ok) {
        Swal.fire({
          title: '¡Contraseña Actualizada!',
          text: 'Tu contraseña ha sido restablecida con éxito. Ya puedes iniciar sesión.',
          icon: 'success',
          confirmButtonColor: 'var(--color-accion)'
        }).then(() => {
          navigate('/login');
        });
      } else {
        const errorData = await response.json();
        Swal.fire('Error', errorData.error || 'No se pudo restablecer la contraseña.', 'error');
      }
    } catch (error) {
      Swal.fire('Error', 'Problema de conexión con el servidor.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', backgroundColor: 'var(--fondo-general)', fontFamily: 'var(--fuente-principal)' }}>
      <Container>
        <Row className="justify-content-center">
          <Col md={6} lg={5}>
            <Card className="border-0 shadow-lg" style={{ borderRadius: '20px', overflow: 'hidden' }}>
              <div style={{ backgroundColor: 'var(--color-primario)', padding: '30px', textAlign: 'center' }}>
                <img src="/logo.png" alt="UMG" style={{ width: '80px', marginBottom: '15px' }} />
                <h3 className="mb-0" style={{ color: 'white', fontFamily: 'var(--fuente-titulos)', fontStyle: 'italic' }}>Parqueo UMG</h3>
              </div>
              <Card.Body style={{ padding: '40px' }}>
                <div className="text-center mb-4">
                  <h4 style={{ color: 'var(--color-primario)', fontWeight: 'bold' }}>Restablecer Contraseña</h4>
                  <p className="text-muted" style={{ fontSize: '0.9rem' }}>Ingresa tu nueva contraseña</p>
                </div>

                <Form onSubmit={handleSubmit}>
                  <Form.Group className="mb-3">
                    <Form.Label className="fw-bold" style={{ color: 'var(--color-primario)' }}>Nueva Contraseña</Form.Label>
                    <Form.Control 
                      type="password" 
                      placeholder="••••••••" 
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required 
                      style={{ padding: '12px', borderRadius: '10px' }}
                    />
                  </Form.Group>

                  <Form.Group className="mb-4">
                    <Form.Label className="fw-bold" style={{ color: 'var(--color-primario)' }}>Confirmar Contraseña</Form.Label>
                    <Form.Control 
                      type="password" 
                      placeholder="••••••••" 
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required 
                      style={{ padding: '12px', borderRadius: '10px' }}
                    />
                  </Form.Group>

                  <Button 
                    type="submit" 
                    className="w-100" 
                    disabled={loading}
                    style={{ 
                      backgroundColor: 'var(--color-accion)', 
                      border: 'none', 
                      padding: '12px', 
                      borderRadius: '10px',
                      fontWeight: 'bold',
                      fontSize: '1.1rem'
                    }}
                  >
                    {loading ? 'Guardando...' : 'Guardar y Entrar'}
                  </Button>
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

export default ResetPassword;
