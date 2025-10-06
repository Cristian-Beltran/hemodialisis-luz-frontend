// Constantes para el sistema clínico

export const USER_ROLES = {
  DOCTOR: "doctor" as const,
  PATIENT: "patient" as const,
  FAMILY: "family" as const,
} as const;

export const SESSION_STATUS = {
  ACTIVE: "active" as const,
  CLOSED: "closed" as const,
} as const;

export const BREATHING_PHASES = {
  INHALE: "inhale" as const,
  HOLD: "hold" as const,
  EXHALE: "exhale" as const,
  REST: "rest" as const,
} as const;

export const VITAL_SIGNS_RANGES = {
  PULSE: {
    MIN: 40,
    MAX: 200,
    NORMAL_MIN: 60,
    NORMAL_MAX: 100,
  },
  SPO2: {
    MIN: 70,
    MAX: 100,
    NORMAL_MIN: 95,
    NORMAL_MAX: 100,
  },
  PRESSURE_VOLTAGE: {
    MIN: 0,
    MAX: 5, // Asumiendo sensor de 5V
  },
} as const;

export const RELATIONSHIPS = [
  "spouse",
  "parent",
  "child",
  "sibling",
  "grandparent",
  "grandchild",
  "other",
] as const;

export const CHART_COLORS = {
  PULSE: "#ef4444", // red-500
  SPO2: "#3b82f6", // blue-500
  PRESSURE: "#10b981", // emerald-500
  BREATHING: "#f59e0b", // amber-500
} as const;
