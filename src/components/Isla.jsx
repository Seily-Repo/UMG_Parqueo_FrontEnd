import Espacio from "./Espacio";

export default function Isla({ carros = 5, motos = 5 }) {

  //  Genera dinámicamente los espacios
  const espacios = [
    ...Array(carros).fill("carro"),
    ...Array(motos).fill("moto")
  ];

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(5, 70px)",
        gap: "15px",
        justifyContent: "center"
      }}
    >
      {espacios.map((tipo, index) => (
        <Espacio
          key={index}
          numero={index + 1}
          tipo={tipo}
          ocupado={false} // luego esto vendrá del backend
        />
      ))}
    </div>
  );
}
