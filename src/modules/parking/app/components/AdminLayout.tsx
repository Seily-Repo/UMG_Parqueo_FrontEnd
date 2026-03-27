import { Outlet, useNavigate } from 'react-router';
import { Container, Button } from 'react-bootstrap';
import { LogOut } from 'lucide-react';
import { AppHeader } from './AppHeader';

export function AdminLayout() {
  const navigate = useNavigate();

  const handleLogout = () => {
    navigate('/parking/admin');
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f8f9fa' }}>
      <AppHeader
        subtitle="Panel de Administración"
        actions={
          <>
            <div className="text-end d-none d-md-block">
              <div className="small fw-medium">Admin Usuario</div>
              <small className="text-muted">Administrador</small>
            </div>
            <Button variant="outline-secondary" size="sm" onClick={handleLogout}>
              <LogOut size={16} className="me-2" />
              Cerrar Sesión
            </Button>
          </>
        }
      />

      {/* Main Content */}
      <Container fluid="lg" className="py-4">
        <Outlet />
      </Container>
    </div>
  );
}
