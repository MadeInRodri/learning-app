import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

interface AuthState {
  isLogged: boolean;
  login: () => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    //Función para loguearse, se guarda la sesión en el async, por ahora solo un true false
    (set) => ({
      isLogged: false,
      login: () => set({ isLogged: true }),
      logout: () => set({ isLogged: false }),
    }),
    {
      name: "learning-app-auth",
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
