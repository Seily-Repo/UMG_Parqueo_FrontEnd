// src/App.jsx
import React, { useEffect, useState } from 'react';
import Nav from './components/nav';
import './index.css';

function App() {
  const [msg, setMsg] = useState('Cargando...');
  const API = process.env.REACT_APP_API_URL || 'http://localhost:4000';

  useEffect(() => {
    fetch(`${API}/test`)
      .then(res => res.json())
      .then(data => {
        // tu endpoint /test devuelve lo que definas en testget
        setMsg(data.message || JSON.stringify(data));
      })
      .catch(err => setMsg('Error: ' + err.message));
  }, [API]);

  return (
    <>
      <Nav />

      <div className="container mt-4">
        Inicio
      </div>
    </>
  );
}

export default App;
