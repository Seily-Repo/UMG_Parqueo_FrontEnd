import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Reportes from './pages/reportes';
import ReporteFinanciero from './pages/reportes/financieros';
import ReporteGerencial from './pages/reportes/gerenciales';
import ReporteAdministrativo from './pages/reportes/administrativos';
import { guardarTokenDesdeUrl } from './utils/authHeaders';

function App() {
  useEffect(() => {
    guardarTokenDesdeUrl();
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
