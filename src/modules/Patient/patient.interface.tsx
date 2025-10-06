import type { User } from "@/types/user.interface";
import type { Device } from "../Device/device.interface";
import type { Family } from "../Family/family.interface";

export interface Patient {
  id: string;
  user: User;
  device?: Device;
  familyMembers?: Family[];
}

export interface CreatePatient {
  fullname: string;
  email: string;
  password?: string;
  address?: string;
  deviceId?: string;
}
