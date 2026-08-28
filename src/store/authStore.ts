import { create } from "zustand";

interface AuthState {
  isLogged: boolean;
  login: () => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  isLogged: false,
  login: () => set({ isLogged: true }),
  logout: () => set({ isLogged: false }),
}));
