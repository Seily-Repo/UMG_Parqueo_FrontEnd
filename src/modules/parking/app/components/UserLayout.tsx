import { NavLink, Outlet, useNavigate } from 'react-router';
import { Building2, Car, ChevronLeft, Home, LogOut, Menu, ReceiptText, UserCircle } from 'lucide-react';
import umgLogo from '../../../../assets/umg_logo.png';
import { useRegistration } from '../context/RegistrationContext';

export function UserLayout() {
  const navigate = useNavigate();
  const { currentRegistration } = useRegistration();

  const userName = currentRegistration.fullName || currentRegistration.carnet || 'Usuario';

  const navItems = [
    { to: '/parking/user', label: 'Inicio', icon: Home },
    { to: '/parking/user/vehiculos', label: 'Mis Vehiculos', icon: Car },
    { to: '/parking/user/pago', label: 'Estado de Cobros', icon: ReceiptText },
    { to: '/parking/user/multas', label: 'Multas', icon: Building2 },
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
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/parking/user'}
                className={({ isActive }) =>
                  `parking-user-sidebar__link${isActive ? ' parking-user-sidebar__link--active' : ''}`
                }
              >
                <Icon size={21} />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>

        <div className="parking-user-sidebar__footer">
          <button type="button" className="parking-user-sidebar__ghost">
            <ChevronLeft size={20} />
            <span>Minimizar</span>
          </button>
          <button type="button" className="parking-user-sidebar__logout" onClick={() => navigate('/parking')}>
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
              <strong>{userName}</strong>
              <span>Mi Perfil</span>
            </div>
            <UserCircle size={44} />
          </div>
        </header>

        <main className="parking-user-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
