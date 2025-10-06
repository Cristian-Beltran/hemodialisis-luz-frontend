// src/features/auth/auth.store.ts
import type { LoginDto, Profile, UserType } from "./auth.interface";
import Cookies from "js-cookie";
import { toast } from "sonner";
import { create } from "zustand";
import { authService } from "./auth.service";

interface AuthState {
  user: Profile | null;
  token: string | null;
  type: UserType | null;
  isLoading: boolean;
  version: boolean;
  // Login flows
  login: (credentials: LoginDto) => Promise<void>;
  verifyToken: () => Promise<void>;
  logout: () => void;
  loadFromStorage: () => void;
  getType: () => UserType | null;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  token: null,
  type: null,
  isLoading: false,
  version: false,

  login: async (credentials) => {
    set({ isLoading: true });
    try {
      const { access_token, user } = await authService.login(credentials);
      Cookies.set("auth_token", access_token, { expires: 3 });
      Cookies.set("auth_type", user.type);
      Cookies.set("auth_user", JSON.stringify(user));

      const version = localStorage.getItem("view_version");
      if (!version) localStorage.setItem("view_version", "1");

      set({
        user,
        token: access_token,
        type: user.type as UserType,
        isLoading: false,
        version: true,
      });
    } catch (err) {
      set({ isLoading: false });
      toast.error("Correo o contraseña incorrectos", {
        position: "top-center",
      });
      throw err;
    }
  },

  logout: () => {
    localStorage.clear();
    Cookies.remove("auth_token");
    Cookies.remove("auth_type");
    Cookies.remove("auth_user");
    set({ user: null, token: null, type: null });
  },

  loadFromStorage: () => {
    const token = Cookies.get("auth_token");
    const type = (Cookies.get("auth_type") as UserType | null) ?? null;
    const user = Cookies.get("auth_user");
    if (token && user && type) {
      set({ token, user: JSON.parse(user), type });
    }
  },

  verifyToken: async () => {
    try {
      const { valid, user } = await authService.verifyToken();
      if (!valid) {
        Cookies.remove("auth_token");
        Cookies.remove("auth_type");
        Cookies.remove("auth_user");
        set({ user: null, token: null, type: null });
        throw new Error("Token no válido");
      }
      const token = Cookies.get("auth_token") ?? null;
      set({ user, token, type: user.type as UserType, isLoading: false });
    } catch (err) {
      set({ isLoading: false });
      throw err;
    }
  },
  // === AuthZ (NUEVO) ===
  getType: () => get().type,
}));
