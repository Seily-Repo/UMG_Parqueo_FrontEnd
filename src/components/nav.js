import { NavLink } from "react-router-dom";
import "../styles/Barra.modules.css";
import logo from "../images/logo.png";

import { useEffect, useRef } from "react";
import { Offcanvas } from "bootstrap";

const Nav = () => {
  const offcanvasRef = useRef(null);
  const offcanvasInstance = useRef(null);

  useEffect(() => {
    if (offcanvasRef.current) {
      offcanvasInstance.current = new Offcanvas(offcanvasRef.current);
    }
  }, []);

  const openMenu = () => {
    offcanvasInstance.current?.show();
  };

  const closeMenu = () => {
    offcanvasInstance.current?.hide();
  };

  return (
    <nav className="navbar navbar-expand-lg">
      <div className="container-fluid">
        <img src={logo} 
              alt="Logo" 
              className="img-fluid ms-2" 
              width={60} 
        />
        <a className="navbar-brand fw-bold d-none d-sm-block titulo-nav" href="#!">
          Universidad Mariano Gálvez de Guatemala
        </a>
        <button
          className="navbar-toggler d-lg-none"
          type="button"
          onClick={openMenu}
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
              <NavLink to="/parqueo" className="nav-link">
                <i className="fi fi-rr-car me-2"></i>Parqueo
              </NavLink>
            </li>

            <li className="nav-item">
              <a className="nav-link" href="#!">
                <i className="fi fi-rr-exit me-2"></i>Salir
              </a>
            </li>
          </ul>
        </div>

        <div
          ref={offcanvasRef}
          className="navbarMobile offcanvas offcanvas-end d-lg-none"
        >
          <div className="offcanvas-header">
            <h5 className="offcanvas-title navbar-brand">Menú</h5>
            <button
              type="button"
              className="btn-close"
              onClick={closeMenu}
            ></button>
          </div>

          <div className="offcanvas-body">
            <ul className="navbar-nav flex-column">
              <li className="nav-item mb-3">
                <NavLink to="/" className="nav-link" onClick={closeMenu}>
                  <i className="fi fi-rr-home me-2"></i>Inicio
                </NavLink>
              </li>

              <li className="nav-item mb-3">
                <NavLink to="/perfil" className="nav-link" onClick={closeMenu}>
                  <i className="fi fi-rr-user me-2"></i>Perfil
                </NavLink>
              </li>

              <li className="nav-item mb-3">
                <NavLink to="/parqueo" className="nav-link" onClick={closeMenu}>
                  <i className="fi fi-rr-car me-2"></i>Parqueo
                </NavLink>
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
