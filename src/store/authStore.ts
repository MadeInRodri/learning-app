import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

// Interfaz exacta con los datos de tu API
export interface UserPayload {
  id: number;
  nombre: string;
  email: string;
  xpTotales: number;
  energiaBalance: number;
  estrellasBalance: number;
  aiPistaBalance: number;
  protectorRachaBalance: number;
}

interface AuthState {
  isLogged: boolean;
  activeUser: UserPayload | null;
  usersCache: Record<string, UserPayload>; // Diccionario para aislar cuentas por email
  login: (userData: UserPayload) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      isLogged: false,
      activeUser: null,
      usersCache: {},

      login: (userData) =>
        set((state) => ({
          isLogged: true,
          activeUser: userData,
          // Actualizamos o creamos el perfil en el caché usando el email como ID único
          usersCache: {
            ...state.usersCache,
            [userData.email]: userData,
          },
        })),

      logout: () =>
        set({
          isLogged: false,
          activeUser: null,
          // NOTA: No borramos el usersCache aquí.
          // Así, si vuelven a logearse, su data cachead sigue intacta.
        }),
    }),
    {
      name: "learning-app-auth",
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
