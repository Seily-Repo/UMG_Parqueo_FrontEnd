import Isla from "../components/Isla";

export default function Parqueo() {
  return (
    <div className="container mt-4">
      <h2>Mapa de Parqueo</h2>

      <div className="card p-3 mb-4">
        <h5>Isla A</h5>
        <Isla cantidad={10} />
      </div>

      <div className="card p-3 mb-4">
        <h5>Isla B</h5>
        <Isla cantidad={15} />
      </div>
    </div>
  );
}