import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Reportes from './pages/reportes';
import ReporteFinanciero from './pages/reportes/financieros';
import ReporteGerencial from './pages/reportes/gerenciales';
import ReporteAdministrativo from './pages/reportes/administrativos';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Reportes />} />
        <Route path="/reportes/financieros" element={<ReporteFinanciero />} />
        <Route path="/reportes/gerenciales" element={<ReporteGerencial />} />
        <Route path="/reportes/administrativos" element={<ReporteAdministrativo />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;