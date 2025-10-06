import axios from "@/lib/axios"; // ajusta el path a tu configuración
import type { CreatePatient, Patient } from "../patient.interface";
import type { Status } from "@/types/status.interface";

const BASE_URL = "/patients";
export const patientService = {
  create: async (data: CreatePatient): Promise<Patient> => {
    const res = await axios.post(BASE_URL, data);
    return res.data;
  },
  findAll: async (): Promise<Patient[]> => {
    const res = await axios.get(BASE_URL);
    return res.data;
  },

  findOne: async (id: string): Promise<Patient> => {
    const res = await axios.get(`${BASE_URL}/${id}`);
    return res.data;
  },

  update: async (
    id: string,
    data: Partial<CreatePatient>,
  ): Promise<Patient> => {
    const res = await axios.put(`${BASE_URL}/${id}`, data);
    return res.data;
  },

  changeStatus: async (id: string, status: Status): Promise<Patient> => {
    const res = await axios.patch(`${BASE_URL}/${id}/status`, { status });
    return res.data;
  },
  remove: async (id: string): Promise<void> => {
    const res = await axios.delete(`${BASE_URL}/${id}`);
    return res.data;
  },
};
