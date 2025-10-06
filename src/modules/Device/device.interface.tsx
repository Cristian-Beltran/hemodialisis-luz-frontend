import type { Patient } from "../Patient/patient.interface";

export interface Device {
  id: string;
  serialNumber: string;
  model: string;
  patient: Patient;
  status: string;
}
