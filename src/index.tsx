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

if (!rootElement) {
  throw new Error("No se encontro el elemento root");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/disponibilidad/parqueo" replace />} />
        <Route path="/inicio" element={<App />} />
        <Route
          path="/disponibilidad/parqueo"
          element={
            <StudentLayout activeSection="disponibilidad">
              <Parqueo />
            </StudentLayout>
          }
        />
        <Route
          path="/disponibilidad/admin"
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
