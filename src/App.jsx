import React from 'react';
import { createBrowserRouter, RouterProvider, Navigate } from 'react-router';
import ParkingModuleLayout from './modules/parking/app/App';
import { parkingRoutes } from './modules/parking/app/routes';
import './App.css';

const router = createBrowserRouter([
  {
    path: '/',
    element: <Navigate to="/parking" replace />,
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
