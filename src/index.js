import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Route, Routes} from "react-router-dom";
import App from "./App";
import reportWebVitals from "./reportWebVitals";

import "bootstrap/dist/css/bootstrap.min.css";
import "@flaticon/flaticon-uicons/css/all/all.css";
import Perfil from "./perfil";
import Parqueo from "./pages/Parqueo";

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
const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
          <Route path="/" element={<App />} />
          <Route path="/parqueo" element={<Parqueo />} />
          <Route path="/perfil" element={<Perfil />} />
          <Route path="/parqueo" element={<Parqueo />} />
        </Routes>
    </BrowserRouter>
  </React.StrictMode>,
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
