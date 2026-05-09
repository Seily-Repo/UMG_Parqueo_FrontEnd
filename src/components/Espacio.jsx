import { FaCar, FaMotorcycle, FaCheckCircle, FaChalkboardTeacher } from "react-icons/fa";
import Swal from "sweetalert2";

export default function Espacio({ 
  numero, 
  ocupado, 
  tipo, 
  discapacitado = false,
  onClick
}) {

  const color = ocupado
    ? "#cb3634"
    : discapacitado
      ? "#1a6db5"
      : "#22c55e";

  const handleClick = () => {

  // Si está ocupado
  if (ocupado) {
    Swal.fire({
      icon: "error",
      title: "Espacio Ocupado",
      text: `El espacio #${numero} está ocupado actualmente.`,
      confirmButtonColor: "#cb3634"
    });

    return;
  }

  // Si está libre
  Swal.fire({
    icon: "question",
    title: "Seleccionar espacio",
    text: `¿Deseas seleccionar el espacio #${numero}?`,
    showCancelButton: true,
    confirmButtonText: "Sí, seleccionar",
    cancelButtonText: "Cancelar",
    confirmButtonColor: "#22c55e"
  }).then((result) => {

    if (result.isConfirmed) {

      // Ejecutar función enviada desde Isla
      onClick?.();

      Swal.fire({
        icon: "success",
        title: "Espacio seleccionado",
        text: `Has seleccionado el espacio #${numero}`,
        confirmButtonColor: "#22c55e"
      });
    }
  });
};

  return (
    <div
      onClick={handleClick}
      style={{
        width: "70px",
        height: "100px",
        borderRadius: "10px",
        backgroundColor: color,
        color: "white",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        fontWeight: "bold",
        boxShadow: "0 2px 6px rgba(0,0,0,0.2)",
        cursor: ocupado ? "not-allowed" : "pointer",
        transition: "transform 0.2s",
        border: discapacitado ? "2px solid #00bfff" : "none"
      }}
      onMouseEnter={(e) => { if (!ocupado) e.currentTarget.style.transform = "scale(1.1)"; }}
      onMouseLeave={(e) => { e.currentTarget.style.transform = "scale(1)"; }}
    >
      <div style={{ fontSize: "18px" }}>
        {discapacitado ? (
          <span style={{ fontSize: "20px" }}>♿</span>
        ) : tipo === "moto" ? (
            <FaMotorcycle />
        ) : tipo === "catedratico" ? (
            <FaChalkboardTeacher />
        ) : (
          <FaCar />
        )}
      </div>

      <div style={{ fontSize: "18px" }}>
        {ocupado ? "❌" : <FaCheckCircle />}
      </div>

      <small>#{numero}</small>

      <small style={{ fontSize: "10px" }}>
        {ocupado ? "Ocupado" : "Libre"}
      </small>
    </div>
  );
}