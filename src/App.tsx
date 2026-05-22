import { useEffect } from 'react';
import axios from 'axios';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Reportes from './pages/reportes';
import ReporteFinanciero from './pages/reportes/financieros';
import ReporteGerencial from './pages/reportes/gerenciales';
import ReporteAdministrativo from './pages/reportes/administrativos';
import { guardarTokenDesdeUrl, obtenerToken, redirigirALogin } from './utils/authHeaders';

function App() {
  useEffect(() => {
    guardarTokenDesdeUrl();

    if (!obtenerToken()) {
      redirigirALogin();
      return;
    }

    const interceptor = axios.interceptors.response.use(
      (response) => response,
      (error) => {
        const status = error.response?.status;

        if (status === 401 || status === 403) {
          localStorage.removeItem('token');
          redirigirALogin();
        }

        return Promise.reject(error);
      },
    );

    return () => axios.interceptors.response.eject(interceptor);
  }, []);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/reportes" replace />} />
        <Route path="/reportes" element={<Reportes />} />
        <Route path="/reportes/" element={<Reportes />} />
        <Route path="/reportes/financieros" element={<ReporteFinanciero />} />
        <Route path="/reportes/gerenciales" element={<ReporteGerencial />} />
        <Route path="/reportes/administrativos" element={<ReporteAdministrativo />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
