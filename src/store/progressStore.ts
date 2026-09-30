//Delicado, maneja todo el progreso

import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { api } from "../config/api";
import { COURSE_DB_MAP } from "../config/courseMapping";
import type { AIQuizData } from "./aiQuizStore";
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

  // Este es para las lecciones normales, de markdown.tsx
  completeNormalLesson: (
    courseId: string,
    pathId: string,
    moduleId: string,
    moduleTitle: string,
    totalCourseModules: number,
    courseTitle: string,
  ) => Promise<AIQuizData | null>;

  // Este es para cuando pasamos un quiz, desbloqueamos la ruta siguiente
  passModule: (
    courseId: string,
    pathId: string,
    moduleId: string,
    moduleTitle: string,
    totalCoursePaths: number,
    courseTitle: string,
  ) => Promise<void>;

  //Examen completado, maneja la data
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

      //Registrar curso (Solo ocurre una vez, cuando se entra al lenguaje por primera vez)
      registerCourse: async (courseId) => {
        //Traigo al usuario
        const user = useAuthStore.getState().activeUser;
        if (!user) return;

        //Traigo su progreso, sino creo todo vacío
        const currentCache = get().progressCache[user.id] || {
          registeredCourses: [],
          unlockedPaths: [],
          unlockedModules: [],
          completedModules: [],
          completedPaths: [],
        };

        //Si ya está registrado el curso, no hago nada
        if (currentCache.registeredCourses.includes(courseId)) return;

        //Mandamos a la API para que registre al usuario en el curso
        try {
          const mysqlCourseId = COURSE_DB_MAP[courseId];
          await api.get(`/course/${mysqlCourseId}/register`, {
            params: { id: user.id },
          });

          //Aquí actualizamos todo, delicado
          set((state) => ({
            progressCache: {
              ...state.progressCache,
              [user.id]: {
                ...currentCache,
                //Registra internamente el curso nuevo
                registeredCourses: [
                  ...currentCache.registeredCourses,
                  courseId,
                ],
                //Le desbloquea la primera ruta
                unlockedPaths: [...currentCache.unlockedPaths, `${courseId}-1`],
                //Le desbloquea el primer módulo
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

      // Clases normales, desbloquea solo la siguiente lección
      completeNormalLesson: async (
        courseId,
        pathId,
        moduleId,
        moduleTitle,
        totalCourseModules,
        courseTitle,
      ) => {
        //Traigo usuario
        const user = useAuthStore.getState().activeUser;

        if (!user) return null;

        const cache = get().progressCache[user.id] || {
          registeredCourses: [],
          unlockedPaths: [],
          unlockedModules: [],
          completedModules: [],
          completedPaths: [],
        };

        //Creo los id's del modulo, y del siguiente por si lo pasa
        const moduleKey = `${courseId}-${pathId}-${moduleId}`;
        const nextModuleNum = parseInt(moduleId) + 1;
        const nextModuleKey = `${courseId}-${pathId}-${nextModuleNum}`;

        //Si lo completa lo agregamos a los completados
        const newCompletedModules = cache.completedModules?.includes(moduleKey)
          ? cache.completedModules
          : [...(cache.completedModules || []), moduleKey];

        const rawPercentage = Math.round(
          (newCompletedModules.length / totalCourseModules) * 100,
        );
        const percentage = rawPercentage > 100 ? 100 : rawPercentage;

        // Y el siguiente para ser desbloqueado
        const newUnlockedModules = cache.unlockedModules?.includes(
          nextModuleKey,
        )
          ? cache.unlockedModules
          : [...(cache.unlockedModules || []), nextModuleKey];

        //Actualizamos el cache
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

        try {
          const mysqlCourseId = COURSE_DB_MAP[courseId];
          const response = await api.post(`/course/${mysqlCourseId}/pass_module`, {
            percentage,
            userId: user.id,
            passedModule: moduleTitle,
            courseTitle: courseTitle || courseId,
          });

          const aiQuiz = response.data?.payload as AIQuizData | null;
          return aiQuiz?.topics?.length ? aiQuiz : null;
        } catch (error) {
          console.error("Error en la API al pasar ruta:", error);
        }
        return null;
      },

      // Para el quiz, termina la ruta, llama a la API y abre la sig. ruta
      passModule: async (
        courseId,
        pathId,
        moduleId,
        moduleTitle,
        totalCoursePaths,
        courseTitle,
      ) => {
        //Usuario
        const user = useAuthStore.getState().activeUser;
        if (!user) return;

        const cache = get().progressCache[user.id] || {
          registeredCourses: [],
          unlockedPaths: [],
          unlockedModules: [],
          completedModules: [],
          completedPaths: [],
        };

        //Creamos los id's de la ruta y el módulo
        const pathKey = `${courseId}-${pathId}`;
        const moduleKey = `${courseId}-${pathId}-${moduleId}`;

        //Si y pasó el test, nada de esto va a suceder
        if (cache.completedPaths?.includes(pathKey)) return;

        //agregamos la ruta que acaba de completar
        const newCompletedPaths = [...(cache.completedPaths || []), pathKey];
        // Y el módulo, en este caso el del quiz
        const newCompletedModules = cache.completedModules?.includes(moduleKey)
          ? cache.completedModules
          : [...(cache.completedModules || []), moduleKey];

        //Esto es para el progreso
        const rawPercentage = Math.round(
          (newCompletedPaths.length / totalCoursePaths) * 100,
        );
        const percentage = rawPercentage > 100 ? 100 : rawPercentage;

        // Calculamos la siguiente ruta y su primer módulo
        const nextPathNum = parseInt(pathId) + 1;
        const nextPathKey = `${courseId}-${nextPathNum}`;
        const firstModuleOfNextPath = `${courseId}-${nextPathNum}-1`;

        //Hacemos lo mismo, actualizamos
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

        //Además de mandar a la API que ya pasó el módulo
        try {
          const mysqlCourseId = COURSE_DB_MAP[courseId];
          const response = await api.post(`/course/${mysqlCourseId}/pass_module`, {
            percentage,
            userId: user.id,
            passedModule: moduleTitle,
            courseTitle: courseTitle || courseId,
          });

          const AiQuiz = response.data.payload;

          if (AiQuiz) {
            console.log(AiQuiz);
            //Hacer algo
          }

        } catch (error) {
          console.error("Error en la API al pasar ruta:", error);
        }
      },

      //Función para cuando completa el quiz
      completeExam: async (
        courseId,
        pathId,
        moduleId,
        totalCourseModules,
        examData,
      ) => {
        //Usuario
        const user = useAuthStore.getState().activeUser;
        if (!user) return null;

        //Mandamos a decir que el examen sí se completó en la API, y los errores
        try {
          const mysqlCourseId = COURSE_DB_MAP[courseId];
          const response = await api.post(
            `/course/${mysqlCourseId}/exam_complete`,
            examData,
            { params: { id: user.id } },
          );
          return response.data.payload;
        } catch (error) {
          return null;
        }
      },
    }),
    {
      name: "learning-progress-storage",
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
