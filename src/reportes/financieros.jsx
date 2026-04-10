import React, { useEffect, useState } from "react";
import NavAdmin from "../components/navAdmin";

const API_URL = "http://localhost:4000/api/reportes"; 

function ReporteFinanciero() {
  const [data, setData] = useState([]);
  const [tipo, setTipo] = useState("");
  const [fecha, setFecha] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    cargarDatos();
  }, []);

  const construirURL = (endpoint) => {
    const url = new URL(`${API_URL}${endpoint}`);

    if (tipo && fecha) {
      if (tipo === "anio") {
        url.searchParams.append("tipo", "anio");
        url.searchParams.append("fecha", fecha.substring(0, 4));
      } else if (tipo === "mes") {
        url.searchParams.append("tipo", "mes");
        url.searchParams.append("fecha", fecha.substring(0, 7));
      } else {
        url.searchParams.append("tipo", tipo);
        url.searchParams.append("fecha", fecha);
      }
    }

    return url;
  };

  const cargarDatos = async () => {
    if (tipo && !fecha) {
      setMensaje("Selecciona una fecha");
      return;
    }

    setLoading(true);
    setMensaje("");

    try {
      const url = construirURL("/reporte-financiero");

      const res = await fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json"
        }
      });

      const json = await res.json();

      if (json.length === 0) {
        setMensaje("No hay datos para este filtro");
      } else {
        setMensaje(`${json.length} registros encontrados`);
      }

      setData(json);

    } catch (err) {
      console.error(err);
      setMensaje("Error de conexión con el servidor");
    }

    setLoading(false);
  };

  const exportarExcel = () => {
    const url = construirURL("/exportar");
    window.open(url, "_blank");
  };

  return (
    <>
    <NavAdmin />
    <div className="card card-report mt-5 container py-4">

      {/* HEADER */}
      <div className="text-center mb-4">
        <h1 className="fw-bold">
          <i className="fi fi-rr-car me-2"></i>
          REPORTE FINANCIERO
        </h1>
      </div>

      {/* FILTROS */}
      <div className="card shadow-sm p-3 mb-4">
        <div className="row g-2">

          <div className="col-md">
            <select
              className="form-select"
              value={tipo}
              onChange={(e) => setTipo(e.target.value)}
            >
              <option value="">Todos</option>
              <option value="dia">Día</option>
              <option value="semana">Semana</option>
              <option value="mes">Mes</option>
              <option value="anio">Año</option>
            </select>
          </div>

          <div className="col-md">
            <input
              type="date"
              className="form-control"
              value={fecha}
              onChange={(e) => setFecha(e.target.value)}
            />
          </div>

          <div className="col-md-auto">
            <button className="btn btn-primary w-100" onClick={cargarDatos}>
              <i className="fi fi-rr-search me-2"></i>
              Buscar
            </button>
          </div>

          <div className="col-md-auto">
            <button className="btn btn-success w-100" onClick={exportarExcel}>
              <i className="fi fi-rr-file-excel me-2"></i>
              Exportar
            </button>
          </div>

        </div>
      </div>

      {/* MENSAJE */}
      {mensaje && (
        <div className="alert alert-info text-center fw-bold">
          {mensaje}
        </div>
      )}

      {/* LOADING */}
      {loading && (
        <div className="text-center">
          <div className="spinner-border text-primary"></div>
        </div>
      )}

      {/* TABLA */}
      <div className="card shadow-sm">
        <div className="table-responsive">
          <table className="table table-hover text-center mb-0">

            <thead className="table-dark">
              <tr>
                <th>Nombre</th>
                <th>Apellido</th>
                <th>Placa</th>
                <th>Parqueo</th>
                <th>Fecha</th>
              </tr>
            </thead>

            <tbody>
              {data.map((d, i) => (
                <tr key={i}>
                  <td>{d.US_NOMBRE}</td>
                  <td>{d.US_APELLIDO}</td>
                  <td>{d.VH_PLACA || "-"}</td>
                  <td>{d.PQ_NOMBRE}</td>
                  <td>
                    {new Date(d.AS_FECHAASIGNACION).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>

          </table>
        </div>
      </div>

    </div>
    </>
  );
}

export default ReporteFinanciero;