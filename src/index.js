import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import App from "./App";
import reportWebVitals from "./reportWebVitals";
import "bootstrap/dist/css/bootstrap.min.css";
import "@flaticon/flaticon-uicons/css/all/all.css";
import Perfil from "./perfil";
import Parqueo from "./pages/Parqueo";
import ParqueoAdmin from "./pages/ParqueoAdmin";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/parqueo" element={<Parqueo />} />
        <Route path="/perfil" element={<Perfil />} />
        <Route path="/admin/parqueo" element={<ParqueoAdmin />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);

reportWebVitals();