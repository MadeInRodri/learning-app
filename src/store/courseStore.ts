import AsyncStorage from "@react-native-async-storage/async-storage";
import { collection, getDocs } from "firebase/firestore";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { db } from "../config/firebase";

export interface PathLesson {
  id: string;
  number: string;
  title: string;
  state: string;
}

interface CourseState {
  activeCourseId: string | null;
  activeCourseName: string;
  lessons: PathLesson[];
  isFetching: boolean;
  setActiveCourse: (id: string, name: string) => void;
  fetchPath: () => Promise<void>;
}

export const useCourseStore = create<CourseState>()(
  persist(
    (set, get) => ({
      activeCourseId: null,
      activeCourseName: "",
      lessons: [],
      isFetching: false,

      setActiveCourse: (id, name) => {
        set({ activeCourseId: id, activeCourseName: name });
        get().fetchPath();
      },

      fetchPath: async () => {
        const { activeCourseId } = get();
        if (!activeCourseId) return;

        set({ isFetching: true });
        try {
          // Consultamos la subcolección 'paths' del lenguaje seleccionado
          const pathRef = collection(db, "languages", activeCourseId, "paths");
          const querySnapshot = await getDocs(pathRef);

          const fetchedLessons: PathLesson[] = [];
          querySnapshot.forEach((doc) => {
            const data = doc.data();
            fetchedLessons.push({
              id: doc.id,
              number: data.number ? `0${data.number}`.slice(-2) : "00",
              title: data.title || "Lección",
              // TODO: Aquí luego cruzaremos con MySQL, por ahora todo bloqueado menos el primero
              state:
                data.number === 1 || data.number === "01"
                  ? "in-progress"
                  : "in-progress",
            });
          });

          // Ordenamos por número para que el árbol tenga sentido
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
