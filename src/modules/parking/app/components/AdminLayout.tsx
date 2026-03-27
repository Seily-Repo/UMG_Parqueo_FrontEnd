import { Outlet, useNavigate } from 'react-router';
import { Container, Button } from 'react-bootstrap';
import { GraduationCap, LogOut } from 'lucide-react';

export function AdminLayout() {
  const navigate = useNavigate();

  const handleLogout = () => {
    navigate('/parking/admin');
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f8f9fa' }}>
      {/* Header */}
      <div style={{ borderBottom: '1px solid #dee2e6', backgroundColor: 'white', position: 'sticky', top: 0, zIndex: 1000 }}>
        <Container fluid="lg">
          <div className="d-flex align-items-center justify-content-between py-3">
            <div className="d-flex align-items-center gap-3">
              <div style={{ width: 40, height: 40, backgroundColor: '#7e57c2', borderRadius: 8 }} className="d-flex align-items-center justify-content-center">
                <GraduationCap size={24} color="white" />
              </div>
              <div>
                <h5 className="mb-0 fw-bold">Universidad Nacional</h5>
                <small className="text-muted">Panel de Administración</small>
              </div>
            </div>
            <div className="d-flex align-items-center gap-3">
              <div className="text-end d-none d-md-block">
                <div className="small fw-medium">Admin Usuario</div>
                <small className="text-muted">Administrador</small>
              </div>
              <Button
                variant="outline-secondary"
                size="sm"
                onClick={handleLogout}
              >
                <LogOut size={16} className="me-2" />
                Cerrar Sesión
              </Button>
            </div>
          </div>
        </Container>
      </div>

      {/* Main Content */}
      <Container fluid="lg" className="py-4">
        <Outlet />
      </Container>
    </div>
  );
}
