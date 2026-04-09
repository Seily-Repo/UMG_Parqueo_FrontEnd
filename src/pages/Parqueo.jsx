import Isla from "../components/Isla";
import Nav from "../components/nav";
import "../styles/Parqueo.css";

export default function Parqueo() {
  return (
    <>
      <Nav />

      <div className="fondo-parqueo">
        <div className="overlay-parqueo">
          <div className="card-parqueo">

            <div className="d-flex flex-column align-items-center gap-4">

              {/* ISLA A */}
              <div className="card p-4 shadow-sm w-100">
                <h5 className="text-center mb-3">Isla A</h5>
                <p className="text-muted">Frente a Edificio A</p>
                <Isla carros={5} motos={5} />
              </div>

              {/* ISLA B */}
              <div className="card p-4 shadow-sm w-100">
                <h5 className="text-center mb-3">Isla B</h5>
                <p className="text-muted">Frente a Edificio A</p>
                <Isla carros={5} motos={5} />
              </div>

            </div>

          </div>
        </div>
      </div>
    </>
  );
}