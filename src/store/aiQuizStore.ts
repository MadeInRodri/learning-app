import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { useQuizStore } from "./quizStore";

export interface AIQuizOption {
  id: "A" | "B" | "C" | "D";
  description: string;
}

export interface AIQuizTopic {
  id: number;
  question: string;
  code: string | null;
  options: AIQuizOption[];
  correctAnswer: "A" | "B" | "C" | "D";
  explanation: string;
}

export interface AIQuizData {
  contentType: "quizz" | "code";
  weekConcept: string;
  message: string;
  rewardType: "XP" | "STAR";
  topics: AIQuizTopic[];
}

interface AiQuizState {
  activeAiQuiz: AIQuizData | null;
  currentIndex: number;
  earnedXP: number;
  isFinished: boolean;

  startAiQuiz: (data: AIQuizData) => void;
  evaluateAnswer: (isCorrect: boolean, rewardVal: number) => void;
  nextAiQuestion: () => void;
  quitAiQuiz: () => void;
  finishAiQuiz: () => void;
}

export const useAiQuizStore = create<AiQuizState>()(
  persist(
    (set, get) => ({
      activeAiQuiz: null,
      currentIndex: 0,
      earnedXP: 0,
      isFinished: false,

      startAiQuiz: (data) => {
        set({
          activeAiQuiz: data,
          currentIndex: 0,
          earnedXP: 0,
          isFinished: false,
        });
      },

      evaluateAnswer: (isCorrect, rewardVal = 25) => {
        if (isCorrect) {
          set((state) => ({ earnedXP: state.earnedXP + rewardVal }));
        }
      },

      nextAiQuestion: () => {
        set((state) => ({ currentIndex: state.currentIndex + 1 }));
      },

      quitAiQuiz: () => {
        set({
          activeAiQuiz: null,
          currentIndex: 0,
          earnedXP: 0,
          isFinished: false,
        });
      },

      finishAiQuiz: () => {
        const { earnedXP } = get();
        if (earnedXP > 0) {
          // Transfiere los puntos ganados al Store global
          useQuizStore.getState().addXP(earnedXP);
        }
        set({ isFinished: true });
      },
    }),
    {
      name: "ai-quiz-storage",
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
