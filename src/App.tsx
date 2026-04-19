import { BrowserRouter, Routes, Route } from 'react-router-dom';
import SelectorRol from './pages/SelectorRol';
import Login from './pages/Login';
import Registro from './pages/Registro';
import LoginAdmin from './pages/LoginAdmin';
import Dashboard from './pages/Dashboard';
import DashboardAdmin from './pages/DashboardAdmin';
import CambiarPassword from './pages/CambiarPassword';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<SelectorRol />} />
        <Route path="/login" element={<Login />} />
        <Route path="/registro" element={<Registro />} />
        <Route path="/login-admin" element={<LoginAdmin />} /> 
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/dashboard-admin" element={<DashboardAdmin />} />
        <Route path="/cambiar-password" element={<CambiarPassword />} />
        <Route path="/cambiar-password" element={<CambiarPassword />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;