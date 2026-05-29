import { useState } from "react";
import { Nav } from "react-bootstrap";
import {
  PersonLinesFill,
  CashStack,
  PieChartFill,
  Speedometer2,
  BoxArrowRight,
  ChevronLeft,
  Building,
} from "react-bootstrap-icons";
import { useLocation, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";

const DASHBOARD_ADMIN_URL =
  import.meta.env.VITE_DASHBOARD_ADMIN_URL || "http://10.0.40.10/dashboard-admin";

const DISPONIBILIDAD_ADMIN_URL =
  import.meta.env.VITE_DISPONIBILIDAD_ADMIN_URL || "http://10.0.40.10:3001/disponibilidad/admin";

const LOGIN_ADMIN_URL =
  import.meta.env.VITE_LOGIN_URL || "http://10.0.40.10/login-admin";

const SideBarAdmin = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const reportesActivo = location.pathname === "/" || location.pathname.startsWith("/reportes");

  const limpiarSesionReportes = () => {
    localStorage.clear();
    sessionStorage.clear();
  };

  const volverAlDashboardAdmin = () => {
    limpiarSesionReportes();
    window.location.href = DASHBOARD_ADMIN_URL;
  };

  const irADisponibilidadAdmin = () => {
    limpiarSesionReportes();
    window.location.href = DISPONIBILIDAD_ADMIN_URL;
  };

  const handleLogout = () => {
    Swal.fire({
      title: "Cerrar Sesion?",
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "var(--azul-universitario)",
      cancelButtonColor: "#d33",
      confirmButtonText: "Si, salir",
    }).then((result) => {
      if (result.isConfirmed) {
        limpiarSesionReportes();
        window.location.href = LOGIN_ADMIN_URL;
      }
    });
  };

  const SidebarItem = ({ icon: Icon, label, active = false, onClick }: any) => (
    <Nav.Link
      onClick={onClick}
      className="d-flex align-items-center text-white"
      style={{
        cursor: "pointer",
        transition: "background-color 0.2s ease, border-color 0.2s ease",
        backgroundColor: active ? "#2e638f" : "transparent",
        borderLeft: active
          ? "4px solid #1498d5"
          : "4px solid transparent",
        minHeight: "64px",
        padding: "0 26px",
      }}
    >
      <Icon
        size={22}
        className="me-4"
        style={{
          color: active
            ? "#1398d5"
            : "rgba(212,232,246,0.82)",
          minWidth: "22px",
        }}
      />
      <span
        style={{
          display: sidebarOpen ? "block" : "none",
          fontWeight: active ? "bold" : "normal",
          color: active ? "#fff" : "rgba(255,255,255,0.94)",
          fontSize: "18px",
          lineHeight: 1,
          whiteSpace: "nowrap",
        }}
      >
        {label}
      </span>
    </Nav.Link>
  );

  return (
    <div className="d-flex">
      <div
        style={{
          width: sidebarOpen ? "260px" : "80px",
          backgroundColor: "#235882",
          transition: "width 0.3s ease",
          zIndex: 1000,
          minHeight: "100vh",
        }}
        className="d-flex flex-column"
      >
        <div
          className="text-center d-flex flex-column align-items-center justify-content-center"
          style={{
            borderBottom: "1px solid rgba(255,255,255,0.05)",
            overflow: "hidden",
            minHeight: "204px",
            padding: "26px 12px 30px",
          }}
        >
          <img
            src="/logo.png?v=login-registro-menu"
            alt="UMG"
            style={{ width: sidebarOpen ? "55px" : "40px", transition: "0.3s" }}
          />
          {sidebarOpen && (
            <div className="mt-3 animate-fade-in">
              <h4
                className="mb-2 fw-bold"
                style={{
                  color: "#1689ca",
                  fontStyle: "italic",
                  fontSize: "28px",
                  letterSpacing: "0",
                }}
              >
                MiUMG
              </h4>
              <small
                style={{
                  color: "rgba(218,234,247,0.58)",
                  letterSpacing: "1px",
                  fontSize: "12px",
                  fontWeight: 600,
                }}
              >
                CONTROL DE PARQUEO
              </small>
            </div>
          )}
        </div>

        <Nav className="flex-column flex-grow-1">
          <SidebarItem icon={Speedometer2} label="Inicio" onClick={volverAlDashboardAdmin} />
          <SidebarItem
            icon={PersonLinesFill}
            label="Gestión de Usuarios"
            onClick={volverAlDashboardAdmin}
          />
          <SidebarItem icon={CashStack} label="Pagos y Cobros" onClick={volverAlDashboardAdmin} />
          <SidebarItem
            icon={PieChartFill}
            label="Reportes"
            active={reportesActivo}
            onClick={() => navigate("/reportes")}
          />
          <SidebarItem
            icon={Building}
            label="Gestión de Islas"
            onClick={irADisponibilidadAdmin}
          />
        </Nav>

        <div
          className="mt-auto"
          style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}
        >
          <Nav.Link
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="d-flex align-items-center px-4 py-3 text-white"
            style={{ cursor: "pointer", color: "rgba(255,255,255,0.6)" }}
          >
            <ChevronLeft
              size={20}
              className="me-3"
              style={{
                transform: sidebarOpen ? "rotate(0deg)" : "rotate(180deg)",
                transition: "0.3s",
              }}
            />
            <span
              style={{
                display: sidebarOpen ? "block" : "none",
                whiteSpace: "nowrap",
              }}
            >
              Minimizar
            </span>
          </Nav.Link>
          <Nav.Link
            onClick={handleLogout}
            className="d-flex align-items-center px-4 py-3 admin-logout-hover"
            style={{ cursor: "pointer", transition: "0.2s", color: "#ff6b6b" }}
          >
            <BoxArrowRight size={20} className="me-3" />
            <span
              style={{
                display: sidebarOpen ? "block" : "none",
                fontWeight: "bold",
                whiteSpace: "nowrap",
              }}
            >
              Cerrar Sesion
            </span>
          </Nav.Link>
        </div>
      </div>
    </div>
  );
};

export default SideBarAdmin;
