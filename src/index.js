import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Route, Routes} from "react-router-dom";
import App from "./App";
import reportWebVitals from "./reportWebVitals";

import "bootstrap/dist/css/bootstrap.min.css";
import "@flaticon/flaticon-uicons/css/all/all.css";
import Perfil from "./perfil";
import Reportes from "./reportes";
import InicioAdmin from "./inicioAdmin";
import ReporteFinanciero from "./reportes/financieros";
import ReporteGerencial from "./reportes/gerenciales";
import ReporteAdministrativo from "./reportes/administrativos";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
          <Route path="/" element={<App />} />
          <Route path="/perfil" element={<Perfil />} />
          <Route path="/reportes" element={<Reportes />} />
          <Route path="/inicioAdmin" element={<InicioAdmin />} />
          <Route path="/reportes/financieros" element={<ReporteFinanciero />} />
          <Route path="/reportes/gerenciales" element={<ReporteGerencial />} />
          <Route path="/reportes/administrativos" element={<ReporteAdministrativo />} />
        </Routes>
    </BrowserRouter>
  </React.StrictMode>,
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
