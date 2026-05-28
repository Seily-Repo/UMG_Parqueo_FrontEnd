import { useCallback, useEffect, useMemo, useState } from "react";
import Swal from "sweetalert2";
import Isla, { type EspacioBackend } from "../components/Isla";
import {
  anularIsla, crearIsla, habilitarIsla,
  obtenerDetalleIsla, obtenerEspacios, obtenerIslas, obtenerParqueos,
  type EspacioApi, type IslaApi, type ParqueoApi,
} from "../services/api";
import { isAuthenticated, userHasRole } from "../services/auth";
import "../styles/Parqueo.css";

interface IslaAdmin extends IslaApi { espacios: EspacioBackend[]; }
interface GrupoTipo { nombre: string; espacios: EspacioApi[]; }

const toNum = (v: unknown) => Number(v || 0);

const colorRestantes = (n: number) => {
  if (n <= 50)  return "#ef4444";
  if (n <= 100) return "#f97316";
  if (n <= 400) return "#eab308";
  return "#22c55e";
};

const BADGE: Record<string, { bg: string; label: string }> = {
  "Carro Estándar": { bg:"#1f4e79", label:"🚗 Carro" },
  "Moto":           { bg:"#7c3aed", label:"🏍️ Moto" },
  "Discapacitado":  { bg:"#0891b2", label:"♿ Discapacitado" },
  "Catedrático":    { bg:"#b45309", label:"🎓 Catedrático" },
};
const badge = (nombre: string) => BADGE[nombre] ?? { bg:"#374151", label: nombre };

const LOGIN_ADMIN = process.env.REACT_APP_LOGIN_ADMIN_URL || "http://10.0.40.10/login-admin";

export default function ParqueoAdmin() {
  const [parqueos,             setParqueos]             = useState<ParqueoApi[]>([]);
  const [idParqueo,            setIdParqueo]            = useState<number | "">("");
  const [islas,                setIslas]                = useState<IslaAdmin[]>([]);
  const [islasInhab,           setIslasInhab]           = useState<IslaAdmin[]>([]);
  const [espacios,             setEspacios]             = useState<EspacioApi[]>([]);
  const [espaciosSel,          setEspaciosSel]          = useState<number[]>([]);
  const [descripcion,          setDescripcion]          = useState("");
  const [mostrarForm,          setMostrarForm]          = useState(false);
  const [mostrarInhab,         setMostrarInhab]         = useState(false);
  const [cargando,             setCargando]             = useState(true);

  // ── PDF #4: redirigir si no tiene rol admin ──────────────────────────────────
  useEffect(() => {
    if (!isAuthenticated()) { window.location.replace(LOGIN_ADMIN); return; }
    if (!userHasRole(["ADMINISTRADOR"])) { window.location.replace(LOGIN_ADMIN); }
  }, []);

  const parqueoActual = parqueos.find((p) => Number(p.PQ_Parqueo) === Number(idParqueo));

  const cargarDatos = useCallback(async () => {
    if (!isAuthenticated()) return;
    setCargando(true);
    try {
      const pRes = await obtenerParqueos();
      const lista: ParqueoApi[] = pRes.data.details ?? (pRes.data as any).data ?? [];
      const primero = idParqueo || Number(lista[0]?.PQ_Parqueo) || "";
      setParqueos(lista);
      setIdParqueo(Number(primero));

      const [activasRes, inhabRes, espaciosRes] = await Promise.all([
        obtenerIslas(Number(primero) || undefined, 1),
        obtenerIslas(Number(primero) || undefined, 0),
        obtenerEspacios(),
      ]);

      const enriquecer = async (lista: IslaApi[]): Promise<IslaAdmin[]> =>
        Promise.all(lista.map(async (isla) => {
          try {
            const det = await obtenerDetalleIsla(Number(isla.IS_ISLA));
            return {
              ...isla,
              espacios: (det.data.details ?? []).map((e: any) => ({
                id_espacio:    Number(e.id_espacio),
                ES_Espacio:    Number(e.id_espacio),
                ES_Estado:     e.estado_fisico ?? 1,
                estado_fisico: e.estado_fisico,
                tipo:          e.tipo,
              })),
            };
          } catch { return { ...isla, espacios: [] }; }
        }));

      const [activas, inhabilitadas] = await Promise.all([
        enriquecer(activasRes.data.details ?? []),
        enriquecer(inhabRes.data.details   ?? []),
      ]);
      setIslas(activas);
      setIslasInhab(inhabilitadas);
      setEspacios(espaciosRes.data.details ?? []);
    } catch (error: any) {
      Swal.fire({ icon:"error", title:"No se pudo cargar administración",
        text: error?.response?.data?.message || "Revisa la conexión con el backend." });
    } finally { setCargando(false); }
  }, [idParqueo]);

  useEffect(() => { cargarDatos(); }, [cargarDatos]);

  // ── Espacios disponibles agrupados ──────────────────────────────────────────
  const espaciosUsados = useMemo(() => new Set(
    [...islas, ...islasInhab].flatMap((i) => i.espacios.map((e) => Number(e.ES_Espacio ?? e.id_espacio)))
  ), [islas, islasInhab]);

  const espaciosDisponibles = useMemo(() =>
    espacios
      .filter((e) => Number(e.ES_Estado) === 1 && !espaciosUsados.has(Number(e.ES_Espacio)))
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

  const totalEnIslas    = islas.reduce((s, i) => s + i.espacios.length, 0);
  const totalCapacidad  = toNum(parqueoActual?.PQ_Capacidad) || 800;
  const restantes       = Math.max(totalCapacidad - totalEnIslas, 0);

  // ── Handlers ────────────────────────────────────────────────────────────────
  const toggleEspacio = (id: number) =>
    setEspaciosSel((p) => p.includes(id) ? p.filter((x) => x !== id) : [...p, id]);

  const seleccionarGrupo = (grupo: GrupoTipo) => {
    const ids = grupo.espacios.map((e) => Number(e.ES_Espacio));
    const todos = ids.every((id) => espaciosSel.includes(id));
    setEspaciosSel((p) => todos ? p.filter((id) => !ids.includes(id)) : [...new Set([...p, ...ids])]);
  };

  const handleCrearIsla = async () => {
    if (!idParqueo) {
      Swal.fire({ icon:"warning", title:"Parqueo requerido", text:"Selecciona un parqueo activo." }); return;
    }
    if (espaciosSel.length === 0) {
      Swal.fire({ icon:"warning", title:"Espacios requeridos", text:"Selecciona al menos un espacio." }); return;
    }
    try {
      const res = await crearIsla({ PQ_PARQUEO: idParqueo as number,
        IS_CAPACIDAD: espaciosSel.length, IS_DESCRIPCION: descripcion.trim(), espacios: espaciosSel });
      setDescripcion(""); setEspaciosSel([]); setMostrarForm(false);
      await cargarDatos();
      Swal.fire({ icon:"success", title:"¡Isla creada!", text: res.data.message, confirmButtonColor:"#22c55e" });
    } catch (error: any) {
      Swal.fire({ icon:"error", title:"No se pudo crear la isla",
        text: error?.response?.data?.message || "El backend rechazó la operación." });
    }
  };

  const handleAnular = async (isla: IslaAdmin) => {
    const r = await Swal.fire({ icon:"warning", title:`Inhabilitar ${isla.IS_NOMBRE}`,
      text:"La isla quedará inactiva. Podrás habilitarla desde la sección de islas inhabilitadas.",
      showCancelButton:true, confirmButtonColor:"#cb3634", cancelButtonColor:"#1f4e79",
      confirmButtonText:"Inhabilitar", cancelButtonText:"Cancelar" });
    if (!r.isConfirmed) return;
    try {
      await anularIsla(Number(isla.IS_ISLA)); await cargarDatos();
      Swal.fire({ icon:"success", title:"Isla inhabilitada", confirmButtonColor:"#22c55e" });
    } catch (error: any) {
      Swal.fire({ icon:"error", title:"No se pudo inhabilitar", text: error?.response?.data?.message });
    }
  };

  const handleHabilitar = async (isla: IslaAdmin) => {
    const r = await Swal.fire({ icon:"question", title:`Habilitar ${isla.IS_NOMBRE}`,
      text:"La isla volverá a estar activa en el parqueo.",
      showCancelButton:true, confirmButtonColor:"#22c55e", cancelButtonColor:"#6b7280",
      confirmButtonText:"Habilitar", cancelButtonText:"Cancelar" });
    if (!r.isConfirmed) return;
    try {
      await habilitarIsla(Number(isla.IS_ISLA)); await cargarDatos();
      Swal.fire({ icon:"success", title:"Isla habilitada", confirmButtonColor:"#22c55e" });
    } catch (error: any) {
      Swal.fire({ icon:"error", title:"No se pudo habilitar", text: error?.response?.data?.message });
    }
  };

  // ── Subcomponentes ───────────────────────────────────────────────────────────
  const CardActiva = ({ isla }: { isla: IslaAdmin }) => (
    <div className="card-isla p-4 shadow-sm w-100">
      <div className="d-flex justify-content-between align-items-center mb-2">
        <h5 className="mb-0 fw-bold">{isla.IS_NOMBRE}</h5>
        <button onClick={() => handleAnular(isla)}
          style={{ background:"#cb3634", color:"white", border:"none", borderRadius:6, padding:"5px 14px", cursor:"pointer", fontWeight:700, fontSize:12 }}>
          Inhabilitar
        </button>
      </div>
      <p className="text-muted text-center mb-1">{isla.IS_DESCRIPCION || "Sin descripción"}</p>
      <p className="text-center mb-3" style={{ fontSize:13, color:"#555" }}>
        Capacidad: <strong>{toNum(isla.IS_CAPACIDAD)}</strong> espacios
      </p>
      {/* PDF #8: islas inhabilitadas no deben ser clickeables */}
      <Isla carros={isla.IS_CAPACIDAD} discapacitados={0} motos={0} catedraticos={0}
        espaciosBackend={isla.espacios} offsetIndex={0} />
    </div>
  );

  const CardInhab = ({ isla }: { isla: IslaAdmin }) => (
    <div className="card-isla p-4 shadow-sm w-100"
      style={{ opacity:0.6, background:"#e5e7eb", border:"2px dashed #9ca3af" }}>
      <div className="d-flex justify-content-between align-items-center mb-2">
        <h5 className="mb-0" style={{ color:"#6b7280" }}>{isla.IS_NOMBRE} — Inhabilitada</h5>
        <button onClick={() => handleHabilitar(isla)}
          style={{ background:"#22c55e", color:"white", border:"none", borderRadius:6, padding:"5px 14px", cursor:"pointer", fontWeight:700, fontSize:12 }}>
          Habilitar
        </button>
      </div>
      <p className="text-muted text-center mb-1">{isla.IS_DESCRIPCION || "Sin descripción"}</p>
      <p className="text-center mb-3" style={{ fontSize:13, color:"#9ca3af" }}>
        Capacidad: <strong>{toNum(isla.IS_CAPACIDAD)}</strong> espacios
      </p>
      {/* Isla inhabilitada: sin handler de selección = no clickeable */}
      <Isla carros={isla.IS_CAPACIDAD} discapacitados={0} motos={0} catedraticos={0}
        espaciosBackend={isla.espacios} offsetIndex={0} />
    </div>
  );

  return (
    <div className="fondo-parqueo">
      <div className="overlay-parqueo">
        <div className="card-parqueo">
          <h4 className="text-center mb-4">Panel Administrativo — Gestión de Parqueo</h4>

          {cargando ? (
            <div className="text-center p-5" style={{ color:"#1f4e79", fontSize:16 }}>Cargando administración...</div>
          ) : (
            <>
              {/* ── RESUMEN ── */}
              <div className="mb-4 p-3" style={{ background:"#1f4e79", borderRadius:12, color:"white" }}>
                <div className="d-flex flex-wrap gap-3 justify-content-between align-items-end">
                  <div>
                    <label style={{ fontSize:13, fontWeight:700 }}>Parqueo</label>
                    <select value={idParqueo}
                      onChange={(e) => { setIdParqueo(Number(e.target.value)); setEspaciosSel([]); }}
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
                    <div style={{ fontSize:30, fontWeight:900, color: colorRestantes(restantes) }}>{restantes}</div>
                    <small>Espacios disponibles para isla</small>
                  </div>
                </div>
              </div>

              {/* ── BOTÓN CREAR ── */}
              <div className="text-center mb-4">
                <button onClick={() => { setMostrarForm(!mostrarForm); setEspaciosSel([]); setDescripcion(""); }}
                  style={{ background:"#1f4e79", color:"white", border:"none", borderRadius:8,
                    padding:"10px 28px", fontWeight:700, cursor:"pointer", fontSize:15 }}>
                  {mostrarForm ? "✕ Cancelar" : "+ Crear Nueva Isla"}
                </button>
              </div>

              {/* ── FORMULARIO CREAR ISLA ── */}
              {mostrarForm && (
                <div className="mb-5 p-4" style={{ background:"#f0f4ff", borderRadius:12, border:"1px solid #1f4e79" }}>
                  <h5 style={{ color:"#1f4e79", marginBottom:4 }}>Nueva isla</h5>
                  <p style={{ fontSize:13, color:"#555", marginBottom:16 }}>
                    Selecciona los espacios agrupados por tipo. La capacidad se calcula automáticamente.
                  </p>
                  <div className="d-flex flex-wrap gap-3 align-items-end mb-4">
                    <div>
                      <label style={{ fontSize:13, fontWeight:700, display:"block", marginBottom:4 }}>Descripción</label>
                      <input type="text" placeholder="Ej: Frente a Edificio A"
                        value={descripcion} onChange={(e) => setDescripcion(e.target.value)}
                        style={{ padding:"7px 10px", borderRadius:6, border:"1px solid #cbd5e1", width:270 }} />
                    </div>
                    <div style={{ fontSize:13, color:"#1f4e79", fontWeight:700 }}>
                      Espacios seleccionados: <span style={{ fontSize:18 }}>{espaciosSel.length}</span>
                    </div>
                    <button onClick={handleCrearIsla}
                      style={{ background:"#22c55e", color:"white", border:"none", borderRadius:8,
                        padding:"9px 22px", fontWeight:700, cursor:"pointer", fontSize:14 }}>
                      Guardar Isla
                    </button>
                  </div>

                  {espaciosDisponibles.length === 0 ? (
                    <div style={{ background:"#fee2e2", borderRadius:8, padding:"12px 16px", color:"#cb3634", fontSize:13 }}>
                      ⚠️ No hay espacios disponibles. Todos los espacios ya están asignados a islas activas.
                    </div>
                  ) : (
                    <div className="d-flex flex-column gap-4">
                      {gruposPorTipo.map((grupo) => {
                        const b = badge(grupo.nombre);
                        const ids = grupo.espacios.map((e) => Number(e.ES_Espacio));
                        const todos = ids.every((id) => espaciosSel.includes(id));
                        return (
                          <div key={grupo.nombre}>
                            <div className="d-flex align-items-center gap-2 mb-2">
                              <span style={{ background:b.bg, color:"white", borderRadius:20, padding:"3px 12px", fontSize:12, fontWeight:700 }}>{b.label}</span>
                              <span style={{ fontSize:12, color:"#6b7280" }}>{grupo.espacios.length} disponibles</span>
                              <button onClick={() => seleccionarGrupo(grupo)}
                                style={{ background:"none", border:"1px solid #1f4e79", borderRadius:6,
                                  padding:"2px 10px", fontSize:11, color:"#1f4e79", cursor:"pointer", fontWeight:700 }}>
                                {todos ? "Quitar todos" : "Seleccionar todos"}
                              </button>
                            </div>
                            <div className="d-flex flex-wrap gap-2">
                              {grupo.espacios.map((espacio) => {
                                const id = Number(espacio.ES_Espacio);
                                const sel = espaciosSel.includes(id);
                                return (
                                  <button key={id} type="button" onClick={() => toggleEspacio(id)}
                                    style={{ border: sel ? `2px solid ${b.bg}` : "1px solid #cbd5e1",
                                      background: sel ? b.bg : "white", color: sel ? "white" : "#1f2937",
                                      borderRadius:8, padding:"7px 11px", fontWeight:700, fontSize:13, cursor:"pointer" }}>
                                    #{espacio.ES_Numero ?? id}
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
                  {islas.map((isla) => <CardActiva key={Number(isla.IS_ISLA)} isla={isla} />)}
                </div>
              )}

              {/* ── ISLAS INHABILITADAS ── */}
              {islasInhab.length > 0 && (
                <div className="mt-5">
                  <button onClick={() => setMostrarInhab(!mostrarInhab)}
                    style={{ background:"none", border:"1px solid #9ca3af", borderRadius:8,
                      padding:"8px 16px", color:"#6b7280", fontWeight:700, cursor:"pointer", fontSize:13, width:"100%" }}>
                    {mostrarInhab ? "▲ Ocultar" : "▼ Ver"} islas inhabilitadas ({islasInhab.length})
                  </button>
                  {mostrarInhab && (
                    <div className="d-flex flex-column align-items-center gap-4 mt-3">
                      {islasInhab.map((isla) => <CardInhab key={Number(isla.IS_ISLA)} isla={isla} />)}
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
