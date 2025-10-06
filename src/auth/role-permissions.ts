export type Role = "patient" | "family" | "doctor" | "admin";
export type Permission =
  | "patients.read"
  | "patients.write"
  | "sessions.read"
  | "sessions.write"
  | "telemetry.read"
  | "telemetry.write";

export const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  patient: ["sessions.read"],
  family: ["patients.read", "sessions.read"],
  doctor: [
    "patients.read",
    "patients.write",
    "sessions.read",
    "sessions.write",
    "telemetry.read",
  ],
  admin: [
    "patients.read",
    "patients.write",
    "sessions.read",
    "sessions.write",
    "telemetry.read",
    "telemetry.write",
  ],
};
