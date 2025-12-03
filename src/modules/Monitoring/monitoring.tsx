import { useEffect, useMemo, useRef, useState } from "react";
import { sessionService } from "@/modules/Session/data/session.service";
import { patientService } from "@/modules/Patient/data/patient.service";
import type { Session } from "@/modules/Session/session.interface";
import type { Patient } from "@/modules/Patient/patient.interface";

import {
  isWebSerialSupported,
  getAuthorizedPorts,
  requestPort,
  openPort,
  writeLine,
  type SerialIO,
} from "./serialAdapter";
import type { SerialPort } from "./serial.interface";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import {
  Play,
  Square,
  RefreshCw,
  Link2,
  Link2Off,
  Usb,
  User,
  Activity,
  Droplets,
  Thermometer,
  HeartPulse,
  AlertTriangle,
  Check,
} from "lucide-react";

/* ======================== Tipos fuertes ======================== */
type RealtimeRow = {
  timestamp: string; // ISO
  pulse: number; // bpm
  oxygenSaturation: number; // %
  temperatureC: number; // °C
  systolic: number; // mmHg
  diastolic: number; // mmHg
};
type MetricKey =
  | "pulse"
  | "oxygenSaturation"
  | "temperatureC"
  | "systolic"
  | "diastolic";

function fmtTime(iso?: string) {
  return iso
    ? new Date(iso).toLocaleTimeString("es-ES", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      })
    : "—";
}

/* Normalizadores de % solo para UI */
const toPct = {
  pulse: (v: number) => clamp(((v - 40) / (180 - 40)) * 100, 0, 100),
  spo2: (v: number) => clamp(v, 0, 100),
  temp: (v: number) => clamp(((v - 35) / (40 - 35)) * 100, 0, 100),
  sys: (v: number) => clamp(((v - 80) / (180 - 80)) * 100, 0, 100),
};

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

/* ======================== Parser NDJSON ======================== */
/**
 * Acepta alias del firmware:
 * pulse|bpm, spo2|oxygenSaturation, temp|temperatureC, sys|systolic, dia|diastolic
 */
function parseLine(line: string): RealtimeRow | null {
  const ts = new Date().toISOString();
  const s = line.trim();
  if (!s || !s.startsWith("{") || !s.endsWith("}")) return null;

  try {
    const obj = JSON.parse(s) as Record<string, unknown>;
    const pulse = Number(obj.pulse ?? obj.bpm);
    const spo2 = Number(obj.spo2 ?? obj.oxygenSaturation);
    const temp = Number(obj.temp ?? obj.temperatureC);
    const sys = Number(obj.sys ?? obj.systolic);
    const dia = Number(obj.dia ?? obj.diastolic);
    const ok = [pulse, spo2, temp, sys, dia].every((x) => Number.isFinite(x));
    if (!ok) return null;
    return {
      timestamp: ts,
      pulse,
      oxygenSaturation: spo2,
      temperatureC: temp,
      systolic: sys,
      diastolic: dia,
    };
  } catch {
    return null;
  }
}

/* ======================== Sparklines (SVG) ======================== */
function sparklinePath(
  values: number[],
  width: number,
  height: number,
): string {
  if (!values.length) return "";
  const min = Math.min(...values);
  const max = Math.max(...values);
  const span = Math.max(1, max - min);
  const stepX = width / Math.max(1, values.length - 1);

  return values
    .map((v, i) => {
      const x = i * stepX;
      const y = height - ((v - min) / span) * height;
      return `${i === 0 ? "M" : "L"}${x.toFixed(2)},${y.toFixed(2)}`;
    })
    .join(" ");
}

/* ======================== Página ======================== */
export default function MonitoringPage() {
  // Dominio
  const [patients, setPatients] = useState<Patient[]>([]);
  const [patientId, setPatientId] = useState<string>("");
  const [session, setSession] = useState<Session | null>(null);

  // Serial
  const [ports, setPorts] = useState<SerialPort[]>([]);
  const [selectedPortIdx, setSelectedPortIdx] = useState<number>(-1);
  const [io, setIo] = useState<SerialIO | null>(null);

  // Flags
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [startedFromDevice, setStartedFromDevice] = useState(false);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  // Datos
  const [realtime, setRealtime] = useState<RealtimeRow[]>([]);
  const last = realtime.at(-1) ?? null;

  // Backend push
  const lastSentRef = useRef<number>(0);
  const closeLoopRef = useRef<boolean>(false);

  /* -------- Efectos -------- */
  useEffect(() => {
    (async () => {
      try {
        const data = await patientService.findAll();
        setPatients(data ?? []);
      } catch (e: unknown) {
        setErr(
          e instanceof Error
            ? e.message
            : "No se pudieron cargar los pacientes.",
        );
      }
    })();
  }, []);

  useEffect(() => {
    (async () => {
      if (!isWebSerialSupported()) return;
      const list = await getAuthorizedPorts();
      setPorts(list);
    })();
  }, []);

  /* -------- Derivados -------- */
  const isConnected = io !== null;
  const canCreateSession = !!patientId && !session;
  const canPickDevice = !!session && !isMonitoring;
  const canConnect = !!session && selectedPortIdx >= 0 && !isConnected;
  const canStart = !!session && isConnected && !isMonitoring;
  const canStop = !!session && isMonitoring;
  const canReset = !isMonitoring && (!!session || !!patientId);

  /* -------- Acciones -------- */
  const handleCreateSession = async (): Promise<void> => {
    if (!patientId) return;
    setLoading(true);
    setErr(null);
    try {
      const s = await sessionService.create({ patientId });
      setSession(s);
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : "Error creando la sesión.");
    } finally {
      setLoading(false);
    }
  };

  const handleRequestPort = async (): Promise<void> => {
    setErr(null);
    try {
      const p = await requestPort();
      const list = await getAuthorizedPorts();
      setPorts(list);
      const idx = list.findIndex((x) => x === p);
      setSelectedPortIdx(idx >= 0 ? idx : -1);
    } catch {
      /* cancelado */
    }
  };

  const handleConnect = async (): Promise<void> => {
    if (selectedPortIdx < 0) return;
    setErr(null);
    try {
      const connected = await openPort(ports[selectedPortIdx], 115200);
      setIo(connected);
      closeLoopRef.current = false;
      void readLoop(connected);
    } catch (e: unknown) {
      setErr(
        e instanceof Error ? e.message : "No se pudo abrir el puerto serial.",
      );
    }
  };

  const handleDisconnect = async (): Promise<void> => {
    if (!io) return;
    closeLoopRef.current = true;
    try {
      await io.close();
    } catch {
      /* noop */
    }
    setIo(null);
  };

  const handleStart = async (): Promise<void> => {
    if (!io || !session) return;
    setErr(null);
    setStartedFromDevice(false);
    await writeLine(io.writer, "1");
    setIsMonitoring(true);
  };

  const handleStop = async (): Promise<void> => {
    if (!io || !session) return;
    setErr(null);
    await writeLine(io.writer, "0");
    setIsMonitoring(false);
    try {
      await sessionService.close(session.id);
      setSession((s) => (s ? { ...s, endedAt: new Date().toISOString() } : s));
    } catch {
      /* tolerar */
    }
  };

  const handleReset = async (): Promise<void> => {
    if (isMonitoring) return;
    await handleDisconnect();
    setRealtime([]);
    setStartedFromDevice(false);
    setSession(null);
    setPatientId("");
    setErr(null);
    setSelectedPortIdx(-1);
  };

  /* -------- Loop de lectura -------- */

  const readLoop = async (connected: SerialIO): Promise<void> => {
    while (!closeLoopRef.current) {
      try {
        const { value, done } = await connected.reader.read();
        if (done) break;
        if (!value) continue;

        // 👉 LOG CRUDO
        console.log("[SERIAL RAW]", JSON.stringify(value));

        const reading = parseLine(value);

        // 👉 LOG PARSEADO
        console.log("[SERIAL PARSED]", reading);

        if (!reading) continue;

        if (session && !isMonitoring) {
          setIsMonitoring(true);
          setStartedFromDevice(true);
        }

        setRealtime((prev) => {
          const up = [...prev, reading];
          return up.slice(-200);
        });

        const now = Date.now();
        if (session && now - lastSentRef.current >= 1000) {
          lastSentRef.current = now;
          try {
            await sessionService.addData(session.id, {
              pulse: clamp(reading.pulse, 20, 240),
              oxygenSaturation: clamp(reading.oxygenSaturation, 50, 100),
              temperatureC: clamp(reading.temperatureC, 30, 45),
              systolic: clamp(reading.systolic, 50, 260),
              diastolic: clamp(reading.diastolic, 30, 200),
            });
          } catch {
            /* tolerar */
          }
        }
      } catch (e: unknown) {
        if (closeLoopRef.current) break;
        setErr(
          e instanceof Error
            ? e.message
            : "Error leyendo datos del dispositivo.",
        );
        break;
      }
    }
  };

  /* -------- Series para sparklines -------- */
  const series = useMemo(() => {
    const lastN = realtime.slice(-50);
    const by = <K extends MetricKey>(k: K): number[] =>
      lastN
        .map((r) => r[k])
        .filter((v) => typeof v === "number" && Number.isFinite(v));
    return {
      pulse: by("pulse"),
      oxygenSaturation: by("oxygenSaturation"),
      temperatureC: by("temperatureC"),
      systolic: by("systolic"),
      diastolic: by("diastolic"),
    };
  }, [realtime]);

  /* ======================== UI – Layout Dock ======================== */
  return (
    <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-6">
      {/* Sidebar Izquierda: Paciente + Dispositivo */}
      <aside className="rounded-2xl border ring-1 ring-border bg-gradient-to-b from-background to-muted/30 p-4 space-y-4">
        <header className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold">Panel de control</h2>
            <p className="text-xs text-muted-foreground">
              Configuración y estado del enlace
            </p>
          </div>
          <Badge variant={isConnected ? "default" : "secondary"}>
            {isConnected ? "Conectado" : "Desconectado"}
          </Badge>
        </header>

        {err && (
          <div className="rounded-lg border border-destructive/40 bg-destructive/5 p-3 text-[13px]">
            {err}
          </div>
        )}

        {/* Selección de Paciente */}
        <section className="space-y-2">
          <div className="text-xs font-medium flex items-center gap-2">
            <User className="h-3.5 w-3.5" /> Paciente
          </div>
          <select
            className="w-full rounded-md border px-3 py-2 bg-background"
            value={patientId}
            onChange={(e) => setPatientId(e.target.value)}
            disabled={!!session || loading}
          >
            <option value="">— Selecciona paciente —</option>
            {patients.map((p) => (
              <option key={p.id} value={p.id}>
                {p.user.fullname}
              </option>
            ))}
          </select>
          <Button
            className="w-full"
            onClick={handleCreateSession}
            disabled={!canCreateSession || loading}
          >
            <Usb className="h-4 w-4 mr-2" /> Crear sesión
          </Button>
        </section>

        <Separator />

        {/* Dispositivo */}
        <section className="space-y-2">
          <div className="text-xs font-medium">Dispositivo (WebSerial)</div>
          <div className="grid grid-cols-[1fr_auto] gap-2">
            <select
              className="w-full rounded-md border px-3 py-2 bg-background"
              value={selectedPortIdx}
              onChange={(e) => setSelectedPortIdx(Number(e.target.value))}
              disabled={!canPickDevice}
            >
              <option value={-1}>— Selecciona dispositivo —</option>
              {ports.map((_p, idx) => (
                <option key={idx} value={idx}>
                  Dispositivo #{idx + 1}
                </option>
              ))}
            </select>
            <Button
              variant="outline"
              onClick={handleRequestPort}
              disabled={!canPickDevice || !isWebSerialSupported()}
            >
              Escanear
            </Button>
          </div>
          <div className="flex gap-2">
            {isConnected ? (
              <Button
                variant="destructive"
                className="flex-1"
                onClick={handleDisconnect}
              >
                <Link2Off className="h-4 w-4 mr-2" /> Desconectar
              </Button>
            ) : (
              <Button
                className="flex-1"
                onClick={handleConnect}
                disabled={!canConnect}
              >
                <Link2 className="h-4 w-4 mr-2" /> Conectar
              </Button>
            )}
            <Button
              variant="outline"
              onClick={handleReset}
              disabled={!canReset}
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        </section>

        <Separator />

        {/* Paso a paso ultra-compacto */}
        <section className="space-y-2">
          <div className="text-xs font-medium">Flujo</div>
          <div className="space-y-2">
            {[
              { label: "Seleccionar paciente", done: !!patientId },
              { label: "Crear sesión", done: !!session },
              { label: "Seleccionar dispositivo", done: selectedPortIdx >= 0 },
              { label: "Conectar", done: isConnected },
              { label: "Monitorear", done: isMonitoring },
            ].map((s, i) => (
              <div key={i} className="rounded-md border p-2 bg-card/60">
                <div className="flex items-center justify-between">
                  <span className="text-xs">{s.label}</span>
                  {s.done ? (
                    <Check className="h-4 w-4 text-green-600" />
                  ) : (
                    <AlertTriangle className="h-4 w-4 text-amber-600" />
                  )}
                </div>
                <Progress value={s.done ? 100 : 0} className="h-1 mt-2" />
              </div>
            ))}
          </div>
        </section>
      </aside>

      {/* Panel Principal: Métricas + Ticker + Dock */}
      <section className="relative rounded-2xl border ring-1 ring-border bg-background/60 backdrop-blur p-4">
        {/* Header fino */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="text-xs text-muted-foreground">
              {session ? `Sesión ${session.id.slice(0, 8)}…` : "Sin sesión"}
            </div>
            <div className="text-sm">
              Última lectura: {fmtTime(last?.timestamp)} • Total{" "}
              {realtime.length}
            </div>
          </div>
          <div className="flex items-center gap-2">
            {isMonitoring ? (
              <Badge variant="default">Grabando</Badge>
            ) : (
              <Badge variant="secondary">En espera</Badge>
            )}
            {startedFromDevice && (
              <Badge variant="outline">Inicio desde dispositivo</Badge>
            )}
          </div>
        </div>

        <Separator className="my-3" />

        {/* Cuadrante de métricas con dígitos grandes + sparkline */}

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4 items-stretch">
          <MetricTile
            title="Pulso"
            value={last?.pulse ?? null}
            unit="bpm"
            icon={<HeartPulse className="h-4 w-4" />}
            pct={typeof last?.pulse === "number" ? toPct.pulse(last!.pulse) : 0}
            series={series.pulse}
          />
          <MetricTile
            title="SpO₂"
            value={last?.oxygenSaturation ?? null}
            unit="%"
            icon={<Droplets className="h-4 w-4" />}
            pct={
              typeof last?.oxygenSaturation === "number"
                ? toPct.spo2(last!.oxygenSaturation)
                : 0
            }
            series={series.oxygenSaturation}
          />
          <MetricTile
            title="Temperatura"
            value={last?.temperatureC ?? null}
            unit="°C"
            icon={<Thermometer className="h-4 w-4" />}
            pct={
              typeof last?.temperatureC === "number"
                ? toPct.temp(last!.temperatureC)
                : 0
            }
            series={series.temperatureC}
          />
          <BpTile
            systolic={last?.systolic ?? null}
            diastolic={last?.diastolic ?? null}
            sysSeries={series.systolic}
            diaSeries={series.diastolic}
          />
        </div>

        {/* Ticker horizontal de últimos N */}
        <div className="mt-5">
          <div className="text-xs text-muted-foreground mb-2">
            Ticker últimos 20
          </div>
          <div className="flex gap-2 overflow-x-auto py-2 custom-scrollbar">
            {realtime.slice(-20).map((r, i) => (
              <div
                key={i}
                className="min-w-[240px] rounded-lg border px-3 py-2 bg-card/50"
              >
                <div className="text-[11px] text-muted-foreground">
                  {fmtTime(r.timestamp)}
                </div>
                <div className="mt-1 grid grid-cols-5 gap-1 text-[11px] font-mono">
                  <BadgeCell label="BPM" val={r.pulse} />
                  <BadgeCell label="SpO₂" val={r.oxygenSaturation} />
                  <BadgeCell label="°C" val={r.temperatureC} />
                  <BadgeCell label="SYS" val={r.systolic} />
                  <BadgeCell label="DIA" val={r.diastolic} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* DOCK inferior: controles primarios anclados */}
        <div className="sticky bottom-0 mt-6 -mx-4 rounded-t-2xl border-t bg-gradient-to-t from-background to-background/60 backdrop-blur px-4 py-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="text-xs text-muted-foreground">
              {session?.endedAt
                ? "Sesión cerrada"
                : isMonitoring
                  ? "Monitoreo activo"
                  : "Listo para iniciar"}
            </div>
            <div className="flex gap-2">
              {isMonitoring ? (
                <Button
                  variant="destructive"
                  onClick={handleStop}
                  disabled={!canStop}
                >
                  <Square className="h-4 w-4 mr-2" /> Finalizar
                </Button>
              ) : (
                <Button onClick={handleStart} disabled={!canStart}>
                  <Play className="h-4 w-4 mr-2" /> Iniciar
                </Button>
              )}
              {isConnected ? (
                <Button variant="outline" onClick={handleDisconnect}>
                  <Link2Off className="h-4 w-4 mr-2" /> Desconectar
                </Button>
              ) : (
                <Button
                  variant="outline"
                  onClick={handleConnect}
                  disabled={!canConnect}
                >
                  <Link2 className="h-4 w-4 mr-2" /> Conectar
                </Button>
              )}
              <Button
                variant="outline"
                onClick={handleReset}
                disabled={!canReset}
              >
                <RefreshCw className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

/* ======================== Subcomponentes (sin any) ======================== */

function MetricTile({
  title,
  value,
  unit,
  icon,
  pct,
  series,
}: {
  title: string;
  value: number | null;
  unit: string;
  icon: React.ReactNode;
  pct: number;
  series: number[];
}) {
  const v = value;
  const show = typeof v === "number" && Number.isFinite(v);

  // Dimensiones internas para calcular el path,
  // pero el SVG se va a escalar con CSS (w-full)
  const sparkW = 100;
  const sparkH = 32;
  const path = sparklinePath(series, sparkW, sparkH);

  return (
    <div className="min-w-0 h-full rounded-2xl border p-4 bg-card/60 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          {icon}
          <span className="text-sm font-medium truncate">{title}</span>
        </div>
        <span className="font-mono text-xs text-muted-foreground whitespace-nowrap">
          {unit}
        </span>
      </div>

      {/* Valor + sparkline */}
      <div className="mt-2 flex items-end justify-between gap-2">
        <div className="text-2xl font-semibold leading-none tracking-tight">
          {show ? v.toFixed(0) : "—"}
        </div>
        <div className="flex-1 flex justify-end">
          <svg
            viewBox={`0 0 ${sparkW} ${sparkH}`}
            className="w-24 sm:w-32 h-10 opacity-80 flex-shrink-0"
          >
            {/* Línea base */}
            <polyline
              points={`0,${sparkH} ${sparkW},${sparkH}`}
              stroke="currentColor"
              opacity={0.15}
              strokeWidth="1"
              fill="none"
            />
            {path && (
              <path
                d={path}
                stroke="currentColor"
                strokeWidth="2"
                fill="none"
              />
            )}
          </svg>
        </div>
      </div>

      {/* Barra de progreso */}
      <div className="mt-3">
        <Progress value={show ? pct : 0} className="h-1.5" />
      </div>
    </div>
  );
}

function BpTile({
  systolic,
  diastolic,
  sysSeries,
  diaSeries,
}: {
  systolic: number | null;
  diastolic: number | null;
  sysSeries: number[];
  diaSeries: number[];
}) {
  const sys = typeof systolic === "number" ? systolic : null;
  const dia = typeof diastolic === "number" ? diastolic : null;

  const sparkW = 180;
  const sparkH = 40;
  const sysPath = sparklinePath(sysSeries, sparkW, sparkH);
  const diaPath = sparklinePath(diaSeries, sparkW, sparkH);

  const base = dia ?? 0;
  const top = sys ?? base;
  const basePct = toPct.sys(base);
  const topPct = toPct.sys(top);

  return (
    <div className="rounded-2xl border p-4 bg-card/60">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Activity className="h-4 w-4" />
          <span className="text-sm font-medium">Presión arterial</span>
        </div>
        <span className="font-mono text-xs text-muted-foreground">mmHg</span>
      </div>

      <div className="mt-2 flex items-end justify-between">
        <div className="text-3xl font-semibold leading-none tracking-tight">
          {sys == null || dia == null
            ? "—/—"
            : `${sys.toFixed(0)}/${dia.toFixed(0)}`}
        </div>
        <svg
          width={sparkW}
          height={sparkH}
          viewBox={`0 0 ${sparkW} ${sparkH}`}
          className="opacity-80"
        >
          <polyline
            points={`0,${sparkH} ${sparkW},${sparkH}`}
            stroke="currentColor"
            opacity={0.15}
            strokeWidth="1"
            fill="none"
          />
          <path
            d={diaPath}
            stroke="currentColor"
            strokeWidth="1.5"
            strokeDasharray="4 3"
            fill="none"
          />
          <path d={sysPath} stroke="currentColor" strokeWidth="2" fill="none" />
        </svg>
      </div>

      {/* Banda SYS/DIA */}
      <div className="mt-3">
        <div className="relative h-2 w-full rounded-full bg-muted overflow-hidden">
          <div
            className="absolute inset-y-0 left-0 bg-muted-foreground/30"
            style={{ width: `${basePct}%` }}
          />
          <div
            className="absolute inset-y-0 bg-foreground/70"
            style={{
              left: `${basePct}%`,
              width: `${Math.max(0, topPct - basePct)}%`,
            }}
          />
        </div>
      </div>
    </div>
  );
}

function BadgeCell({ label, val }: { label: string; val: number }) {
  const v = Number.isFinite(val) ? Number(val) : null;
  return (
    <div className="rounded border px-2 py-1 bg-muted/30 flex items-center justify-between">
      <span className="text-[10px] text-muted-foreground">{label}</span>
      <span className="font-mono text-[11px]">
        {v === null ? "—" : v.toFixed(0)}
      </span>
    </div>
  );
}

/* ===== css scrollbar minimal =====
.custom-scrollbar::-webkit-scrollbar { height: 8px; width: 8px; }
.custom-scrollbar::-webkit-scrollbar-thumb { border-radius: 9999px; background: hsl(var(--muted-foreground) / 0.35); }
.custom-scrollbar:hover::-webkit-scrollbar-thumb { background: hsl(var(--muted-foreground) / 0.55); }
*/
