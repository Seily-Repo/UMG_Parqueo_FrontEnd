import { LandingPage } from "./pages/LandingPage";
import { UserLayout } from "./components/UserLayout";
import { AdminLayout } from "./components/AdminLayout";

// User Pages
import { UserStart } from "./pages/user/UserStart";
import { PersonalData } from "./pages/user/PersonalData";
import { VehicleData } from "./pages/user/VehicleData";
import { Payment } from "./pages/user/Payment";
import { Signature } from "./pages/user/Signature";
import { Confirmation } from "./pages/user/Confirmation";

// Admin Pages
import { AdminLogin } from "./pages/admin/AdminLogin";
import { AdminDashboard } from "./pages/admin/AdminDashboard";
import { RegistrationDetail } from "./pages/admin/RegistrationDetail";

export const parkingRoutes = [
  {
    index: true,
    Component: LandingPage,
  },
  {
    path: "user",
    Component: UserLayout,
    children: [
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
    children: [
      { index: true, Component: AdminLogin },
      {
        path: "dashboard",
        Component: AdminLayout,
        children: [
          { index: true, Component: AdminDashboard },
          { path: "registro/:id", Component: RegistrationDetail },
        ],
      },
    ],
  },
];
