import { useMemo } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip as ReTooltip,
  Legend,
  LineChart,
  Line,
} from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { sessionStore } from "../data/session.store";
import type { Session, SessionData } from "../session.interface";

/* ---------------------- Tipos fuertes ---------------------- */
type Row = {
  sessionCode: string; // S1, S2...
  dateLabel: string; // "02 nov"
  avgPulse: number; // bpm
  avgSpo2: number; // %
  avgTemp: number; // °C
  avgSys: number; // mmHg
  avgDia: number; // mmHg
  bpSpread: number; // sys - dia (para banda)
};

const toDateLabel = (iso: string): string =>
  new Date(iso).toLocaleDateString("es-ES", { day: "2-digit", month: "short" });

const numeric = (v: unknown): number | null =>
  typeof v === "number" && Number.isFinite(v) ? v : null;

const avg = (
  recs: SessionData[],
  pick: (r: SessionData) => number | null,
): number => {
  const vals = recs
    .map(pick)
    .filter((n): n is number => typeof n === "number" && Number.isFinite(n));
  if (!vals.length) return 0;
  const m = vals.reduce((a, b) => a + b, 0) / vals.length;
  return +m.toFixed(2);
};

export function SessionCharts() {
  const { sessions } = sessionStore();

  const data: Row[] = useMemo(() => {
    const list = (sessions as Session[])
      .slice()
      .sort(
        (a, b) =>
          new Date(a.startedAt).getTime() - new Date(b.startedAt).getTime(),
      );

    return list.map((s, i) => {
      const recs = (s.records ?? []) as SessionData[];
      const avgPulse = avg(recs, (r) => numeric(r.pulse));
      const avgSpo2 = avg(recs, (r) => numeric(r.oxygenSaturation));
      const avgTemp = avg(recs, (r) =>
        numeric(
          (r as SessionData & { temperatureC?: number }).temperatureC ?? null,
        ),
      );
      const avgSys = avg(recs, (r) =>
        numeric((r as SessionData & { systolic?: number }).systolic ?? null),
      );
      const avgDia = avg(recs, (r) =>
        numeric((r as SessionData & { diastolic?: number }).diastolic ?? null),
      );

      return {
        sessionCode: `S${i + 1}`,
        dateLabel: toDateLabel(s.startedAt),
        avgPulse,
        avgSpo2,
        avgTemp,
        avgSys,
        avgDia,
        bpSpread: Math.max(0, +(avgSys - avgDia).toFixed(2)),
      };
    });
  }, [sessions]);

  if (!sessions.length) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Resumen</CardTitle>
          <CardDescription>Sin registros disponibles</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  /* ---- Config semántica para leyendas/tooltip ---- */
  const cfg = {
    avgPulse: { label: "Pulso (BPM)" },
    avgSpo2: { label: "SpO₂ (%)" },
    avgTemp: { label: "Temperatura (°C)" },
    avgSys: { label: "Sistólica (mmHg)" },
    avgDia: { label: "Diastólica (mmHg)" },
    bpSpread: { label: "Ancho (SYS-DIA)" },
  } as const;

  return (
    <div className="grid gap-6 xl:grid-cols-2">
      {/* Card 1: Pulso y SpO2 como áreas superpuestas (gradiente sutil) */}
      <Card className="bg-gradient-to-b from-background to-muted/30 border-dotted">
        <CardHeader>
          <CardTitle>Tendencias Cardiorrespiratorias</CardTitle>
          <CardDescription>Promedio por sesión (Pulso y SpO₂)</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer
            config={{ avgPulse: cfg.avgPulse, avgSpo2: cfg.avgSpo2 }}
            className="h-[320px] w-full"
          >
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data}>
                <defs>
                  <linearGradient id="gPulse" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopOpacity={0.35} />
                    <stop offset="95%" stopOpacity={0.05} />
                  </linearGradient>
                  <linearGradient id="gSpo2" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopOpacity={0.35} />
                    <stop offset="95%" stopOpacity={0.05} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="2 3" opacity={0.5} />
                <XAxis dataKey="sessionCode" />
                <YAxis />
                <ReTooltip content={<ChartTooltipContent />} />
                <Legend />
                <Area
                  type="monotone"
                  dataKey="avgPulse"
                  name={cfg.avgPulse.label}
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#gPulse)"
                />
                <Area
                  type="monotone"
                  dataKey="avgSpo2"
                  name={cfg.avgSpo2.label}
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#gSpo2)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* Card 2: Temperatura como línea minimalista con puntos y grid suave */}
      <Card className="bg-card/60 backdrop-blur">
        <CardHeader>
          <CardTitle>Temperatura corporal</CardTitle>
          <CardDescription>Promedio por sesión (°C)</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer
            config={{ avgTemp: cfg.avgTemp }}
            className="h-[320px] w-full"
          >
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data}>
                <CartesianGrid strokeDasharray="4 4" opacity={0.35} />
                <XAxis dataKey="dateLabel" />
                <YAxis domain={[30, 45]} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="avgTemp"
                  name={cfg.avgTemp.label}
                  strokeWidth={3}
                  dot={{ r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* Card 3: Presión arterial como BANDA (SYS base + SPREAD apilado) */}
      <Card className="bg-muted/20 border-dashed">
        <CardHeader>
          <CardTitle>Presión arterial</CardTitle>
          <CardDescription>
            Banda Sistólica/Diastólica por sesión (mmHg)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer
            config={{ avgDia: cfg.avgDia, avgSys: cfg.avgSys }}
            className="h-[340px] w-full"
          >
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data}>
                <defs>
                  <linearGradient id="gBPBand" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopOpacity={0.35} />
                    <stop offset="100%" stopOpacity={0.08} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" opacity={0.45} />
                <XAxis dataKey="sessionCode" />
                <YAxis />

                <Legend />
                {/* Base: diastólica (invisible, solo sirve de baseline del stack) */}
                <Area
                  type="monotone"
                  dataKey="avgDia"
                  name={cfg.avgDia.label}
                  stackId="bp"
                  strokeWidth={2}
                  fillOpacity={0}
                />
                {/* Spread: (sys - dia) para pintar la banda */}
                <Area
                  type="monotone"
                  dataKey="bpSpread"
                  name="Banda (SYS-DIA)"
                  stackId="bp"
                  strokeWidth={0}
                  fill="url(#gBPBand)"
                  activeDot={{ r: 4 }}
                />
                {/* Líneas finas por encima para leer valores exactos */}
                <Line
                  type="monotone"
                  dataKey="avgSys"
                  name={cfg.avgSys.label}
                  strokeWidth={2}
                  dot={false}
                />
                <Line
                  type="monotone"
                  dataKey="avgDia"
                  name={cfg.avgDia.label}
                  strokeDasharray="4 4"
                  strokeWidth={2}
                  dot={false}
                />
              </AreaChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  );
}
