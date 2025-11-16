import { useMemo, useState } from "react";
import { sessionStore } from "../data/session.store";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button"; // 👈 NUEVO
import type { Session, SessionData } from "../session.interface";

const fmtDate = (d: string | Date) => {
  const date = new Date(d);
  if (!Number.isFinite(date.getTime())) return "Fecha inválida";
  return date.toLocaleString("es-ES", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const safe = (n?: number | null) =>
  Number.isFinite(Number(n)) ? Number(n) : null;

/** ---------- NUEVO: helpers CSV ---------- */
function safeISO(value?: string | Date | null): string {
  if (!value) return "";
  const d = value instanceof Date ? value : new Date(value);
  return Number.isFinite(d.getTime()) ? d.toISOString() : "";
}

function toCsvCell(value: unknown): string {
  if (value === null || value === undefined) return "";
  const s = String(value);
  const escaped = s.replace(/"/g, '""');
  if (/[",\n]/.test(escaped)) return `"${escaped}"`;
  return escaped;
}

function buildCsvFromSessions(sessions: Session[]): string {
  // Cabeceras
  const headers = [
    "sessionId",
    "sessionStartedAt",
    "sessionEndedAt",
    "patientId",
    "patientFirstName",
    "patientLastName",
    "recordId",
    "recordedAt",
    "pulse",
    "oxygenSaturation",
    "temperatureC",
    "systolic",
    "diastolic",
  ];

  const lines: string[] = [];
  lines.push(headers.map(toCsvCell).join(","));

  sessions.forEach((s) => {
    const recs = s.records ?? [];
    recs.forEach((r) => {
      const row = [
        s.id ?? "",
        safeISO(s.startedAt),
        safeISO(s.endedAt ?? null),
        s.patient?.id ?? "",
        s.patient?.firstName ?? "",
        s.patient?.lastName ?? "",
        r.id ?? "",
        safeISO(r.recordedAt),
        r.pulse ?? "",
        r.oxygenSaturation ?? "",
        (r as SessionData & { temperatureC?: number }).temperatureC ?? "",
        (r as SessionData & { systolic?: number }).systolic ?? "",
        (r as SessionData & { diastolic?: number }).diastolic ?? "",
      ];
      lines.push(row.map(toCsvCell).join(","));
    });
  });

  return lines.join("\n");
}

/** ---------- estadísticos por métrica ---------- */
function miniStats(records: SessionData[]) {
  const nums = (sel: (r: SessionData) => number | null | undefined) =>
    records
      .map(sel)
      .map((x) => (typeof x === "number" ? x : Number.NaN))
      .filter((x) => Number.isFinite(x)) as number[];

  const pulse = nums((r) => r.pulse);
  const spo2 = nums((r) => r.oxygenSaturation);
  const temp = nums((r) => r.temperatureC);
  const sys = nums((r) => r.systolic);
  const dia = nums((r) => r.diastolic);

  const avg = (a: number[]) =>
    a.length ? +(a.reduce((x, y) => x + y, 0) / a.length).toFixed(2) : 0;
  const min = (a: number[]) => (a.length ? Math.min(...a) : 0);
  const max = (a: number[]) => (a.length ? Math.max(...a) : 0);

  return {
    pulse: { avg: avg(pulse), min: min(pulse), max: max(pulse) },
    spo2: { avg: avg(spo2), min: min(spo2), max: max(spo2) },
    temp: { avg: avg(temp), min: min(temp), max: max(temp) },
    systolic: { avg: avg(sys), min: min(sys), max: max(sys) },
    diastolic: { avg: avg(dia), min: min(dia), max: max(dia) },
  };
}

export function SessionsTable() {
  const { sessions, isLoading } = sessionStore();
  const [open, setOpen] = useState<string | undefined>();

  const list = useMemo(() => {
    const s = [...sessions];
    s.sort(
      (a, b) =>
        new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime(),
    );
    return s as Session[];
  }, [sessions]);

  const hasRecords = useMemo(
    () => list.some((s) => (s.records?.length ?? 0) > 0),
    [list],
  );

  const handleExportCsv = () => {
    if (!list.length || !hasRecords) return;
    const csv = buildCsvFromSessions(list);
    const blob = new Blob([csv], {
      type: "text/csv;charset=utf-8;",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");

    const ts = new Date().toISOString().slice(0, 19).replace(/[:T]/g, "-");

    a.href = url;
    a.download = `sesiones-${ts}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Sesiones</CardTitle>
          <CardDescription>Cargando…</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (!list.length) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Sesiones</CardTitle>
          <CardDescription>No hay datos</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* KPIs globales + botón CSV */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Card className="flex-1 bg-muted/30 border-dotted">
          <CardContent className="grid gap-3 py-4 sm:grid-cols-3">
            <Kpi label="Sesiones" value={list.length} />
            <Kpi
              label="Lecturas"
              value={list.reduce((acc, s) => acc + (s.records?.length ?? 0), 0)}
            />
            <Kpi label="Última sesión" value={fmtDate(list[0].startedAt)} />
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportCsv}
            disabled={!hasRecords}
          >
            Exportar CSV
          </Button>
        </div>
      </div>

      {/* NUEVA VISTA: timeline/accordion con KPIs por sesión y tiles de lecturas */}
      <Accordion
        type="single"
        collapsible
        value={open}
        onValueChange={(v) => setOpen((v as string) || undefined)}
        className="space-y-3"
      >
        {list.map((s, idx) => {
          const recs = s.records ?? [];
          const last = recs.at(-1);
          const st = miniStats(recs);

          return (
            <AccordionItem
              key={s.id}
              value={s.id}
              className="relative overflow-hidden rounded-2xl border bg-card/60 backdrop-blur"
            >
              {/* Línea de timeline a la izquierda */}
              <span
                className="absolute left-3 top-0 h-full w-0.5 bg-muted"
                aria-hidden
              />
              <span className="absolute left-2.5 top-4 h-3 w-3 rounded-full bg-primary/90 ring-2 ring-background" />
              {idx < list.length - 1 && (
                <span className="absolute left-[9px] bottom-0 h-4 w-0.5 bg-gradient-to-b from-muted to-transparent" />
              )}

              <AccordionTrigger className="px-8 pr-4">
                <div className="flex w-full items-center justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <Badge variant="outline" className="font-mono text-[11px]">
                      {s.id.slice(0, 8)}…
                    </Badge>
                    <div className="text-left">
                      <div className="text-sm font-semibold">
                        {s.patient?.firstName
                          ? `${s.patient.firstName} ${
                              s.patient.lastName ?? ""
                            }`.trim()
                          : "Paciente"}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Inicio {fmtDate(s.startedAt)}{" "}
                        {s.endedAt && <>• Fin {fmtDate(s.endedAt)}</>}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">{recs.length} lecturas</Badge>
                    <Badge variant={s.endedAt ? "outline" : "default"}>
                      {s.endedAt ? "Cerrada" : "Activa"}
                    </Badge>
                  </div>
                </div>
              </AccordionTrigger>

              <AccordionContent className="px-6">
                <Separator className="my-2" />

                {/* Mini KPIs de la sesión */}
                <div className="grid gap-3 md:grid-cols-3">
                  <MetricCompact
                    title="Pulso (bpm)"
                    avg={st.pulse.avg}
                    min={st.pulse.min}
                    max={st.pulse.max}
                    now={safe(last?.pulse)}
                  />
                  <MetricCompact
                    title="SpO₂ (%)"
                    avg={st.spo2.avg}
                    min={st.spo2.min}
                    max={st.spo2.max}
                    now={safe(last?.oxygenSaturation)}
                  />
                  <MetricCompact
                    title="Temp (°C)"
                    avg={st.temp.avg}
                    min={st.temp.min}
                    max={st.temp.max}
                    now={safe(last?.temperatureC)}
                  />
                </div>

                {/* KPIs de Presión con badge compuesto */}
                <div className="mt-3 grid gap-3 md:grid-cols-2">
                  <MetricBp
                    title="Presión arterial (mmHg)"
                    avgSys={st.systolic.avg}
                    avgDia={st.diastolic.avg}
                    minSys={st.systolic.min}
                    maxSys={st.systolic.max}
                    minDia={st.diastolic.min}
                    maxDia={st.diastolic.max}
                    nowSys={safe(last?.systolic)}
                    nowDia={safe(last?.diastolic)}
                  />
                  <Card className="border-muted/70">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium">
                        Estado actual
                      </CardTitle>
                      <CardDescription className="text-[11px]">
                        Última lectura de la sesión
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="grid grid-cols-5 gap-2 text-xs">
                      <Chip label="BPM" value={safe(last?.pulse)} />
                      <Chip label="SpO₂" value={safe(last?.oxygenSaturation)} />
                      <Chip label="°C" value={safe(last?.temperatureC)} />
                      <Chip label="SYS" value={safe(last?.systolic)} />
                      <Chip label="DIA" value={safe(last?.diastolic)} />
                    </CardContent>
                  </Card>
                </div>

                {/* Grid de lecturas (tiles) */}
                <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {recs.map((r) => {
                    const date = new Date(r.recordedAt);
                    const timeLabel = Number.isFinite(date.getTime())
                      ? date.toLocaleTimeString("es-ES", {
                          hour: "2-digit",
                          minute: "2-digit",
                          second: "2-digit",
                        })
                      : "Hora inválida";
                    const dayLabel = Number.isFinite(date.getTime())
                      ? date.toLocaleDateString("es-ES")
                      : "Fecha inválida";

                    return (
                      <Card key={r.id} className="border-muted/70">
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm font-medium">
                            {timeLabel}
                          </CardTitle>
                          <CardDescription className="text-[11px] font-mono">
                            {dayLabel}
                          </CardDescription>
                        </CardHeader>
                        <CardContent className="grid grid-cols-5 gap-2 text-xs">
                          <Chip label="BPM" value={safe(r.pulse)} />
                          <Chip label="SpO₂" value={safe(r.oxygenSaturation)} />
                          <Chip label="°C" value={safe(r.temperatureC)} />
                          <Chip label="SYS" value={safe(r.systolic)} />
                          <Chip label="DIA" value={safe(r.diastolic)} />
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </AccordionContent>
            </AccordionItem>
          );
        })}
      </Accordion>
    </div>
  );
}

/* ---------- UI helpers ---------- */
function Kpi({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="rounded-xl border p-3 bg-card/50">
      <div className="text-[11px] text-muted-foreground">{label}</div>
      <div className="text-lg font-semibold">{value}</div>
    </div>
  );
}

function pct(now: number | null, min: number, max: number) {
  if (now == null || !Number.isFinite(now) || max <= min) return 0;
  return Math.max(0, Math.min(100, ((now - min) / (max - min)) * 100));
}

function MetricCompact({
  title,
  avg,
  min,
  max,
  now,
}: {
  title: string;
  avg: number;
  min: number;
  max: number;
  now: number | null;
}) {
  const v = now ?? 0;
  const p = pct(now, min, max);
  return (
    <div className="rounded-lg border p-3">
      <div className="flex items-center justify-between mb-1">
        <span className="text-sm font-medium">{title}</span>
        <Badge variant="outline" className="font-mono text-[11px]">
          {now == null ? "—" : v.toFixed(0)}
        </Badge>
      </div>
      <div className="text-[11px] text-muted-foreground mb-2">
        Avg {avg.toFixed(2)} • Min {min.toFixed(2)} • Max {max.toFixed(2)}
      </div>
      <Progress value={p} className="h-1.5" />
    </div>
  );
}

function MetricBp({
  title,
  avgSys,
  avgDia,
  minSys,
  maxSys,
  minDia,
  maxDia,
  nowSys,
  nowDia,
}: {
  title: string;
  avgSys: number;
  avgDia: number;
  minSys: number;
  maxSys: number;
  minDia: number;
  maxDia: number;
  nowSys: number | null;
  nowDia: number | null;
}) {
  const p = pct(nowSys, minSys, maxSys);
  const badge =
    nowSys == null || nowDia == null
      ? "—/—"
      : `${nowSys.toFixed(0)}/${nowDia.toFixed(0)}`;
  return (
    <div className="rounded-lg border p-3">
      <div className="flex items-center justify-between mb-1">
        <span className="text-sm font-medium">{title}</span>
        <Badge variant="outline" className="font-mono text-[11px]">
          {badge}
        </Badge>
      </div>
      <div className="text-[11px] text-muted-foreground mb-2">
        Avg {avgSys.toFixed(0)}/{avgDia.toFixed(0)} • SYS [{minSys}-{maxSys}] •
        DIA [{minDia}-{maxDia}]
      </div>
      <Progress value={p} className="h-1.5" />
    </div>
  );
}

function Chip({ label, value }: { label: string; value: number | null }) {
  return (
    <div className="flex items-center justify-between rounded-md border px-2 py-1 bg-muted/30">
      <span className="text-[11px] text-muted-foreground">{label}</span>
      <span className="font-mono text-[12px]">
        {value == null ? "—" : value.toFixed(0)}
      </span>
    </div>
  );
}
