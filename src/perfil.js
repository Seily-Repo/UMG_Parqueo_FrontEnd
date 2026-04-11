export default function Espacio({ numero }) {
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

