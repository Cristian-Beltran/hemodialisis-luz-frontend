import type { User } from "@/types/user.interface";
import type { Patient } from "../Patient/patient.interface";

export interface Family {
  id: string;
  user: User;
  patients?: Patient[];
}
