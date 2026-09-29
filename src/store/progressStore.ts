import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { api } from "../config/api";
import { COURSE_DB_MAP } from "../config/courseMapping";
import { useAuthStore } from "./authStore";

interface UserProgress {
  registeredCourses: string[];
  unlockedPaths: string[];
  unlockedModules: string[];
  completedModules: string[];
  completedPaths: string[];
}

interface ProgressState {
  progressCache: Record<number, UserProgress>;

  registerCourse: (courseId: string) => Promise<void>;

  // 1. NUEVA FUNCIÓN: Para lecciones de Markdown (avanza internamente)
  completeNormalLesson: (
    courseId: string,
    pathId: string,
    moduleId: string,
  ) => void;

  // 2. FUNCIÓN DE QUIZ: Termina la ruta y avanza a la siguiente
  passModule: (
    courseId: string,
    pathId: string,
    moduleId: string,
    moduleTitle: string,
    totalCoursePaths: number,
    courseTitle: string,
  ) => Promise<void>;

  completeExam: (
    courseId: string,
    pathId: string,
    moduleId: string,
    totalCourseModules: number,
    examData: any,
  ) => Promise<any>;
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
          completedPaths: [],
        };

        if (currentCache.registeredCourses.includes(courseId)) return;

        try {
          const mysqlCourseId = COURSE_DB_MAP[courseId];
          await api.get(`/course/${mysqlCourseId}/register`, {
            params: { id: user.id },
          });

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

      // LÓGICA DE MARKDOWN: Desbloquea solo la siguiente lección
      completeNormalLesson: (courseId, pathId, moduleId) => {
        const user = useAuthStore.getState().activeUser;
        if (!user) return;

        const cache = get().progressCache[user.id] || {
          registeredCourses: [],
          unlockedPaths: [],
          unlockedModules: [],
          completedModules: [],
          completedPaths: [],
        };

        const moduleKey = `${courseId}-${pathId}-${moduleId}`;
        const nextModuleNum = parseInt(moduleId) + 1;
        const nextModuleKey = `${courseId}-${pathId}-${nextModuleNum}`;

        const newCompletedModules = cache.completedModules?.includes(moduleKey)
          ? cache.completedModules
          : [...(cache.completedModules || []), moduleKey];

        const newUnlockedModules = cache.unlockedModules?.includes(
          nextModuleKey,
        )
          ? cache.unlockedModules
          : [...(cache.unlockedModules || []), nextModuleKey];

        set((state) => ({
          progressCache: {
            ...state.progressCache,
            [user.id]: {
              ...cache,
              completedModules: newCompletedModules,
              unlockedModules: newUnlockedModules,
            },
          },
        }));
      },

      // LÓGICA DE QUIZ: Termina la ruta, llama a la API y abre la sig. ruta
      passModule: async (
        courseId,
        pathId,
        moduleId,
        moduleTitle,
        totalCoursePaths,
        courseTitle,
      ) => {
        const user = useAuthStore.getState().activeUser;
        if (!user) return;

        const cache = get().progressCache[user.id] || {
          registeredCourses: [],
          unlockedPaths: [],
          unlockedModules: [],
          completedModules: [],
          completedPaths: [],
        };

        const pathKey = `${courseId}-${pathId}`;
        const moduleKey = `${courseId}-${pathId}-${moduleId}`;

        if (cache.completedPaths?.includes(pathKey)) return;

        const newCompletedPaths = [...(cache.completedPaths || []), pathKey];
        const newCompletedModules = cache.completedModules?.includes(moduleKey)
          ? cache.completedModules
          : [...(cache.completedModules || []), moduleKey];

        const rawPercentage = Math.round(
          (newCompletedPaths.length / totalCoursePaths) * 100,
        );
        const percentage = rawPercentage > 100 ? 100 : rawPercentage;

        // Calculamos la siguiente RUTA y su primer módulo
        const nextPathNum = parseInt(pathId) + 1;
        const nextPathKey = `${courseId}-${nextPathNum}`;
        const firstModuleOfNextPath = `${courseId}-${nextPathNum}-1`;

        set((state) => ({
          progressCache: {
            ...state.progressCache,
            [user.id]: {
              ...cache,
              completedModules: newCompletedModules,
              completedPaths: newCompletedPaths,
              unlockedPaths: [...(cache.unlockedPaths || []), nextPathKey],
              unlockedModules: [
                ...(cache.unlockedModules || []),
                firstModuleOfNextPath,
              ],
            },
          },
        }));

        try {
          const mysqlCourseId = COURSE_DB_MAP[courseId];
          await api.post(`/course/${mysqlCourseId}/pass_module`, {
            percentage,
            userId: user.id,
            passedModule: moduleTitle,
            courseTitle: courseTitle || courseId,
          });
        } catch (error) {
          console.error("Error en la API al pasar ruta:", error);
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
        if (!user) return null;

        try {
          const mysqlCourseId = COURSE_DB_MAP[courseId];
          const response = await api.post(
            `/course/${mysqlCourseId}/exam_complete`,
            examData,
            { params: { id: user.id } },
          );
          return response.data.payload;
        } catch (error) {
          return null; // Bypass temporal anti-crasheo
        }
      },
    }),
    {
      name: "learning-progress-storage",
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
