import { useState } from 'react';
import { useNavigate } from 'react-router';
import { useRegistration } from '../../context/RegistrationContext';
import { Card, Form, Button, Alert, Tabs, Tab, Container } from 'react-bootstrap';
import { LogIn, User } from 'lucide-react';
import { toast } from 'react-toastify';
import { AppHeader } from '../../components/AppHeader';

export function LoginUser() {
  const navigate = useNavigate();
  const { registrations, updateRegistration } = useRegistration();
  
  // Usuarios demo estáticos para asegurar que funcione el inicio de sesión
  const demoUsers = [
    { id: 'demo-1', carnet: '5190-23-0001', fullName: 'Juan Pérez', paymentStatus: 'pending', vehicles: [], createdAt: new Date() },
    { id: 'demo-2', carnet: '5190-23-0002', fullName: 'Ana García', paymentStatus: 'pending', vehicles: [], createdAt: new Date() }
  ];

  const [formData, setFormData] = useState({
    carnet: '',
    password: '',
  });

  const [error, setError] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Protegemos la variable por si aún no existen registros
    const safeRegistrations = registrations || [];

    if (isRegistering) {
      // Lógica de registro
      const exists = demoUsers.find(u => u.carnet === formData.carnet) || safeRegistrations.find(u => u.carnet === formData.carnet);
      if (exists) {
        setError('El carnet ya está registrado. Por favor inicia sesión.');
        return;
      }

      // Iniciar sesión del nuevo usuario
      updateRegistration({
        id: crypto.randomUUID(),
        carnet: formData.carnet,
        paymentStatus: 'pending',
        vehicles: [],
        createdAt: new Date(),
      });
      toast.success('Cuenta iniciada. Completa tu información en el portal.');
      navigate('/parking');
    } else {
      // Lógica de login: Buscar en usuarios demo y en usuarios ya registrados
      const user = demoUsers.find(u => u.carnet === formData.carnet) || safeRegistrations.find(u => u.carnet === formData.carnet);
      
      if (!user) {
        setError('Usuario no encontrado. Verifica tu número de carnet o regístrate.');
        return;
      }

      // Login exitoso, setear datos
      updateRegistration({
        ...(user as any),
        createdAt: new Date(user.createdAt),
      });
      toast.success(`Bienvenido, ${user.fullName || 'Estudiante'}`);
      navigate('/parking');
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      backgroundImage: 'linear-gradient(rgba(0,0,0,0.55), rgba(0,0,0,0.55)), url(/villanueva.webp)',
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundAttachment: 'fixed',
    }}>
      <AppHeader />
      
      <Container className="d-flex align-items-center justify-content-center" style={{ minHeight: 'calc(100vh - 100px)' }}>
        <div style={{ width: '100%', maxWidth: 450 }}>
          <Card className="shadow-lg border-0 rounded-3">
            <Card.Body className="p-4 p-md-5">
              <div className="text-center mb-4">
                <h4 className="fw-bold text-primary mb-1">Portal de Parqueo</h4>
                <p className="text-muted small">Universidad Nacional</p>
              </div>

              {error && <Alert variant="danger">{error}</Alert>}

              <Tabs
                activeKey={isRegistering ? 'register' : 'login'}
                onSelect={(k) => {
                  setIsRegistering(k === 'register');
                  setError('');
                }}
                className="mb-4 nav-justified"
              >
                <Tab eventKey="login" title="Iniciar Sesión">
                  <Form onSubmit={handleSubmit}>
                    <Form.Group className="mb-3">
                      <Form.Label>Número de Carnet</Form.Label>
                      <Form.Control
                        type="text"
                        placeholder="5190-23-XXXX"
                        value={formData.carnet}
                        onChange={(e) => setFormData({ ...formData, carnet: e.target.value })}
                        required
                      />
                    </Form.Group>

                    <Form.Group className="mb-4">
                      <Form.Label>Contraseña</Form.Label>
                      <Form.Control
                        type="password"
                        placeholder="Contraseña"
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        required
                      />
                    </Form.Group>

                    <Alert variant="info" className="mb-4 text-start">
                      <small>
                        <strong>Cuentas Demo:</strong><br />
                        • Carnet: <code>5190-23-0001</code> (Juan Pérez)<br />
                        • Carnet: <code>5190-23-0002</code> (Ana García)
                      </small>
                    </Alert>

                    <Button variant="primary" type="submit" size="lg" className="w-100">
                      <LogIn size={16} className="me-2" /> Iniciar Sesión
                    </Button>
                  </Form>
                </Tab>

                <Tab eventKey="register" title="Registrarse">
                  <Form onSubmit={handleSubmit}>
                    <Form.Group className="mb-3">
                      <Form.Label>Número de Carnet Nuevo</Form.Label>
                      <Form.Control
                        type="text"
                        placeholder="5190-23-XXXX"
                        value={formData.carnet}
                        onChange={(e) => setFormData({ ...formData, carnet: e.target.value })}
                        required
                      />
                    </Form.Group>

                    <Form.Group className="mb-4">
                      <Form.Label>Crear Contraseña</Form.Label>
                      <Form.Control
                        type="password"
                        placeholder="Contraseña"
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        required
                      />
                    </Form.Group>

                    <Button variant="success" type="submit" size="lg" className="w-100">
                      <User size={16} className="me-2" /> Crear Cuenta
                    </Button>
                  </Form>
                </Tab>
              </Tabs>
            </Card.Body>
          </Card>
        </div>
      </Container>
    </div>
  );
}