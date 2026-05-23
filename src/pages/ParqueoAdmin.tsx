import { useCallback, useEffect, useMemo, useState } from "react";
import Swal from "sweetalert2";
import Isla, { type EspacioBackend } from "../components/Isla";
import {
  anularIsla,
  crearIsla,
  habilitarIsla,
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

interface GrupoTipo {
  nombre: string;
  espacios: EspacioApi[];
}

const toNumber = (value: unknown) => Number(value || 0);

const colorRestantes = (restantes: number) => {
  if (restantes <= 50)  return "#ef4444";
  if (restantes <= 100) return "#f97316";
  if (restantes <= 400) return "#eab308";
  return "#22c55e";
};

const badgeTipo: Record<string, { bg: string; label: string }> = {
  "Carro Estándar": { bg: "#1f4e79", label: "🚗 Carro" },
  "Moto":           { bg: "#7c3aed", label: "🏍️ Moto" },
  "Discapacitado":  { bg: "#0891b2", label: "♿ Discapacitado" },
  "Catedrático":    { bg: "#b45309", label: "🎓 Catedrático" },
};

const badgePorTipo = (nombre: string) =>
  badgeTipo[nombre] ?? { bg: "#374151", label: nombre };

export default function ParqueoAdmin() {
  const [parqueos,            setParqueos]            = useState<ParqueoApi[]>([]);
  const [idParqueo,           setIdParqueo]           = useState<number | "">("");
  const [islas,               setIslas]               = useState<IslaAdmin[]>([]);
  const [islasInhabilitadas,  setIslasInhabilitadas]  = useState<IslaAdmin[]>([]);
  const [espacios,            setEspacios]            = useState<EspacioApi[]>([]);
  const [espaciosSeleccionados, setEspaciosSeleccionados] = useState<number[]>([]);
  const [descripcion,         setDescripcion]         = useState("");
  const [mostrarFormulario,   setMostrarFormulario]   = useState(false);
  const [mostrarInhabilitadas,setMostrarInhabilitadas]= useState(false);
  const [cargando,            setCargando]            = useState(true);

  const parqueoActual = parqueos.find((p) => Number(p.PQ_Parqueo) === Number(idParqueo));

  // ─── Carga de datos ─────────────────────────────────────────────────────────
  const cargarDatos = useCallback(async () => {
    setCargando(true);
    try {
      const parqueosRes   = await obtenerParqueos();
      const parqueosActivos: ParqueoApi[] =
        parqueosRes.data.details ?? (parqueosRes.data as any).data ?? [];

      const parqueoInicial = idParqueo || Number(parqueosActivos[0]?.PQ_Parqueo) || "";
      setParqueos(parqueosActivos);
      setIdParqueo(Number(parqueoInicial));

      const [islasActivasRes, islasInhabRes, espaciosRes] = await Promise.all([
        obtenerIslas(Number(parqueoInicial) || undefined, 1),
        obtenerIslas(Number(parqueoInicial) || undefined, 0),
        obtenerEspacios(),
      ]);

      const enriquecer = async (lista: IslaApi[]): Promise<IslaAdmin[]> =>
        Promise.all(
          lista.map(async (isla) => {
            try {
              const det = await obtenerDetalleIsla(Number(isla.IS_ISLA));
              const detalles = det.data.details ?? [];
              return {
                ...isla,
                espacios: detalles.map((e: any) => ({
                  id_espacio:   Number(e.id_espacio),
                  ES_Espacio:   Number(e.id_espacio),
                  ES_Estado:    e.estado_fisico ?? 1,
                  estado_fisico: e.estado_fisico,
                  tipo:         e.tipo,
                })),
              };
            } catch {
              return { ...isla, espacios: [] };
            }
          })
        );

      const [activas, inhabilitadas] = await Promise.all([
        enriquecer(islasActivasRes.data.details ?? []),
        enriquecer(islasInhabRes.data.details  ?? []),
      ]);

      setIslas(activas);
      setIslasInhabilitadas(inhabilitadas);
      setEspacios(espaciosRes.data.details ?? []);
    } catch (error: any) {
      Swal.fire({
        icon: "error",
        title: "No se pudo cargar administración",
        text: error?.response?.data?.message || "Revisa la conexión con el backend.",
      });
    } finally {
      setCargando(false);
    }
  }, [idParqueo]);

  useEffect(() => { cargarDatos(); }, [cargarDatos]);

  // ─── Espacios disponibles agrupados por tipo ─────────────────────────────────
  const espaciosUsados = useMemo(() => new Set(
    [...islas, ...islasInhabilitadas].flatMap((isla) =>
      isla.espacios.map((e) => Number(e.ES_Espacio ?? e.id_espacio))
    )
  ), [islas, islasInhabilitadas]);

  const espaciosDisponibles = useMemo(() =>
    espacios
      .filter((e) => Number(e.ES_Estado) === 1)
      .filter((e) => !espaciosUsados.has(Number(e.ES_Espacio)))
      .sort((a, b) => (a.ES_Numero ?? a.ES_Espacio) - (b.ES_Numero ?? b.ES_Espacio)),
  [espacios, espaciosUsados]);

  const gruposPorTipo = useMemo((): GrupoTipo[] => {
    const mapa: Record<string, EspacioApi[]> = {};
    espaciosDisponibles.forEach((e) => {
      const nombre = e.TipoEspacio?.TES_NOMBRE ?? "General";
      if (!mapa[nombre]) mapa[nombre] = [];
      mapa[nombre].push(e);
    });
    return Object.entries(mapa).map(([nombre, esps]) => ({ nombre, espacios: esps }));
  }, [espaciosDisponibles]);

  // ─── Métricas ────────────────────────────────────────────────────────────────
  const totalEnIslas     = islas.reduce((s, i) => s + i.espacios.length, 0);
  const totalCapacidad   = toNumber(parqueoActual?.PQ_Capacidad) || 800;
  const espaciosRestantes = Math.max(totalCapacidad - totalEnIslas, 0);

  // ─── Handlers ────────────────────────────────────────────────────────────────
  const toggleEspacio = (id: number) =>
    setEspaciosSeleccionados((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );

  const seleccionarGrupo = (grupo: GrupoTipo) => {
    const ids = grupo.espacios.map((e) => Number(e.ES_Espacio));
    const todosSeleccionados = ids.every((id) => espaciosSeleccionados.includes(id));
    if (todosSeleccionados) {
      setEspaciosSeleccionados((prev) => prev.filter((id) => !ids.includes(id)));
    } else {
      setEspaciosSeleccionados((prev) => [...new Set([...prev, ...ids])]);
    }
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
        PQ_PARQUEO:    idParqueo,
        IS_CAPACIDAD:  espaciosSeleccionados.length,
        IS_DESCRIPCION: descripcion.trim(),
        espacios:      espaciosSeleccionados,
      });
      setDescripcion("");
      setEspaciosSeleccionados([]);
      setMostrarFormulario(false);
      await cargarDatos();
      Swal.fire({ icon: "success", title: "¡Isla creada!", text: res.data.message, confirmButtonColor: "#22c55e" });
    } catch (error: any) {
      Swal.fire({
        icon: "error",
        title: "No se pudo crear la isla",
        text: error?.response?.data?.message || "El backend rechazó la operación.",
      });
    }
  };

  const handleAnularIsla = async (isla: IslaAdmin) => {
    const result = await Swal.fire({
      icon: "warning",
      title: `Inhabilitar ${isla.IS_NOMBRE}`,
      text: "La isla quedará inactiva. Podrás habilitarla de nuevo desde la sección de islas inhabilitadas.",
      showCancelButton: true,
      confirmButtonColor: "#cb3634",
      cancelButtonColor: "#1f4e79",
      confirmButtonText: "Inhabilitar",
      cancelButtonText: "Cancelar",
    });
    if (!result.isConfirmed) return;
    try {
      await anularIsla(Number(isla.IS_ISLA));
      await cargarDatos();
      Swal.fire({ icon: "success", title: "Isla inhabilitada", confirmButtonColor: "#22c55e" });
    } catch (error: any) {
      Swal.fire({ icon: "error", title: "No se pudo inhabilitar", text: error?.response?.data?.message });
    }
  };

  const handleHabilitarIsla = async (isla: IslaAdmin) => {
    const result = await Swal.fire({
      icon: "question",
      title: `Habilitar ${isla.IS_NOMBRE}`,
      text: "La isla volverá a estar activa en el parqueo.",
      showCancelButton: true,
      confirmButtonColor: "#22c55e",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Habilitar",
      cancelButtonText: "Cancelar",
    });
    if (!result.isConfirmed) return;
    try {
      await habilitarIsla(Number(isla.IS_ISLA));
      await cargarDatos();
      Swal.fire({ icon: "success", title: "Isla habilitada", confirmButtonColor: "#22c55e" });
    } catch (error: any) {
      Swal.fire({ icon: "error", title: "No se pudo habilitar", text: error?.response?.data?.message });
    }
  };

  // ─── Subcomponentes ───────────────────────────────────────────────────────────
  const CardIslaActiva = ({ isla }: { isla: IslaAdmin }) => (
    <div className="card-isla p-4 shadow-sm w-100">
      <div className="d-flex justify-content-between align-items-center mb-2">
        <h5 className="mb-0 fw-bold">{isla.IS_NOMBRE}</h5>
        <button onClick={() => handleAnularIsla(isla)}
          style={{ background:"#cb3634", color:"white", border:"none",
            borderRadius:6, padding:"5px 14px", cursor:"pointer", fontWeight:700, fontSize:12 }}>
          Inhabilitar
        </button>
      </div>
      <p className="text-muted text-center mb-1">{isla.IS_DESCRIPCION || "Sin descripción"}</p>
      <p className="text-center mb-3" style={{ fontSize:13, color:"#555" }}>
        Capacidad: <strong>{toNumber(isla.IS_CAPACIDAD)}</strong> espacios
      </p>
      <Isla carros={isla.IS_CAPACIDAD} discapacitados={0} motos={0} catedraticos={0}
        espaciosBackend={isla.espacios} offsetIndex={0} />
    </div>
  );

  const CardIslaInhabilitada = ({ isla }: { isla: IslaAdmin }) => (
    <div className="card-isla p-4 shadow-sm w-100"
      style={{ opacity:0.65, background:"#e5e7eb", border:"2px dashed #9ca3af" }}>
      <div className="d-flex justify-content-between align-items-center mb-2">
        <h5 className="mb-0" style={{ color:"#6b7280" }}>{isla.IS_NOMBRE} — Inhabilitada</h5>
        <button onClick={() => handleHabilitarIsla(isla)}
          style={{ background:"#22c55e", color:"white", border:"none",
            borderRadius:6, padding:"5px 14px", cursor:"pointer", fontWeight:700, fontSize:12 }}>
          Habilitar
        </button>
      </div>
      <p className="text-muted text-center mb-1">{isla.IS_DESCRIPCION || "Sin descripción"}</p>
      <p className="text-center mb-3" style={{ fontSize:13, color:"#9ca3af" }}>
        Capacidad: <strong>{toNumber(isla.IS_CAPACIDAD)}</strong> espacios
      </p>
      <Isla carros={isla.IS_CAPACIDAD} discapacitados={0} motos={0} catedraticos={0}
        espaciosBackend={isla.espacios} offsetIndex={0} />
    </div>
  );

  // ─── Render ───────────────────────────────────────────────────────────────────
  return (
    <div className="fondo-parqueo">
      <div className="overlay-parqueo">
        <div className="card-parqueo">
          <h4 className="text-center mb-4">Panel Administrativo — Gestión de Parqueo</h4>

          {cargando ? (
            <div className="text-center p-5" style={{ color:"#1f4e79", fontSize:16 }}>
              Cargando administración...
            </div>
          ) : (
            <>
              {/* ── RESUMEN ── */}
              <div className="mb-4 p-3" style={{ background:"#1f4e79", borderRadius:12, color:"white" }}>
                <div className="d-flex flex-wrap gap-3 justify-content-between align-items-end">
                  <div>
                    <label style={{ fontSize:13, fontWeight:700 }}>Parqueo</label>
                    <select value={idParqueo}
                      onChange={(e) => { setIdParqueo(Number(e.target.value)); setEspaciosSeleccionados([]); }}
                      style={{ display:"block", padding:"7px 10px", borderRadius:6, border:"none", minWidth:230, marginTop:4 }}>
                      {parqueos.map((p) => (
                        <option key={String(p.PQ_Parqueo)} value={Number(p.PQ_Parqueo)}>{p.PQ_Nombre}</option>
                      ))}
                    </select>
                  </div>
                  <div className="text-center">
                    <div style={{ fontSize:30, fontWeight:900 }}>{islas.length}</div>
                    <small>Islas activas</small>
                  </div>
                  <div className="text-center">
                    <div style={{ fontSize:30, fontWeight:900 }}>{totalEnIslas}</div>
                    <small>Espacios en islas</small>
                  </div>
                  <div className="text-center">
                    <div style={{ fontSize:30, fontWeight:900, color: colorRestantes(espaciosRestantes) }}>
                      {espaciosRestantes}
                    </div>
                    <small>Espacios disponibles para isla</small>
                  </div>
                </div>
              </div>

              {/* ── BOTÓN CREAR ── */}
              <div className="text-center mb-4">
                <button onClick={() => { setMostrarFormulario(!mostrarFormulario); setEspaciosSeleccionados([]); setDescripcion(""); }}
                  style={{ background:"#1f4e79", color:"white", border:"none", borderRadius:8,
                    padding:"10px 28px", fontWeight:700, cursor:"pointer", fontSize:15 }}>
                  {mostrarFormulario ? "✕ Cancelar" : "+ Crear Nueva Isla"}
                </button>
              </div>

              {/* ── FORMULARIO CREAR ISLA ── */}
              {mostrarFormulario && (
                <div className="mb-5 p-4" style={{ background:"#f0f4ff", borderRadius:12, border:"1px solid #1f4e79" }}>
                  <h5 style={{ color:"#1f4e79", marginBottom:4 }}>Nueva isla</h5>
                  <p style={{ fontSize:13, color:"#555", marginBottom:16 }}>
                    Selecciona los espacios que formarán la isla agrupados por tipo.
                    La capacidad se calcula automáticamente.
                  </p>

                  {/* Descripción + guardar */}
                  <div className="d-flex flex-wrap gap-3 align-items-end mb-4">
                    <div>
                      <label style={{ fontSize:13, fontWeight:700, display:"block", marginBottom:4 }}>Descripción</label>
                      <input type="text" placeholder="Ej: Frente a Edificio A"
                        value={descripcion} onChange={(e) => setDescripcion(e.target.value)}
                        style={{ padding:"7px 10px", borderRadius:6, border:"1px solid #cbd5e1", width:270 }} />
                    </div>
                    <div style={{ fontSize:13, color:"#1f4e79", fontWeight:700 }}>
                      Espacios seleccionados: <span style={{ fontSize:18 }}>{espaciosSeleccionados.length}</span>
                    </div>
                    <button onClick={handleCrearIsla}
                      style={{ background:"#22c55e", color:"white", border:"none", borderRadius:8,
                        padding:"9px 22px", fontWeight:700, cursor:"pointer", fontSize:14 }}>
                      Guardar Isla
                    </button>
                  </div>

                  {/* Espacios por tipo */}
                  {espaciosDisponibles.length === 0 ? (
                    <div style={{ background:"#fee2e2", borderRadius:8, padding:"12px 16px", color:"#cb3634", fontSize:13 }}>
                      ⚠️ No hay espacios disponibles para asignar a una nueva isla. Todos los espacios ya están en islas activas.
                    </div>
                  ) : (
                    <div className="d-flex flex-column gap-4">
                      {gruposPorTipo.map((grupo) => {
                        const badge = badgePorTipo(grupo.nombre);
                        const idsGrupo = grupo.espacios.map((e) => Number(e.ES_Espacio));
                        const todosSeleccionados = idsGrupo.every((id) => espaciosSeleccionados.includes(id));
                        return (
                          <div key={grupo.nombre}>
                            {/* Cabecera del grupo */}
                            <div className="d-flex align-items-center gap-2 mb-2">
                              <span style={{ background:badge.bg, color:"white", borderRadius:20,
                                padding:"3px 12px", fontSize:12, fontWeight:700 }}>
                                {badge.label}
                              </span>
                              <span style={{ fontSize:12, color:"#6b7280" }}>
                                {grupo.espacios.length} disponibles
                              </span>
                              <button onClick={() => seleccionarGrupo(grupo)}
                                style={{ background:"none", border:"1px solid #1f4e79", borderRadius:6,
                                  padding:"2px 10px", fontSize:11, color:"#1f4e79", cursor:"pointer", fontWeight:700 }}>
                                {todosSeleccionados ? "Quitar todos" : "Seleccionar todos"}
                              </button>
                            </div>
                            {/* Espacios del grupo */}
                            <div className="d-flex flex-wrap gap-2">
                              {grupo.espacios.map((espacio) => {
                                const idEspacio = Number(espacio.ES_Espacio);
                                const seleccionado = espaciosSeleccionados.includes(idEspacio);
                                return (
                                  <button key={idEspacio} type="button" onClick={() => toggleEspacio(idEspacio)}
                                    style={{
                                      border: seleccionado ? `2px solid ${badge.bg}` : "1px solid #cbd5e1",
                                      background: seleccionado ? badge.bg : "white",
                                      color: seleccionado ? "white" : "#1f2937",
                                      borderRadius:8, padding:"7px 11px", fontWeight:700, fontSize:13,
                                      cursor:"pointer", transition:"all 0.15s",
                                    }}>
                                    #{espacio.ES_Numero ?? idEspacio}
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* ── ISLAS ACTIVAS ── */}
              {islas.length === 0 ? (
                <div className="text-center py-4" style={{ color:"#9ca3af", fontSize:14 }}>
                  No hay islas activas. Crea la primera isla usando el botón de arriba.
                </div>
              ) : (
                <div className="d-flex flex-column align-items-center gap-4">
                  {islas.map((isla) => <CardIslaActiva key={Number(isla.IS_ISLA)} isla={isla} />)}
                </div>
              )}

              {/* ── ISLAS INHABILITADAS ── */}
              {islasInhabilitadas.length > 0 && (
                <div className="mt-5">
                  <button onClick={() => setMostrarInhabilitadas(!mostrarInhabilitadas)}
                    style={{ background:"none", border:"1px solid #9ca3af", borderRadius:8,
                      padding:"8px 16px", color:"#6b7280", fontWeight:700,
                      cursor:"pointer", fontSize:13, width:"100%" }}>
                    {mostrarInhabilitadas ? "▲ Ocultar" : "▼ Ver"} islas inhabilitadas ({islasInhabilitadas.length})
                  </button>
                  {mostrarInhabilitadas && (
                    <div className="d-flex flex-column align-items-center gap-4 mt-3">
                      {islasInhabilitadas.map((isla) => <CardIslaInhabilitada key={Number(isla.IS_ISLA)} isla={isla} />)}
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
