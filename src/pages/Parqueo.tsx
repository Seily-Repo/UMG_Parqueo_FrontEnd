import { useCallback, useEffect, useMemo, useState } from "react";
import Swal from "sweetalert2";
import Isla, { type EspacioBackend } from "../components/Isla";
import MessageBox from "../components/Mensaje";
import {
  asignarEspacio,
  getAuthToken,
  obtenerDetalleIsla,
  obtenerEspaciosLibres,
  obtenerEspaciosOcupados,
  obtenerIslas,
  type EspacioApi,
} from "../services/api";
import "../styles/Parqueo.css";

interface IslaLocal {
  nombre: string;
  descripcion: string;
  carros: number;
  motos: number;
  discapacitados: number;
  catedraticos: number;
}

interface IslaVista extends IslaLocal {
  id?: number;
  espacios?: EspacioBackend[];
}

const ID_CICLO = Number(process.env.REACT_APP_ID_CICLO || 1);
const ID_JORNADA = Number(process.env.REACT_APP_ID_JORNADA || 1);

const ISLAS: IslaLocal[] = [
  { nombre: "Isla A", descripcion: "Frente a Edificio A", carros: 10, motos: 5, discapacitados: 5, catedraticos: 3 },
  { nombre: "Isla B", descripcion: "Frente a Edificio B", carros: 10, motos: 4, discapacitados: 5, catedraticos: 2 },
  { nombre: "Isla C", descripcion: "Frente a Edificio C", carros: 10, motos: 6, discapacitados: 5, catedraticos: 1 },
  { nombre: "Isla D", descripcion: "Ubicada al lado izquierdo del Edificio C", carros: 8, motos: 3, discapacitados: 2, catedraticos: 0 },
];

const obtenerCarneUsuario = () => {
  const usuarioRaw = localStorage.getItem("usuarioParqueo") || localStorage.getItem("usuarioAdmin");
  if (!usuarioRaw) return null;
  try {
    const usuario = JSON.parse(usuarioRaw);
    const carne = usuario.carne ?? usuario.carne_usuario ?? usuario.LR_CARNE;
    return carne ? Number(String(carne).replace(/-/g, "")) : null;
  } catch {
    return null;
  }
};

const ordenarEspacios = (espacios: EspacioApi[]) => {
  return [...espacios].sort((a, b) => (a.ES_Numero ?? a.ES_Espacio) - (b.ES_Numero ?? b.ES_Espacio));
};

export default function Parqueo() {
  const [showModal, setShowModal] = useState(false);
  const [espacios, setEspacios] = useState<EspacioApi[]>([]);
  const [islasBackend, setIslasBackend] = useState<IslaVista[]>([]);
  const [cargando, setCargando] = useState(true);

  const cargarDisponibilidad = useCallback(async () => {

    setCargando(true);
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
        const idEspacio = Number(asignacion.ES_Espacio);
        const espacioActual = espaciosPorId.get(idEspacio);
        espaciosPorId.set(idEspacio, {
          ...espacioActual,
          ES_Espacio: idEspacio,
          ES_Estado: 0,
        });
      });

      const espaciosCombinados = ordenarEspacios(Array.from(espaciosPorId.values()));
      setEspacios(espaciosCombinados);

      try {
        const islasRes = await obtenerIslas(undefined, 1);
        const islasActivas = islasRes.data.details ?? [];

        const islasConDetalle = await Promise.all(
          islasActivas.map(async (isla) => {
            const detalleRes = await obtenerDetalleIsla(Number(isla.IS_ISLA));
            const detalle = detalleRes.data.details ?? [];
            return {
              id: Number(isla.IS_ISLA),
              nombre: isla.IS_NOMBRE,
              descripcion: isla.IS_DESCRIPCION || "",
              carros: isla.IS_CAPACIDAD,
              motos: 0,
              discapacitados: 0,
              catedraticos: 0,
              espacios: detalle.map((espacio) => {
                const idEspacio = Number(espacio.id_espacio);
                const estadoDisponibilidad = espaciosPorId.get(idEspacio);
                return {
                  ...estadoDisponibilidad,
                  id_espacio: idEspacio,
                  ES_Espacio: idEspacio,
                  ES_Estado: estadoDisponibilidad?.ES_Estado ?? espacio.estado_fisico ?? 1,
                  estado_fisico: espacio.estado_fisico,
                  tipo: espacio.tipo,
                };
              }),
            };
          })
        );

        setIslasBackend(islasConDetalle);
      } catch {
        setIslasBackend([]);
      }
    } catch (error: any) {
      console.error("Error al traer disponibilidad:", error);
      const status = error?.response?.status;
      Swal.fire({
        icon: "error",
        title: "No se pudo cargar la disponibilidad",
        text: "Verifica el backend y los parametros de ciclo/jornada.",
      });
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => {
    cargarDisponibilidad();
  }, [cargarDisponibilidad]);

  const handleSeleccion = async (idEspacio?: number) => {
    if (!idEspacio) return;

    const token = getAuthToken();
    const carneUsuario = obtenerCarneUsuario();

    const { value: correlativo } = await Swal.fire<string>({
      title: "Correlativo de pago",
      input: "text",
      inputPlaceholder: "Ingresa el correlativo",
      showCancelButton: true,
      confirmButtonText: "Reservar",
      cancelButtonText: "Cancelar",
      confirmButtonColor: "#22c55e",
      inputValidator: (value) => (!value ? "El correlativo es obligatorio." : null),
    });

    if (!correlativo) return;

    try {
      const res = await asignarEspacio({
        carne_usuario: carneUsuario,
        ES_Espacio: idEspacio,
        id_ciclo: ID_CICLO,
        id_jornada: ID_JORNADA,
        correlativo,
      });

      await cargarDisponibilidad();

      Swal.fire({
        icon: "success",
        title: "Espacio asignado",
        text: res.data.message,
        confirmButtonColor: "#22c55e",
      });
    } catch (error: any) {
      Swal.fire({
        icon: "error",
        title: "No se pudo asignar",
        text: error?.response?.data?.message || "El backend rechazo la asignacion.",
        confirmButtonColor: "#cb3634",
      });
    }
  };

  const islaOffsets = useMemo(() => {
    return ISLAS.reduce<Record<number, number>>((acc, isla, i) => {
      const prev = acc[i - 1] ?? 0;
      const prevIsla = ISLAS[i - 1];
      const prevTotal = prevIsla
        ? prevIsla.carros + prevIsla.motos + prevIsla.discapacitados + prevIsla.catedraticos
        : 0;
      acc[i] = prev + prevTotal;
      return acc;
    }, {});
  }, []);

  // Se muestran islas base solo como respaldo visual si el backend no responde con islas.
  const islasBase = islasBackend.length > 0 ? islasBackend : ISLAS;
  const islas: IslaVista[] = islasBase;

  const totalEspacios = islas.reduce(
    (sum, isla) =>
      sum + (isla.espacios?.length ?? isla.carros + isla.motos + isla.discapacitados + isla.catedraticos),
    0
  );
  const libres = espacios.filter((e) => e.ES_Estado !== 0).length;
  const ocupados = espacios.filter((e) => e.ES_Estado === 0).length;
  const totalDiscapacitados = islas.reduce((sum, i) => sum + i.discapacitados, 0);

  return (
    <div className="fondo-parqueo">
      <div className="overlay-parqueo">
        <div className="card-parqueo">

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
                height: "100%",
                width: totalEspacios > 0 ? `${(ocupados / totalEspacios) * 100}%` : "0%",
                background: "linear-gradient(90deg, #22c55e, #cb3634)",
                borderRadius: 99,
                transition: "width 0.5s",
              }} />
            </div>
            <div className="d-flex justify-content-between mt-1">
              <small>0%</small>
              <small>Ocupacion</small>
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
              <small>Discapacitado</small>
            </div>
          </div>

          {/* ISLAS */}
          {cargando ? (
            <div className="text-center p-4">Cargando disponibilidad...</div>
          ) : (
            <div className="d-flex flex-column align-items-center gap-4">
              {islas.map((isla, index) => (
                <div key={isla.id ?? `extra-${index}`} className="card-isla p-4 shadow-sm w-100">
                  <h5 className="text-center mb-1">{isla.nombre}</h5>
                  <p className="text-muted text-center mb-3">{isla.descripcion}</p>
                  <Isla
                    carros={isla.carros}
                    motos={isla.motos}
                    discapacitados={isla.discapacitados}
                    catedraticos={isla.catedraticos}
                    espaciosBackend={isla.espacios ?? espacios}
                    offsetIndex={isla.espacios ? 0 : islaOffsets[index] ?? 0}
                    onSeleccionar={handleSeleccion}
                  />
                </div>
              ))}
            </div>
          )}

          <div style={{ padding: "50px", textAlign: "center" }}>
            <button
              onClick={() => setShowModal(true)}
              style={{
                background: "rgba(255,255,255,0.2)",
                color: "white",
                borderRadius: "10%",
                padding: "10px",
                backgroundColor: "#1a6db5",
                paddingLeft: "8%",
                paddingRight: "8%",
              }}
            >
              Siguiente
            </button>

            <MessageBox
              isOpen={showModal}
              onClose={() => setShowModal(false)}
              title="Estas seguro?"
              message="Despues de aceptar este puesto no podras cambiarlo"
              buttonText="Entendido"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
