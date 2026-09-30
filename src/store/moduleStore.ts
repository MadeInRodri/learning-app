//Aparentemente bien, pegarle un ojo, pero diría que no debe cambiar

import AsyncStorage from "@react-native-async-storage/async-storage";
import { collection, getDocs } from "firebase/firestore";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { db } from "../config/firebase";
import { useAuthStore } from "./authStore";
import { useCourseStore } from "./courseStore";
import { useProgressStore } from "./progressStore";

//Módulos
export interface ModuleLesson {
  id: string;
  title: string;
  subtitle: string;
  type: string;
  state: "locked" | "in-progress" | "completed";
  content: any;
}

//Estado del módulo
interface ModuleState {
  modules: ModuleLesson[];
  activeModuleId: string | null;
  isFetching: boolean;
  setActiveModule: (id: string) => void;
  completeModule: (id: string) => void;
  fetchModules: (pathId: string) => Promise<void>;
  cancelFetchModules: () => void;
}

let fetchModulesRequestId = 0;

export const useModuleStore = create<ModuleState>()(
  persist(
    (set, get) => ({
      modules: [],
      activeModuleId: null,
      isFetching: false,

      setActiveModule: (id) => set({ activeModuleId: id }),
      completeModule: (id) =>
        set((state) => {
          const completedIndex = state.modules.findIndex(
            (module) => module.id === id,
          );

          return {
            modules: state.modules.map((module, index) => {
              if (module.id === id) return { ...module, state: "completed" };
              if (
                index === completedIndex + 1 &&
                module.state === "locked"
              ) {
                return { ...module, state: "in-progress" };
              }
              return module;
            }),
          };
        }),

      cancelFetchModules: () => {
        fetchModulesRequestId += 1;
      },

      //Traerme los módulos de FireStore
      fetchModules: async (pathId) => {
        const languageId = useCourseStore.getState().activeCourseId;
        const user = useAuthStore.getState().activeUser;
        if (!languageId || !pathId || !user) return;

        const requestId = ++fetchModulesRequestId;
        set({ isFetching: true });
        try {
          const modulesRef = collection(
            db,
            "languages",
            languageId,
            "paths",
            pathId,
            "modules",
          );

          //Acá los traigo
          const snapshot = await getDocs(modulesRef);
          if (requestId !== fetchModulesRequestId) return;

          const progress = useProgressStore.getState().progressCache[user.id];

          //Lleno este arreglo
          const fetchedModules: ModuleLesson[] = [];
          snapshot.forEach((doc) => {
            const data = doc.data();

            //Creo la Key para registrar que el user pasó más tarde
            const moduleKey = `${languageId}-${pathId}-${doc.id}`;

            // Evaluamos estado dinámicamente
            let currentState: "locked" | "in-progress" | "completed" = "locked";
            if (progress?.completedModules.includes(moduleKey)) {
              currentState = "completed";
            } else if (progress?.unlockedModules.includes(moduleKey)) {
              currentState = "in-progress";
            }

            //Voy actualizando el array
            fetchedModules.push({
              id: doc.id,
              title: data.title || "Módulo",
              subtitle: data.subtitle || "",
              type: data.type || "lesson",
              state: currentState,
              content: data.content || "",
            });
          });

          //Los ordeno
          fetchedModules.sort((a, b) => Number(a.id) - Number(b.id));

          set({ modules: fetchedModules, isFetching: false });
        } catch (error) {
          if (requestId === fetchModulesRequestId) {
            console.error("Error trayendo módulos:", error);
            set({ isFetching: false });
          }
        }
      },
    }),
    {
      name: "learning-app-modules",
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
