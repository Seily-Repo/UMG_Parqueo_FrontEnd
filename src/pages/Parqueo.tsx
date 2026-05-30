import { useCallback, useEffect, useMemo, useState } from "react";
import Swal from "sweetalert2";
import Isla, { type EspacioBackend } from "../components/Isla";
import {
  asignarEspacio,
  obtenerDetalleIsla,
  obtenerEspaciosLibres,
  obtenerEspaciosOcupados,
  obtenerIslas,
  obtenerParqueos,
  type EspacioApi,
} from "../services/api";
import { isAuthenticated, getStoredUser } from "../services/auth";
import "../styles/Parqueo.css";

interface IslaVista {
  id: number;
  nombre: string;
  descripcion: string;
  carros: number;
  motos: number;
  discapacitados: number;
  catedraticos: number;
  espacios: EspacioBackend[];
}

interface ParqueoOpcion {
  PQ_Parqueo: number;
  PQ_Nombre:  string;
}

interface AsignacionGuardada {
  espacioId:       number;
  islaNombre:      string;
  islaDescripcion: string;
}

const ID_CICLO   = Number(process.env.REACT_APP_ID_CICLO   || 1);
const ID_JORNADA = Number(process.env.REACT_APP_ID_JORNADA || 1);
const LOGIN_URL  = (process.env.REACT_APP_LOGIN_URL || "http://10.0.40.10/login").trim();
const STORAGE_KEY = `umg_asignacion_${ID_CICLO}_${ID_JORNADA}`;

const ordenarEspacios = (espacios: EspacioApi[]) =>
  [...espacios].sort((a, b) => (a.ES_Numero ?? a.ES_Espacio) - (b.ES_Numero ?? b.ES_Espacio));

const obtenerCarneUsuario = (): number | null => {
  const user = getStoredUser();
  if (!user?.carne) return null;
  return Number(String(user.carne).replace(/-/g, ""));
};

const guardarAsignacionLocal = (data: AsignacionGuardada) => {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(data)); } catch {}
};

const leerAsignacionLocal = (): AsignacionGuardada | null => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
};

export default function Parqueo() {
  const [espacios,      setEspacios]      = useState<EspacioApi[]>([]);
  const [islasBackend,  setIslasBackend]  = useState<IslaVista[]>([]);
  const [parqueos,      setParqueos]      = useState<ParqueoOpcion[]>([]);
  const [parqueoId,     setParqueoId]     = useState<number | null>(null);
  const [cargando,      setCargando]      = useState(true);
  const [cargandoIslas, setCargandoIslas] = useState(false);
  const [asignacion,    setAsignacion]    = useState<AsignacionGuardada | null>(
    () => leerAsignacionLocal()
  );

  useEffect(() => {
    if (!isAuthenticated()) window.location.replace(LOGIN_URL);
  }, []);

  // Cargar lista de parqueos al montar
  useEffect(() => {
    const cargarParqueos = async () => {
      try {
        const res = await obtenerParqueos();
        const lista = ((res.data as any).data ?? []) as ParqueoOpcion[];
        setParqueos(lista);
        if (lista.length > 0) setParqueoId(Number(lista[0].PQ_Parqueo));
      } catch {
        Swal.fire({ icon: "error", title: "No se pudieron cargar los parqueos",
          text: "Verifica tu conexión con el backend." });
      }
    };
    if (isAuthenticated()) cargarParqueos();
  }, []);

  const cargarDisponibilidad = useCallback(async (idParqueo: number) => {
    if (!isAuthenticated()) return;
    setCargandoIslas(true);
    try {
      const [libresRes, ocupadosRes] = await Promise.all([
        obtenerEspaciosLibres(ID_CICLO, ID_JORNADA),
        obtenerEspaciosOcupados(ID_CICLO, ID_JORNADA),
      ]);

      const espaciosPorId = new Map<number, EspacioApi>();

      (libresRes.data.details ?? []).forEach((espacio) => {
        espaciosPorId.set(Number(espacio.ES_Espacio), { ...espacio, ES_Estado: 1 });
      });

      (ocupadosRes.data.details ?? []).forEach((asignacion) => {
        const id = Number(asignacion.ES_Espacio);
        espaciosPorId.set(id, {
          ...espaciosPorId.get(id),
          ES_Espacio: id,
          ES_Estado: 0,
        });
      });

      setEspacios(ordenarEspacios(Array.from(espaciosPorId.values())));

      const islasRes     = await obtenerIslas(idParqueo, 1);
      const islasActivas = islasRes.data.details ?? [];

      const islasConDetalle = await Promise.all(
        islasActivas.map(async (isla) => {
          try {
            const detalleRes = await obtenerDetalleIsla(Number(isla.IS_ISLA));
            const detalle    = detalleRes.data.details ?? [];
            return {
              id:             Number(isla.IS_ISLA),
              nombre:         isla.IS_NOMBRE,
              descripcion:    isla.IS_DESCRIPCION || "",
              carros:         isla.IS_CAPACIDAD,
              motos:          0,
              discapacitados: 0,
              catedraticos:   0,
              espacios: detalle.map((e: any) => {
                const idEspacio  = Number(e.id_espacio);
                const estadoDisp = espaciosPorId.get(idEspacio);
                return {
                  id_espacio:    idEspacio,
                  ES_Espacio:    idEspacio,
                  ES_Estado:     estadoDisp?.ES_Estado ?? e.estado_fisico ?? 1,
                  estado_fisico: e.estado_fisico,
                  tipo:          e.tipo,
                };
              }),
            };
          } catch {
            return {
              id: Number(isla.IS_ISLA), nombre: isla.IS_NOMBRE,
              descripcion: isla.IS_DESCRIPCION || "",
              carros: isla.IS_CAPACIDAD, motos: 0, discapacitados: 0, catedraticos: 0,
              espacios: [],
            };
          }
        })
      );

      setIslasBackend(islasConDetalle);
    } catch (error: any) {
      console.error("Error al traer disponibilidad:", error);
      Swal.fire({ icon: "error", title: "No se pudo cargar la disponibilidad",
        text: "Verifica el backend y los parámetros de ciclo/jornada." });
    } finally {
      setCargandoIslas(false);
      setCargando(false);
    }
  }, []);

  // Recargar islas cuando cambia el parqueo seleccionado
  useEffect(() => {
    if (parqueoId !== null) cargarDisponibilidad(parqueoId);
  }, [parqueoId, cargarDisponibilidad]);

  const handleSeleccion = async (idEspacio?: number) => {
    if (!idEspacio || asignacion) return;
    if (!isAuthenticated()) { window.location.replace(LOGIN_URL); return; }

    const carneUsuario = obtenerCarneUsuario();
    if (!carneUsuario) {
      Swal.fire({ icon: "error", title: "Sesión incompleta",
        text: "No se encontró el carné del usuario en la sesión.", confirmButtonColor: "#cb3634" });
      return;
    }

    const { value: correlativo } = await Swal.fire<string>({
      title:             "Validar pago",
      html:              `<p style="margin-bottom:8px">Ingresa el correlativo de pago para reservar el espacio <strong>#${idEspacio}</strong></p>`,
      input:             "text",
      inputPlaceholder:  "Ej: CORR-2024-001",
      showCancelButton:  true,
      confirmButtonText: "Validar y reservar",
      cancelButtonText:  "Cancelar",
      confirmButtonColor: "#22c55e",
      inputValidator:    (v) => (!v?.trim() ? "El correlativo es obligatorio." : null),
    });

    if (!correlativo || parqueoId === null) return;

    try {
      const res = await asignarEspacio({
        carne_usuario: carneUsuario,
        ES_Espacio:    idEspacio,
        id_ciclo:      ID_CICLO,
        id_jornada:    ID_JORNADA,
        correlativo:   correlativo.trim(),
      });

      await cargarDisponibilidad(parqueoId);

      const islaDelEspacio = islasBackend.find((isla) =>
        isla.espacios.some((e) => Number(e.ES_Espacio) === idEspacio || Number(e.id_espacio) === idEspacio)
      );

      const parqueoNombre = parqueos.find((p) => Number(p.PQ_Parqueo) === parqueoId)?.PQ_Nombre ?? "";

      const nuevaAsignacion: AsignacionGuardada = {
        espacioId:       idEspacio,
        islaNombre:      islaDelEspacio?.nombre  ?? "Isla",
        islaDescripcion: islaDelEspacio?.descripcion ?? parqueoNombre,
      };

      guardarAsignacionLocal(nuevaAsignacion);
      setAsignacion(nuevaAsignacion);

      Swal.fire({
        icon: "success",
        title: "¡Espacio asignado!",
        html: `
          <div style="text-align:center; padding:8px 0;">
            <div style="font-size:48px; margin-bottom:8px">🚗</div>
            <p style="font-size:13px; color:#6b7280; margin-bottom:4px">${parqueoNombre}</p>
            <p style="font-size:18px; font-weight:700; color:#1f4e79; margin-bottom:4px">
              ${nuevaAsignacion.islaNombre}
            </p>
            <p style="font-size:28px; font-weight:900; color:#22c55e; margin-bottom:4px">
              Espacio #${idEspacio}
            </p>
            ${nuevaAsignacion.islaDescripcion
              ? `<p style="font-size:13px; color:#6b7280;">${nuevaAsignacion.islaDescripcion}</p>`
              : ""}
            <p style="font-size:13px; color:#6b7280; margin-top:8px">${res.data.message ?? ""}</p>
          </div>`,
        confirmButtonText: "¡Listo!",
        confirmButtonColor: "#22c55e",
      });
    } catch (error: any) {
      Swal.fire({ icon: "error", title: "No se pudo asignar",
        text: error?.response?.data?.message || "El backend rechazó la asignación.",
        confirmButtonColor: "#cb3634" });
    }
  };

  const islas               = islasBackend;
  const totalEspacios       = islas.reduce((s, i) => s + (i.espacios?.length ?? i.carros), 0);
  const libres              = espacios.filter((e) => Number(e.ES_Estado) !== 0).length;
  const ocupados            = espacios.filter((e) => Number(e.ES_Estado) === 0).length;
  const totalDiscapacitados = islas.reduce((s, i) => s + i.discapacitados, 0);

  const islaOffsets = useMemo(() => {
    return islas.reduce<Record<number, number>>((acc, isla, i) => {
      const prev      = acc[i - 1] ?? 0;
      const prevIsla  = islas[i - 1];
      const prevTotal = prevIsla
        ? (prevIsla.espacios?.length ?? prevIsla.carros + prevIsla.motos + prevIsla.discapacitados + prevIsla.catedraticos)
        : 0;
      acc[i] = prev + prevTotal;
      return acc;
    }, {});
  }, [islas]);

  if (cargando && parqueos.length === 0) {
    return (
      <div className="fondo-parqueo">
        <div className="overlay-parqueo">
          <div className="card-parqueo text-center p-5" style={{ color: "#1f4e79" }}>
            Cargando parqueos...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fondo-parqueo">
      <div className="overlay-parqueo">
        <div className="card-parqueo">

          {/* SELECTOR DE PARQUEO */}
          {parqueos.length > 1 && (
            <div className="mb-4">
              <label style={{ fontWeight: 600, color: "#1f4e79", marginBottom: 6, display: "block" }}>
                Selecciona tu parqueo
              </label>
              <select
                className="form-select"
                value={parqueoId ?? ""}
                onChange={(e) => {
                  setParqueoId(Number(e.target.value));
                  setIslasBackend([]);
                }}
              >
                {parqueos.map((p) => (
                  <option key={p.PQ_Parqueo} value={p.PQ_Parqueo}>
                    {p.PQ_Nombre}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* RESUMEN */}
          <div className="mb-4 p-3" style={{ background: "#1f4e79", borderRadius: 10, color: "white" }}>
            <h5 className="text-center mb-3">Resumen del Parqueo</h5>
            <div className="d-flex justify-content-around flex-wrap gap-3">
              <div className="text-center">
                <div style={{ fontSize: 28, fontWeight: 900 }}>{islas.length}</div>
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
                <small>Discapacitados</small>
              </div>
            </div>
            <div className="mt-3" style={{ height: 10, borderRadius: 99, background: "rgba(255,255,255,0.2)", overflow: "hidden" }}>
              <div style={{
                height: "100%", borderRadius: 99, transition: "width 0.5s",
                background: ocupados === 0 ? "#22c55e" : ocupados / (totalEspacios || 1) > 0.8 ? "#cb3634" : "#eab308",
                width: `${totalEspacios ? (ocupados / totalEspacios) * 100 : 0}%`,
              }} />
            </div>
            <div className="d-flex justify-content-between mt-1" style={{ fontSize: 11, opacity: 0.7 }}>
              <span>0%</span><span>Ocupación</span><span>100%</span>
            </div>
            <div className="d-flex justify-content-center gap-3 mt-2" style={{ fontSize: 12 }}>
              <span>🟢 Libre</span><span>🔴 Ocupado</span><span>🔵 Discapacitado</span>
            </div>
          </div>

          {/* BANNER DE ESPACIO ASIGNADO */}
          {asignacion && (
            <div className="mb-4 p-3 text-center" style={{
              background: "linear-gradient(135deg, #22c55e, #16a34a)",
              borderRadius: 10, color: "white",
            }}>
              <div style={{ fontSize: 32 }}>🚗</div>
              <div style={{ fontSize: 14, opacity: 0.9, marginTop: 2 }}>Tu espacio asignado</div>
              <div style={{ fontSize: 26, fontWeight: 900, margin: "4px 0" }}>
                {asignacion.islaNombre} — Espacio #{asignacion.espacioId}
              </div>
              {asignacion.islaDescripcion && (
                <div style={{ fontSize: 13, opacity: 0.85 }}>{asignacion.islaDescripcion}</div>
              )}
            </div>
          )}

          {/* ISLAS */}
          {cargandoIslas ? (
            <div className="text-center p-4" style={{ color: "#1f4e79" }}>Cargando disponibilidad...</div>
          ) : islas.length === 0 ? (
            <div className="text-center p-4" style={{ color: "#9ca3af" }}>
              No hay islas activas en este parqueo.
            </div>
          ) : (
            <div className="d-flex flex-column align-items-center gap-4">
              {islas.map((isla, i) => (
                <div key={isla.id} className="card-isla p-4 shadow-sm w-100">
                  <h5 className="text-center mb-1">{isla.nombre}</h5>
                  <p className="text-muted text-center mb-3" style={{ fontSize: 13 }}>{isla.descripcion}</p>
                  <Isla
                    carros={isla.carros}
                    discapacitados={isla.discapacitados}
                    motos={isla.motos}
                    catedraticos={isla.catedraticos}
                    espaciosBackend={isla.espacios}
                    offsetIndex={islaOffsets[i] ?? 0}
                    onSeleccionar={asignacion ? undefined : handleSeleccion}
                  />
                </div>
              ))}
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
