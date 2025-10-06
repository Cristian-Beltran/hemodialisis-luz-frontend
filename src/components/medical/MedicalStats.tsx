import type React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, Activity, AlertCircle } from "lucide-react";

interface MedicalStatsProps {
  title: string;
  value: string | number;
  change?: number;
  target?: number;
  status?: "normal" | "warning" | "critical";
  unit?: string;
}

const MedicalStats: React.FC<MedicalStatsProps> = ({
  title,
  value,
  change,
  target,
  status = "normal",
  unit,
}) => {
  const getStatusColor = () => {
    switch (status) {
      case "warning":
        return "text-chart-4";
      case "critical":
        return "text-destructive";
      default:
        return "text-primary";
    }
  };

  const getStatusBadge = () => {
    switch (status) {
      case "warning":
        return (
          <Badge
            variant="secondary"
            className="bg-chart-4/10 text-chart-4 border-chart-4/20"
          >
            Atención
          </Badge>
        );
      case "critical":
        return <Badge variant="destructive">Crítico</Badge>;
      default:
        return <Badge variant="default">Normal</Badge>;
    }
  };

  const progressValue = target ? (Number(value) / target) * 100 : undefined;

  return (
    <Card className="bg-card border-border hover:shadow-medical transition-shadow">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-card-foreground">
          {title}
        </CardTitle>
        <div className="flex items-center gap-2">
          {status === "critical" && (
            <AlertCircle className="h-4 w-4 text-destructive" />
          )}
          <Activity className={`h-4 w-4 ${getStatusColor()}`} />
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="flex items-baseline gap-2">
            <div className={`text-2xl font-bold ${getStatusColor()}`}>
              {value}
              {unit && (
                <span className="text-sm font-normal text-muted-foreground ml-1">
                  {unit}
                </span>
              )}
            </div>
            {getStatusBadge()}
          </div>

          {change !== undefined && (
            <div className="flex items-center gap-1 text-xs">
              {change >= 0 ? (
                <TrendingUp className="h-3 w-3 text-primary" />
              ) : (
                <TrendingDown className="h-3 w-3 text-destructive" />
              )}
              <span
                className={change >= 0 ? "text-primary" : "text-destructive"}
              >
                {change >= 0 ? "+" : ""}
                {change}%
              </span>
              <span className="text-muted-foreground">vs. anterior</span>
            </div>
          )}

          {target && progressValue !== undefined && (
            <div className="space-y-1">
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Progreso</span>
                <span>{Math.round(progressValue)}%</span>
              </div>
              <Progress value={progressValue} className="h-2" />
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default MedicalStats;
