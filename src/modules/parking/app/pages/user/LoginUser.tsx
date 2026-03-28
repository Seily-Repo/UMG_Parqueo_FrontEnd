import { useState } from 'react';
import { useNavigate } from 'react-router';
import { useRegistration } from '../../context/RegistrationContext';
import { Card, Form, Button, Alert } from 'react-bootstrap';
import { LogIn, User } from 'lucide-react';
import { toast } from 'react-toastify';
import { AppHeader } from '../../components/AppHeader';

export function LoginUser() {
  const navigate = useNavigate();
  const { updateRegistration } = useRegistration();
  
  const [formData, setFormData] = useState({
    carnet: '',
    password: '',
  });

  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Simular llamada a API
    fetch('/users.json')
      .then(res => res.json())
      .then((users: any[]) => {
        const user = users.find(u => u.carnet === formData.carnet && u.password === formData.password);
        if (!user) {
          setError('Usuario no encontrado o contraseña incorrecta');
          return;
        }

        // Login exitoso, setear datos
        updateRegistration({
          ...user,
          createdAt: new Date(user.createdAt),
        });
        toast.success(`Bienvenido, ${user.fullName}`);
        navigate('/parking');
      })
      .catch(err => {
        setError('Error al conectar con el servidor');
        console.error(err);
      });
  };

  return (
    <div style={{
      height: '100vh',
      backgroundImage: 'url(/villanueva.webp)',
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundAttachment: 'scroll',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    }}>
      <AppHeader />
      
      <div style={{ maxWidth: 400, margin: '50px auto' }}>
        <Card className="shadow-sm">
          <Card.Header className="bg-white border-bottom text-center">
            <Card.Title className="mb-1 h4">Iniciar Sesión</Card.Title>
            <Card.Subtitle className="text-muted">
              Ingresa tus credenciales para continuar
            </Card.Subtitle>
          </Card.Header>
          <Card.Body className="p-4">
            {error && <Alert variant="danger">{error}</Alert>}
            
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

              <Button variant="primary" type="submit" size="lg" className="w-100">
                <LogIn size={16} className="me-2" />
                Iniciar Sesión
              </Button>
            </Form>

            <hr className="my-4" />

            <div className="text-center text-muted small">
              <p className="mb-1">Ingrese sus credenciales para continuar</p>
            </div>
          </Card.Body>
        </Card>
      </div>
    </div>
  );
}