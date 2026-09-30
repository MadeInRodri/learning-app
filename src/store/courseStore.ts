import AsyncStorage from "@react-native-async-storage/async-storage";
import { collection, getDocs } from "firebase/firestore";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { db } from "../config/firebase";
import { useAuthStore } from "./authStore";
import { useProgressStore } from "./progressStore";

//Lecciones, pueden estar en progreso, bloqueada o completada
export interface PathLesson {
  id: string;
  number: string;
  title: string;
  state: "locked" | "in-progress" | "completed";
}

//Data del curso actual
interface CourseState {
  activeCourseId: string | null;
  activeCourseName: string;
  lessons: PathLesson[];
  isFetching: boolean;
  setActiveCourse: (id: string, name: string) => Promise<void>;
  fetchPath: () => Promise<void>;
}

export const useCourseStore = create<CourseState>()(
  persist(
    (set, get) => ({
      //Todo por defecto
      activeCourseId: null,
      activeCourseName: "",
      lessons: [],
      isFetching: false,

      setActiveCourse: async (id, name) => {
        set({ activeCourseId: id, activeCourseName: name });
        // Lanzamos el registro en la API si es la primera vez
        await useProgressStore.getState().registerCourse(id);
        get().fetchPath();
      },

      fetchPath: async () => {
        const { activeCourseId } = get();
        const user = useAuthStore.getState().activeUser;
        if (!activeCourseId || !user) return;

        set({ isFetching: true });
        try {
          //Nos traemos la ruta del "curso"
          const pathRef = collection(db, "languages", activeCourseId, "paths");
          const querySnapshot = await getDocs(pathRef);

          // Obtenemos el progreso actual del usuario
          const progress = useProgressStore.getState().progressCache[user.id];

          const fetchedLessons: PathLesson[] = [];
          querySnapshot.forEach((doc) => {
            const data = doc.data();
            const pathKey = `${activeCourseId}-${doc.id}`;

            // Determinamos el estado dinámico
            let currentState: "locked" | "in-progress" | "completed" = "locked";
            if (progress?.unlockedPaths.includes(pathKey)) {
              currentState = "in-progress"; // Simplificado, luego puedes evaluar si todos sus módulos están 'completed'
            }

            fetchedLessons.push({
              id: doc.id,
              number: data.number ? `0${data.number}`.slice(-2) : "00",
              title: data.title || "Lección",
              state: currentState,
            });
          });

          fetchedLessons.sort((a, b) => a.number.localeCompare(b.number));

          set({ lessons: fetchedLessons, isFetching: false });
        } catch (error) {
          console.error("Error trayendo la ruta:", error);
          set({ isFetching: false });
        }
      },
    }),
    {
      name: "learning-app-course",
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
