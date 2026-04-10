import React, { useEffect, useState } from "react";
import * as XLSX from "xlsx";
import NavAdmin from "../components/navAdmin";
/*const express = require("express");
const cors = require("cors");
const app = express();

app.use(cors());
app.use(express.json());*/

const ReporteFinanciero = () => {
  const [datos, setDatos] = useState([]);
  const [busqueda, setBusqueda] = useState("");

  useEffect(() => {
    fetch("http://localhost:4000/api/reportes/reporte-financiero")
      .then((res) => res.json())
      .then((data) => setDatos(data))
      .catch((err) => console.log("Error al cargar datos:", err));
  }, []);

  const exportarExcel = () => {
    const ws = XLSX.utils.json_to_sheet(datos);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Finanzas");
    XLSX.writeFile(wb, "Reporte_Asignaciones.xlsx");
  };

  const filtrados = datos.filter(
    (d) =>
      (d.US_Nombre &&
        d.US_Nombre.toLowerCase().includes(busqueda.toLowerCase())) ||
      (d.VH_Placa && d.VH_Placa.includes(busqueda)),
  );

  return (
    <>
      <NavAdmin />
      <div
        className="card report-card p-4 w-100 container mt-5"
        style={{ padding: "20px", fontFamily: "Arial, sans-serif" }}
      >
        <h1 style={{ color: "#2c3e50" }}>
          📊 Panel de Control Financiero - Parqueos
        </h1>

        <div style={{ display: "flex", gap: "10px", marginBottom: "20px" }} className="mt-4">
          <input
            type="text"
            placeholder="Buscar por nombre o placa..."
            style={{
              padding: "8px",
              width: "300px",
              borderRadius: "4px",
              border: "1px solid #ccc",
            }}
            onChange={(e) => setBusqueda(e.target.value)}
          />
          <button
            onClick={exportarExcel}
            style={{
              backgroundColor: "#2ecc71",
              color: "white",
              padding: "8px 15px",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
              fontWeight: "bold",
            }}
          >
            Descargar Excel
          </button>
        </div>

        <div
          className="stats"
          style={{ display: "flex", gap: "20px", marginBottom: "20px" }}
        >
          <div
            style={{
              backgroundColor: "#f9f9f9",
              border: "1px solid #ddd",
              padding: "15px",
              borderRadius: "8px",
            }}
          >
            <strong>Total Asignaciones:</strong> {filtrados.length}
          </div>
        </div>

        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            boxShadow: "0 2px 5px rgba(0,0,0,0.1)",
          }}
        >
          <thead style={{ backgroundColor: "#34495e", color: "white" }}>
            <tr>
              <th style={{ padding: "12px", textAlign: "left" }}>Usuario</th>
              <th style={{ padding: "12px", textAlign: "left" }}>
                Vehículo (Placa)
              </th>
              <th style={{ padding: "12px", textAlign: "left" }}>Ubicación</th>
              <th style={{ padding: "12px", textAlign: "left" }}>Periodo</th>
              <th style={{ padding: "12px", textAlign: "left" }}>Estado</th>
            </tr>
          </thead>
          <tbody>
            {filtrados.length > 0 ? (
              filtrados.map((reg, i) => (
                <tr key={i} style={{ borderBottom: "1px solid #eee" }}>
                  <td
                    style={{ padding: "10px" }}
                  >{`${reg.US_Nombre} ${reg.US_Apellido}`}</td>
                  <td style={{ padding: "10px" }}>{reg.VH_Placa}</td>
                  <td
                    style={{ padding: "10px" }}
                  >{`${reg.Parqueo} - Espacio ${reg.Numero_Espacio}`}</td>
                  <td
                    style={{ padding: "10px" }}
                  >{`${reg.Semestre} / ${reg.Anio}`}</td>
                  <td style={{ padding: "10px" }}>
                    <span style={{ color: "#27ae60", fontWeight: "bold" }}>
                      ● Activo
                    </span>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan="5"
                  style={{
                    textAlign: "center",
                    padding: "20px",
                    color: "#7f8c8d",
                  }}
                >
                  No hay datos disponibles. Asegúrate de que el servidor esté
                  encendido.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  );
};

/*const PORT = 3001;
app.listen(PORT, () => {
  console.log(`Servidor de reportes corriendo en http://localhost:${PORT}`);
});*/

export default ReporteFinanciero;
