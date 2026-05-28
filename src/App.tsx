import "./App.css";
import { getStoredUser, isAuthenticated, normalizeRole } from "./services/auth";
import { Link } from "react-router-dom";
function App() {
  const user = getStoredUser();
  const role = normalizeRole(user?.rol);
  const targetPath = role === "ADMINISTRADOR" ? "/admin" : "/parqueo";

  return (
    <div className="container" style={{ marginTop: "90px" }}>
      <div className="card p-4 shadow-sm mx-auto" style={{ maxWidth: 560 }}>
        <h3 className="mb-3">Disponibilidad de parqueo</h3>
        {isAuthenticated() ? (
          <>
            <p className="text-muted">
              Tu sesión esta activa. Ingresa a tu vista correspondiente para continuar.
            </p>
              <Link className="btn btn-primary" to={targetPath}>
                Ir a disponibilidad
              </Link>
          </>
        ) : (
          <p className="text-muted mb-0">
            Inicia sesión desde MiUMG para consultar o administrar los espacios de parqueo.
          </p>
        )}
      </div>
    </div>
  );
}

export default App;
