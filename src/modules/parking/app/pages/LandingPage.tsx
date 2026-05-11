import { useNavigate } from 'react-router';
import { Button, Card } from 'react-bootstrap';
import {
  AlertTriangle,
  Building2,
  Car,
  ChevronLeft,
  FileText,
  Home,
  LogOut,
  Menu,
  ReceiptText,
  ShieldCheck,
  UserCircle,
} from 'lucide-react';
import { useRegistration } from '../context/RegistrationContext';
import umgLogo from '../../../../assets/umg_logo.png';

export function LandingPage() {
  const navigate = useNavigate();
  const { currentRegistration } = useRegistration();
  const displayName = currentRegistration?.fullName || 'Cristian Estrada';
  const firstName = displayName.split(' ')[0] || 'Usuario';

  const navItems = [
    { label: 'Inicio', icon: Home, action: () => navigate('/parking') },
    { label: 'Mis Vehiculos', icon: Car, action: () => navigate('/parking/user/vehiculos') },
    { label: 'Estado de Cobros', icon: ReceiptText, action: () => navigate('/parking/user/pago') },
    { label: 'Multas', icon: Building2, action: () => navigate('/parking/user/multas') },
  ];

  return (
    <div className="parking-user-app">
      <aside className="parking-user-sidebar">
        <div className="parking-user-sidebar__brand">
          <img src={umgLogo} alt="UMG Logo" />
          <span>MiUMG</span>
        </div>

        <nav className="parking-user-sidebar__nav" aria-label="Navegacion principal">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.label}
                type="button"
                className={`parking-user-sidebar__link${item.label === 'Inicio' ? ' parking-user-sidebar__link--active' : ''}`}
                onClick={item.action}
              >
                <Icon size={21} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="parking-user-sidebar__footer">
          <button type="button" className="parking-user-sidebar__ghost">
            <ChevronLeft size={20} />
            <span>Minimizar</span>
          </button>
          <button type="button" className="parking-user-sidebar__logout">
            <LogOut size={20} />
            <span>Cerrar Sesion</span>
          </button>
        </div>
      </aside>

      <div className="parking-user-main">
        <header className="parking-user-topbar">
          <button type="button" className="parking-user-topbar__menu" aria-label="Abrir menu">
            <Menu size={24} />
          </button>
          <div className="parking-user-topbar__profile">
            <div className="text-end">
              <strong>{displayName}</strong>
              <span>Mi Perfil</span>
            </div>
            <UserCircle size={44} />
          </div>
        </header>

        <main className="parking-user-content">
          <div className="parking-user-view">
            <h1 className="parking-user-greeting">Buenas tardes, {firstName}</h1>

            <div className="d-flex justify-content-end mb-4">
              <Button variant="outline-primary" onClick={() => navigate('/parking/admin/dashboard')}>
                <ShieldCheck size={18} className="me-2" />
                Ir al Admin
              </Button>
            </div>

            <div className="parking-portal-grid">
              <Card className="parking-portal-card">
                <Card.Body>
                  <div className="parking-portal-card__icon parking-portal-card__icon--danger">
                    <AlertTriangle size={32} />
                  </div>
                  <h2>Consultas y Pago Multas</h2>
                  <p>Consulta tus multas activas y registra su pago desde el portal.</p>
                  <Button variant="primary" onClick={() => navigate('/parking/user/multas')}>
                    Consultar y Pagar
                  </Button>
                </Card.Body>
              </Card>

              <Card className="parking-portal-card">
                <Card.Body>
                  <div className="parking-portal-card__icon">
                    <Car size={32} />
                  </div>
                  <h2>Registro de Parqueo</h2>
                  <p>Registra tu placa y selecciona un plan sin generar cobros pendientes.</p>
                  <Button variant="primary" onClick={() => navigate('/parking/user')}>
                    Registrar
                  </Button>
                </Card.Body>
              </Card>

              <Card className="parking-portal-card">
                <Card.Body>
                  <div className="parking-portal-card__icon">
                    <FileText size={32} />
                  </div>
                  <h2>Estado de Cuenta</h2>
                  <p>Revisa tu historial y pagos realizados.</p>
                  <Button variant="outline-primary" onClick={() => navigate('/parking/user/perfil')}>
                    Ver
                  </Button>
                </Card.Body>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
