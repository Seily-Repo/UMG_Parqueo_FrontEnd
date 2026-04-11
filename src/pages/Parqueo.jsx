import Isla from "../components/Isla";
import Nav from "../components/nav";
import "../styles/Parqueo.css";
import api from "../services/api";
import { useEffect, useState } from "react";


export default function Parqueo() {
<<<<<<< HEAD
 
=======
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

>>>>>>> c34180efb57f4e6f93b698ac31a5e49bff885c1f
  return (
    <>
      <Nav />

      <div className="fondo-parqueo">
        <div className="overlay-parqueo">
          <button className="card-parqueo" onClick={(e) => e.currentTarget.disabled="false"}>

            <div className="d-flex flex-column align-items-center gap-4" >

              {/* ISLA A */}
              <div className="card-isla p-4 shadow-sm w-100" 
            >
                <h5 className="text-center mb-3">Isla A</h5>
                <p className="text-muted">Frente a Edificio A</p>
<<<<<<< HEAD
                <Isla  carros={5} motos={5} />
=======
                <Isla espacios={espacios} />
>>>>>>> c34180efb57f4e6f93b698ac31a5e49bff885c1f
              </div>

              {/* ISLA B */}
              <div className="card-isla p-4 shadow-sm w-100">
                <h5 className="text-center mb-3">Isla B</h5>
                <p className="text-muted">Frente a Edificio B</p>
                <Isla carros={5} motos={5} espaciosBackend={espacios} />
              </div>

            </div>

          </button>
    
        </div>
      </div>
    </>
  );
}

