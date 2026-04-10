import React, { useEffect, useState } from "react";
import NavAdmin from "../components/navAdmin";

function ReporteAdministrativo() {
  const [data, setData] = useState(null);
  const [fechaInicio, setFechaInicio] = useState("");
  const [fechaFin, setFechaFin] = useState("");

  useEffect(() => {
    obtenerDatos();
  }, []);

  const obtenerDatos = async () => {
    try {
      const res = await fetch("http://localhost:4000/api/reportes/reporte-administrativo");
      const json = await res.json();
      setData(json);
    } catch (err) {
      console.error(err);
    }
  };

  const filtrar = async () => {
    try {
      const url = new URL("http://localhost:4000/api/reportes/reporte-administrativo");
      url.searchParams.append("fecha_inicio", fechaInicio);
      url.searchParams.append("fecha_fin", fechaFin);

      const res = await fetch(url);
      const json = await res.json();
      setData(json);
    } catch (err) {
      console.error(err);
    }
  };

  const limpiarFiltros = () => {
    setFechaInicio("");
    setFechaFin("");
    obtenerDatos();
  };

  /*if (!data) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100">
        <div className="spinner-border text-primary"></div>
      </div>
    );
  }*/

  return (
    <>
    <NavAdmin />
    <div className="card report-card p-4 w-100 mt-3 container py-4">
      
      <div className="text-center mb-4">
        <h1 className="fw-bold uppercase">📊 DASHBOARD ADMINISTRATIVO</h1>
        <p className="text-muted">Resumen general del sistema</p>
      </div>

      <div className="card shadow-sm mb-4 p-3">
        <div className="row g-2 align-items-center">
          <div className="col-md">
            <input
              type="datetime-local"
              className="form-control"
              value={fechaInicio}
              onChange={e => setFechaInicio(e.target.value)}
            />
          </div>

          <div className="col-md">
            <input
              type="datetime-local"
              className="form-control"
              value={fechaFin}
              onChange={e => setFechaFin(e.target.value)}
            />
          </div>

          <div className="col-md-auto">
            <button className="btn btn-primary w-100" onClick={filtrar}>
              <i className="fi fi-rr-filter me-2"></i>
              Filtrar
            </button>
          </div>

          <div className="col-md-auto">
            <button className="btn btn-danger w-100" onClick={limpiarFiltros}>
              <i className="fi fi-rr-cross-circle me-2"></i>
              Limpiar
            </button>
          </div>
        </div>
      </div>

      <div className="text-center mb-4">
        <button
          onClick={() => window.open("http://localhost:3001/reporte-pdf")}
          className="btn btn-dark px-4 py-2 shadow"
        >
          <i className="fi fi-rr-file-pdf me-2"></i>
          Descargar Reporte PDF
        </button>
      </div>
      {/*
      <div className="row g-4">
        <Card title="Usuarios Totales" value={data.total_usuarios} icon="fi fi-rr-users" />
        <Card title="Usuarios Activos" value={data.usuarios_activos} icon="fi fi-rr-user-check" />
        <Card title="Usuarios Inactivos" value={data.usuarios_inactivos} icon="fi fi-rr-user-delete" />
        <Card title="Accesos Totales" value={data.total_accesos} icon="fi fi-rr-door-open" />
        <Card title="Accesos Permitidos" value={data.accesos_permitidos} icon="fi fi-rr-shield-check" />
        <Card title="Accesos Denegados" value={data.accesos_denegados} icon="fi fi-rr-shield-exclamation" />
        <Card title="Vehículos" value={data.total_vehiculos} icon="fi fi-rr-car" />
        <Card title="Tarjetas Activas" value={data.tarjetas_activas} icon="fi fi-rr-id-badge" />
      </div>*/}
      <div className="row g-4">
        <Card title="Usuarios Totales" value={5} icon="fi fi-rr-users" />
        <Card title="Usuarios Activos" value={5} icon="fi fi-rr-user-check" />
        <Card title="Usuarios Inactivos" value={0} icon="fi fi-rr-delete-user" />
        <Card title="Accesos Totales" value={5} icon="fi fi-rr-door-open" />
        <Card title="Accesos Permitidos" value={5} icon="fi fi-rr-shield-check" />
        <Card title="Accesos Denegados" value={0} icon="fi fi-rr-shield-exclamation" />
        <Card title="Vehículos" value={5} icon="fi fi-rr-car" />
        <Card title="Tarjetas Activas" value={4} icon="fi fi-rr-id-badge" />
      </div>
    </div>
    
    </>
  );
}
function Card({ title, value, icon }) {
  return (
    <div className="col-md-6 col-lg-3">
      <div className="card shadow h-100 border-0 card-hover text-bg-light">
        <div className="card-body text-center">
          
          <div className="mb-4">
            <i className={`${icon} fs-2 text-primary`}></i>
          </div>

          <h6 className="text-muted">{title}</h6>
          <h3 className="fw-bold">{value}</h3>
        </div>
      </div>
    </div>
  );
}

export default ReporteAdministrativo;