import React, { useEffect, useState } from "react";
import SideBarAdmin from "../../../components/SidebarAdmin";
import axios from "axios";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { Card, Row, Col } from "react-bootstrap";

function ReporteFinanciero() {
  const [datos, setDatos] = useState([]);
  const [pagos, setPagos] = useState([]);
  const [busqueda, setBusqueda] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const cargarPagos = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await axios.get(
        `http://10.0.40.10/api/reportes/pagos-aceptados`,
      );

      if (response.data.success) {
        setPagos(response.data.data);
      }
    } catch (err) {
      console.error("Error cargando pagos:", err);

      setError("No se pudieron cargar los pagos");
    } finally {
      setLoading(false);
    }
  };

  const cargarReporteFinanciero = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await axios.get(
        `http://10.0.40.10/api/reportes/reporte-financiero`,
      );

      if (response.data.success) {
        setDatos(response.data.data);
      }
    } catch (err) {
      console.error("Error al conectar:", err);
      setError("Error al cargar el reporte financiero");
    } finally {
      setLoading(false);
    }
  };

  // Carga de datos desde tu API
  useEffect(() => {
    cargarReporteFinanciero();
    cargarPagos();
  }, []);

  // Lógica de filtrado
  const filtrados = pagos.filter((d) =>
    d.usuario.toLowerCase().includes(busqueda.toLowerCase()),
  );

  // Cálculo de KPIs rápidos
  const totalRecaudado = pagos.reduce((acc, curr) => {
    const estado = String(curr.estado || curr.PAG_ESTADO || "")
      .trim()
      .toUpperCase();

    const monto = Number(curr.MONTO || curr.PAG_MONTO || 0);

    return estado === "ACEPTADO" || estado === "A" ? acc + monto : acc;
  }, 0);
  const pendientes = pagos.filter((d) => d.estado == "PENDIENTE").length;

  // Función para exportar PDF mejorado
  const exportarPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.setTextColor(30, 70, 154);
    doc.text("REPORTE FINANCIERO - PARQUEOS UMG", 14, 15);

    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Fecha de generación: ${new Date().toLocaleDateString()}`, 14, 22);

    const rows = filtrados.map((d) => [
      d.carne,
      d.usuario,
      d.plan,
      `Q ${d.monto}`,
      d.fecha_pago,
      d.estado,
    ]);

    autoTable(doc, {
      head: [["Carne", "Usuario", "Plan", "Monto", "Fecha", "Estado"]],
      body: rows,
      startY: 30,

      headStyles: { fillColor: [0, 51, 102] },
    });

    doc.save("Reporte_Financiero_UMG.pdf");
  };

  const calcularResumen = (estado) => {
    const filtrados = pagos.filter((pago) => pago.estado === estado);

    return {
      totalPagos: filtrados.length,
      totalMonto: filtrados.reduce(
        (acc, pago) => acc + Number(pago.monto || 0),
        0,
      ),
    };
  };

  const aceptados = calcularResumen("ACEPTADO");
  const pendientesP = calcularResumen("PENDIENTE");
  const cancelados = calcularResumen("CANCELADO");

  return (
    <div
      style={{
        display: "flex",
        minHeight: "100vh",
        backgroundColor: "var(--fondo-general, #f4f7f6)",
      }}
    >
      <SideBarAdmin />
      <div style={styles.container}>
        {/* Encabezado */}
        <div style={styles.header}>
          <h1 style={styles.title}>📊 Gestión Financiera de Parqueo</h1>
          <p style={styles.subtitle}>
            Universidad Mariano Gálvez de Guatemala - Villa Nueva
          </p>
        </div>

        {/* Tarjetas de Resumen (KPIs) */}
        <div style={styles.kpiGrid}>
          <div style={styles.card}>
            <span style={styles.cardLabel}>TOTAL REGISTROS</span>
            <h2 style={styles.cardValue}>{pagos.length}</h2>
          </div>
          <div style={styles.card}>
            <span style={styles.cardLabel}>RECAUDADO (PAGADO)</span>
            <h2 style={{ ...styles.cardValue, color: "#27ae60" }}>
              Q{aceptados.totalMonto.toFixed(2)}
            </h2>
          </div>
          <div style={styles.card}>
            <span style={styles.cardLabel}>PENDIENTES DE PAGO</span>
            <h2 style={{ ...styles.cardValue, color: "#e74c3c" }}>
              {pendientes}
            </h2>
          </div>
        </div>

        {/* Barra de Herramientas */}
        <div style={styles.toolbar}>
          <input
            type="text"
            placeholder="🔍 Buscar por nombre o número de placa..."
            onChange={(e) => setBusqueda(e.target.value)}
            style={styles.input}
          />
          <button onClick={exportarPDF} style={styles.btnPdf}>
            📄 Exportar Reporte PDF
          </button>
        </div>

        <Row className="mt-4 g-4 mb-5">
          {/* ACEPTADOS */}
          <Col md={4}>
            <Card className="shadow border-0 h-100">
              <Card.Body>
                <Card.Title className="fw-bold text-success">
                  Aceptados
                </Card.Title>

                <hr />

                <h6>Total de pagos</h6>

                <p className="fs-3 fw-bold">{aceptados.totalPagos}</p>

                <h6>Total monto</h6>

                <p className="fs-4 fw-bold text-success">
                  Q {aceptados.totalMonto.toFixed(2)}
                </p>
              </Card.Body>
            </Card>
          </Col>

          {/* PENDIENTES */}
          <Col md={4}>
            <Card className="shadow border-0 h-100">
              <Card.Body>
                <Card.Title className="fw-bold text-warning">
                  Pendientes
                </Card.Title>

                <hr />

                <h6>Total de pagos</h6>

                <p className="fs-3 fw-bold">{pendientesP.totalPagos}</p>

                <h6>Total monto</h6>

                <p className="fs-4 fw-bold text-warning">
                  Q {pendientesP.totalMonto.toFixed(2)}
                </p>
              </Card.Body>
            </Card>
          </Col>

          {/* CANCELADOS */}
          <Col md={4}>
            <Card className="shadow border-0 h-100">
              <Card.Body>
                <Card.Title className="fw-bold text-danger">
                  Cancelados
                </Card.Title>

                <hr />

                <h6>Total de pagos</h6>

                <p className="fs-3 fw-bold">{cancelados.totalPagos}</p>

                <h6>Total monto</h6>

                <p className="fs-4 fw-bold text-danger">
                  Q {cancelados.totalMonto.toFixed(2)}
                </p>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Tabla de Resultados */}
        <div style={styles.tableWrapper}>
          <table className="table table-bordered table-hover">
            <thead className="table-dark">
              <tr>
                <th>ID</th>
                <th>Carne</th>
                <th>Usuario</th>
                <th>Plan</th>
                <th>Monto</th>
                <th>Fecha</th>
                <th>Estado</th>
              </tr>
            </thead>

            <tbody>
              {filtrados.map((pago) => (
                <tr key={pago.id_pago}>
                  <td>{pago.id_pago}</td>
                  <td>{pago.carne}</td>
                  <td>{pago.usuario}</td>
                  <td>{pago.plan}</td>
                  <td>Q {pago.monto}</td>
                  <td>{pago.fecha_pago}</td>
                  <td>{pago.estado}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    padding: "100px",
    //backgroundColor: "#1e469a",
    minHeight: "100vh",
    fontFamily: "Segoe UI, sans-serif",
    width: "100%",
  },
  header: {
    backgroundColor: "white",
    padding: "20px",
    borderRadius: "15px",
    textAlign: "center",
    marginBottom: "25px",
  },
  title: { margin: 0, color: "#1e469a", fontSize: "24px" },
  subtitle: { margin: "5px 0 0", color: "#666" },
  kpiGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gap: "20px",
    marginBottom: "25px",
  },
  card: {
    backgroundColor: "white",
    padding: "20px",
    borderRadius: "15px",
    textAlign: "center",
    boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
  },
  cardLabel: { fontSize: "12px", color: "#888", fontWeight: "bold" },
  cardValue: { margin: "10px 0 0", color: "#333", fontSize: "28px" },
  toolbar: {
    backgroundColor: "white",
    padding: "15px",
    borderRadius: "15px",
    display: "flex",
    gap: "15px",
    marginBottom: "20px",
  },
  input: {
    flex: 1,
    padding: "10px",
    borderRadius: "8px",
    border: "1px solid #ddd",
    outline: "none",
  },
  btnPdf: {
    backgroundColor: "#c0392b",
    color: "white",
    border: "none",
    padding: "10px 20px",
    borderRadius: "8px",
    cursor: "pointer",
    fontWeight: "bold",
  },
  tableWrapper: {
    backgroundColor: "white",
    borderRadius: "15px",
    overflow: "hidden",
    boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
  },
  table: { width: "100%", borderCollapse: "collapse" },
  tableHead: { backgroundColor: "#f8f9fa", borderBottom: "2px solid #eee" },
  th: {
    padding: "15px",
    textAlign: "left",
    color: "#1e469a",
    fontSize: "14px",
  },
  td: {
    padding: "15px",
    borderBottom: "1px solid #eee",
    fontSize: "14px",
    color: "#444",
  },
  trEven: { backgroundColor: "#ffffff" },
  trOdd: { backgroundColor: "#fafafa" },
};

export default ReporteFinanciero;
