import { NavLink } from "react-router-dom";

import "../styles/Barra.modules.css";
import logo from "../images/logo.png";

import { useEffect } from "react";

const Nav = () => {
  useEffect(() => {
    const offcanvasElement = document.getElementById('offcanvasNavbar');
    offcanvasElement?.addEventListener('hidden.bs.offcanvas', () => {
      document.body.classList.remove('modal-open');
    });
  }, []);

  return (
    <nav className="navbar navbar-expand-lg">
      <div className="container-fluid">
        <img src={logo} alt="Logo" className="img-fluid" width={60} />
        <a className="navbar-brand fw-bold d-none d-sm-block" href="#!">
          Universidad Mariano Galvez de Guatemala
        </a>
        <button
          className="navbar-toggler d-lg-none"
          type="button"
          data-bs-toggle="offcanvas"
          data-bs-target="#offcanvasNavbar"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className="collapse navbar-collapse flex-row-reverse d-none d-lg-flex">
          <ul className="navbar-nav me-5">
            <li className="nav-item me-3">
                <NavLink to="/" className="nav-link">
                  <i className="fi fi-rr-home me-2"></i>Inicio
                </NavLink>
            </li>
            <li className="nav-item me-3">
                <NavLink to="/perfil" className="nav-link">
                  <i className="fi fi-rr-user me-2"></i>Perfil
                </NavLink>
            </li>
            <li className="nav-item me-3">
              <a className="nav-link" href="#!">
                <i className="fi fi-rr-car me-2"></i>Parqueo
              </a>
            </li>
            <li className="nav-item">
              <a className="nav-link" href="#!">
                <i className="fi fi-rr-exit me-2"></i>Salir
              </a>
            </li>
          </ul>
        </div>

        <div
          className="offcanvas offcanvas-end d-lg-none navbarMovile"
          tabIndex="-1"
          id="offcanvasNavbar"
        >
          <div className="offcanvas-header">
            <h5 className="offcanvas-title navbar-brand">Menú</h5>
            <button
              type="button"
              className="btn-close"
              data-bs-dismiss="offcanvas"
            ></button>
          </div>

          <div className="offcanvas-body">
            <ul className="navbar-nav flex-column">
              <li className="nav-item mb-3">
                  <NavLink to="/" className="nav-link">
                    <i className="fi fi-rr-home me-2"></i>Inicio
                  </NavLink>
              </li>
              <li className="nav-item mb-3">
                  <NavLink to="/perfil" className="nav-link">
                    <i className="fi fi-rr-user me-2"></i>Perfil
                  </NavLink>
              </li>
              <li className="nav-item mb-3">
                <a className="nav-link" href="#!">
                  <i className="fi fi-rr-car me-2"></i>Parqueo
                </a>
              </li>
              <li className="nav-item">
                <a className="nav-link" href="#!">
                  <i className="fi fi-rr-exit me-2"></i>Salir
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Nav;
