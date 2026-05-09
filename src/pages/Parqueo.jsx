import Isla from "../components/Isla";
import Nav from "../components/nav";
import "../styles/Parqueo.css";
import api, { asignarEspacio } from "../services/api";
import { useEffect, useState } from "react";

const ISLAS = [
  { nombre: "Isla A", descripcion: "Frente a Edificio A", carros: 10, discapacitados: 5 },
  { nombre: "Isla B", descripcion: "Frente a Edificio B", carros: 10, discapacitados: 5 },
  { nombre: "Isla C", descripcion: "Frente a Edificio C", carros: 10, discapacitados: 5 },
];

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

    //CREAR FUNCIÓN HANDLESELECCION
    const handleSeleccion = async (idEspacio) => {
  try {

    const data = {
      carne_usuario: 202601001,
      ES_Espacio: idEspacio,
      id_ciclo: 1,
      id_jornada: 1,
      correlativo: "pi_3RDXTm2eZvKY1o2C1TjPKHmg"
    };

    const res = await asignarEspacio(data);

    console.log("Asignación exitosa:", res.data);

    alert("Espacio asignado correctamente");

  } catch (error) {
    console.error("Error al asignar:", error.response.data);
  }
};  



  const islaOffsets = ISLAS.reduce((acc, isla, i) => {
    const prev = acc[i - 1] ?? 0;
    const prevIsla = ISLAS[i - 1];
    const prevTotal = prevIsla ? prevIsla.carros + prevIsla.discapacitados : 0;
    acc[i] = prev + prevTotal;
    return acc;
  }, {});

  const totalEspacios = ISLAS.reduce((sum, i) => sum + i.carros + i.discapacitados, 0);
  const libres = espacios.filter(e => e.ES_Estado !== 0).length;
  const ocupados = espacios.filter(e => e.ES_Estado === 0).length;
  const totalDiscapacitados = ISLAS.reduce((sum, i) => sum + i.discapacitados, 0);

  return (
    <>
      <Nav />
      <div className="fondo-parqueo">
        <div className="overlay-parqueo">
          <div className="card-parqueo">

            {/* PANEL RESUMEN */}
            <div className="mb-4 p-3" style={{ background: "#1f4e79", borderRadius: 10, color: "white" }}>
              <h5 className="text-center mb-3">📊 Resumen del Parqueo</h5>
              <div className="d-flex justify-content-around flex-wrap gap-3">
                <div className="text-center">
                  <div style={{ fontSize: 28, fontWeight: 900 }}>{ISLAS.length}</div>
                  <small>Total Islas</small>
                </div>
                <div className="text-center">
                  <div style={{ fontSize: 28, fontWeight: 900 }}>{totalEspacios}</div>
                  <small>Total Espacios</small>
                </div>
                <div className="text-center">
                  <div style={{ fontSize: 28, fontWeight: 900, color: "#22c55e" }}>{libres}</div>
                  <small>Libres</small>
                </div>
                <div className="text-center">
                  <div style={{ fontSize: 28, fontWeight: 900, color: "#cb3634" }}>{ocupados}</div>
                  <small>Ocupados</small>
                </div>
                <div className="text-center">
                  <div style={{ fontSize: 28, fontWeight: 900, color: "#00bfff" }}>{totalDiscapacitados}</div>
                  <small>♿ Discapacitados</small>
                </div>
              </div>

              {/* Barra de ocupación */}
              <div className="mt-3" style={{ height: 10, borderRadius: 99, background: "rgba(255,255,255,0.2)", overflow: "hidden" }}>
                <div style={{
                  height: "100%",
                  width: totalEspacios > 0 ? `${(ocupados / totalEspacios) * 100}%` : "0%",
                  background: "linear-gradient(90deg, #22c55e, #cb3634)",
                  borderRadius: 99,
                  transition: "width 0.5s"
                }} />
              </div>
              <div className="d-flex justify-content-between mt-1">
                <small>0%</small>
                <small>Ocupación</small>
                <small>100%</small>
              </div>
            </div>

            {/* LEYENDA */}
            <div className="d-flex justify-content-center gap-4 mb-4 flex-wrap">
              <div className="d-flex align-items-center gap-2">
                <div style={{ width: 16, height: 16, borderRadius: 4, background: "#22c55e" }} />
                <small>Libre</small>
              </div>
              <div className="d-flex align-items-center gap-2">
                <div style={{ width: 16, height: 16, borderRadius: 4, background: "#cb3634" }} />
                <small>Ocupado</small>
              </div>
              <div className="d-flex align-items-center gap-2">
                <div style={{ width: 16, height: 16, borderRadius: 4, background: "#1a6db5", border: "2px solid #00bfff" }} />
                <small>♿ Discapacitado</small>
              </div>
            </div>

            {/* ISLAS */}
            <div className="d-flex flex-column align-items-center gap-4">
              {ISLAS.map((isla, index) => (
                <div key={index} className="card-isla p-4 shadow-sm w-100">
                  <h5 className="text-center mb-1">{isla.nombre}</h5>
                  <p className="text-muted text-center mb-3">{isla.descripcion}</p>
                  <Isla
                    carros={isla.carros}
                    discapacitados={isla.discapacitados}
                    espaciosBackend={espacios}
                    offsetIndex={islaOffsets[index] ?? 0}
                    onSeleccionar={handleSeleccion}
                  />
                </div>
              ))}
            </div>

          </div>
        </div>
      </div>
    </>
  );
}