import Isla from "../components/Isla";
import Nav from "../components/nav";
import "../styles/Parqueo.css";
import api from "../services/api";
import { useEffect, useState } from "react";


export default function Parqueo() {
  const [espacios, setEspacios] = useState([]);

  useEffect(() => {
  const obtenerEspacios = async () => {
    try {
      const res = await api.get("/api/espacios");
      console.log("ESPACIOS:", res.data);

      setEspacios(res.data.details);
    } catch (error) {
      console.error("Error al traer espacios:", error);
    }
  };

  obtenerEspacios();
}, []);

  return (
    <>
      <Nav />

      <div className="fondo-parqueo">
        <div className="overlay-parqueo">
          <div className="card-parqueo">

            <div className="d-flex flex-column align-items-center gap-4">

              {/* ISLA A */}
              <div className="card-isla p-4 shadow-sm w-100">
                <h5 className="text-center mb-3">Isla A</h5>
                <p className="text-muted">Frente a Edificio A</p>
                <Isla espacios={espacios} />
              </div>

              {/* ISLA B */}
              <div className="card-isla p-4 shadow-sm w-100">
                <h5 className="text-center mb-3">Isla B</h5>
                <p className="text-muted">Frente a Edificio B</p>
                <Isla carros={5} motos={5} espaciosBackend={espacios} />
              </div>

            </div>

          </div>
        </div>
      </div>
    </>
  );
}

