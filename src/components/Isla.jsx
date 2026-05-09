import Espacio from "./Espacio";

export default function Isla({
  carros = 8,
  motos = 5,
  discapacitados = 2,
  catedraticos = 0,
  espaciosBackend = [],
  offsetIndex = 0,
  onSeleccionar
}) {

  const espacios = [
    ...Array(discapacitados).fill("discapacitado"),
    ...Array(catedraticos).fill("catedratico"),
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

        // Espacio de backend
        const espacioActual = espaciosBackend[backendIndex];

        // TEMPORAL: deja el primero ocupado para demo
        const ocupadoDemo = index === 0;

        return (
          <Espacio
            key={index}
            numero={backendIndex + 1}
            tipo={tipo}
            discapacitado={tipo === "discapacitado"}

            // Backend + demo temporal
            ocupado={
              espacioActual?.ES_Estado === 0 || ocupadoDemo
            }

            onClick={() =>
              onSeleccionar?.(espacioActual?.ES_Espacio)
            }
          />
        );
      })}
    </div>
  );
}