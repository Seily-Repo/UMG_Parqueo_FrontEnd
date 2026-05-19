import Espacio from "./Espacio";
import type { TipoEspacioApi } from "../services/api";

export type TipoEspacio = "discapacitado" | "catedratico" | "carro" | "moto";

export interface EspacioBackend {
  ES_Espacio?: number;
  id_espacio?: number;
  ES_Numero?: number;
  ES_Estado?: number;
  estado_fisico?: number | null;
  TES_ESPACIO?: number;
  tipo?: number | string;
  TipoEspacio?: TipoEspacioApi;
}

interface IslaProps {
  carros?: number;
  motos?: number;
  discapacitados?: number;
  catedraticos?: number;
  espaciosBackend?: EspacioBackend[];
  offsetIndex?: number;
  onSeleccionar?: (idEspacio?: number) => void;
}

const normalizarTipo = (espacio?: EspacioBackend): TipoEspacio => {
  const nombreTipo = espacio?.TipoEspacio?.TES_NOMBRE ?? String(espacio?.tipo ?? "").toLowerCase();

  if (nombreTipo.includes("moto")) return "moto";
  if (nombreTipo.includes("cated")) return "catedratico";
  if (nombreTipo.includes("discap")) return "discapacitado";

  return "carro";
};

export default function Isla({
  carros = 8,
  motos = 5,
  discapacitados = 2,
  catedraticos = 0,
  espaciosBackend = [],
  offsetIndex = 0,
  onSeleccionar
}: IslaProps) {

  const espaciosLocales: TipoEspacio[] = [
    ...Array(discapacitados).fill("discapacitado"),
    ...Array(catedraticos).fill("catedratico"),
    ...Array(carros).fill("carro"),
    ...Array(motos).fill("moto")
  ];

  const espacios = espaciosBackend.length > 0
    ? espaciosBackend
    : espaciosLocales.map((tipo, index) => ({
        ES_Espacio: undefined,
        ES_Numero: offsetIndex + index + 1,
        ES_Estado: 1,
        tipo
      }));

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(5, 70px)",
        gap: "15px",
        justifyContent: "center"
      }}
    >
      {espacios.map((espacioActual, index) => {
        const tipo = normalizarTipo(espacioActual);
        const idEspacio = espacioActual.ES_Espacio ?? espacioActual.id_espacio;
        const numero = espacioActual.ES_Numero ?? idEspacio ?? offsetIndex + index + 1;
        const ocupado = espacioActual.ES_Estado === 0 || espacioActual.estado_fisico === 0;

        return (
          <Espacio
            key={index}
            numero={numero}
            tipo={tipo}
            discapacitado={tipo === "discapacitado"}
            ocupado={ocupado}
            onClick={() => onSeleccionar?.(idEspacio)}
          />
        );
      })}
    </div>
  );
}