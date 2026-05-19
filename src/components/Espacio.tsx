import type { ComponentType } from "react";
import { FaCar, FaChalkboardTeacher, FaCheckCircle, FaMotorcycle, FaWheelchair } from "react-icons/fa";
import Swal from "sweetalert2";
import type { TipoEspacio } from "./Isla";

const CarIcon = FaCar as ComponentType;
const MotorcycleIcon = FaMotorcycle as ComponentType;
const CheckCircleIcon = FaCheckCircle as ComponentType;
const TeacherIcon = FaChalkboardTeacher as ComponentType;
const WheelchairIcon = FaWheelchair as ComponentType;

interface EspacioProps {
  numero: number;
  ocupado: boolean;
  tipo: TipoEspacio;
  discapacitado?: boolean;
  onClick?: () => void;
}

export default function Espacio({
  numero,
  ocupado,
  tipo,
  discapacitado = false,
  onClick
}: EspacioProps) {
  const color = ocupado ? "#cb3634" : discapacitado ? "#1a6db5" : "#22c55e";

  const handleClick = () => {
    if (ocupado) {
      Swal.fire({
        icon: "error",
        title: "Espacio Ocupado",
        text: `El espacio #${numero} esta ocupado actualmente.`,
        confirmButtonColor: "#cb3634"
      });
      return;
    }

    Swal.fire({
      icon: "question",
      title: "Seleccionar espacio",
      text: `Deseas seleccionar el espacio #${numero}?`,
      showCancelButton: true,
      confirmButtonText: "Si, seleccionar",
      cancelButtonText: "Cancelar",
      confirmButtonColor: "#22c55e"
    }).then((result) => {
      if (result.isConfirmed) {
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
      onMouseEnter={(e) => {
        if (!ocupado) e.currentTarget.style.transform = "scale(1.1)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "scale(1)";
      }}
    >
      <div style={{ fontSize: "18px" }}>
        {discapacitado ? (
          <WheelchairIcon />
        ) : tipo === "moto" ? (
          <MotorcycleIcon />
        ) : tipo === "catedratico" ? (
          <TeacherIcon />
        ) : (
          <CarIcon />
        )}
      </div>

      <div style={{ fontSize: "18px" }}>{ocupado ? "X" : <CheckCircleIcon />}</div>
      <small>#{numero}</small>
      <small style={{ fontSize: "10px" }}>{ocupado ? "Ocupado" : "Libre"}</small>
    </div>
  );
}
