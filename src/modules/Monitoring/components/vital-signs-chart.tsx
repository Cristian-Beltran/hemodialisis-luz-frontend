import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";
import { CHART_COLORS } from "@/types/constants";

interface VitalSignsChartProps {
  data: Array<{
    timestamp: string;
    pulse?: number;
    spo2?: number;
  }>;
  title?: string;
  description?: string;
  showPulse?: boolean;
  showSpo2?: boolean;
}

export function VitalSignsChart({
  data,
  title = "Signos Vitales",
  description = "Evolución de frecuencia cardíaca y saturación de oxígeno",
  showPulse = true,
  showSpo2 = true,
}: VitalSignsChartProps) {
  const chartConfig = {
    pulse: {
      label: "Frecuencia Cardíaca (bpm)",
      color: CHART_COLORS.PULSE,
    },
    spo2: {
      label: "Saturación O2 (%)",
      color: CHART_COLORS.SPO2,
    },
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString("es-ES", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart
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
              <YAxis className="text-xs fill-muted-foreground" />
              <ChartTooltip
                content={<ChartTooltipContent labelFormatter={formatTime} />}
              />
              {showPulse && (
                <Line
                  type="monotone"
                  dataKey="pulse"
                  stroke={chartConfig.pulse.color}
                  strokeWidth={2}
                  dot={{ fill: chartConfig.pulse.color, strokeWidth: 2, r: 3 }}
                  activeDot={{ r: 5 }}
                />
              )}
              {showSpo2 && (
                <Line
                  type="monotone"
                  dataKey="spo2"
                  stroke={chartConfig.spo2.color}
                  strokeWidth={2}
                  dot={{ fill: chartConfig.spo2.color, strokeWidth: 2, r: 3 }}
                  activeDot={{ r: 5 }}
                />
              )}
            </LineChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
