import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import App from "./App";
import reportWebVitals from "./reportWebVitals";
import "bootstrap/dist/css/bootstrap.min.css";
import "@flaticon/flaticon-uicons/css/all/all.css";
import Parqueo from "./pages/Parqueo";
import ParqueoAdmin from "./pages/ParqueoAdmin";
import "./index.css";
import { isAuthenticated, persistAuthFromUrl, userHasRole } from "./services/auth";

const rootElement = document.getElementById("root");

persistAuthFromUrl();

if (!rootElement) {
  throw new Error("No se encontro el elemento root");
}

const ProtectedRoute = ({
  roles,
  children,
}: {
  roles: string[];
  children: JSX.Element;
}) => {
  if (!isAuthenticated()) return <Navigate to="/inicio" replace />;
  if (!userHasRole(roles)) return <Navigate to="/inicio" replace />;
  return children;
};

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <BrowserRouter basename="/">
      <Routes>
        <Route path="/" element={<Navigate to="/inicio" replace />} />
        <Route path="/inicio" element={<App />} />
        <Route
          path="/parqueo"
          element={
            <ProtectedRoute roles={["USUARIO", "ESTUDIANTE"]}>
              <Parqueo />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin"
          element={
            <ProtectedRoute roles={["ADMINISTRADOR"]}>
              <ParqueoAdmin />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to="/inicio" replace />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);

reportWebVitals();
