import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

interface GamificationState {
  energy: { current: number; max: number };
  streak: { days: number; isActive: boolean };
  experience: { level: number; currentXP: number; maxXP: number };

  // Acciones
  useEnergy: (amount: number) => boolean;
  addXP: (amount: number) => void;
  breakStreak: () => void;
  incrementStreak: () => void;
  addEnergy: (amount: number) => void;
}

export const useGamificationStore = create<GamificationState>()(
  persist(
    (set, get) => ({
      energy: { current: 12, max: 20 },
      streak: { days: 7, isActive: true },
      experience: { level: 3, currentXP: 120, maxXP: 200 },

      useEnergy: (amount) => {
        const { energy } = get();
        if (energy.current >= amount) {
          set({ energy: { ...energy, current: energy.current - amount } });
          return true;
        }
        return false;
      },

      addEnergy: (amount) =>
        set((state) => {
          const newEnergy = Math.min(
            state.energy.current + amount,
            state.energy.max,
          );
          return { energy: { ...state.energy, current: newEnergy } };
        }),

      addXP: (amount) =>
        set((state) => {
          let newXP = state.experience.currentXP + amount;
          let newLevel = state.experience.level;
          let newMaxXP = state.experience.maxXP;

          while (newXP >= newMaxXP) {
            newXP -= newMaxXP;
            newLevel += 1;
            newMaxXP = Math.floor(newMaxXP * 1.5);
          }

          return {
            experience: { level: newLevel, currentXP: newXP, maxXP: newMaxXP },
          };
        }),

      breakStreak: () => set({ streak: { days: 0, isActive: false } }),

      incrementStreak: () =>
        set((state) => ({
          streak: {
            days: state.streak.isActive ? state.streak.days + 1 : 1,
            isActive: true,
          },
        })),
    }),
    {
      name: "learning-gamification-storage",
      storage: createJSONStorage(() => AsyncStorage), // Adaptado para React Native
    },
  ),
);
