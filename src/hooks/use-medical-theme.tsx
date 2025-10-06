"use client";

import { useTheme } from "@/contexts/ThemeContext";

export const useMedicalTheme = () => {
  const { theme, toggleTheme } = useTheme();

  const medicalColors = {
    primary: "var(--color-primary)",
    secondary: "var(--color-secondary)",
    success: "var(--color-primary)",
    warning: "var(--color-chart-4)",
    error: "var(--color-destructive)",
    info: "var(--color-chart-2)",
  };

  const getMedicalStatusColor = (
    status: "normal" | "warning" | "critical" | "success",
  ) => {
    switch (status) {
      case "success":
        return medicalColors.success;
      case "warning":
        return medicalColors.warning;
      case "critical":
        return medicalColors.error;
      default:
        return medicalColors.primary;
    }
  };

  const getMedicalPriorityColor = (priority: "low" | "medium" | "high") => {
    switch (priority) {
      case "high":
        return medicalColors.error;
      case "medium":
        return medicalColors.warning;
      default:
        return medicalColors.info;
    }
  };

  return {
    theme,
    toggleTheme,
    medicalColors,
    getMedicalStatusColor,
    getMedicalPriorityColor,
  };
};
