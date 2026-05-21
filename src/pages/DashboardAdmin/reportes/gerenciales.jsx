import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import {
  BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from "recharts";
import * as XLSX from "xlsx";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import styles from "../../../styles/Gerenciales.module.css";
import SideBarAdmin from "../../../components/SidebarAdmin";

const API_URL = `http://10.0.40.10/api/reportes`;


const ReporteGerencial = () => {
  const [dashboard, setDashboard] = useState(null);
  const [facultades, setFacultades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [fechaInicio, setFechaInicio] = useState("");
  const [fechaFin, setFechaFin] = useState("");
  const [exportando, setExportando] = useState(false);

  // Referencia para el PDF
  const dashboardRef = useRef(null);

  // Cargar datos iniciales
  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Cargar todos los datos en paralelo
      const [dashboardRes, facultadesRes] = await Promise.all([
        axios.get(`${API_URL}/dashboard`, {
          params: { fecha_inicio: fechaInicio, fecha_fin: fechaFin }
        }),
        axios.get(`${API_URL}/distribucion-facultades`)
      ]);
      
      if (dashboardRes.data.success) setDashboard(dashboardRes.data.data);
      if (facultadesRes.data.success) setFacultades(facultadesRes.data.data);
      
    } catch (err) {
      console.error("Error cargando datos:", err);
      setError("Error al cargar los datos. Verifica que el servidor esté corriendo.");
    } finally {
      setLoading(false);
    }
  };

  const aplicarFiltros = () => {
    cargarDatos();
  };

  const limpiarFiltros = () => {
    setFechaInicio("");
    setFechaFin("");
    setTimeout(() => cargarDatos(), 100);
  };

  // =============================================
  // 📄 EXPORTAR A PDF
  // =============================================
  const exportarPDF = async () => {
    if (!dashboardRef.current) return;
    
    setExportando(true);
    
    try {
      const element = dashboardRef.current;
      const originalOverflow = element.style.overflow;
      element.style.overflow = "visible";
      
      const canvas = await html2canvas(element, {
        scale: 2,
        backgroundColor: "#ffffff",
        logging: false,
        useCORS: true
      });
      
      element.style.overflow = originalOverflow;
      
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4"
      });
      
      const imgWidth = 210;
      const pageHeight = 297;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 0;
      
      pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
      
      while (heightLeft > 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }
      
      pdf.save(`dashboard_parqueo_${new Date().toISOString().slice(0, 19)}.pdf`);
      
    } catch (error) {
      console.error("Error al generar PDF:", error);
      alert("Error al generar el PDF. Intenta nuevamente.");
    } finally {
      setExportando(false);
    }
  };

  // =============================================
  // 📊 EXPORTAR A EXCEL
  // =============================================
  const exportarExcel = () => {
    try {
      setExportando(true);
      
      // Crear libro de trabajo
      const workbook = XLSX.utils.book_new();
      
      // 1. Hoja de Resumen Ejecutivo
      const resumenData = [
        ["RESUMEN EJECUTIVO"],
        [],
        ["Métrica", "Valor"],
        ["Total Usuarios", dashboard.usuarios.total],
        ["Usuarios Activos", dashboard.usuarios.activos],
        ["Usuarios Inactivos", dashboard.usuarios.inactivos],
        ["Porcentaje Activos", `${dashboard.usuarios.porcentaje_activos}%`],
        [],
        ["Total Vehículos", dashboard.vehiculos.total],
        ["Vehículos Activos", dashboard.vehiculos.activos],
        [],
        ["Total Espacios", dashboard.espacios.total],
        ["Espacios Ocupados", dashboard.espacios.ocupados],
        ["Espacios Libres", dashboard.espacios.libres],
        ["Porcentaje Ocupación", `${dashboard.espacios.porcentaje_ocupacion}%`],
        [],
        ["Total Accesos", dashboard.accesos.total],
        ["Accesos Permitidos", dashboard.accesos.permitidos],
        ["Accesos Denegados", dashboard.accesos.denegados],
        ["Tasa de Éxito", `${dashboard.accesos.tasa_exito}%`],
        [],
        ["Total Ingresos", `Q${dashboard.finanzas.total_ingresos.toLocaleString()}`],
        ["Total Pagos", dashboard.finanzas.total_pagos],
        ["Total Multas", `Q${dashboard.finanzas.total_multas.toLocaleString()}`],
        ["Usuarios en Mora", dashboard.morosidad.usuarios_morosos],
        [],
        ["Fecha Generación", new Date().toLocaleString()],
        ["Filtro Inicio", fechaInicio || "Sin filtro"],
        ["Filtro Fin", fechaFin || "Sin filtro"]
      ];
      
      const resumenSheet = XLSX.utils.aoa_to_sheet(resumenData);
      resumenSheet['!cols'] = [{wch:25}, {wch:20}];
      XLSX.utils.book_append_sheet(workbook, resumenSheet, "Resumen Ejecutivo");
      
      // 2. Hoja de Distribución por Facultad
      const facultadData = [
        ["DISTRIBUCIÓN POR FACULTAD"],
        [],
        ["Facultad", "Cantidad de Usuarios", "Porcentaje"]
      ];
      
      facultades.forEach(fac => {
        const porcentaje = ((fac.cantidad / dashboard.usuarios.total) * 100).toFixed(1);
        facultadData.push([fac.facultad, fac.cantidad, `${porcentaje}%`]);
      });
      
      const facultadSheet = XLSX.utils.aoa_to_sheet(facultadData);
      facultadSheet['!cols'] = [{wch:35}, {wch:20}, {wch:15}];
      XLSX.utils.book_append_sheet(workbook, facultadSheet, "Distribución por Facultad");
      
      // 3. Hoja de Detalle de Facultades
      const detalleData = [
        ["DETALLE COMPLETO POR FACULTAD"],
        [],
        ["#", "Facultad", "Cantidad de Usuarios", "Porcentaje del Total"]
      ];
      
      facultades.forEach((fac, index) => {
        const porcentaje = ((fac.cantidad / dashboard.usuarios.total) * 100).toFixed(2);
        detalleData.push([index + 1, fac.facultad, fac.cantidad, `${porcentaje}%`]);
      });
      
      const detalleSheet = XLSX.utils.aoa_to_sheet(detalleData);
      detalleSheet['!cols'] = [{wch:5}, {wch:35}, {wch:20}, {wch:20}];
      XLSX.utils.book_append_sheet(workbook, detalleSheet, "Detalle por Facultad");
      
      // 4. Hoja de Información de Filtros
      const filtrosData = [
        ["INFORMACIÓN DEL REPORTE"],
        [],
        ["Campo", "Valor"],
        ["Fecha de Generación", new Date().toLocaleString()],
        ["Fecha Inicio Filtro", fechaInicio || "No aplica"],
        ["Fecha Fin Filtro", fechaFin || "No aplica"],
        ["Total de Facultades", facultades.length],
        ["Total de Usuarios", dashboard.usuarios.total],
        ["Rango de Fechas Aplicado", fechaInicio && fechaFin ? `${fechaInicio} al ${fechaFin}` : "Todos los datos"]
      ];
      
      const filtrosSheet = XLSX.utils.aoa_to_sheet(filtrosData);
      filtrosSheet['!cols'] = [{wch:25}, {wch:35}];
      XLSX.utils.book_append_sheet(workbook, filtrosSheet, "Información del Reporte");
      
      // Guardar archivo
      XLSX.writeFile(workbook, `reporte_parqueo_${new Date().toISOString().slice(0, 19)}.xlsx`);
      
    } catch (error) {
      console.error("Error al exportar Excel:", error);
      alert("Error al exportar Excel. Intenta nuevamente.");
    } finally {
      setExportando(false);
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Cargando datos del dashboard...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.error_container}>
        <h2>❌ Error</h2>
        <p>{error}</p>
        <button onClick={cargarDatos}>Reintentar</button>
      </div>
    );
  }

  if (!dashboard) return null;

  return (
    <div style={{
        display: "flex",
        minHeight: "100vh",
        backgroundColor: "var(--fondo-general, #f4f7f6)",
      }}>
        
        <SideBarAdmin />
      <div className={styles.app}>

      {/* Header */}
      <header className={styles.header}>
        <h1>📊 Dashboard Gerencial de Parqueo</h1>
        <p>Sistema de Gestión de Parqueo</p>
        <p>Universidad Mariano Gálvez de Guatemala</p>
        <p>Sede Villa Nueva</p>
      </header>

      {/* Filtros */}
      <div className={styles.filtros}>
        <div className={styles['filtro-group']} >
          <label>📅 Fecha Inicio:</label>
          <input
            type="date"
            value={fechaInicio}
            onChange={(e) => setFechaInicio(e.target.value)}
          />
        </div>
        <div className={styles['filtro-group']}>
          <label>📅 Fecha Fin:</label>
          <input
            type="date"
            value={fechaFin}
            onChange={(e) => setFechaFin(e.target.value)}
          />
        </div>
        <button className={styles['btn-primary']} onClick={aplicarFiltros}>
          🔍 Filtrar
        </button>
        <button className={styles['btn-secondary']} onClick={limpiarFiltros}>
          🗑️ Limpiar
        </button>
        <button 
          className={styles['btn-pdf']} 
          onClick={exportarPDF}
          disabled={exportando}
        >
          📄 {exportando ? "Generando..." : "Exportar PDF"}
        </button>
        <button 
          className={styles['btn-excel']} 
          onClick={exportarExcel}
          disabled={exportando}
        >
          📊 {exportando ? "Generando..." : "Exportar Excel"}
        </button>
      </div>

      {/* Contenido del Dashboard para PDF */}
      <div ref={dashboardRef} className={styles['dashboard-content']}>
        {/* KPIs */}
        <div className={styles['kpi-grid']}>
          <div className={styles['kpi-card']}>
            <div className={styles['kpi-icon']}>👥</div>
            <div className={styles['kpi-content']}>
              <h3>Usuarios Activos</h3>
              <p className={styles['kpi-value']}>{dashboard.usuarios.activos}</p>
              <p className={styles['kpi-sub']}>de {dashboard.usuarios.total} total</p>
            </div>
          </div>

          <div className={styles['kpi-card']}>
            <div className={styles['kpi-icon']}>🅿️</div>
            <div className={styles['kpi-content']}>
              <h3>Ocupación</h3>
              <p className={styles['kpi-value']}>{dashboard.espacios.porcentaje_ocupacion}%</p>
              <p className={styles['kpi-sub']}>
                {dashboard.espacios.ocupados} / {dashboard.espacios.total} espacios
              </p>
            </div>
          </div>

          <div className={styles['kpi-card']}>
            <div className={styles['kpi-icon']}>💰</div>
            <div className={styles['kpi-content']}>
              <h3>Ingresos Totales</h3>
              <p className={styles['kpi-value']}>
                Q{dashboard.finanzas.total_ingresos.toLocaleString()}
              </p>
              <p className={styles['kpi-sub']}>{dashboard.finanzas.total_pagos} pagos</p>
            </div>
          </div>

          <div className={styles['kpi-card']}>
            <div className={styles['kpi-icon']}>⚠️</div>
            <div className={styles['kpi-content']}>
              <h3>Usuarios en Mora</h3>
              <p className={styles['kpi-value']}>{dashboard.morosidad.usuarios_morosos}</p>
              <p className={styles['kpi-sub']}>Multas: Q{dashboard.finanzas.total_multas.toLocaleString()}</p>
            </div>
          </div>
        </div>

        {/* Métricas secundarias */}
        <div className={styles['metrics-grid']}>
          <div className={styles['metric-card']}>
            <h4>🚗 Vehículos</h4>
            <p className={styles['metric-value']}>{dashboard.vehiculos.total}</p>
            <p>{dashboard.vehiculos.activos} activos</p>
          </div>

          <div className={styles['metric-card']}>
            <h4>🚪 Accesos</h4>
            <p className={styles['metric-value']}>{dashboard.accesos.total}</p>
            <p>✅ {dashboard.accesos.permitidos} | ❌ {dashboard.accesos.denegados}</p>
            <p>Tasa de éxito: {dashboard.accesos.tasa_exito}%</p>
          </div>

          <div className={styles['metric-card']}>
            <h4>📈 Actividad</h4>
            <p className={styles['metric-value']}>{dashboard.usuarios.porcentaje_activos}%</p>
            <p>de usuarios activos</p>
          </div>

          <div className={styles['metric-card']}>
            <h4>🎓 Facultades</h4>
            <p className={styles['metric-value']}>{facultades.length}</p>
            <p>con usuarios registrados</p>
          </div>
        </div>

        {/* Gráfico de Distribución por Facultad */}
        <div className={styles['charts-grid']}>
          <div className={styles['chart-card'] + ' ' + styles['full-width']} >
            <h3>🏫 Distribución de Usuarios por Facultad</h3>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={facultades} margin={{ top: 20, right: 30, left: 20, bottom: 100 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="facultad" 
                  angle={-45} 
                  textAnchor="end" 
                  height={100}
                  interval={0}
                />
                <YAxis />
                <Tooltip />
                <Legend />
                <br></br>
                
                <Bar dataKey="cantidad" fill="#3498db" name="Usuarios" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        

        </div>
      </div>
    </div>
  );
};

/*const PORT = 3001;
app.listen(PORT, () => {
  console.log(`Servidor de reportes corriendo en http://localhost:${PORT}`);
});*/

export default ReporteGerencial;
