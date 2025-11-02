// src/pages/sessions/data/session.store.ts
import { create } from "zustand";
import { sessionService } from "./session.service";
import type { Session } from "../session.interface";

interface SessionState {
  sessions: Session[];
  isLoading: boolean;
  error: string | null;

  fetchByPatient: (patientId: string) => Promise<void>;
}

export const sessionStore = create<SessionState>((set) => ({
  sessions: [],
  isLoading: false,
  error: null,

  fetchByPatient: async (patientId: string) => {
    set({ isLoading: true, error: null });
    try {
      const sessions = await sessionService.findByPatient(patientId);
      // Garantiza orden y datos consistentes (por si el BE no los ordena)
      sessions.sort(
        (a, b) =>
          new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime(),
      );
      sessions.forEach((s) =>
        s.records?.sort(
          (r1, r2) =>
            new Date(r1.recordedAt).getTime() -
            new Date(r2.recordedAt).getTime(),
        ),
      );
      set({ sessions, isLoading: false });
    } catch (e) {
      console.error(e);
    }
  },
}));
