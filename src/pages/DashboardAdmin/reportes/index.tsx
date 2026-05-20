import React from "react";
import SideBarAdmin from "../../../components/SidebarAdmin";
//import "@/styles/reportes.module.css";

import {useNavigate} from "react-router-dom";

const Reportes = () => {

  const navigate = useNavigate();

  return (
    <div style={{
        display: "flex",
        minHeight: "100vh",
        backgroundColor: "var(--fondo-general, #f4f7f6)",
      }}>
      
      <SideBarAdmin />
     <div className="container d-flex justify-content-center align-items-center vh-91">

      <div className="card report-card p-4 w-100" style={{ maxWidth: "900px", borderRadius: "18px", minHeight: "500px" }}>
        
        {/* Título */}
        <h3 className="text-center mb-4 fw-bold mt-4">
          PANEL DE REPORTES
        </h3>

        {/* Contenido */}
        <div className="row text-center mt-5">

          {/* Administrativo */}
          <div className="col-md-4 mb-3">
            <div className="p-3 border rounded h-100 hover-card">
              <i className="fi fi-rr-briefcase fs-1 text-primary mb-3"></i>
              <h5 className="fw-bold">Administrativos</h5>
              <p className="text-muted small">
                Reportes operativos y administrativos del sistema.
              </p>
              <button className="btn btn-outline-primary btn-sm"onClick={() => navigate('/reportes/administrativos')}>
                Ver reportes
              </button>
            </div>
          </div>

          {/* Financieros */}
          <div className="col-md-4 mb-3">
            <div className="p-3 border rounded h-100 hover-card">
              <i className="fi fi-rr-dollar fs-1 text-success mb-3"></i>
              <h5 className="fw-bold">Financieros</h5>
              <p className="text-muted small">
                Reportes de ingresos, egresos y análisis financiero.
              </p>
              <button className="btn btn-outline-success btn-sm" 
              onClick={() => navigate('/reportes/financieros')}
              >
                Ver reportes
              </button>
            </div>
          </div>

          {/* Gerenciales */}
          <div className="col-md-4 mb-3">
            <div className="p-3 border rounded h-100 hover-card">
              <i className="fi fi-rr-chart-histogram fs-1 text-warning mb-3"></i>
              <h5 className="fw-bold">Gerenciales</h5>
              <p className="text-muted small">
                Reportes estratégicos para la toma de decisiones.
              </p>
              <button className="btn btn-outline-warning btn-sm"
               onClick={() => navigate('/reportes/gerenciales')}>
                Ver reportes
              </button>
            </div>
          </div>

        </div>

      </div>
    </div>
    </div>
  );
};

export default Reportes;