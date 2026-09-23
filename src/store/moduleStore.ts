import AsyncStorage from "@react-native-async-storage/async-storage";
import { collection, getDocs } from "firebase/firestore";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { db } from "../config/firebase";
//Estamos viendo el curso actual
import { useCourseStore } from "./courseStore";

//Data de la lección
export interface ModuleLesson {
  id: string;
  title: string;
  subtitle: string;
  // clase/quiz
  type: string;
  state: string;
  //Este puede ser preguntas o markdown
  content: any;
}

interface ModuleState {
  modules: ModuleLesson[];
  activeModuleId: string | null;
  isFetching: boolean;
  setActiveModule: (id: string) => void;
  fetchModules: (pathId: string) => Promise<void>;
}

export const useModuleStore = create<ModuleState>()(
  persist(
    (set, get) => ({
      modules: [],
      activeModuleId: null,
      isFetching: false,

      setActiveModule: (id) => set({ activeModuleId: id }),

      fetchModules: async (pathId) => {
        // Obtenemos el lenguaje actual del store de cursos
        const languageId = useCourseStore.getState().activeCourseId;

        //Si no está seleccionado, regresamos
        if (!languageId || !pathId) return;

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
          const snapshot = await getDocs(modulesRef);

          const fetchedModules: ModuleLesson[] = [];

          //Lo llenamos
          snapshot.forEach((doc) => {
            const data = doc.data();
            fetchedModules.push({
              id: doc.id,
              title: data.title || "Módulo",
              subtitle: data.subtitle || "",
              type: data.type || "lesson",
              // HACK DE PRUEBA: Todo desbloqueado por ahora
              state: data.type === "quiz" ? "in-progress" : "completed",
              content: data.content || "",
            });
          });

          // Ordenamos por ID para mantener la secuencia (1, 2, 3...)
          fetchedModules.sort((a, b) => Number(a.id) - Number(b.id));

          set({ modules: fetchedModules, isFetching: false });
        } catch (error) {
          console.error("Error trayendo módulos:", error);
          set({ isFetching: false });
        }
      },
    }),
    {
      name: "learning-app-modules",
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
