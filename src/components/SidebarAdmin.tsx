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
      className="d-flex align-items-center px-4 py-3 text-white mb-1"
      style={{
        cursor: "pointer",
        transition: "0.2s",
        backgroundColor: active ? "rgba(255,255,255,0.05)" : "transparent",
        borderLeft: active
          ? "4px solid var(--color-accion, #00d2ff)"
          : "4px solid transparent",
      }}
    >
      <Icon
        size={20}
        className="me-3"
        style={{
          color: active
            ? "var(--color-accion, #00d2ff)"
            : "rgba(255,255,255,0.7)",
        }}
      />
      <span
        style={{
          display: sidebarOpen ? "block" : "none",
          fontWeight: active ? "bold" : "normal",
          color: active ? "#fff" : "rgba(255,255,255,0.8)",
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
          backgroundColor: "var(--azul-oscuro, #002b5c)",
          transition: "width 0.3s ease",
          zIndex: 1000,
          minHeight: "100vh",
        }}
        className="d-flex flex-column"
      >
        <div
          className="text-center py-4"
          style={{
            borderBottom: "1px solid rgba(255,255,255,0.05)",
            overflow: "hidden",
          }}
        >
          <img
            src="/logo.png"
            alt="UMG"
            style={{ width: sidebarOpen ? "55px" : "40px", transition: "0.3s" }}
          />
          {sidebarOpen && (
            <div className="mt-2 animate-fade-in">
              <h4
                className="mb-0 fw-bold"
                style={{
                  color: "var(--color-accion, #00d2ff)",
                  fontStyle: "italic",
                }}
              >
                MiUMG
              </h4>
              <small
                style={{
                  color: "rgba(255,255,255,0.5)",
                  letterSpacing: "1px",
                  fontSize: "0.65rem",
                }}
              >
                CONTROL DE PARQUEO
              </small>
            </div>
          )}
        </div>

        <Nav className="flex-column mt-3 flex-grow-1">
          <SidebarItem icon={Speedometer2} label="Inicio" onClick={volverAlDashboardAdmin} />
          <SidebarItem
            icon={PersonLinesFill}
            label="Gestion de Usuarios"
            onClick={volverAlDashboardAdmin}
          />
          <SidebarItem icon={CashStack} label="Pagos y Cobros" onClick={volverAlDashboardAdmin} />
          <SidebarItem
            icon={PieChartFill}
            label="Reportes"
            active={location.pathname.startsWith("/reportes")}
            onClick={() => navigate("/reportes")}
          />
          <SidebarItem
            icon={Building}
            label="Gestion de Islas"
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
