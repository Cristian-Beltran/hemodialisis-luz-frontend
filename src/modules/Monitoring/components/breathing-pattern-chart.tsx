import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ChartContainer, ChartTooltip } from "@/components/ui/chart";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";
import { Badge } from "@/components/ui/badge";
import { CHART_COLORS } from "@/types/constants";
import type { BreathingPhase } from "@/types/breathing-phase";

interface BreathingPatternChartProps {
  data: Array<{
    timestamp: string;
    pressureVoltage: number;
    breathingPhase: BreathingPhase;
  }>;
  title?: string;
  description?: string;
}

export function BreathingPatternChart({
  data,
  title = "Patrón Respiratorio",
  description = "Análisis de la capacidad pulmonar basado en sensor de presión",
}: BreathingPatternChartProps) {
  const chartConfig = {
    pressureVoltage: {
      label: "Presión (V)",
      color: CHART_COLORS.PRESSURE,
    },
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString("es-ES", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  const getPhaseColor = (phase: BreathingPhase) => {
    switch (phase) {
      case "inhale":
        return "bg-blue-100 text-blue-800";
      case "hold":
        return "bg-yellow-100 text-yellow-800";
      case "exhale":
        return "bg-green-100 text-green-800";
      case "rest":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getPhaseLabel = (phase: BreathingPhase) => {
    switch (phase) {
      case "inhale":
        return "Inspiración";
      case "hold":
        return "Retención";
      case "exhale":
        return "Expiración";
      case "rest":
        return "Reposo";
      default:
        return phase;
    }
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="rounded-lg border bg-background p-3 shadow-md">
          <p className="text-sm font-medium">{formatTime(label)}</p>
          <p className="text-sm">
            <span className="font-medium">Presión:</span> {payload[0].value}V
          </p>
          <div className="mt-1">
            <Badge
              className={getPhaseColor(data.breathingPhase)}
              variant="secondary"
            >
              {getPhaseLabel(data.breathingPhase)}
            </Badge>
          </div>
        </div>
      );
    }
    return null;
  };

  // Calcular estadísticas
  const avgPressure =
    data.length > 0
      ? (
          data.reduce((sum, d) => sum + d.pressureVoltage, 0) / data.length
        ).toFixed(2)
      : "0";
  const maxPressure =
    data.length > 0
      ? Math.max(...data.map((d) => d.pressureVoltage)).toFixed(2)
      : "0";
  const minPressure =
    data.length > 0
      ? Math.min(...data.map((d) => d.pressureVoltage)).toFixed(2)
      : "0";

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          {title}
          <div className="flex gap-2">
            <Badge variant="outline">Promedio: {avgPressure}V</Badge>
            <Badge variant="outline">Máx: {maxPressure}V</Badge>
            <Badge variant="outline">Mín: {minPressure}V</Badge>
          </div>
        </CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart
              data={data}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis
                dataKey="timestamp"
                tickFormatter={formatTime}
                className="text-xs fill-muted-foreground"
                interval="preserveStartEnd"
              />
              <YAxis
                domain={["dataMin - 0.1", "dataMax + 0.1"]}
                className="text-xs fill-muted-foreground"
                label={{
                  value: "Presión (V)",
                  angle: -90,
                  position: "insideLeft",
                }}
              />
              <ChartTooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="pressureVoltage"
                stroke={chartConfig.pressureVoltage.color}
                fill={chartConfig.pressureVoltage.color}
                fillOpacity={0.3}
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </ChartContainer>

        {/* Leyenda de fases respiratorias */}
        <div className="mt-4 flex flex-wrap gap-2">
          <Badge className="bg-blue-100 text-blue-800" variant="secondary">
            Inspiración
          </Badge>
          <Badge className="bg-yellow-100 text-yellow-800" variant="secondary">
            Retención
          </Badge>
          <Badge className="bg-green-100 text-green-800" variant="secondary">
            Expiración
          </Badge>
          <Badge className="bg-gray-100 text-gray-800" variant="secondary">
            Reposo
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
}
