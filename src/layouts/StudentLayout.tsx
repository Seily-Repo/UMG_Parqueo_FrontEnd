import type { ComponentType, CSSProperties, ReactNode } from "react";
import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { FaBars, FaCar, FaChevronLeft, FaHome, FaSignOutAlt, FaUserCircle } from "react-icons/fa";
import logo from "../images/logo.png";

const BarsIcon = FaBars as ComponentType;
const CarIcon = FaCar as ComponentType;
const ChevronLeftIcon = FaChevronLeft as ComponentType<{ style?: CSSProperties }>;
const HomeIcon = FaHome as ComponentType;
const SignOutIcon = FaSignOutAlt as ComponentType;
const UserCircleIcon = FaUserCircle as ComponentType;

interface StudentLayoutProps {
  children: ReactNode;
  activeSection?: "inicio" | "disponibilidad";
}

const StudentLayout = ({ children, activeSection = "disponibilidad" }: StudentLayoutProps) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const navigate = useNavigate();
  const sidebarWidth = sidebarOpen ? 260 : 78;

  const closeSession = () => {
    localStorage.removeItem("usuarioParqueo");
    localStorage.removeItem("token");
    navigate("/");
  };

  return (
    <div className="app-shell">
      <aside className="app-sidebar" style={{ width: sidebarWidth, minWidth: sidebarWidth }}>
        <div className="app-sidebar-brand">
          <img src={logo} alt="UMG" style={{ width: sidebarOpen ? 74 : 48 }} />
          {sidebarOpen && (
            <div>
              <h4>MiUMG</h4>
              <small>CONTROL DE PARQUEO</small>
            </div>
          )}
        </div>

        <nav className="app-sidebar-nav">
          <NavLink to="/inicio" className={`app-sidebar-link ${activeSection === "inicio" ? "is-active" : ""}`}>
            <HomeIcon />
            {sidebarOpen && <span>Inicio</span>}
          </NavLink>

          <NavLink
            to="/disponibilidad"
            className={`app-sidebar-link ${activeSection === "disponibilidad" ? "is-active" : ""}`}
          >
            <CarIcon />
            {sidebarOpen && <span>Disponibilidad</span>}
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
              <strong>Estudiante</strong>
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

export default StudentLayout;
