import type { User } from "@/types/user.interface";

export interface Doctor {
  id: string;
  user: User;
}

export interface CreateDoctor {
  fullname: string;
  email: string;
  password?: string;
  address?: string;
}
