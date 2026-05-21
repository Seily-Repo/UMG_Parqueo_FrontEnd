import { useCallback, useEffect, useMemo, useState } from "react";
import Swal from "sweetalert2";
import Isla, { type EspacioBackend } from "../components/Isla";
import {
  anularIsla,
  crearIsla,
  obtenerDetalleIsla,
  obtenerEspacios,
  obtenerIslas,
  obtenerParqueos,
  type EspacioApi,
  type IslaApi,
  type ParqueoApi,
} from "../services/api";
import "../styles/Parqueo.css";

interface IslaAdmin extends IslaApi {
  espacios: EspacioBackend[];
}

const toNumber = (value: unknown) => Number(value || 0);

export default function ParqueoAdmin() {
  const [parqueos, setParqueos] = useState<ParqueoApi[]>([]);
  const [idParqueo, setIdParqueo] = useState<number | "">("");
  const [islas, setIslas] = useState<IslaAdmin[]>([]);
  const [espacios, setEspacios] = useState<EspacioApi[]>([]);
  const [espaciosSeleccionados, setEspaciosSeleccionados] = useState<number[]>([]);
  const [descripcion, setDescripcion] = useState("");
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [cargando, setCargando] = useState(true);

  const parqueoActual = parqueos.find((parqueo) => parqueo.PQ_Parqueo === idParqueo);

  const cargarDatos = useCallback(async () => {
    setCargando(true);

    try {
      const parqueosRes = await obtenerParqueos();
      const parqueosActivos = parqueosRes.data.details ?? [];
      const parqueoInicial = idParqueo || parqueosActivos[0]?.PQ_Parqueo || "";

      setParqueos(parqueosActivos);
      setIdParqueo(parqueoInicial);

      const [islasRes, espaciosRes] = await Promise.all([
        obtenerIslas(parqueoInicial || undefined, 1),
        obtenerEspacios(),
      ]);

      const islasConDetalle = await Promise.all(
        (islasRes.data.details ?? []).map(async (isla) => {
          try {
            const detalleRes = await obtenerDetalleIsla(isla.IS_ISLA);
            const detalle = detalleRes.data.details ?? [];
            const espaciosDetalle = detalle.map((espacio) => ({
              id_espacio: Number(espacio.id_espacio),
              ES_Espacio: Number(espacio.id_espacio),
              ES_Estado: espacio.estado_fisico ?? 1,
              estado_fisico: espacio.estado_fisico,
              tipo: espacio.tipo,
            }));

            return { ...isla, espacios: espaciosDetalle };
          } catch {
            return { ...isla, espacios: [] };
          }
        })
      );

      setIslas(islasConDetalle);
      setEspacios(espaciosRes.data.details ?? []);
    } catch (error: any) {
      Swal.fire({
        icon: "error",
        title: "No se pudo cargar administracion",
        text: error?.response?.data?.message || "Revisa la conexion con el backend.",
      });
    } finally {
      setCargando(false);
    }
  }, [idParqueo]);

  useEffect(() => {
    cargarDatos();
  }, [cargarDatos]);

  const espaciosUsados = useMemo(() => {
    return new Set(islas.flatMap((isla) => isla.espacios.map((espacio) => Number(espacio.ES_Espacio ?? espacio.id_espacio))));
  }, [islas]);

  const espaciosDisponibles = useMemo(() => {
    return espacios
      .filter((espacio) => Number(espacio.ES_Estado) === 1)
      .filter((espacio) => !espaciosUsados.has(Number(espacio.ES_Espacio)))
      .sort((a, b) => (a.ES_Numero ?? a.ES_Espacio) - (b.ES_Numero ?? b.ES_Espacio));
  }, [espacios, espaciosUsados]);

  const totalEspacios = espacios.length;
  const totalEnIslas = islas.reduce((sum, isla) => sum + isla.espacios.length, 0);
  const totalCapacidad = parqueoActual?.PQ_Capacidad ?? 800;
  const espaciosRestantes = Math.max(totalCapacidad - totalEnIslas, 0);

  const toggleEspacio = (idEspacio: number) => {
    setEspaciosSeleccionados((actuales) =>
      actuales.includes(idEspacio)
        ? actuales.filter((id) => id !== idEspacio)
        : [...actuales, idEspacio]
    );
  };

  const handleCrearIsla = async () => {
    if (!idParqueo) {
      Swal.fire({ icon: "warning", title: "Parqueo requerido", text: "Selecciona un parqueo activo." });
      return;
    }

    if (espaciosSeleccionados.length === 0) {
      Swal.fire({ icon: "warning", title: "Espacios requeridos", text: "Selecciona al menos un espacio para la isla." });
      return;
    }

    try {
      const res = await crearIsla({
        PQ_PARQUEO: idParqueo,
        IS_CAPACIDAD: espaciosSeleccionados.length,
        IS_DESCRIPCION: descripcion.trim(),
        espacios: espaciosSeleccionados,
      });

      setDescripcion("");
      setEspaciosSeleccionados([]);
      setMostrarFormulario(false);
      await cargarDatos();

      Swal.fire({
        icon: "success",
        title: "Isla creada",
        text: res.data.message,
        confirmButtonColor: "#22c55e",
      });
    } catch (error: any) {
      Swal.fire({
        icon: "error",
        title: "No se pudo crear la isla",
        text: error?.response?.data?.message || "El backend rechazo la operacion.",
      });
    }
  };

  const handleAnularIsla = async (isla: IslaAdmin) => {
    const result = await Swal.fire({
      icon: "warning",
      title: `Inhabilitar ${isla.IS_NOMBRE}`,
      text: "La isla quedara inactiva en el backend.",
      showCancelButton: true,
      confirmButtonColor: "#cb3634",
      cancelButtonColor: "#1f4e79",
      confirmButtonText: "Inhabilitar",
      cancelButtonText: "Cancelar",
    });

    if (!result.isConfirmed) return;

    try {
      await anularIsla(isla.IS_ISLA);
      await cargarDatos();
      Swal.fire({ icon: "success", title: "Isla inhabilitada", confirmButtonColor: "#22c55e" });
    } catch (error: any) {
      Swal.fire({
        icon: "error",
        title: "No se pudo inhabilitar",
        text: error?.response?.data?.message || "El backend rechazo la operacion.",
      });
    }
  };

  return (
    <div className="fondo-parqueo">
      <div className="overlay-parqueo">
        <div className="card-parqueo">
          <h4 className="text-center mb-3">Panel Administrativo - Gestion de Parqueo</h4>

          {cargando ? (
            <div className="text-center p-4">Cargando administracion...</div>
          ) : (
            <>
              <div className="mb-4 p-3" style={{ background: "#1f4e79", borderRadius: 10, color: "white" }}>
                <div className="d-flex flex-wrap gap-3 justify-content-between align-items-end">
                  <div>
                    <label style={{ fontSize: 13, fontWeight: 700 }}>Parqueo</label>
                    <select
                      value={idParqueo}
                      onChange={(event) => {
                        setIdParqueo(Number(event.target.value));
                        setEspaciosSeleccionados([]);
                      }}
                      style={{ display: "block", padding: "7px 10px", borderRadius: 6, border: "none", minWidth: 220 }}
                    >
                      {parqueos.map((parqueo) => (
                        <option key={parqueo.PQ_Parqueo} value={parqueo.PQ_Parqueo}>
                          {parqueo.PQ_Nombre}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="text-center">
                    <div style={{ fontSize: 28, fontWeight: 900 }}>{islas.length}</div>
                    <small>Islas activas</small>
                  </div>
                  <div className="text-center">
                    <div style={{ fontSize: 28, fontWeight: 900 }}>{totalEspacios}</div>
                    <small>Espacios registrados</small>
                  </div>
                  <div className="text-center">
                    <div style={{ fontSize: 28, fontWeight: 900, color: "#22c55e" }}>{espaciosDisponibles.length}</div>
                    <small>Disponibles para isla</small>
                  </div>
                  <div className="text-center">
                    <div style={{ fontSize: 28, fontWeight: 900, color: espaciosRestantes <= 10 ? "#f87171" : "#e0f2fe" }}>
                      {espaciosRestantes}
                    </div>
                    <small>Restantes de capacidad</small>
                  </div>
                </div>
              </div>

              <div className="text-center mb-4">
                <button
                  onClick={() => setMostrarFormulario(!mostrarFormulario)}
                  style={{
                    background: "#1f4e79",
                    color: "white",
                    border: "none",
                    borderRadius: 8,
                    padding: "10px 24px",
                    fontWeight: 700,
                    cursor: "pointer",
                    fontSize: 15,
                  }}
                >
                  {mostrarFormulario ? "Cancelar" : "Crear Nueva Isla"}
                </button>
              </div>

              {mostrarFormulario && (
                <div className="mb-4 p-4" style={{ background: "#f0f4ff", borderRadius: 10, border: "1px solid #1f4e79" }}>
                  <h5 style={{ color: "#1f4e79" }}>Nueva isla</h5>
                  <div className="d-flex flex-wrap gap-3 align-items-end">
                    <div>
                      <label style={{ fontSize: 13, fontWeight: 700 }}>Descripcion</label>
                      <input
                        type="text"
                        placeholder="Ej: Frente a edificio A"
                        value={descripcion}
                        onChange={(event) => setDescripcion(event.target.value)}
                        style={{ display: "block", padding: "6px 10px", borderRadius: 6, border: "1px solid #ccc", width: 260 }}
                      />
                    </div>
                    <div style={{ fontSize: 13, color: "#1f4e79", fontWeight: 700 }}>
                      Seleccionados: {espaciosSeleccionados.length}
                    </div>
                    <button
                      onClick={handleCrearIsla}
                      style={{
                        background: "#22c55e",
                        color: "white",
                        border: "none",
                        borderRadius: 8,
                        padding: "8px 20px",
                        fontWeight: 700,
                        cursor: "pointer",
                        fontSize: 14,
                      }}
                    >
                      Guardar Isla
                    </button>
                  </div>

                  <div className="mt-3 d-flex flex-wrap gap-2">
                    {espaciosDisponibles.map((espacio) => {
                      const idEspacio = Number(espacio.ES_Espacio);
                      const seleccionado = espaciosSeleccionados.includes(idEspacio);
                      return (
                        <button
                          key={idEspacio}
                          type="button"
                          onClick={() => toggleEspacio(idEspacio)}
                          style={{
                            border: seleccionado ? "2px solid #1f4e79" : "1px solid #cbd5e1",
                            background: seleccionado ? "#dbeafe" : "white",
                            color: "#1f2937",
                            borderRadius: 8,
                            padding: "8px 10px",
                            fontWeight: 700,
                          }}
                        >
                          #{espacio.ES_Numero ?? idEspacio}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              <div className="d-flex flex-column align-items-center gap-4">
                {islas.map((isla) => (
                  <div key={isla.IS_ISLA} className="card-isla p-4 shadow-sm w-100">
                    <div className="d-flex justify-content-between align-items-center mb-1">
                      <h5 className="mb-0">{isla.IS_NOMBRE}</h5>
                      <button
                        onClick={() => handleAnularIsla(isla)}
                        style={{
                          background: "#cb3634",
                          color: "white",
                          border: "none",
                          borderRadius: 6,
                          padding: "4px 12px",
                          cursor: "pointer",
                          fontWeight: 700,
                          fontSize: 12,
                        }}
                      >
                        Inhabilitar
                      </button>
                    </div>
                    <p className="text-muted text-center mb-3">{isla.IS_DESCRIPCION || "Sin descripcion"}</p>
                    <p className="text-center mb-3" style={{ fontSize: 13, color: "#555" }}>
                      Capacidad: {toNumber(isla.IS_CAPACIDAD)} espacios
                    </p>
                    <Isla
                      carros={isla.IS_CAPACIDAD}
                      discapacitados={0}
                      motos={0}
                      catedraticos={0}
                      espaciosBackend={isla.espacios}
                      offsetIndex={0}
                    />
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
