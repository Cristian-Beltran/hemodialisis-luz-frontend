import { VitalSignsCard } from "./components/vital-signs-card";
import { MonitoringSessionCard } from "./components/monitoring-session-card";
import { StatsOverview } from "./components/stats-overview";
import {
  Heart,
  Activity,
  Droplets,
  Users,
  AlertTriangle,
  CheckCircle,
} from "lucide-react";
import type { MonitoringSession } from "@/types/monitoring-session";
import { useAuthStore } from "@/auth/useAuth";

export default function DashboardPage() {
  const { user } = useAuthStore();
  const mockVitals = [
    {
      label: "Frecuencia Cardíaca",
      value: 72,
      unit: "bpm",
      status: "normal" as const,
      icon: Heart,
      trend: "stable" as const,
    },
    {
      label: "Saturación O2",
      value: 98,
      unit: "%",
      status: "normal" as const,
      icon: Droplets,
      trend: "up" as const,
    },
    {
      label: "Presión Respiratoria",
      value: 2.3,
      unit: "V",
      status: "normal" as const,
      icon: Activity,
      trend: "stable" as const,
    },
  ];

  const mockSession: MonitoringSession = {
    id: "1",
    patientId: "1",
    sessionDate: new Date().toISOString().split("T")[0],
    notes: "Sesión del paciente Juan Pérez, ultima conexion hace 2 minutos",
    createdAt: new Date().toISOString(),
  };

  const doctorStats = [
    {
      title: "Pacientes Activos",
      value: 24,
      description: "Pacientes bajo monitoreo",
      icon: Users,
      trend: { value: 12, isPositive: true },
    },
    {
      title: "Sesiones Hoy",
      value: 8,
      description: "Sesiones de monitoreo activas",
      icon: Activity,
    },
    {
      title: "Alertas Críticas",
      value: 2,
      description: "Requieren atención inmediata",
      icon: AlertTriangle,
    },
    {
      title: "Pacientes Estables",
      value: 22,
      description: "Sin alertas activas",
      icon: CheckCircle,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Bienvenida */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          Bienvenido, {user?.fullname}
        </h2>
        <p className="text-muted-foreground">
          {"Gestiona el monitoreo de tus pacientes"}
        </p>
      </div>

      {/* Estadísticas generales */}
      <StatsOverview stats={doctorStats} />

      {/* Contenido principal */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Signos vitales */}
        <VitalSignsCard
          patientName={"Juan Pérez"}
          lastUpdate="Hace 2 minutos"
          vitals={mockVitals}
        />

        {/* Sesión de monitoreo */}
        <MonitoringSessionCard
          session={mockSession}
          onViewReport={() => console.log("Ver reporte")}
        />
      </div>

      {/* Contenido específico por rol */}
      <div className="rounded-lg border bg-card p-6">
        <h3 className="text-lg font-semibold mb-4">Pacientes Recientes</h3>
        <div className="space-y-3">
          {[
            {
              name: "Juan Pérez",
              status: "Estable",
              lastReading: "Hace 2 min",
            },
            {
              name: "María García",
              status: "Atención",
              lastReading: "Hace 5 min",
            },
            {
              name: "Carlos López",
              status: "Estable",
              lastReading: "Hace 10 min",
            },
          ].map((patient, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-3 rounded-lg bg-muted"
            >
              <div>
                <p className="font-medium">{patient.name}</p>
                <p className="text-sm text-muted-foreground">
                  {patient.lastReading}
                </p>
              </div>
              <span
                className={`px-2 py-1 rounded-full text-xs font-medium ${
                  patient.status === "Estable"
                    ? "bg-green-100 text-green-800"
                    : "bg-yellow-100 text-yellow-800"
                }`}
              >
                {patient.status}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
