import { MaterialIcons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { useMemo, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import Markdown from "react-native-markdown-display";
import Toast from "react-native-toast-message";

import { useAuthStore } from "../../store/authStore";
import { useCourseStore } from "../../store/courseStore";
import { useGamificationStore } from "../../store/gamificationStore";
import { useModuleStore } from "../../store/moduleStore";
import { useProgressStore } from "../../store/progressStore";

export default function MarkdownLessonScreen() {
  const { pathId } = useLocalSearchParams<{ pathId: string }>();

  const { modules, activeModuleId } = useModuleStore();
  const { activeCourseId, activeCourseName } = useCourseStore();
  const { claimReward } = useGamificationStore();
  const { completeNormalLesson } = useProgressStore();
  const { activeUser, updateGamificationStats } = useAuthStore();

  const [isProcessing, setIsProcessing] = useState(false);

  // Buscamos el módulo específico que el usuario clickeó
  const activeModule = useMemo(() => {
    return modules.find((m) => m.id === activeModuleId);
  }, [modules, activeModuleId]);

  // Si por alguna razón no hay contenido, mostramos un fallback
  const lessonContent =
    activeModule?.content ||
    "# Contenido no encontrado\nIntenta recargar la lección.";

  const handleCompleteLesson = async () => {
    // Si ya completó esta lección previamente, no gasta energía ni da XP
    if (activeModule?.state === "completed") {
      router.back();
      return;
    }

    // Verificamos si tiene la energía necesaria (20 de energía)
    if ((activeUser?.energiaBalance || 0) < 20) {
      Toast.show({
        type: "error",
        text1: "Energía Insuficiente ⚡",
        text2: "Necesitas al menos 20 de energía para completar una lección.",
      });
      return;
    }

    setIsProcessing(true);

    try {
      // 1. Consumimos energía en el backend
      await claimReward("ENERGY", "lesson_completion", "LESS_ENERGY");

      // 2. Reclamamos la XP en el backend
      await claimReward("XP", "lesson_completion", "XP_REWARD");

      // 3. Marcamos el módulo como pasado en la BD de progreso
      // Nota: Asumimos pathId = "1" temporalmente, igual que en el quiz
      completeNormalLesson(activeCourseId!, pathId!, activeModuleId!);

      // 4. Actualizamos el UI localmente de forma instantánea (+100 XP, -20 Energía)
      updateGamificationStats(100, -20);

      Toast.show({
        type: "success",
        text1: "¡Lección Completada! 🎉",
        text2: "+100 XP | -20 Energía",
      });

      router.back();
    } catch (error) {
      Toast.show({
        type: "error",
        text1: "Error de conexión",
        text2: "No pudimos registrar tu progreso. Intenta de nuevo.",
      });
      setIsProcessing(false);
    }
  };

  return (
    <View className="flex-1 bg-[#0d1117]">
      <View className="flex-row items-center justify-between px-4 pt-12 pb-4 border-b border-gray-800 bg-[#0d1117]">
        <Pressable
          onPress={() => router.back()}
          disabled={isProcessing}
          className={`w-10 h-10 rounded-full bg-[#181c22] border border-gray-700 items-center justify-center  ${isProcessing ? "opacity-50" : "active:bg-gray-700"}`}
        >
          <MaterialIcons name="arrow-back" size={24} color="#9ca3af" />
        </Pressable>

        <Text className="text-white font-bold text-lg">
          {activeCourseName} - Teoría
        </Text>
        <View className="w-10 h-10" />
      </View>

      <ScrollView className="flex-1 px-4">
        <View className="w-full max-w-md mx-auto pt-6 pb-24">
          <Markdown style={markdownStyles}>{lessonContent}</Markdown>

          <Pressable
            onPress={handleCompleteLesson}
            disabled={isProcessing}
            className={`w-full mt-8 rounded-lg py-4 flex-row items-center justify-center shadow-lg  ${
              activeModule?.state === "completed"
                ? "bg-gray-700"
                : "bg-blue-600 active:bg-blue-700 shadow-blue-500/30"
            } ${isProcessing ? "opacity-70" : ""}`}
          >
            {isProcessing ? (
              <ActivityIndicator color="white" />
            ) : (
              <>
                <Text className="text-white font-bold mr-2 text-base">
                  {activeModule?.state === "completed"
                    ? "Volver a la ruta"
                    : "¡Entendido! Completar lección"}
                </Text>
                <MaterialIcons
                  name={
                    activeModule?.state === "completed" ? "arrow-back" : "check"
                  }
                  size={20}
                  color="white"
                />
              </>
            )}
          </Pressable>
        </View>
      </ScrollView>
    </View>
  );
}
const markdownStyles = StyleSheet.create({
  body: { color: "#dfe2eb", fontSize: 16, lineHeight: 26 },
  heading1: {
    color: "#ffffff",
    fontSize: 26,
    fontWeight: "bold",
    marginTop: 10,
    marginBottom: 16,
  },
  heading2: {
    color: "#ffffff",
    fontSize: 22,
    fontWeight: "bold",
    marginTop: 20,
    marginBottom: 12,
  },
  paragraph: { marginBottom: 16 },
  strong: { color: "#adc6ff", fontWeight: "bold" },
  list_item: { marginBottom: 8 },
  code_inline: {
    backgroundColor: "#1e1e1e",
    color: "#ffb786",
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
    fontFamily: "monospace",
    overflow: "hidden",
  },
  fence: {
    backgroundColor: "#161b22",
    borderColor: "#30363d",
    borderWidth: 1,
    borderRadius: 8,
    padding: 16,
    marginVertical: 16,
    fontFamily: "monospace",
    color: "#c2c6d6",
  },
  blockquote: {
    backgroundColor: "#161b22",
    borderLeftColor: "#3b82f6",
    borderLeftWidth: 4,
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginVertical: 16,
    borderRadius: 4,
  },
});
