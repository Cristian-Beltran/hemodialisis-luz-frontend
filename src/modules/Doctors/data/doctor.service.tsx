import axios from "@/lib/axios"; // ajusta el path a tu configuración
import type { CreateDoctor, Doctor } from "../doctor.interface";
import type { Status } from "@/types/status.interface";

const BASE_URL = "/doctors";
export const doctorService = {
  create: async (data: CreateDoctor): Promise<Doctor> => {
    const res = await axios.post(BASE_URL, data);
    return res.data;
  },
  findAll: async (): Promise<Doctor[]> => {
    const res = await axios.get(BASE_URL);
    return res.data;
  },

  findOne: async (id: string): Promise<Doctor> => {
    const res = await axios.get(`${BASE_URL}/${id}`);
    return res.data;
  },

  update: async (id: string, data: Partial<CreateDoctor>): Promise<Doctor> => {
    const res = await axios.put(`${BASE_URL}/${id}`, data);
    return res.data;
  },

  changeStatus: async (id: string, status: Status): Promise<Doctor> => {
    const res = await axios.patch(`${BASE_URL}/${id}/status`, { status });
    return res.data;
  },
  remove: async (id: string): Promise<void> => {
    const res = await axios.delete(`${BASE_URL}/${id}`);
    return res.data;
  },
};
