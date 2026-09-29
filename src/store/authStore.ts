// 1 -> Revisar updateGamificationStats

import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

// Interfaz exacta con los datos de la API
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

//Interfaz para el login, guardo si hay alguien logueado, Que usuario está activo, y su cache
interface AuthState {
  isLogged: boolean;
  activeUser: UserPayload | null;
  //Guardando cuentas por email
  usersCache: Record<string, UserPayload>;

  //Funciones declaradas, esta recibe los datos del usuario
  login: (userData: UserPayload) => void;
  logout: () => void;
  //Esta es para cambiar el XP y la energía
  updateGamificationStats: (xpChange: number, energyChange: number) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      isLogged: false,
      activeUser: null,
      usersCache: {},

      //Recibe la data del usuario, y lo crea si no existe dentro del cache de la app
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

      //Recibe el cambio en el XP y energía (REVISAR SI SE USA)
      updateGamificationStats: (xpChange, energyChange) =>
        set((state) => {
          if (!state.activeUser) return state;

          //Recibe la XP que tenía + la nueva, y la energía + la nueva
          const updatedUser = {
            ...state.activeUser,
            xpTotales: state.activeUser.xpTotales + xpChange,
            energiaBalance: Math.max(
              0,
              state.activeUser.energiaBalance + energyChange,
            ),
          };

          return {
            activeUser: updatedUser,
            usersCache: {
              ...state.usersCache,
              [updatedUser.email]: updatedUser,
            },
          };
        }),

      //Solo ponemos todo en false para que la app no intente cargar nada.
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
