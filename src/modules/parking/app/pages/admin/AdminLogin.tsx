import { useState } from 'react';
import { useNavigate } from 'react-router';
import { Container, Card, Form, Button, Alert } from 'react-bootstrap';
import { GraduationCap, ArrowLeft, Shield } from 'lucide-react';
import { toast } from 'react-toastify';
import { AppFooter } from '../../components/AppFooter';

export function AdminLogin() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: '',
    password: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Demo credentials
    if (formData.username === 'admin' && formData.password === 'admin123') {
      toast.success('Bienvenido, Administrador');
      navigate('/parking/admin/dashboard');
    } else {
      toast.error('Credenciales incorrectas');
    }
  };

  return (
    <div
      className="parking-shell parking-shell--solid d-flex flex-column"
      style={{
        minHeight: '100vh',
      }}
    >
      <main className="flex-grow-1 d-flex align-items-center justify-content-center p-4">
      <Container style={{ maxWidth: 450 }}>
        {/* Header */}
        <div className="text-center mb-4">
          <div 
            className="d-inline-flex align-items-center justify-center mb-3"
            style={{ 
              width: 64, 
              height: 64, 
              backgroundColor: '#1A6AA6', 
              borderRadius: 16
            }}
          >
            <GraduationCap size={32} color="white" />
          </div>
          <h4 className="fw-bold mb-1">Universidad Nacional</h4>
          <p className="text-muted mb-0">Panel de Administración</p>
        </div>

        {/* Login Card */}
        <Card className="shadow-sm" style={{ border: '2px solid #A7C9D6' }}>
          <Card.Body className="p-4">
            <div className="text-center mb-4">
              <div 
                className="d-inline-flex align-items-center justify-content-center mb-3"
                style={{ 
                  width: 48, 
                  height: 48, 
                  backgroundColor: '#CCF2FF', 
                  borderRadius: '50%'
                }}
              >
                <Shield size={24} color="#1A6AA6" />
              </div>
              <h5 className="mb-1">Inicio de Sesión</h5>
              <p className="text-muted small mb-0">
                Ingrese sus credenciales de administrador
              </p>
            </div>

            <Form onSubmit={handleSubmit}>
              <Form.Group className="mb-3">
                <Form.Label>Usuario</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="admin"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  autoComplete="username"
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Contraseña</Form.Label>
                <Form.Control
                  type="password"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  autoComplete="current-password"
                />
              </Form.Group>

              <Alert variant="info" className="mb-3">
                <small>
                  <strong>Demo:</strong> Usuario: <code>admin</code> / Contraseña: <code>admin123</code>
                </small>
              </Alert>

              <Button variant="primary" type="submit" size="lg" className="w-100 mb-3">
                Entrar
              </Button>

              <Button
                variant="link"
                size="sm"
              className="w-100 text-decoration-none d-flex align-items-center justify-content-center"
                onClick={() => navigate('/parking')}
              >
                <ArrowLeft size={16} className="me-2" />
                Volver al Inicio
              </Button>
            </Form>
          </Card.Body>
        </Card>
      </Container>
      </main>
      <AppFooter />
    </div>
  );
}
