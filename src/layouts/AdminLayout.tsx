import type { ComponentType, CSSProperties, ReactNode } from "react";
import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  FaBars,
  FaCashRegister,
  FaChartPie,
  FaChevronLeft,
  FaLayerGroup,
  FaSignOutAlt,
  FaTachometerAlt,
  FaUserCircle,
  FaUsers
} from "react-icons/fa";
import logo from "../images/logo.png";

const BarsIcon = FaBars as ComponentType;
const CashRegisterIcon = FaCashRegister as ComponentType;
const ChartPieIcon = FaChartPie as ComponentType;
const ChevronLeftIcon = FaChevronLeft as ComponentType<{ style?: CSSProperties }>;
const LayerGroupIcon = FaLayerGroup as ComponentType;
const SignOutIcon = FaSignOutAlt as ComponentType;
const TachometerIcon = FaTachometerAlt as ComponentType;
const UserCircleIcon = FaUserCircle as ComponentType;
const UsersIcon = FaUsers as ComponentType;

interface AdminLayoutProps {
  children: ReactNode;
  activeSection?: "dashboard" | "usuarios" | "pagos" | "reportes" | "islas";
}

const AdminLayout = ({ children, activeSection = "islas" }: AdminLayoutProps) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const navigate = useNavigate();
  const sidebarWidth = sidebarOpen ? 260 : 78;

  const closeSession = () => {
    localStorage.removeItem("usuarioAdmin");
    localStorage.removeItem("token");
    navigate("/");
  };

  return (
    <div className="app-shell">
      <aside className="app-sidebar" style={{ width: sidebarWidth, minWidth: sidebarWidth }}>
        <div className="app-sidebar-brand">
          <img src={logo} alt="UMG" style={{ width: sidebarOpen ? 60 : 44 }} />
          {sidebarOpen && (
            <div>
              <h4>MiUMG</h4>
              <small>CONTROL DE PARQUEO</small>
            </div>
          )}
        </div>

        <nav className="app-sidebar-nav">
          <span className={`app-sidebar-link ${activeSection === "dashboard" ? "is-active" : ""}`}>
            <TachometerIcon />
            {sidebarOpen && <span>Inicio</span>}
          </span>
          <span className={`app-sidebar-link ${activeSection === "usuarios" ? "is-active" : ""}`}>
            <UsersIcon />
            {sidebarOpen && <span>Gestion de Usuarios</span>}
          </span>
          <span className={`app-sidebar-link ${activeSection === "pagos" ? "is-active" : ""}`}>
            <CashRegisterIcon />
            {sidebarOpen && <span>Pagos y Cobros</span>}
          </span>
          <span className={`app-sidebar-link ${activeSection === "reportes" ? "is-active" : ""}`}>
            <ChartPieIcon />
            {sidebarOpen && <span>Reportes</span>}
          </span>
          <NavLink to="/disponibilidad/admin" className={`app-sidebar-link ${activeSection === "islas" ? "is-active" : ""}`}>
            <LayerGroupIcon />
            {sidebarOpen && <span>Gestion de Islas</span>}
          </NavLink>
        </nav>

        <div className="app-sidebar-footer">
          <button className="app-sidebar-button" type="button" onClick={() => setSidebarOpen(!sidebarOpen)}>
            <ChevronLeftIcon style={{ transform: sidebarOpen ? "rotate(0deg)" : "rotate(180deg)" }} />
            {sidebarOpen && <span>Minimizar</span>}
          </button>
          <button className="app-sidebar-button app-sidebar-logout" type="button" onClick={closeSession}>
            <SignOutIcon />
            {sidebarOpen && <span>Cerrar Sesion</span>}
          </button>
        </div>
      </aside>

      <main className="app-main">
        <header className="app-topbar">
          <button className="app-icon-button" type="button" onClick={() => setSidebarOpen(!sidebarOpen)}>
            <BarsIcon />
          </button>
          <div className="app-profile">
            <div>
              <strong>Administrador</strong>
              <small>Mi Perfil</small>
            </div>
            <UserCircleIcon />
          </div>
        </header>

        <section className="app-content">{children}</section>
      </main>
    </div>
  );
};

export default AdminLayout;
