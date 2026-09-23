import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

//Anotaciones:
// Dar el puntaje hasta que se termine el quiz
// Guardar preguntas malas independientemente de que se termine o no (quiza ?))
// Estado del quiz
// Cuando lo inició y cuando lo terminó
// Errores del quiz
//Data de la pregunta que falló
// Que se inició un curso
// Cuando pase un módulo

// interface QuizzAI {
//   contentType: "quizz" | "code";
//   weekConcept: string;
//   message: string;
//   rewardType: "XP";
//   topics: {
//     id: number;
//     question: string;
//     code: string | null;
//     options: string[];
//     correctAnswer: "A" | "B" | "C" | "D";e
//     explanation: string;
//   }[];
// }

// Última fecha que inició

export interface FailedQuestion {
  language: string;
  path: string | number;
  question: string | number;
  datetime: string;
}

//Data del quiz activo
export interface ActiveQuiz {
  languageId: string;
  pathId: string;
  currentIndex: number;
}

interface QuizState {
  activeQuiz: ActiveQuiz | null;
  resetQuiz: () => void;
  failedQuestions: FailedQuestion[];
  userXP: number; // Puntaje global temporal del usuario

  // Acciones

  //Checkear que no esté en otro ya
  checkAndStartQuiz: (
    languageId: string,
    pathId: string,
  ) => "READY" | "MISMATCH";

  //Poder cancelar el otro
  forceStartQuiz: (languageId: string, pathId: string) => void;

  //Fallo en una pregunta
  recordFailure: (
    languageId: string,
    pathId: string,
    questionId: string | number,
  ) => void;

  //Dar XP
  addXP: (amount: number) => void;

  //Pasar a la otra pregunta
  nextQuestion: () => void;

  //Terminar
  finishQuiz: () => void;
}

export const useQuizStore = create<QuizState>()(
  persist(
    (set, get) => ({
      activeQuiz: null,
      failedQuestions: [],
      userXP: 0,

      // Verifica si se puede iniciar o si hay uno colgado de otra ruta
      checkAndStartQuiz: (languageId, pathId) => {
        const current = get().activeQuiz;

        // Si hay un quiz activo de otro lenguaje o ruta diferente
        if (
          current &&
          (current.languageId !== languageId || current.pathId !== pathId)
        ) {
          return "MISMATCH";
        }

        // Si no hay quiz, lo inicializa
        if (!current) {
          set({ activeQuiz: { languageId, pathId, currentIndex: 0 } });
        }
        return "READY";
      },

      // Sobrescribe cualquier quiz anterior e inicia uno nuevo
      forceStartQuiz: (languageId, pathId) => {
        set({ activeQuiz: { languageId, pathId, currentIndex: 0 } });
      },
      resetQuiz: () => {
        set({ activeQuiz: null });
      },

      // Registra el error (DATA PARA LA IA)
      recordFailure: (languageId, pathId, questionId) => {
        const newFailure: FailedQuestion = {
          language: languageId,
          path: pathId,
          question: questionId,
          datetime: new Date().toISOString(),
        };
        set((state) => ({
          failedQuestions: [...state.failedQuestions, newFailure],
        }));
      },

      // Suma la experiencia
      addXP: (amount) => set((state) => ({ userXP: state.userXP + amount })),

      // Avanza a la siguiente pregunta
      nextQuestion: () =>
        set((state) => ({
          activeQuiz: state.activeQuiz
            ? {
                ...state.activeQuiz,
                currentIndex: state.activeQuiz.currentIndex + 1,
              }
            : null,
        })),

      // Limpia el estado del quiz actual al finalizar
      finishQuiz: () => set({ activeQuiz: null }),
    }),
    {
      name: "learning-app-quiz",
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
