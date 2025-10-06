import { createBrowserRouter } from "react-router-dom";
import DashboardLayout from "./layouts/dashboard";
import DashboardPage from "./modules/Dashboard/dashboard-page";
import LoginPage from "./pages/login";
import NotFoundPage from "./pages/not-found";
import MonitoringPage from "./modules/Monitoring/monitoring";
import DoctorsPage from "./modules/Doctors/doctors";
import { AuthProvider } from "./auth/ProtectedRoute";
import DevicesPage from "./modules/Device/devices";
import PatientPage from "./modules/Patient/patient";
import FamilyPage from "./modules/Family/family";

export const router = createBrowserRouter([
  { path: "/login", element: <LoginPage /> },
  {
    path: "/",
    element: (
      <AuthProvider>
        <DashboardLayout />
      </AuthProvider>
    ),
    children: [
      { index: true, element: <DashboardPage /> },
      { path: "monitoring", element: <MonitoringPage /> },
      { path: "doctor", element: <DoctorsPage /> },
      { path: "devices", element: <DevicesPage /> },
      { path: "patients", element: <PatientPage /> },
      { path: "family", element: <FamilyPage /> },

      // routes
    ],
  },
  { path: "*", element: <NotFoundPage /> },
]);
