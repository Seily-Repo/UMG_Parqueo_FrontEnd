import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import App from "./App";
import reportWebVitals from "./reportWebVitals";
import "bootstrap/dist/css/bootstrap.min.css";
import "@flaticon/flaticon-uicons/css/all/all.css";
import Parqueo from "./pages/Parqueo";
import ParqueoAdmin from "./pages/ParqueoAdmin";
import StudentLayout from "./layouts/StudentLayout";
import AdminLayout from "./layouts/AdminLayout";
import "./index.css";

const rootElement = document.getElementById("root");

const urlParams = new URLSearchParams(window.location.search);
const urlToken = urlParams.get("token");
if (urlToken) {
  localStorage.setItem("token", urlToken);
  try {
    const base64Url = urlToken.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
    const payload = JSON.parse(jsonPayload);
    
    const userData = {
      carne: payload.carne || payload.LR_CARNE,
      nombres: payload.nombres || "",
      apellidos: payload.apellidos || "",
      rol: payload.rol
    };

    if (payload.rol === 'ADMINISTRADOR') {
      localStorage.setItem("usuarioAdmin", JSON.stringify(userData));
    } else {
      localStorage.setItem("usuarioParqueo", JSON.stringify(userData));
    }
  } catch (e) {
    console.error("Error decoding token", e);
  }
  window.history.replaceState({}, document.title, window.location.pathname);
}

if (!rootElement) {
  throw new Error("No se encontro el elemento root");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <BrowserRouter basename="/disponibilidad">
      <Routes>
        <Route path="/" element={<Navigate to="/parqueo" replace />} />
        <Route path="/inicio" element={<App />} />
        <Route
          path="/parqueo"
          element={
            <StudentLayout activeSection="disponibilidad">
              <Parqueo />
            </StudentLayout>
          }
        />
        <Route
          path="/admin"
          element={
            <AdminLayout activeSection="islas">
              <ParqueoAdmin />
            </AdminLayout>
          }
        />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);

reportWebVitals();
