import React from "react";
import SideBarAdmin from "../../components/SidebarAdmin";

const Reportes = () => {
  return (
    <div style={{
        display: "flex",
        minHeight: "100vh",
        backgroundColor: "var(--fondo-general, #f4f7f6)",
      }}>
      
      <SideBarAdmin />
      <div style={{ flexGrow: 1, paddingTop: "20px" }}>
        <h1>Reportes</h1>
        <p>Gestión de reportes y estadísticas   .</p>
      </div>
    </div>
  );
};

export default Reportes;