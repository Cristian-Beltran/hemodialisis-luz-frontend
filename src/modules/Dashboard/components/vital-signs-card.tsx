import type React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface VitalSign {
  label: string;
  value: number | string;
  unit: string;
  status: "normal" | "warning" | "critical";
  icon: React.ElementType;
  trend?: "up" | "down" | "stable";
}

interface VitalSignsCardProps {
  patientName?: string;
  lastUpdate?: string;
  vitals: VitalSign[];
}

export function VitalSignsCard({
  patientName,
  lastUpdate,
  vitals,
}: VitalSignsCardProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "normal":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      case "warning":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
      case "critical":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
    }
  };

  const getTrendIcon = (trend?: string) => {
    switch (trend) {
      case "up":
        return "↗";
      case "down":
        return "↘";
      case "stable":
        return "→";
      default:
        return "";
    }
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold">
            Signos Vitales
          </CardTitle>
          {patientName && <Badge variant="outline">{patientName}</Badge>}
        </div>
        {lastUpdate && (
          <p className="text-sm text-muted-foreground">
            Última actualización: {lastUpdate}
          </p>
        )}
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 md:grid-cols-3">
          {vitals.map((vital, index) => {
            const Icon = vital.icon;
            return (
              <div
                key={index}
                className="flex items-center space-x-3 rounded-lg border p-3"
              >
                <div className="flex-shrink-0">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900">
                    <Icon className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    {vital.label}
                  </p>
                  <div className="flex items-center gap-2">
                    <p className="text-lg font-bold text-gray-900 dark:text-gray-100">
                      {vital.value} {vital.unit}
                    </p>
                    {vital.trend && (
                      <span className="text-sm text-gray-500">
                        {getTrendIcon(vital.trend)}
                      </span>
                    )}
                  </div>
                  <Badge
                    className={cn("text-xs", getStatusColor(vital.status))}
                    variant="secondary"
                  >
                    {vital.status === "normal" && "Normal"}
                    {vital.status === "warning" && "Atención"}
                    {vital.status === "critical" && "Crítico"}
                  </Badge>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
