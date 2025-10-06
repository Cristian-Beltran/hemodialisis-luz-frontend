import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Clock, FileText } from "lucide-react";
import type { MonitoringSession } from "@/types/monitoring-session";

interface MonitoringSessionCardProps {
  session: MonitoringSession;
  onViewReport?: () => void;
}

export function MonitoringSessionCard({
  session,
  onViewReport,
}: MonitoringSessionCardProps) {
  const sessionDate = new Date(session.sessionDate).toLocaleDateString(
    "es-ES",
    {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    },
  );

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold">
            Sesión de Monitoreo
          </CardTitle>
        </div>
        <p className="text-sm text-muted-foreground capitalize">
          {sessionDate}
        </p>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-sm">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <p>Ultima sesión registrada</p>
          </div>

          {session.notes && (
            <div className="rounded-lg bg-muted p-3">
              <p className="text-sm">{session.notes}</p>
            </div>
          )}

          <div className="flex gap-2">
            <Button onClick={onViewReport} variant="outline" size="sm">
              <FileText className="mr-2 h-4 w-4" />
              Ver Reporte
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
