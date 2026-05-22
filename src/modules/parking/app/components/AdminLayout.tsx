import { Outlet } from 'react-router';
import { Container, Button } from 'react-bootstrap';
import { LogOut } from 'lucide-react';
import { AppHeader } from './AppHeader';
import { AppFooter } from './AppFooter';

const ADMIN_DASHBOARD_URL = 'http://10.0.40.10/dashboard-admin';

export function AdminLayout() {
  const handleLogout = () => {
    window.location.href = ADMIN_DASHBOARD_URL;
  };

  return (
    <div className="parking-shell parking-shell--solid">
      <AppHeader
        subtitle="Panel de Administracion"
        actions={
          <>
            <div className="text-end d-none d-md-block text-white">
              <div className="small fw-medium">Admin Usuario</div>
              <small style={{ color: 'rgba(255, 255, 255, 0.8)' }}>Administrador</small>
            </div>
            <Button variant="light" size="sm" onClick={handleLogout}>
              <LogOut size={16} className="me-2" />
              Volver al Dashboard
            </Button>
          </>
        }
      />

      <main>
        <Container fluid="lg" className="parking-content-container py-4">
          <Outlet />
        </Container>
      </main>

      <AppFooter />
    </div>
  );
}
