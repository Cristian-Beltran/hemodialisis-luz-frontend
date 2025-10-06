import { toast } from "sonner";
import { create } from "zustand";
import type { CreatePatient, Patient } from "../patient.interface";
import type { Status } from "@/types/status.interface";
import { patientService } from "./patient.service";

interface UserClinicStore {
  data: Patient[];
  filteredData: Patient[];
  search: string;
  isLoading: boolean;
  fetchFull: () => Promise<void>;
  reload: () => Promise<void>;
  total: number;
  applySearch: (term: string) => void;

  create: (payload: CreatePatient) => Promise<void>;
  update: (id: string, payload: Partial<CreatePatient>) => Promise<void>;
  remove: (id: string) => Promise<void>;
  changeStatus: (id: string, status: Status) => Promise<void>;
}

export const userPatientStore = create<UserClinicStore>((set, get) => ({
  data: [],
  filteredData: [],
  total: 0,
  search: "",
  isLoading: false,
  referrals: [],
  referralsLoading: false,

  async fetchFull() {
    set({ isLoading: true });
    try {
      const data = await patientService.findAll();
      set({
        data,
        filteredData: data,
        isLoading: false,
      });
      get().applySearch(get().search);
    } catch (error) {
      console.error("Error fetching full data", error);
      toast.error("Ha ocurrido un error");
      set({ isLoading: false });
    }
  },

  applySearch(term) {
    set({ search: term });
    const { data, search } = get();
    console.log("filtrando");
    const filtered = data.filter((item) => {
      const { fullname, email } = item.user;
      const normalized = search.toLowerCase();

      return (
        fullname?.toLowerCase().includes(normalized) ||
        email?.toLowerCase().includes(normalized)
      );
    });
    set({ filteredData: filtered });
  },

  async create(payload) {
    const created = await patientService.create(payload);
    const { data } = get();
    set({
      data: [created, ...data],
      total: data.length + 1,
    });
    get().applySearch(get().search);
    toast.success("Paciente creado");
  },

  async reload() {
    get().applySearch(get().search);
  },

  async update(id, payload) {
    const updated = await patientService.update(id, payload);
    console.log(updated);
    const { data } = get();
    data.map((item) => {
      console.log(item.user.id == id);
    });
    const updatedData = data.map((item) =>
      item.user.id == id ? updated : item,
    );
    console.log(updatedData);
    set({ data: updatedData });
    get().reload();
    toast.success("Paciente actualizado");
  },

  async remove(id) {
    try {
      await patientService.remove(id);
      const { data } = get();
      const updatedData = data.filter((item) => item.user.id !== id);
      set({
        data: updatedData,
        total: updatedData.length,
      });
      get().reload();
      toast.success("Paciente eliminado");
    } catch (error) {
      console.error(error);
      toast.error("Ha Ocurrido un error");
    }
  },

  async changeStatus(id, status) {
    try {
      const updated = await patientService.changeStatus(id, status);
      toast.success("Estado modificiado");
      const { data } = get();
      const updatedData = data.map((item) =>
        item.user.id === id ? updated : item,
      );
      set({ data: updatedData });
      get().reload();
    } catch (error) {
      console.error(error);
      toast.error("Ha ocurrido un error");
    }
  },
}));
