import React, { useEffect, useState } from "react";
import SideBarAdmin from "../../../components/SidebarAdmin";
import axios from "axios";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

function ReporteFinanciero() {
    const [datos, setDatos] = useState([]);
    const [busqueda, setBusqueda] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Carga de datos desde tu API
   useEffect(() => {

    const cargarReporteFinanciero = async () => {
        setLoading(true);
        setError(null);

        try {

            const response = await axios.get(
                "http://localhost:3001/api/reportes/reporte-financiero"
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

    cargarReporteFinanciero();

}, []);

    // Lógica de filtrado
    const filtrados = datos.filter(d =>
        (d.USUARIO && d.USUARIO.toLowerCase().includes(busqueda.toLowerCase())) ||
        (d.VEH_PLACA && d.VEH_PLACA.toLowerCase().includes(busqueda.toLowerCase()))
    );

    // Cálculo de KPIs rápidos
    const totalRecaudado = filtrados.reduce((acc, curr) => acc + (curr.ESTADO_PAGO === "PAGADO" ? parseFloat(curr.MONTO) : 0), 0);
    const pendientes = filtrados.filter(d => d.ESTADO_PAGO !== "PAGADO").length;

    // Función para exportar PDF mejorado
    const exportarPDF = () => {
        const doc = new jsPDF();
        doc.setFontSize(18);
        doc.setTextColor(30, 70, 154);
        doc.text("REPORTE FINANCIERO - PARQUEOS UMG", 14, 15);
        
        doc.setFontSize(10);
        doc.setTextColor(100);
        doc.text(`Fecha de generación: ${new Date().toLocaleDateString()}`, 14, 22);

        const rows = filtrados.map(d => [
            d.LR_CARNE,
            d.USUARIO,
            d.VEH_PLACA,
            `${d.PARQUEO} (Espacio: ${d.NUMERO_ESPACIO})`,
            `Q${d.MONTO}`,
            d.ESTADO_PAGO
        ]);

        autoTable(doc, {
            head: [["Carne", "Usuario", "Placa", "Ubicación", "Monto", "Estado"]],
            body: rows,
            startY: 30,
            
            headStyles: { fillColor: [0, 51, 102] },
        });

        doc.save("Reporte_Financiero_UMG.pdf");
    };

    return (
      <div style={{
        display: "flex",
        minHeight: "100vh",
        backgroundColor: "var(--fondo-general, #f4f7f6)",
      }}>
        
        <SideBarAdmin />
        <div style={styles.container}>
            {/* Encabezado */}
            <div style={styles.header}>
                <h1 style={styles.title}>📊 Gestión Financiera de Parqueo</h1>
                <p style={styles.subtitle}>Universidad Mariano Gálvez de Guatemala - Villa Nueva</p>
            </div>

            {/* Tarjetas de Resumen (KPIs) */}
            <div style={styles.kpiGrid}>
                <div style={styles.card}>
                    <span style={styles.cardLabel}>TOTAL REGISTROS</span>
                    <h2 style={styles.cardValue}>{filtrados.length}</h2>
                </div>
                <div style={styles.card}>
                    <span style={styles.cardLabel}>RECAUDADO (PAGADO)</span>
                    <h2 style={{...styles.cardValue, color: "#27ae60"}}>Q{totalRecaudado.toFixed(2)}</h2>
                </div>
                <div style={styles.card}>
                    <span style={styles.cardLabel}>PENDIENTES DE PAGO</span>
                    <h2 style={{...styles.cardValue, color: "#e74c3c"}}>{pendientes}</h2>
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

            {/* Tabla de Resultados */}
            <div style={styles.tableWrapper}>
                <table style={styles.table}>
                    <thead>
                        <tr style={styles.tableHead}>
                            <th style={styles.th}>Carne</th>
                            <th style={styles.th}>Usuario</th>
                            <th style={styles.th}>Placa</th>
                            <th style={styles.th}>Ubicación</th>
                            <th style={styles.th}>Monto</th>
                            <th style={styles.th}>Estado</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filtrados.map((reg, i) => (
                            <tr key={i} style={i % 2 === 0 ? styles.trEven : styles.trOdd}>
                                <td style={styles.td}>{reg.LR_CARNE}</td>
                                <td style={{...styles.td, fontWeight: "bold"}}>{reg.USUARIO}</td>
                                <td style={styles.td}>{reg.VEH_PLACA}</td>
                                <td style={styles.td}>{reg.PARQUEO} <br/><small>Espacio: {reg.NUMERO_ESPACIO}</small></td>
                                <td style={styles.td}>Q{reg.MONTO}</td>
                                <td style={{...styles.td, fontWeight: "bold", color: reg.ESTADO_PAGO === "PAGADO" ? "#27ae60" : "#e74c3c"}}>
                                    {reg.ESTADO_PAGO}
                                </td>
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
    container: { padding: "100px", backgroundColor: "#1e469a", minHeight: "100vh", fontFamily: 'Segoe UI, sans-serif', width: "100%"},
    header: { backgroundColor: "white", padding: "20px", borderRadius: "15px", textAlign: "center", marginBottom: "25px" },
    title: { margin: 0, color: "#1e469a", fontSize: "24px" },
    subtitle: { margin: "5px 0 0", color: "#666" },
    kpiGrid: { display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "20px", marginBottom: "25px" },
    card: { backgroundColor: "white", padding: "20px", borderRadius: "15px", textAlign: "center", boxShadow: "0 4px 6px rgba(0,0,0,0.1)" },
    cardLabel: { fontSize: "12px", color: "#888", fontWeight: "bold" },
    cardValue: { margin: "10px 0 0", color: "#333", fontSize: "28px" },
    toolbar: { backgroundColor: "white", padding: "15px", borderRadius: "15px", display: "flex", gap: "15px", marginBottom: "20px" },
    input: { flex: 1, padding: "10px", borderRadius: "8px", border: "1px solid #ddd", outline: "none" },
    btnPdf: { backgroundColor: "#c0392b", color: "white", border: "none", padding: "10px 20px", borderRadius: "8px", cursor: "pointer", fontWeight: "bold" },
    tableWrapper: { backgroundColor: "white", borderRadius: "15px", overflow: "hidden", boxShadow: "0 4px 6px rgba(0,0,0,0.1)" },
    table: { width: "100%", borderCollapse: "collapse" },
    tableHead: { backgroundColor: "#f8f9fa", borderBottom: "2px solid #eee" },
    th: { padding: "15px", textAlign: "left", color: "#1e469a", fontSize: "14px" },
    td: { padding: "15px", borderBottom: "1px solid #eee", fontSize: "14px", color: "#444" },
    trEven: { backgroundColor: "#ffffff" },
    trOdd: { backgroundColor: "#fafafa" }
};


export default ReporteFinanciero;