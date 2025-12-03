import { useEffect, useMemo, useState } from "react";
import {
  Users,
  Activity,
  AlertTriangle,
  CheckCircle,
  HeartPulse,
  Droplets,
  Thermometer,
  Gauge,
  RefreshCw,
} from "lucide-react";
import { useAuthStore } from "@/auth/useAuth";
import { sessionService } from "@/modules/Session/data/session.service";
import type { Session, SessionData } from "@/modules/Session/session.interface";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";

// Campos extendidos que pueden o no venir en SessionData
type ExtVitals = Partial<{
  temperatureC: number;
  systolic: number;
  diastolic: number;
}>;

/* ============== Helpers de seguridad ============== */
function safeDate(value?: string | Date | null): Date | null {
  if (!value) return null;
  const d = value instanceof Date ? value : new Date(value);
  return Number.isFinite(d.getTime()) ? d : null;
}

// Acceso seguro sin usar `any` ni romper cuando no hay `latestRecord`
function pickVital(
  rec: (SessionData & ExtVitals) | undefined,
  key: keyof ExtVitals,
): number | null {
  if (!rec) return null;
  const val = rec[key];
  const n = Number(val);
  return Number.isFinite(n) ? n : null;
}

/* ============== Helpers (adaptados) ============== */
function formatRelative(dateISO?: string | null) {
  const d = dateISO ? safeDate(dateISO) : null;
  if (!d) return "Sin lecturas";

  const diffMs = Date.now() - d.getTime();
  const mins = Math.floor(diffMs / 60000);

  if (!Number.isFinite(mins)) return "Sin lecturas";

  if (mins < 1) return "Hace segundos";
  if (mins < 60) return `Hace ${mins} min`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `Hace ${hrs} h`;
  const days = Math.floor(hrs / 24);
  return `Hace ${days} d`;
}

function latestRecordOfSession(
  s: Session | null | undefined,
): SessionData | undefined {
  if (!s || !Array.isArray(s.records) || s.records.length === 0)
    return undefined;

  return s.records.reduce<SessionData | undefined>((acc, r) => {
    const rDate = safeDate(r.recordedAt);
    const accDate = acc ? safeDate(acc.recordedAt) : null;
    if (!rDate) return acc;
    if (!acc || (accDate && rDate > accDate)) return r;
    return acc;
  }, undefined);
}

function latestGlobal(sessions: Session[] | null | undefined) {
  if (!Array.isArray(sessions) || sessions.length === 0) {
    return { rec: undefined, ses: undefined };
  }

  let rec: SessionData | undefined;
  let ses: Session | undefined;

  for (const s of sessions) {
    if (!Array.isArray(s.records)) continue;
    for (const r of s.records) {
      const rDate = safeDate(r.recordedAt);
      if (!rDate) continue;

      const currentDate = rec ? safeDate(rec.recordedAt) : null;
      if (!rec || (currentDate && rDate > currentDate)) {
        rec = r;
        ses = s;
      }
    }
  }

  return { rec, ses };
}

function countTodaySessions(sessions: Session[] | null | undefined) {
  if (!Array.isArray(sessions) || sessions.length === 0) return 0;

  const start = new Date();
  start.setHours(0, 0, 0, 0);
  const end = new Date();
  end.setHours(23, 59, 59, 999);

  return sessions.filter((s) => {
    const d = safeDate(s.startedAt);
    return d && d >= start && d <= end;
  }).length;
}

function distinctPatientCount(sessions: Session[] | null | undefined) {
  if (!Array.isArray(sessions) || sessions.length === 0) return 0;

  const set = new Set<string>();
  sessions.forEach((s) => {
    const id = s?.patient?.id;
    if (id) set.add(id);
  });
  return set.size;
}

function num(n: unknown): number | null {
  const x = Number(n);
  return Number.isFinite(x) ? x : null;
}

function pct(now: number | null, min: number, max: number) {
  if (now == null || max <= min) return 0;
  return Math.max(0, Math.min(100, ((now - min) / (max - min)) * 100));
}

/* ============== Página ============== */
export default function DashboardPage() {
  const { user } = useAuthStore();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await sessionService.findAll(); // ✅ getAll
      // Aseguramos que sessions siempre sea un array válido
      setSessions(Array.isArray(data) ? data : []);
    } catch {
      setError("No se pudieron cargar las sesiones.");
      setSessions([]); // fallback defensivo
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  /* -------- Derivados -------- */
  const { rec: latestRecord, ses: latestSession } = useMemo(
    () => latestGlobal(sessions),
    [sessions],
  );

  const lastUpdate = useMemo(
    () => formatRelative(latestRecord?.recordedAt ?? null),
    [latestRecord],
  );

  const latestPatientName = latestSession?.patient
    ? `${latestSession.patient.user.fullname ?? ""}`.trim() ||
      latestSession.patient.id
    : "Paciente";

  const patientsCount = useMemo(
    () => distinctPatientCount(sessions),
    [sessions],
  );

  const todayCount = useMemo(() => countTodaySessions(sessions), [sessions]);

  // Puedes calcularlo con reglas (SpO2<92, Temp≥38, SYS≥140 o DIA≥90, etc.)
  const criticalCount = 0;
  const stableCount = Math.max(patientsCount - criticalCount, 0);

  // === Nuevas métricas del último registro ===
  const vPulse = num(latestRecord?.pulse);
  const vSpo2 = num(latestRecord?.oxygenSaturation);
  const vTemp = pickVital(
    latestRecord as (SessionData & ExtVitals) | undefined,
    "temperatureC",
  );
  const vSys = pickVital(
    latestRecord as (SessionData & ExtVitals) | undefined,
    "systolic",
  );
  const vDia = pickVital(
    latestRecord as (SessionData & ExtVitals) | undefined,
    "diastolic",
  );

  // Rangos para barras (ajusta por clínica)
  const rPulse = { min: 40, max: 160 };
  const rSpo2 = { min: 85, max: 100 };
  const rTemp = { min: 35, max: 40 };
  const toPctSys = (v: number) => pct(v, 80, 180);

  /* -------- Recientes (top 5 por última lectura) -------- */
  const recentPatients = useMemo(() => {
    if (!Array.isArray(sessions) || sessions.length === 0) return [];

    const map = new Map<string, { name: string; lastISO: string }>();

    sessions.forEach((s) => {
      const r = latestRecordOfSession(s);
      if (!r || !s.patient?.id) return;

      const name = s.patient ? `${s.patient.user.fullname}`.trim() : s.patient;

      const cur = map.get(s.patient.id);
      const rDate = safeDate(r.recordedAt);
      const curDate = cur ? safeDate(cur.lastISO) : null;

      if (!rDate) return;

      if (!cur || (curDate && rDate > curDate)) {
        map.set(s.patient.id, { name, lastISO: r.recordedAt });
      }
    });

    return Array.from(map.values())
      .sort((a, b) => {
        const da = safeDate(a.lastISO);
        const db = safeDate(b.lastISO);
        if (!da && !db) return 0;
        if (!da) return 1;
        if (!db) return -1;
        return db.getTime() - da.getTime();
      })
      .slice(0, 5)
      .map((p) => ({ name: p.name, last: formatRelative(p.lastISO) }));
  }, [sessions]);

  const latestStartedAt = safeDate(latestSession?.startedAt);

  /* ============== UI ============== */
  return (
    <div className="space-y-6">
      {/* HERO con gradiente (nuevo look) */}
      <div className="rounded-2xl border ring-1 ring-border bg-gradient-to-r from-background to-muted/40 p-5 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">
            Hola, {user?.fullname ?? "Doctor"}
          </h2>
          <p className="text-muted-foreground">Panel clínico consolidado</p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={load}
          disabled={loading}
          title="Recargar"
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          {loading ? "Cargando..." : "Recargar"}
        </Button>
      </div>

      {error && (
        <Card className="border-destructive/50">
          <CardHeader>
            <CardTitle className="text-destructive">Error</CardTitle>
            <CardDescription>{error}</CardDescription>
          </CardHeader>
        </Card>
      )}

      {/* KPIs – badges prominentes */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <KpiTile
          label="Pacientes"
          value={patientsCount || 0}
          Icon={Users}
          variant="outline"
        />
        <KpiTile
          label="Sesiones hoy"
          value={todayCount || 0}
          Icon={Activity}
          variant="secondary"
        />
        <KpiTile
          label="Críticas"
          value={criticalCount || 0}
          Icon={AlertTriangle}
          variant="destructive"
        />
        <KpiTile
          label="Estables"
          value={stableCount || 0}
          Icon={CheckCircle}
          variant="outline"
        />
      </div>

      {/* Dos columnas */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Última lectura global – actualizado a Temp + Presión */}
        <Card className="bg-card/60 backdrop-blur border-dotted">
          <CardHeader>
            <CardTitle>Última Lectura</CardTitle>
            <CardDescription>
              {latestSession ? (
                <>
                  Paciente:{" "}
                  <span className="font-medium">{latestPatientName}</span> •{" "}
                  {lastUpdate}
                </>
              ) : (
                "Aún no hay lecturas registradas"
              )}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-3 sm:grid-cols-3">
              <VitalTile
                title="Pulso"
                value={vPulse}
                unit="bpm"
                icon={<HeartPulse className="h-4 w-4" />}
                progress={pct(vPulse, rPulse.min, rPulse.max)}
                hint={`${rPulse.min}-${rPulse.max}`}
              />
              <VitalTile
                title="SpO₂"
                value={vSpo2}
                unit="%"
                icon={<Droplets className="h-4 w-4" />}
                progress={pct(vSpo2, rSpo2.min, rSpo2.max)}
                hint={`${rSpo2.min}-${rSpo2.max}`}
              />
              <VitalTile
                title="Temperatura"
                value={vTemp}
                unit="°C"
                icon={<Thermometer className="h-4 w-4" />}
                progress={pct(vTemp, rTemp.min, rTemp.max)}
                hint={`${rTemp.min}-${rTemp.max}`}
              />
            </div>

            {/* Banda de presión arterial: SYS/DIA */}
            <PressureBand
              systolic={vSys}
              diastolic={vDia}
              toPctSys={toPctSys}
            />

            <Separator />

            <div className="text-xs text-muted-foreground">
              {latestSession ? (
                <>
                  Sesión{" "}
                  {latestSession.id
                    ? String(latestSession.id).slice(0, 8)
                    : "—"}
                  … iniciada{" "}
                  {latestStartedAt
                    ? latestStartedAt.toLocaleString("es-ES")
                    : "Fecha no disponible"}
                </>
              ) : (
                <>No hay sesión activa</>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Pacientes recientes */}
        <Card>
          <CardHeader>
            <CardTitle>Pacientes Recientes</CardTitle>
            <CardDescription>Top 5 por última lectura</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {recentPatients.length ? (
              recentPatients.map((p, i) => (
                <div
                  key={`${p.name}-${i}`}
                  className="flex items-center justify-between rounded-lg border p-3 bg-muted/30"
                >
                  <div>
                    <div className="font-medium">{p.name}</div>
                    <div className="text-xs text-muted-foreground">
                      {p.last}
                    </div>
                  </div>
                  <Badge variant="secondary">Estable</Badge>
                </div>
              ))
            ) : (
              <div className="text-sm text-muted-foreground">
                Aún no hay lecturas para mostrar.
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Sesiones recientes (tarjetas actualizadas) */}
      <Card>
        <CardHeader>
          <CardTitle>Sesiones Recientes</CardTitle>
          <CardDescription>
            Resumen compacto de las últimas 6 sesiones
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          {(Array.isArray(sessions) ? sessions : [])
            .slice()
            .sort((a, b) => {
              const da = safeDate(a.startedAt);
              const db = safeDate(b.startedAt);
              if (!da && !db) return 0;
              if (!da) return 1;
              if (!db) return -1;
              return db.getTime() - da.getTime();
            })
            .slice(0, 6)
            .map((s, idx) => {
              const r = latestRecordOfSession(s);
              const name = s.patient
                ? `${s.patient.user.fullname} `.trim()
                : (s.patient ?? "Paciente");

              const pulse = num(r?.pulse);
              const spo2 = num(r?.oxygenSaturation);
              const temp = num(
                (r as SessionData & { temperatureC?: number })?.temperatureC,
              );
              const sys = num(
                (r as SessionData & { systolic?: number })?.systolic,
              );
              const dia = num(
                (r as SessionData & { diastolic?: number })?.diastolic,
              );

              const startedAt = safeDate(s.startedAt);
              const startedAtLabel = startedAt
                ? startedAt.toLocaleString("es-ES")
                : "Fecha no disponible";

              return (
                <Card
                  key={s.id ?? `session-${idx}`}
                  className="border-muted/70"
                >
                  <CardContent className="py-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="text-sm font-semibold">{name}</div>
                      <Badge variant={s.endedAt ? "outline" : "default"}>
                        {s.endedAt ? "Cerrada" : "Activa"}
                      </Badge>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {startedAtLabel}
                    </div>
                    <Separator />
                    <div className="grid grid-cols-5 gap-2 text-xs">
                      <Chip label="BPM" value={pulse} />
                      <Chip label="SpO₂" value={spo2} />
                      <Chip label="°C" value={temp} />
                      <Chip label="SYS" value={sys} />
                      <Chip label="DIA" value={dia} />
                    </div>
                  </CardContent>
                </Card>
              );
            })}
        </CardContent>
      </Card>
    </div>
  );
}

/* ============== UI auxiliares (nuevo estilo) ============== */
function KpiTile({
  label,
  value,
  Icon,
  variant,
}: {
  label: string;
  value: number;
  Icon: React.ComponentType<{ className?: string }>;
  variant: "outline" | "secondary" | "destructive";
}) {
  return (
    <Card className="bg-muted/30 border-dotted">
      <CardContent className="py-4 flex items-center justify-between">
        <div>
          <div className="text-[11px] text-muted-foreground">{label}</div>
          <div className="text-xl font-semibold">{value}</div>
        </div>
        <Badge variant={variant} className="gap-1">
          <Icon className="h-4 w-4" />
        </Badge>
      </CardContent>
    </Card>
  );
}

function VitalTile({
  title,
  value,
  unit,
  icon,
  progress,
  hint,
}: {
  title: string;
  value: number | null;
  unit: string;
  icon: React.ReactNode;
  progress: number;
  hint?: string;
}) {
  return (
    <div className="rounded-xl border p-3 bg-card/50">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          {icon}
          <span className="text-sm font-medium">{title}</span>
        </div>
        <Badge variant="outline" className="font-mono text-[11px]">
          {value == null ? "—" : `${value.toFixed(0)}${unit}`}
        </Badge>
      </div>
      <Progress value={progress} className="h-1.5" />
      {hint && (
        <div className="text-[11px] text-muted-foreground mt-2">
          Rango: {hint}
        </div>
      )}
    </div>
  );
}

function PressureBand({
  systolic,
  diastolic,
  toPctSys,
}: {
  systolic: number | null;
  diastolic: number | null;
  toPctSys: (v: number) => number;
}) {
  const sys = systolic ?? 0;
  const dia = diastolic ?? 0;
  const left = toPctSys(dia);
  const right = Math.max(0, toPctSys(sys) - left);

  return (
    <div className="rounded-xl border p-3 bg-card/50">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Gauge className="h-4 w-4" />
          <span className="text-sm font-medium">Presión arterial</span>
        </div>
        <Badge variant="outline" className="font-mono text-[11px]">
          {systolic == null || diastolic == null
            ? "—/—"
            : `${sys.toFixed(0)}/${dia.toFixed(0)} mmHg`}
        </Badge>
      </div>
      <div className="relative h-2 w-full rounded-full bg-muted overflow-hidden">
        {/* DIA (base) */}
        <div
          className="absolute inset-y-0 left-0 bg-muted-foreground/30"
          style={{ width: `${left}%` }}
        />
        {/* SYS - DIA */}
        <div
          className="absolute inset-y-0 bg-foreground/70"
          style={{ left: `${left}%`, width: `${right}%` }}
        />
      </div>
      <div className="mt-2 text-[11px] text-muted-foreground">
        Banda visualizada entre DIA (base) y SYS (tope)
      </div>
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
