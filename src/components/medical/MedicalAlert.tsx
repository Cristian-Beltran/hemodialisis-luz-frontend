"use client";
import type React from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, Info, CheckCircle, XCircle, Clock } from "lucide-react";

interface MedicalAlertProps {
  type: "info" | "warning" | "error" | "success";
  title: string;
  message: string;
  timestamp?: string;
  priority?: "low" | "medium" | "high";
  actionRequired?: boolean;
}

const MedicalAlert: React.FC<MedicalAlertProps> = ({
  type,
  title,
  message,
  timestamp,
  priority = "medium",
  actionRequired = false,
}) => {
  const getIcon = () => {
    switch (type) {
      case "error":
        return <XCircle className="h-4 w-4" />;
      case "warning":
        return <AlertTriangle className="h-4 w-4" />;
      case "success":
        return <CheckCircle className="h-4 w-4" />;
      default:
        return <Info className="h-4 w-4" />;
    }
  };

  const getVariant = () => {
    return type === "error" ? "destructive" : "default";
  };

  const getPriorityBadge = () => {
    const variants = {
      low: "outline",
      medium: "secondary",
      high: "destructive",
    } as const;

    return (
      <Badge variant={variants[priority]} className="text-xs">
        {priority === "low" ? "Baja" : priority === "medium" ? "Media" : "Alta"}
      </Badge>
    );
  };

  return (
    <Alert variant={getVariant()} className="animate-fade-in">
      {getIcon()}
      <div className="flex-1">
        <div className="flex items-center justify-between mb-1">
          <AlertTitle className="text-sm font-medium">{title}</AlertTitle>
          <div className="flex items-center gap-2">
            {getPriorityBadge()}
            {actionRequired && (
              <Badge
                variant="outline"
                className="text-xs bg-chart-4/10 text-chart-4 border-chart-4/20"
              >
                Acción Requerida
              </Badge>
            )}
          </div>
        </div>
        <AlertDescription className="text-sm text-pretty">
          {message}
        </AlertDescription>
        {timestamp && (
          <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
            <Clock className="h-3 w-3" />
            {timestamp}
          </div>
        )}
      </div>
    </Alert>
  );
};

export default MedicalAlert;
