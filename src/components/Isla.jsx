import Espacio from "./Espacio";

<<<<<<< HEAD
export default function Isla({ carros = 7, motos = 5 }) {
=======
export default function Isla({ carros = 5, motos = 5, espaciosBackend = [] }) {
>>>>>>> c34180efb57f4e6f93b698ac31a5e49bff885c1f

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
          ocupado={espaciosBackend[index]?.ES_Estado === 0} // backend
        />
      ))}
    </div>
  );
}
