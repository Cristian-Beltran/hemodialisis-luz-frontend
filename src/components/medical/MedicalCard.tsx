import type React from "react";
import type { ReactNode } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface MedicalCardProps {
  title: string;
  description?: string;
  children: ReactNode;
  status?: "active" | "inactive" | "pending" | "critical";
  priority?: "low" | "medium" | "high";
  className?: string;
  headerAction?: ReactNode;
}

const MedicalCard: React.FC<MedicalCardProps> = ({
  title,
  description,
  children,
  status,
  priority,
  className,
  headerAction,
}) => {
  const getStatusBadge = () => {
    if (!status) return null;

    const variants = {
      active: { variant: "default" as const, label: "Activo" },
      inactive: { variant: "secondary" as const, label: "Inactivo" },
      pending: { variant: "outline" as const, label: "Pendiente" },
      critical: { variant: "destructive" as const, label: "Crítico" },
    };

    const config = variants[status];
    return (
      <Badge variant={config.variant} className="text-xs">
        {config.label}
      </Badge>
    );
  };

  const getPriorityBadge = () => {
    if (!priority) return null;

    const variants = {
      low: {
        variant: "outline" as const,
        label: "Baja",
        color: "text-muted-foreground",
      },
      medium: {
        variant: "secondary" as const,
        label: "Media",
        color: "text-chart-4",
      },
      high: {
        variant: "destructive" as const,
        label: "Alta",
        color: "text-destructive",
      },
    };

    const config = variants[priority];
    return (
      <Badge variant={config.variant} className={cn("text-xs", config.color)}>
        Prioridad {config.label}
      </Badge>
    );
  };

  return (
    <Card
      className={cn(
        "bg-card border-border hover:shadow-medical transition-all duration-200",
        status === "critical" && "border-destructive/50",
        status === "active" && "border-primary/50",
        className,
      )}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <CardTitle className="text-lg text-card-foreground text-balance">
              {title}
            </CardTitle>
            {description && (
              <CardDescription className="text-pretty">
                {description}
              </CardDescription>
            )}
          </div>
          {headerAction && <div className="flex-shrink-0">{headerAction}</div>}
        </div>
        {(status || priority) && (
          <div className="flex items-center gap-2 pt-2">
            {getStatusBadge()}
            {getPriorityBadge()}
          </div>
        )}
      </CardHeader>
      <CardContent className="pt-0">{children}</CardContent>
    </Card>
  );
};

export default MedicalCard;
