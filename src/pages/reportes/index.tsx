import { useEffect, useState } from "react";
import axios from "axios";
import SideBarAdmin from "../../components/SidebarAdmin";
//import "@/styles/reportes.module.css";

import {useNavigate} from "react-router-dom";
import { obtenerHeaders } from "../../utils/authHeaders";

const API_URL = "http://10.0.40.10/api/reportes";

type DescargaReciente = {
  id: number;
  carne: number;
  nombres: string;
  apellidos: string;
  tipo: string;
  fecha: string;
};

const Index = () => {
  const navigate = useNavigate();
  const [descargas, setDescargas] = useState<DescargaReciente[]>([]);
  const [cargandoDescargas, setCargandoDescargas] = useState(false);

  useEffect(() => {
    const cargarDescargas = async () => {
      setCargandoDescargas(true);

      try {
        const response = await axios.get(`${API_URL}/descargas-recientes`, {
          headers: obtenerHeaders(),
        });

        if (response.data.success) {
          setDescargas(response.data.data || []);
        }
      } catch (error) {
        console.error("Error cargando descargas recientes:", error);
      } finally {
        setCargandoDescargas(false);
      }
    };

    cargarDescargas();
  }, []);

  return (
    <div style={{
        display: "flex",
        minHeight: "100vh",
        backgroundColor: "var(--fondo-general, #f4f7f6)",
      }}>
      
      <SideBarAdmin />
     <div className="container py-5">

      <div className="card report-card p-4 w-100 mx-auto" style={{ maxWidth: "900px", borderRadius: "18px", minHeight: "500px" }}>
        
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

      <div className="card border-0 shadow-sm mt-4 w-100 mx-auto" style={{ maxWidth: "900px", borderRadius: "14px" }}>
        <div className="card-body p-4">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <div>
              <h5 className="fw-bold mb-1">Ultimas descargas</h5>
              <p className="text-muted small mb-0">Usuarios que solicitaron reportes PDF o Excel recientemente.</p>
            </div>
            {cargandoDescargas && (
              <span className="badge bg-light text-muted border">Cargando...</span>
            )}
          </div>

          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="table-light">
                <tr>
                  <th>Carne</th>
                  <th>Nombre</th>
                  <th>Apellido</th>
                  <th>Documento</th>
                  <th>Fecha</th>
                </tr>
              </thead>
              <tbody>
                {descargas.length > 0 ? (
                  descargas.map((descarga) => (
                    <tr key={descarga.id}>
                      <td className="fw-semibold">{descarga.carne}</td>
                      <td>{descarga.nombres}</td>
                      <td>{descarga.apellidos}</td>
                      <td>
                        <span className={`badge ${descarga.tipo === "PDF" ? "bg-danger" : "bg-success"}`}>
                          {descarga.tipo}
                        </span>
                      </td>
                      <td>{descarga.fecha}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="text-center text-muted py-4">
                      No hay descargas registradas.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
    </div>
  );
};

export default Index;
