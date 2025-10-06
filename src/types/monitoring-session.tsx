export interface MonitoringSession {
  id: string;
  patientId: string;
  sessionDate: string;
  notes?: string;
  createdAt: string;
  closedAt?: string;
  // Relaciones
}
