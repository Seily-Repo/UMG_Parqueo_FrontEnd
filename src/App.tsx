import { BrowserRouter, Routes, Route } from 'react-router-dom';
import SelectorRol from './pages/SelectorRol';
import Login from './pages/Login';
import Registro from './pages/Registro';
import LoginAdmin from './pages/LoginAdmin';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<SelectorRol />} />
        <Route path="/login" element={<Login />} />
        <Route path="/registro" element={<Registro />} />
        <Route path="/login-admin" element={<LoginAdmin />} /> 
      </Routes>
    </BrowserRouter>
  );
}

export default App;