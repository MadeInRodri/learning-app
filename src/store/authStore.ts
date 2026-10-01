import { api } from "@/config/api";
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

let latestUserFetchId = 0;

//Interfaz para el login, guardo si hay alguien logueado, Que usuario está activo, y su cache
interface AuthState {
  isLogged: boolean;
  activeUser: UserPayload | null;
  //Guardando cuentas por email
  usersCache: Record<string, UserPayload>;

  //Funciones declaradas, esta recibe los datos del usuario
  login: (userData: UserPayload) => void;
  fetchUser: (id: number) => Promise<void>;
  logout: () => void;
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

      fetchUser: async (id) => {
        const requestId = ++latestUserFetchId;
        const response = await api.get("/user", { params: { id } });
        const userData = response.data.payload as UserPayload;

        set((state) => {
          if (
            requestId !== latestUserFetchId ||
            state.activeUser?.id !== id
          ) {
            return state;
          }

          return {
            activeUser: userData,
            usersCache: {
              ...state.usersCache,
              [userData.email]: userData,
            },
          };
        });
      },

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
