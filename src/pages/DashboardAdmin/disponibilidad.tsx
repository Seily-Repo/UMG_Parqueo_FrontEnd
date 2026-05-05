import React from "react";
import SideBarAdmin from "../../components/SidebarAdmin";

const Disponibilidad = () => {
  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: 'var(--fondo-general, #f4f7f6)' }}>
      
      <SideBarAdmin />
      <header className="dashboard-page__header">
        <h1>Disponibilidad</h1>
        <p>Gestión de disponibilidad de espacios de parqueo.</p>
      </header>

    </div>
  );
};

export default Disponibilidad;