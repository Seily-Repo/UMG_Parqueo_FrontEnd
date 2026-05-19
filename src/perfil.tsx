interface PerfilProps {
  numero?: number;
}

export default function Perfil({ numero = 0 }: PerfilProps) {
  return (
    <div
      style={{
        width: "60px",
        height: "100px",
        backgroundColor: "#ccc",
        border: "1px solid black",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontWeight: "bold"
      }}
    >
      {numero}
    </div>
  );
}

