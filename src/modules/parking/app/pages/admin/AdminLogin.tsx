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
    <div className="bg-mesh d-flex flex-column" style={{ minHeight: '100vh' }}>
      <div className="deco-circle deco-circle-1" />
      <div className="deco-circle deco-circle-2" />

      <main className="flex-grow-1 d-flex align-items-center justify-content-center p-4">
        <Container style={{ maxWidth: 470 }}>
          <div className="text-center mb-4 animate-fade-in">
            <div className="icon-glass d-inline-flex align-items-center justify-content-center mb-3" style={{ width: 80, height: 80 }}>
              <GraduationCap size={32} color="var(--color-primario)" />
            </div>
            <h4 className="fw-bold mb-1" style={{ color: 'var(--color-primario)' }}>Panel Administrativo</h4>
            <p className="text-muted mb-0">Ingresa tus credenciales de administrador.</p>
          </div>

          <Card className="liquid-card border-0 shadow-lg" style={{ overflow: 'hidden' }}>
            <div className="accent-bar" />
            <Card.Body className="p-4">
              <div className="text-center mb-4">
                <div className="d-inline-flex align-items-center justify-content-center mb-3 icon-glass" style={{ width: 56, height: 56 }}>
                  <Shield size={24} color="var(--color-primario)" />
                </div>
                <h5 className="mb-1">Inicio de Sesión</h5>
                <p className="text-muted small mb-0">Accede con tu usuario administrativo.</p>
              </div>

              <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-3">
                  <Form.Label className="form-label">Usuario</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="admin"
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    autoComplete="username"
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label className="form-label">Contraseña</Form.Label>
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

                <Button type="submit" className="btn-liquid mb-3">Entrar</Button>

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
