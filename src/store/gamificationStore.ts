// 1 -> Aún no uso la parte del quiz IA con checkWeekQuiz

import { api } from "@/config/api";
import { create } from "zustand";
import { useAuthStore } from "./authStore";

// Función utilitaria para calcular el Nivel dinámicamente según la XP total
export const calculateLevelInfo = (totalXP: number = 0) => {
  let level = 1;
  let currentXP = totalXP;
  let maxXP = 200; // XP base requerida para pasar del Nivel 1 al 2

  // Escala de dificultad
  while (currentXP >= maxXP) {
    currentXP -= maxXP;
    level += 1;
    maxXP = Math.floor(maxXP * 1.5);
  }

  const progress = Math.min(100, Math.round((currentXP / maxXP) * 100));

  return { level, currentXP, maxXP, progress };
};

interface GamificationState {
  // Peticiones al backend basadas en la API
  fetchRewardsCatalog: () => Promise<any>;
  registerStreak: (dateISO: string) => Promise<void>;
  claimReward: (
    type: string,
    source: string,
    nameReward: string,
  ) => Promise<boolean>;
  checkWeekQuiz: () => Promise<any>;
}

export const useGamificationStore = create<GamificationState>()((set, get) => ({
  //Me traigo las recompensas
  fetchRewardsCatalog: async () => {
    try {
      const response = await api.get("/game/rewards_catalogo");
      return response.data;
    } catch (error) {
      console.error("Error obteniendo catálogo:", error);
      return null;
    }
  },

  //La racha
  registerStreak: async (dateISO) => {
    const user = useAuthStore.getState().activeUser;
    if (!user) return;

    try {
      await api.get("/game/strike", {
        params: { id: user.id, date: dateISO },
      });
    } catch (error) {
      console.error("Error registrando racha:", error);
    }
  },

  //Reclamar recompensa, en cada vista solo le paso el name y el tipo
  claimReward: async (type, source, nameReward) => {
    const user = useAuthStore.getState().activeUser;
    if (!user) return false;

    try {
      await api.post(
        "/game/reward",
        { source, nameReward },
        { params: { id: user.id, type } },
      );

      return true;
    } catch (error) {
      console.error("Error reclamando recompensa:", error);
      return false;
    }
  },

  //Esto para el quiz IA, todavía no lo uso
  checkWeekQuiz: async () => {
    const user = useAuthStore.getState().activeUser;
    if (!user) return null;

    try {
      const response = await api.get("/game/week_quiz", {
        params: { id: user.id },
      });
      return response.data;
    } catch (error) {
      console.error("Error verificando quiz semanal:", error);
      return null;
    }
  },
}));
