import AsyncStorage from "@react-native-async-storage/async-storage";
import { collection, getDocs } from "firebase/firestore";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { db } from "../config/firebase";

export interface Language {
  id: string;
  language: string;
  description?: string;
}

interface LanguageState {
  languages: Language[];
  isFetching: boolean;
  fetchLanguages: () => Promise<void>;
}

export const useLanguageStore = create<LanguageState>()(
  persist(
    (set, get) => ({
      languages: [],
      isFetching: false,

      fetchLanguages: async () => {
        // Activamos el estado de carga solo para comprobaciones visuales
        set({ isFetching: true });

        try {
          const querySnapshot = await getDocs(collection(db, "languages"));
          const fetchedLanguages: Language[] = [];

          querySnapshot.forEach((doc) => {
            const data = doc.data();
            fetchedLanguages.push({
              id: doc.id,
              language: data.language || doc.id,
              description: data.description || "",
            });
          });

          // Actualizamos la caché con los datos más frescos de Firebase
          set({ languages: fetchedLanguages, isFetching: false });
        } catch (error) {
          console.error("Error sincronizando lenguajes:", error);
          set({ isFetching: false });
        }
      },
    }),
    {
      name: "learning-app-languages",
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
