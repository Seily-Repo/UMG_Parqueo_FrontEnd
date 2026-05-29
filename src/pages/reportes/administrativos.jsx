import { useState } from "react";
import axios from "axios";
import SideBarAdmin from "../../components/SidebarAdmin";
import { obtenerHeaders } from "../../utils/authHeaders";

const API_URL = `http://10.0.40.10/api/reportes`;

function PanelParqueo() {
  
  const [anio, setAnio] = useState("");
  const [mes, setMes] = useState("");
  const [dia, setDia] = useState("");

  const [datos, setDatos] = useState([]);
  const [total, setTotal] = useState(0);

  const [loading, setLoading] = useState(false);
  const [mensajeDescarga, setMensajeDescarga] = useState("");

  // ============================================
  // VALIDAR
  // ============================================

  const validar = () => {
    if (!anio) {
      alert("Selecciona un año");
      return false;
    }

    return true;
  };

  // ============================================
  // BUSCAR
  // ============================================

  const buscar = async () => {
    //if (!validar()) return;

    setLoading(true);

    try {
      const response = await axios.get(`${API_URL}/reporte-administrativo`, {
        params: {
          anio,
          mes,
          dia,
        },
        headers: obtenerHeaders(),
      });

      setDatos(response.data.datos);
      setTotal(response.data.total);
    } catch (error) {
      console.error("Error:", error);

      alert("Error al obtener datos");
    } finally {
      setLoading(false);
    }
  };

  // ============================================
  // EXCEL
  // ============================================

  const obtenerMensajeErrorDescarga = async (error) => {
    const data = error.response?.data;

    if (data instanceof Blob) {
      const text = await data.text();

      try {
        const parsed = JSON.parse(text);
        return parsed.message || "Error al descargar el archivo";
      } catch {
        return text || "Error al descargar el archivo";
      }
    }

    return data?.message || "Error al descargar el archivo";
  };

  const descargarArchivo = async (url, nombreArchivo) => {
    //if (!validar()) return;

    setMensajeDescarga("");

    try {
      const response = await axios.get(url, {
        headers: obtenerHeaders(),
        responseType: "blob",
      });
      const blobUrl = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = blobUrl;
      link.setAttribute("download", nombreArchivo);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(blobUrl);
    } catch (error) {
      console.error("Error:", error);
      const mensaje = await obtenerMensajeErrorDescarga(error);
      setMensajeDescarga(mensaje);
    }
  };

  const excel = () => {
    descargarArchivo(`${API_URL}/excel?anio=${anio}&mes=${mes}&dia=${dia}`, "reporte-administrativo.xlsx");
  };

  // ============================================
  // PDF
  // ============================================

  const pdf = () => {
    descargarArchivo(`${API_URL}/pdf?anio=${anio}&mes=${mes}&dia=${dia}`, "reporte-administrativo.pdf");
  };

  // ============================================
  // LIMPIAR
  // ============================================

  const limpiar = () => {
    setAnio("");
    setMes("");
    setDia("");

    setDatos([]);
    setTotal(0);
  };

  return (
    <div
      style={{
        display: "flex",
        minHeight: "100vh",
        backgroundColor: "var(--fondo-general, #f4f7f6)",
      }}
    >
      <SideBarAdmin />

      <div className="bg-light min-vh-100 w-100">
        {/* TOPBAR */}
        <div className="bg-primary text-white text-center py-3 shadow">
          <h3 className="m-0">
            <i className="bi bi-car-front-fill me-2"></i>
            PANEL ADMINISTRATIVO - PARQUEO UMG VILLA NUEVA
          </h3>
        </div>

        {/* CONTENIDO */}
        <div className="container py-4">
          {/* CARD FILTROS */}
          <div className="card shadow border-0 mb-4">
            <div className="card-body">
              <h4 className="mb-4">
                <i className="bi bi-funnel-fill me-2"></i>
                Filtros
              </h4>

              <div className="row g-3">
                {/* AÑO */}
                <div className="col-md-4">
                  <label className="form-label">Año</label>

                  <select
                    className="form-select"
                    value={anio}
                    onChange={(e) => setAnio(e.target.value)}
                  >
                    <option value="">Todos</option>

                    <option value="2025">2025</option>

                    <option value="2026">2026</option>
                  </select>
                </div>

                {/* MES */}
                <div className="col-md-4">
                  <label className="form-label">Mes</label>

                  <select
                    className="form-select"
                    value={mes}
                    onChange={(e) => setMes(e.target.value)}
                  >
                    <option value="">Seleccionar mes</option>

                    <option value="1">Enero</option>
                    <option value="2">Febrero</option>
                    <option value="3">Marzo</option>
                    <option value="4">Abril</option>
                    <option value="5">Mayo</option>
                    <option value="6">Junio</option>
                    <option value="7">Julio</option>
                    <option value="8">Agosto</option>
                    <option value="9">Septiembre</option>
                    <option value="10">Octubre</option>
                    <option value="11">Noviembre</option>
                    <option value="12">Diciembre</option>
                  </select>
                </div>

                {/* DÍA */}
                <div className="col-md-4">
                  <label className="form-label">Día</label>

                  <select
                    className="form-select"
                    value={dia}
                    onChange={(e) => setDia(e.target.value)}
                  >
                    <option value="">Seleccionar día</option>

                    {[...Array(31)].map((_, i) => (
                      <option key={i + 1} value={i + 1}>
                        {i + 1}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* BOTONES */}
              <div className="mt-4 d-flex flex-wrap gap-2">
                <button className="btn btn-primary" onClick={buscar}>
                  <i className="bi bi-search me-2"></i>
                  Buscar
                </button>

                <button className="btn btn-success" onClick={excel}>
                  <i className="bi bi-file-earmark-excel-fill me-2"></i>
                  Excel
                </button>

                <button className="btn btn-danger" onClick={pdf}>
                  <i className="bi bi-file-earmark-pdf-fill me-2"></i>
                  PDF
                </button>

                <button className="btn btn-secondary" onClick={limpiar}>
                  <i className="bi bi-eraser-fill me-2"></i>
                  Limpiar
                </button>
              </div>

              {mensajeDescarga && (
                <div className="alert alert-warning mt-3 mb-0" role="alert">
                  {mensajeDescarga}
                </div>
              )}
            </div>
          </div>

          {/* CONTADOR */}
          <div className="alert alert-primary shadow-sm">
            <h5 className="m-0">
              <i className="bi bi-database-fill me-2"></i>
              Total de registros: {total}
            </h5>
          </div>

          {/* TABLA */}
          <div className="card shadow border-0">
            <div className="card-body">
              <div className="table-responsive">
                <table className="table table-hover align-middle">
                  <thead className="table-primary">
                    <tr>
                      <th>Carné</th>
                      <th>Usuario</th>
                      <th>Placa</th>
                      <th>Vehículo</th>
                      <th>Jornada</th>
                      <th>Fecha Registro</th>
                      <th>Pago Aprobado</th>
                      <th>Espacio Asignado</th>
                    </tr>
                  </thead>

                  <tbody>
                    {loading ? (
                      <tr>
                        <td colSpan="5" className="text-center py-4">
                          <div className="spinner-border text-primary"></div>
                        </td>
                      </tr>
                    ) : datos.length > 0 ? (
                      datos.map((r, index) => (
                        <tr key={index}>
                          <td>{r.carne}</td>

                          <td>{r.usuario}</td>

                          <td>{r.placa}</td>

                          <td>{r.vehiculo}</td>

                          <td>{r.jornada}</td>

                          <td>{r.fecha_registro}</td>
                          <td>
                            {r.pago_aprobado == 'SI' ? (
                              <span className="badge bg-success">Sí</span>
                            ) : (
                              <span className="badge bg-danger">No</span>
                            )}
                          </td>
                          <td>{r.espacio_asignado == 'SI' ? (
                              <span className="badge bg-success">Sí</span>
                            ) : (
                              <span className="badge bg-danger">No</span>
                            )}</td> 
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="5" className="text-center text-muted py-4">
                          No hay datos disponibles
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
    </div>
  );
}

export default PanelParqueo;
