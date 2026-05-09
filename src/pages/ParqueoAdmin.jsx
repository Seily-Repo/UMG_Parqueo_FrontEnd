import { useState } from "react";
import Isla from "../components/Isla";
import Nav from "../components/nav";
import "../styles/Parqueo.css";
import Swal from "sweetalert2";

export default function ParqueoAdmin() {

  const [islas, setIslas] = useState([]);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);

  const [nuevaIsla, setNuevaIsla] = useState({
    nombre: "",
    descripcion: "",
    carros: 10,
    motos: 5,
    discapacitados: 5,
    catedraticos: 2,
  });

  const totalEspacios = islas.reduce(
    (sum, i) =>
      sum +
      i.carros +
      i.motos +
      i.discapacitados +
      i.catedraticos,
    0
  );

  const totalDiscapacitados = islas.reduce(
    (sum, i) => sum + i.discapacitados,
    0
  );

  const handleCrearIsla = () => {

    if (!nuevaIsla.nombre.trim()) {
      Swal.fire({
        icon: "warning",
        title: "Nombre requerido",
        text: "Ingresa un nombre para la isla."
      });
      return;
    }

    const espaciosNueva =
      Number(nuevaIsla.carros) +
      Number(nuevaIsla.motos) +
      Number(nuevaIsla.discapacitados) +
      Number(nuevaIsla.catedraticos);

    if (totalEspacios + espaciosNueva > 800) {
      Swal.fire({
        icon: "error",
        title: "Límite alcanzado",
        text: `Solo puedes agregar ${800 - totalEspacios} espacios más para no superar 800.`
      });
      return;
    }

    const nueva = {
      ...nuevaIsla,
      id: Date.now(),
      carros: Number(nuevaIsla.carros),
      motos: Number(nuevaIsla.motos),
      discapacitados: Number(nuevaIsla.discapacitados),
      catedraticos: Number(nuevaIsla.catedraticos)
    };

    setIslas([...islas, nueva]);

    setNuevaIsla({
      nombre: "",
      descripcion: "",
      carros: 10,
      motos: 5,
      discapacitados: 5,
      catedraticos: 2
    });

    setMostrarFormulario(false);

    Swal.fire({
      icon: "success",
      title: "Isla creada",
      text: `${nueva.nombre} agregada correctamente.`
    });
  };

  const handleEliminarIsla = (id, nombre) => {

    Swal.fire({
      icon: "warning",
      title: `¿Eliminar ${nombre}?`,
      text: "Esta acción no se puede deshacer.",
      showCancelButton: true,
      confirmButtonColor: "#cb3634",
      cancelButtonColor: "#1f4e79",
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar"
    }).then((result) => {

      if (result.isConfirmed) {

        setIslas(islas.filter(i => i.id !== id));

        Swal.fire({
          icon: "success",
          title: "Eliminada",
          text: `${nombre} eliminada correctamente.`
        });
      }
    });
  };

  return (
    <>
      <Nav />

      <div className="fondo-parqueo">
        <div className="overlay-parqueo">

          <div className="card-parqueo">

            <h4 className="text-center mb-3">
              🔐 Panel Administrativo — Gestión de Parqueo
            </h4>

            {/* RESUMEN */}
            <div
              className="mb-4 p-3"
              style={{
                background: "#1f4e79",
                borderRadius: 10,
                color: "white"
              }}
            >

              <h5 className="text-center mb-3">
                📊 Resumen del Parqueo
              </h5>

              <div className="d-flex justify-content-around flex-wrap gap-3">

                <div className="text-center">
                  <div style={{ fontSize: 28, fontWeight: 900 }}>
                    {islas.length}
                  </div>
                  <small>Total Islas</small>
                </div>

                <div className="text-center">
                  <div style={{ fontSize: 28, fontWeight: 900 }}>
                    {totalEspacios}
                  </div>
                  <small>Total Espacios</small>
                </div>

                <div className="text-center">
                  <div
                    style={{
                      fontSize: 28,
                      fontWeight: 900,
                      color: "#00bfff"
                    }}
                  >
                    {totalDiscapacitados}
                  </div>

                  <small>♿ Discapacitados</small>
                </div>

                <div className="text-center">
                  <div
                    style={{
                      fontSize: 28,
                      fontWeight: 900,
                      color: totalEspacios >= 800
                        ? "#cb3634"
                        : "#22c55e"
                    }}
                  >
                    {800 - totalEspacios}
                  </div>

                  <small>
                    Espacios disponibles para agregar
                  </small>
                </div>
              </div>

              {/* BARRA */}
              <div
                className="mt-3"
                style={{
                  height: 10,
                  borderRadius: 99,
                  background: "rgba(255,255,255,0.2)",
                  overflow: "hidden"
                }}
              >

                <div
                  style={{
                    height: "100%",
                    width: `${(totalEspacios / 800) * 100}%`,
                    background:
                      "linear-gradient(90deg, #22c55e, #cb3634)",
                    borderRadius: 99,
                    transition: "width 0.5s"
                  }}
                />
              </div>

              <div className="d-flex justify-content-between mt-1">
                <small>0</small>
                <small>Capacidad usada ({totalEspacios}/800)</small>
                <small>800</small>
              </div>
            </div>

            {/* LEYENDA */}
            <div className="d-flex justify-content-center gap-4 mb-3 flex-wrap">

              <div className="d-flex align-items-center gap-2">
                <div
                  style={{
                    width: 16,
                    height: 16,
                    borderRadius: 4,
                    background: "#22c55e"
                  }}
                />
                <small>Libre</small>
              </div>

              <div className="d-flex align-items-center gap-2">
                <div
                  style={{
                    width: 16,
                    height: 16,
                    borderRadius: 4,
                    background: "#cb3634"
                  }}
                />
                <small>Ocupado</small>
              </div>

              <div className="d-flex align-items-center gap-2">
                <div
                  style={{
                    width: 16,
                    height: 16,
                    borderRadius: 4,
                    background: "#1a6db5",
                    border: "2px solid #00bfff"
                  }}
                />
                <small>♿ Discapacitado</small>
              </div>
            </div>

            {/* BOTÓN */}
            <div className="text-center mb-4">

              <button
                onClick={() =>
                  setMostrarFormulario(!mostrarFormulario)
                }

                disabled={totalEspacios >= 800}

                style={{
                  background:
                    totalEspacios >= 800
                      ? "#aaa"
                      : "#1f4e79",

                  color: "white",
                  border: "none",
                  borderRadius: 8,
                  padding: "10px 24px",
                  fontWeight: 700,

                  cursor:
                    totalEspacios >= 800
                      ? "not-allowed"
                      : "pointer",

                  fontSize: 15
                }}
              >

                {mostrarFormulario
                  ? "❌ Cancelar"
                  : "➕ Crear Nueva Isla"}
              </button>
            </div>

            {/* FORMULARIO */}
            {mostrarFormulario && (

              <div
                className="mb-4 p-4"
                style={{
                  background: "#f0f4ff",
                  borderRadius: 10,
                  border: "1px solid #1f4e79"
                }}
              >

                <h5 style={{ color: "#1f4e79" }}>
                  Nueva Isla
                </h5>

                <div className="d-flex flex-wrap gap-3">

                  <div>
                    <label style={{ fontSize: 13, fontWeight: 700 }}>
                      Nombre
                    </label>

                    <input
                      type="text"
                      placeholder="Ej: Isla D"
                      value={nuevaIsla.nombre}

                      onChange={e =>
                        setNuevaIsla({
                          ...nuevaIsla,
                          nombre: e.target.value
                        })
                      }

                      style={{
                        display: "block",
                        padding: "6px 10px",
                        borderRadius: 6,
                        border: "1px solid #ccc",
                        width: 180
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: 13, fontWeight: 700 }}>
                      Descripción
                    </label>

                    <input
                      type="text"
                      placeholder="Ej: Frente a Edificio D"
                      value={nuevaIsla.descripcion}

                      onChange={e =>
                        setNuevaIsla({
                          ...nuevaIsla,
                          descripcion: e.target.value
                        })
                      }

                      style={{
                        display: "block",
                        padding: "6px 10px",
                        borderRadius: 6,
                        border: "1px solid #ccc",
                        width: 220
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: 13, fontWeight: 700 }}>
                      Espacios para carros
                    </label>

                    <input
                      type="number"
                      min={1}
                      max={50}
                      value={nuevaIsla.carros}

                      onChange={e =>
                        setNuevaIsla({
                          ...nuevaIsla,
                          carros: e.target.value
                        })
                      }

                      style={{
                        display: "block",
                        padding: "6px 10px",
                        borderRadius: 6,
                        border: "1px solid #ccc",
                        width: 100
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: 13, fontWeight: 700 }}>
                      Espacios para motos
                    </label>

                    <input
                      type="number"
                      min={0}
                      max={30}
                      value={nuevaIsla.motos}

                      onChange={e =>
                        setNuevaIsla({
                          ...nuevaIsla,
                          motos: e.target.value
                        })
                      }

                      style={{
                        display: "block",
                        padding: "6px 10px",
                        borderRadius: 6,
                        border: "1px solid #ccc",
                        width: 100
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: 13, fontWeight: 700 }}>
                      Espacios discapacitados
                    </label>

                    <input
                      type="number"
                      min={0}
                      max={20}
                      value={nuevaIsla.discapacitados}

                      onChange={e =>
                        setNuevaIsla({
                          ...nuevaIsla,
                          discapacitados: e.target.value
                        })
                      }

                      style={{
                        display: "block",
                        padding: "6px 10px",
                        borderRadius: 6,
                        border: "1px solid #ccc",
                        width: 100
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: 13, fontWeight: 700 }}>
                      Espacios catedráticos
                    </label>

                    <input
                      type="number"
                      min={0}
                      max={20}
                      value={nuevaIsla.catedraticos}

                      onChange={e =>
                        setNuevaIsla({
                          ...nuevaIsla,
                          catedraticos: e.target.value
                        })
                      }

                      style={{
                        display: "block",
                        padding: "6px 10px",
                        borderRadius: 6,
                        border: "1px solid #ccc",
                        width: 100
                      }}
                    />
                  </div>
                </div>

                <button
                  onClick={handleCrearIsla}

                  style={{
                    marginTop: 16,
                    background: "#22c55e",
                    color: "white",
                    border: "none",
                    borderRadius: 8,
                    padding: "8px 20px",
                    fontWeight: 700,
                    cursor: "pointer",
                    fontSize: 14
                  }}
                >
                  ✅ Guardar Isla
                </button>
              </div>
            )}

            {/* ISLAS */}
            {islas.length === 0 ? (

              <div
                className="text-center p-5"
                style={{ color: "#aaa" }}
              >

                <div style={{ fontSize: 48 }}>
                  🏝
                </div>

                <p>
                  No hay islas creadas aún.
                  Crea una nueva isla para comenzar.
                </p>
              </div>

            ) : (

              <div className="d-flex flex-column align-items-center gap-4">

                {islas.map((isla) => (

                  <div
                    key={isla.id}
                    className="card-isla p-4 shadow-sm w-100"
                  >

                    <div className="d-flex justify-content-between align-items-center mb-1">

                      <h5 className="mb-0">
                        {isla.nombre}
                      </h5>

                      <button
                        onClick={() =>
                          handleEliminarIsla(
                            isla.id,
                            isla.nombre
                          )
                        }

                        style={{
                          background: "#cb3634",
                          color: "white",
                          border: "none",
                          borderRadius: 6,
                          padding: "4px 12px",
                          cursor: "pointer",
                          fontWeight: 700,
                          fontSize: 12
                        }}
                      >
                        🗑 Eliminar
                      </button>
                    </div>

                    <p className="text-muted text-center mb-3">
                      {isla.descripcion}
                    </p>

                    <Isla
                      carros={isla.carros}
                      motos={isla.motos}
                      discapacitados={isla.discapacitados}
                      catedraticos={isla.catedraticos}
                      espaciosBackend={[]}
                      offsetIndex={0}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}