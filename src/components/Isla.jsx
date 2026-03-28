import Espacio from "../components/Espacio";

export default function Isla({ cantidad = 10 }) {
  return (
    <div className="d-flex gap-3 mb-4">
      {Array.from({ length: cantidad }, (_, index) => (
        <Espacio key={index} numero={index + 1} />
      ))}
    </div>
  );
}