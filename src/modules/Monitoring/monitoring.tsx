import { useState, useEffect } from "react";
import { VitalSignsChart } from "./components/vital-signs-chart";
import { BreathingPatternChart } from "./components/breathing-pattern-chart";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Play, Square, Wifi, WifiOff } from "lucide-react";
import type { SensorReading } from "@/types/sensor-reading";
import { useAuthStore } from "@/auth/useAuth";

export default function MonitoringPage() {
  const { user } = useAuthStore();
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [realtimeData, setRealtimeData] = useState<SensorReading[]>([]);

  // Simular conexión ESP32 y datos en tiempo real
  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isMonitoring) {
      setIsConnected(true);
      interval = setInterval(() => {
        const newReading: SensorReading = {
          id: Math.random().toString(36).substr(2, 9),
          sessionId: "current-session",
          timestamp: new Date().toISOString(),
          pulseBpm: Math.round(70 + Math.random() * 30),
          spo2Percentage: Math.round((96 + Math.random() * 4) * 100) / 100,
          pressureVoltage: Math.round((2 + Math.random() * 2) * 1000) / 1000,
          breathingPhase: ["inhale", "hold", "exhale", "rest"][
            Math.floor(Math.random() * 4)
          ] as any,
          createdAt: new Date().toISOString(),
        };

        setRealtimeData((prev) => {
          const updated = [...prev, newReading];
          // Mantener solo los últimos 50 puntos para mejor rendimiento
          return updated.slice(-50);
        });
      }, 3000); // Nueva lectura cada 3 segundos
    } else {
      setIsConnected(false);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isMonitoring]);

  const startMonitoring = () => {
    setIsMonitoring(true);
    setRealtimeData([]);
  };

  const stopMonitoring = () => {
    setIsMonitoring(false);
    setRealtimeData([]);
  };

  const latestReading = realtimeData[realtimeData.length - 1];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Monitoreo en Tiempo Real
          </h2>
          <p className="text-muted-foreground">
            {user?.type.includes("doctor")
              ? "Supervisa los signos vitales de tus pacientes en tiempo real"
              : "Monitoreo continuo de tus signos vitales"}
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <select
              className="px-3 py-1 border border-gray-300 rounded-md text-sm bg-white dark:bg-gray-800 dark:border-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isMonitoring}
              defaultValue="ESP32-001"
            >
              <option value="ESP32-001">ESP32-001 (Sala A)</option>
              <option value="ESP32-002">ESP32-002 (Sala B)</option>
              <option value="ESP32-003">ESP32-003 (Sala C)</option>
              <option value="ESP32-004">ESP32-004 (Portátil)</option>
            </select>
          </div>
          <div className="flex items-center gap-2">
            {isConnected ? (
              <>
                <Wifi className="h-4 w-4 text-green-600" />
                <Badge className="bg-green-100 text-green-800">
                  ESP32 Conectado
                </Badge>
              </>
            ) : (
              <>
                <WifiOff className="h-4 w-4 text-gray-400" />
                <Badge variant="secondary">Desconectado</Badge>
              </>
            )}
          </div>
          {isMonitoring ? (
            <Button onClick={stopMonitoring} variant="destructive">
              <Square className="mr-2 h-4 w-4" />
              Detener
            </Button>
          ) : (
            <Button onClick={startMonitoring}>
              <Play className="mr-2 h-4 w-4" />
              Iniciar Monitoreo
            </Button>
          )}
        </div>
      </div>

      {/* Estado actual */}
      {latestReading && (
        <Card>
          <CardHeader>
            <CardTitle>Lecturas Actuales</CardTitle>
            <CardDescription>
              Última actualización:{" "}
              {new Date(latestReading.timestamp).toLocaleTimeString("es-ES")}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="text-center p-4 rounded-lg border">
                <p className="text-sm font-medium text-muted-foreground">
                  Frecuencia Cardíaca
                </p>
                <p className="text-3xl font-bold text-red-600">
                  {latestReading.pulseBpm} bpm
                </p>
              </div>
              <div className="text-center p-4 rounded-lg border">
                <p className="text-sm font-medium text-muted-foreground">
                  Saturación O2
                </p>
                <p className="text-3xl font-bold text-blue-600">
                  {latestReading.spo2Percentage}%
                </p>
              </div>
              <div className="text-center p-4 rounded-lg border">
                <p className="text-sm font-medium text-muted-foreground">
                  Presión Respiratoria
                </p>
                <p className="text-3xl font-bold text-green-600">
                  {latestReading.pressureVoltage}V
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Gráficos en tiempo real */}
      {realtimeData.length > 0 && (
        <div className="space-y-6">
          <VitalSignsChart
            data={realtimeData.map((r) => ({
              timestamp: r.timestamp,
              pulse: r.pulseBpm,
              spo2: r.spo2Percentage,
            }))}
            title="Signos Vitales - Tiempo Real"
            description="Actualización automática cada 3 segundos"
          />

          <BreathingPatternChart
            data={realtimeData.map((r) => ({
              timestamp: r.timestamp,
              pressureVoltage: r.pressureVoltage!,
              breathingPhase: r.breathingPhase!,
            }))}
            title="Patrón Respiratorio - Tiempo Real"
            description="Análisis continuo de la capacidad pulmonar"
          />
        </div>
      )}

      {!isMonitoring && realtimeData.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="text-center space-y-4">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-gray-100">
                <Play className="h-6 w-6 text-gray-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold">Monitoreo Detenido</h3>
                <p className="text-muted-foreground">
                  Haz clic en "Iniciar Monitoreo" para comenzar a recibir datos
                  del ESP32
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
