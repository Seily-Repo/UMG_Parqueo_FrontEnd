import React from "react";
import SideBarAdmin from "../../components/SidebarAdmin";

const Pagos = () => {
  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: 'var(--fondo-general, #f4f7f6)' }}>
      
      <SideBarAdmin />
      <header className="dashboard-page__header">
        <h1>Pagos</h1>
        <p>Gestión de pagos administrativos.</p>
      </header>

    </div>
  );
};

export default Pagos;
