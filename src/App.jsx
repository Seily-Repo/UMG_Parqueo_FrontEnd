import React from 'react';
import { Link, createBrowserRouter, RouterProvider } from 'react-router';
import ParkingModuleLayout from './modules/parking/app/App';
import { parkingRoutes } from './modules/parking/app/routes';
import './App.css';

function Home() {
  return (
    <main className="landing-shell">
      <section className="landing-hero">
        <p className="landing-tag">Universidad Mariano Galvez • Campus Central</p>
        <h1>Gestiona tu parqueo universitario en minutos</h1>
        <p className="landing-subtitle">
          Registro de vehiculos, validacion administrativa y confirmaciones en un solo flujo.
        </p>
        <div className="landing-actions">
          <Link to="/parking" className="btn-primary">
            Ir al sistema
          </Link>
          <a href="#beneficios" className="btn-ghost">
            Ver beneficios
          </a>
        </div>
      </section>

      <section id="beneficios" className="landing-grid">
        <article className="landing-card">
          <h2>Flujo estudiantil</h2>
          <p>Registro paso a paso con datos personales, vehiculos, pago y firma digital.</p>
        </article>
        <article className="landing-card">
          <h2>Panel administrativo</h2>
          <p>Consulta de registros, detalle de expediente y estado de pago en tiempo real.</p>
        </article>
        <article className="landing-card">
          <h2>Integracion central</h2>
          <p>El modulo de parqueo ya vive dentro del frontend principal para un solo despliegue.</p>
        </article>
      </section>

      <section className="landing-band">
        <div>
          <strong>+1 modulo</strong>
          <span>Integrado al proyecto raiz</span>
        </div>
        <div>
          <strong>2 perfiles</strong>
          <span>Usuario y administrador</span>
        </div>
        <div>
          <strong>100%</strong>
          <span>Web y responsive</span>
        </div>
      </section>
    </main>
  );
}

const router = createBrowserRouter([
  {
    path: '/',
    Component: Home,
  },
  {
    path: '/parking',
    Component: ParkingModuleLayout,
    children: parkingRoutes,
  },
]);

function App() {
  return <RouterProvider router={router} />;
}

export default App;
