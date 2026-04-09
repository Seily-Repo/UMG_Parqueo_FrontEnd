// src/App.jsx

import Parqueo from './pages/Parqueo';
import React, { useEffect, useState } from 'react';
import Swal from 'sweetalert2';
import Nav from './components/nav';
import './App.css';

function App() {
  const [msg, setMsg] = useState('Cargando...');
  const API = process.env.REACT_APP_API_URL || 'http://localhost:4000';

useEffect(() => {

  const cargarTest = async () => {
    try {
      const res = await fetch(`${API}/test`);

      if (!res.ok) {
        throw new Error('Error en el servidor');
      }

      const data = await res.json();

      setMsg(data.message || JSON.stringify(data));

    } catch (error) {
      setMsg('No se pudo conectar con el servidor');

      Swal.fire({
        icon: 'error',
        title: 'Error al conectar con el servidor',
        text: 'Recarga la página o verifica el backend'
      });

      console.error(error);
    }
  };

  cargarTest();

  }, [API]);

  return (
    <>
      <Nav />

      <div className="container" style={{ marginTop: "90px" }}>
      <h3>{msg}</h3>
      </div>
    </>
  );
}

export default App;
