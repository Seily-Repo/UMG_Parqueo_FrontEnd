import Espacio from "./Espacio";

export default function Isla({
  carros = 8,
  motos = 5,
  discapacitados = 2,
  espaciosBackend = [],
  offsetIndex = 0
}) {

  const espacios = [
    ...Array(discapacitados).fill("discapacitado"),
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
      {espacios.map((tipo, index) => {
        const backendIndex = offsetIndex + index;
        return (
          <Espacio
            key={index}
            numero={backendIndex + 1}
            tipo={tipo === "discapacitado" ? "carro" : tipo}
            discapacitado={tipo === "discapacitado"}
            ocupado={index === 0}
          />
        );
      })}
    </div>
  );
}