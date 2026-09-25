import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { api } from "../config/api";
import { COURSE_DB_MAP } from "../config/courseMapping";
import { useAuthStore } from "./authStore";

interface UserProgress {
  registeredCourses: string[]; // IDs de Firebase ("js", "python")
  unlockedPaths: string[]; // Ej: "js-path-1"
  unlockedModules: string[]; // Ej: "js-path-1-module-1"
  completedModules: string[]; // Para calcular el porcentaje de avance
}

interface ProgressState {
  progressCache: Record<number, UserProgress>; // El ID del usuario es la llave

  // Acciones
  registerCourse: (courseId: string) => Promise<void>;
  passModule: (
    courseId: string,
    pathId: string,
    moduleId: string,
    moduleTitle: string,
    totalCourseModules: number,
    courseTitle: string,
  ) => Promise<void>;
  completeExam: (
    courseId: string,
    pathId: string,
    moduleId: string,
    totalCourseModules: number,
    examData: {
      totalErrors: number;
      topicsHasError: string;
      hasErrors: boolean;
      titleExam: string;
      percentage: number;
    },
  ) => Promise<void>;
  unlockNextModule: (
    courseId: string,
    pathId: string,
    currentModuleId: string,
  ) => void;
}

export const useProgressStore = create<ProgressState>()(
  persist(
    (set, get) => ({
      progressCache: {},

      registerCourse: async (courseId) => {
        const user = useAuthStore.getState().activeUser;
        if (!user) return;

        const currentCache = get().progressCache[user.id] || {
          registeredCourses: [],
          unlockedPaths: [],
          unlockedModules: [],
          completedModules: [],
        };

        // Si ya está registrado localmente, no hacemos petición
        if (currentCache.registeredCourses.includes(courseId)) return;

        try {
          const mysqlCourseId = COURSE_DB_MAP[courseId];
          await api.get(`/course/${mysqlCourseId}/register`, {
            params: { id: user.id },
          });

          // Desbloqueamos el curso, su primera ruta (id "1") y su primer módulo (id "1") por defecto
          set((state) => ({
            progressCache: {
              ...state.progressCache,
              [user.id]: {
                ...currentCache,
                registeredCourses: [
                  ...currentCache.registeredCourses,
                  courseId,
                ],
                unlockedPaths: [...currentCache.unlockedPaths, `${courseId}-1`],
                unlockedModules: [
                  ...currentCache.unlockedModules,
                  `${courseId}-1-1`,
                ],
              },
            },
          }));
        } catch (error) {
          console.error("Error registrando curso:", error);
        }
      },

      passModule: async (
        courseId,
        pathId,
        moduleId,
        moduleTitle,
        totalCourseModules,
        courseTitle,
      ) => {
        const user = useAuthStore.getState().activeUser;
        if (!user) return;

        const cache = get().progressCache[user.id];
        const moduleKey = `${courseId}-${pathId}-${moduleId}`;

        // Evitamos peticiones dobles si ya lo completó antes
        if (cache.completedModules.includes(moduleKey)) return;

        const newCompleted = [...cache.completedModules, moduleKey];
        const percentage = Number(
          (newCompleted.length / totalCourseModules).toFixed(2),
        );

        try {
          const mysqlCourseId = COURSE_DB_MAP[courseId];
          await api.post(`/course/${mysqlCourseId}/pass_module`, {
            percentage,
            userId: user.id,
            passedModule: moduleTitle,
            courseTitle,
          });

          // Actualizamos caché de completados
          set((state) => ({
            progressCache: {
              ...state.progressCache,
              [user.id]: { ...cache, completedModules: newCompleted },
            },
          }));

          // Desbloquear el siguiente
          get().unlockNextModule(courseId, pathId, moduleId);
        } catch (error) {
          console.error("Error pasando módulo:", error);
        }
      },

      completeExam: async (
        courseId,
        pathId,
        moduleId,
        totalCourseModules,
        examData,
      ) => {
        const user = useAuthStore.getState().activeUser;
        if (!user) return;

        const cache = get().progressCache[user.id];
        const moduleKey = `${courseId}-${pathId}-${moduleId}`;

        if (cache.completedModules.includes(moduleKey)) return;

        const newCompleted = [...cache.completedModules, moduleKey];
        // Aquí puedes usar el porcentaje del examData o calcularlo

        try {
          const mysqlCourseId = COURSE_DB_MAP[courseId];
          await api.post(`/course/${mysqlCourseId}/exam_complete`, examData, {
            params: { id: user.id },
          });

          set((state) => ({
            progressCache: {
              ...state.progressCache,
              [user.id]: { ...cache, completedModules: newCompleted },
            },
          }));

          get().unlockNextModule(courseId, pathId, moduleId);
        } catch (error) {
          console.error("Error completando examen:", error);
        }
      },

      unlockNextModule: (courseId, pathId, currentModuleId) => {
        const user = useAuthStore.getState().activeUser;
        if (!user) return;

        const cache = get().progressCache[user.id];
        const nextModuleNum = parseInt(currentModuleId) + 1;
        const nextModuleKey = `${courseId}-${pathId}-${nextModuleNum}`;

        set((state) => ({
          progressCache: {
            ...state.progressCache,
            [user.id]: {
              ...cache,
              unlockedModules: [...cache.unlockedModules, nextModuleKey],
            },
          },
        }));
      },
    }),
    {
      name: "learning-progress-storage",
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
