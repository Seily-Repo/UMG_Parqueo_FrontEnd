import { createElement } from "react";
import { Navigate } from "react-router";
import { UserLayout } from "./components/UserLayout";
import { AdminLayout } from "./components/AdminLayout";

// User Pages
import { UserStart } from "./pages/user/UserStart";
import { PersonalData } from "./pages/user/PersonalData";
import { VehicleData } from "./pages/user/VehicleData";
import { Payment } from "./pages/user/Payment";
import { Signature } from "./pages/user/Signature";
import { Confirmation } from "./pages/user/Confirmation";
import { UserProfile } from "./pages/user/UserProfile";
import { UserFines } from "./pages/user/UserFines";
import { UserFinePayment } from "./pages/user/UserFinePayment";

// Admin Pages
import { AdminDashboard } from "./pages/admin/AdminDashboard";
import { RegistrationDetail } from "./pages/admin/RegistrationDetail";
import { AdminFines } from "./pages/admin/AdminFines";

export const parkingRoutes = [
  {
    index: true,
    element: createElement(Navigate, { to: "/parking/user/pago", replace: true }),
  },
  {
    path: "user",
    Component: UserLayout,
    children: [
      { path: "perfil", Component: UserProfile },
      { path: "multas", Component: UserFines },
      { path: "multas/pagar/:relationId", Component: UserFinePayment },
      { index: true, Component: UserStart },
      { path: "datos-personales", Component: PersonalData },
      { path: "vehiculos", Component: VehicleData },
      { path: "pago", Component: Payment },
      { path: "firma", Component: Signature },
      { path: "confirmacion", Component: Confirmation },
    ],
  },
  {
    path: "admin",
    Component: AdminLayout,
    children: [
      { index: true, Component: AdminDashboard },
      { path: "dashboard", Component: AdminDashboard },
      { path: "multas", Component: AdminFines },
      { path: "dashboard/multas", Component: AdminFines },
      { path: "registro/:id", Component: RegistrationDetail },
      { path: "dashboard/registro/:id", Component: RegistrationDetail },
    ],
  },
];
