import AsyncStorage from "@react-native-async-storage/async-storage";
import { collection, getDocs } from "firebase/firestore";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { db } from "../config/firebase";

//Interfaz del lenguaje
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
      //Por defecto
      languages: [],
      isFetching: false,

      fetchLanguages: async () => {
        // Activamos el estado de carga solo para comprobaciones visuales
        set({ isFetching: true });

        try {
          //Traemos la data
          const querySnapshot = await getDocs(collection(db, "languages"));
          const fetchedLanguages: Language[] = [];

          //Llenamos el array
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
