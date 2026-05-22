import { useState } from "react";
import { Nav } from "react-bootstrap";
import {
  PersonLinesFill,
  CashStack,
  PieChartFill,
  Speedometer2,
  BoxArrowRight,
  ChevronLeft,
  CarFront,
} from "react-bootstrap-icons";
import { useNavigate, useLocation } from "react-router-dom";
import Swal from "sweetalert2";

const SideBarAdmin = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [sidebarOpen, setSidebarOpen] = useState(true);
  const handleLogout = () => {
    Swal.fire({
      title: "¿Cerrar Sesión?",
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "var(--azul-universitario)",
      cancelButtonColor: "#d33",
      confirmButtonText: "Sí, salir",
    }).then((result) => {
      if (result.isConfirmed) {
        localStorage.removeItem("usuarioAdmin");
        localStorage.removeItem("token");
        navigate("/reportes");
      }
    });
  };

  const handleChangeVista = (vista: string) => {
    navigate(vista);
  }

  const SidebarItem = ({ icon: Icon, label, vista }: any) => {
    const isActive = location.pathname === vista;
    return (
      <Nav.Link
        onClick={() => handleChangeVista(vista)}
        className={`d-flex align-items-center px-4 py-3 text-white mb-1`}
        style={{
          cursor: "pointer",
          transition: "0.2s",
          backgroundColor: isActive ? "rgba(255,255,255,0.05)" : "transparent",
          borderLeft: isActive
            ? "4px solid var(--color-accion, #00d2ff)"
            : "4px solid transparent",
        }}
      >
        <Icon
          size={20}
          className="me-3"
          style={{
            color: isActive
              ? "var(--color-accion, #00d2ff)"
              : "rgba(255,255,255,0.7)",
          }}
        />
        <span
          style={{
            display: sidebarOpen ? "block" : "none",
            fontWeight: isActive ? "bold" : "normal",
            color: isActive ? "#fff" : "rgba(255,255,255,0.8)",
            whiteSpace: "nowrap",
          }}
        >
          {label}
        </span>
      </Nav.Link>
    );
  };
  return (
    <div
        className="d-flex"
    >
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
          <SidebarItem icon={Speedometer2} label="Inicio" vista="/reportes" />
          <SidebarItem
            icon={PersonLinesFill}
            label="Gestión de Usuarios"
            vista="/reportes"
          />
          <SidebarItem icon={CashStack} label="Pagos y Cobros" vista="/reportes/financieros" />
          <SidebarItem
            icon={CarFront}
            label="Disponibilidad"
            vista="/reportes/administrativos"
          />
          <SidebarItem icon={PieChartFill} label="Reportes" vista="/reportes" />
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
              Cerrar Sesión
            </span>
          </Nav.Link>
        </div>
      </div>
      
    </div>
  );
};

export default SideBarAdmin;
