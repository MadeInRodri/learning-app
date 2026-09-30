import { MaterialIcons } from "@expo/vector-icons";
import { router, useFocusEffect, useLocalSearchParams } from "expo-router";
import { useCallback, useMemo, useRef, useState } from "react";
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
import { useAiQuizStore } from "../../store/aiQuizStore";

export default function MarkdownLessonScreen() {
  const { pathId } = useLocalSearchParams<{ pathId: string }>();

  // EXTRAER CON SELECTORES (Evita re-renderizados innecesarios)
  const modules = useModuleStore((state) => state.modules);
  const activeModuleId = useModuleStore((state) => state.activeModuleId);
  const completeModule = useModuleStore((state) => state.completeModule);

  const activeCourseId = useCourseStore((state) => state.activeCourseId);
  const activeCourseName = useCourseStore((state) => state.activeCourseName);

  const claimReward = useGamificationStore((state) => state.claimReward);
  const { completeNormalLesson } = useProgressStore();
  const startAiQuiz = useAiQuizStore((state) => state.startAiQuiz);

  const activeUser = useAuthStore((state) => state.activeUser);
  const updateGamificationStats = useAuthStore((state) => state.updateGamificationStats);

  const [isProcessing, setIsProcessing] = useState(false);
  const isScreenFocused = useRef(false);
  const completionRequestId = useRef(0);

  useFocusEffect(
    useCallback(() => {
      isScreenFocused.current = true;
      setIsProcessing(false);

      return () => {
        isScreenFocused.current = false;
        completionRequestId.current += 1;
      };
    }, []),
  );

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
      setTimeout(() => {
        router.back();
      }, 50);
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
    const requestId = ++completionRequestId.current;

    try {
      // 1. Consumimos energía en el backend
      const energyClaimed = await claimReward(
        "ENERGY",
        "lesson_completion",
        "LESS_ENERGY",
      );
      if (!energyClaimed) throw new Error("No se pudo consumir la energía");

      // 2. Reclamamos la XP en el backend
      const xpClaimed = await claimReward(
        "XP",
        "lesson_completion",
        "XP_REWARD",
      );
      if (!xpClaimed) throw new Error("No se pudo reclamar la XP");

      Toast.show({
        type: "info",
        text1: "Analizando progreso...",
        text2: "La IA está preparando tu reto personalizado.",
      });

      const aiQuiz = await completeNormalLesson(
        activeCourseId!,
        pathId!,
        activeModuleId!,
        activeModule?.title || "Módulo",
        modules.length,
        activeCourseName,
      );
      completeModule(activeModuleId!);
      updateGamificationStats(100, -20);

      if (aiQuiz) {
        startAiQuiz(aiQuiz);
        Toast.hide();
        Toast.show({
          type: "info",
          text1: "¡Reto sorpresa detectado!",
          text2: "La IA preparó un reto personalizado para ti.",
        });
        router.replace("/lesson/ai-quiz" as any);
        return;
      }

      Toast.hide();

      if (
        requestId !== completionRequestId.current ||
        !isScreenFocused.current
      ) {
        return;
      }

      Toast.show({
        type: "success",
        text1: "¡Lección Completada! 🎉",
        text2: "+100 XP | -20 Energía",
      });
      setTimeout(() => {
        router.back();
      }, 50);

    } catch (error) {
      if (
        requestId === completionRequestId.current &&
        isScreenFocused.current
      ) {
        Toast.hide();
        Toast.show({
          type: "error",
          text1: "Error de conexión",
          text2: "No pudimos registrar tu progreso. Intenta de nuevo.",
        });
        setIsProcessing(false);
      }
    }
  };

  return (
    <View className="flex-1 bg-[#0d1117]">
      <View className="flex-row items-center justify-between px-4 pt-12 pb-4 border-b border-gray-800 bg-[#0d1117]">
        <Pressable
          onPress={() => setTimeout(() => {
            router.back();
          }, 50)}
          disabled={isProcessing}
          // 1. Dejamos className 100% estático
          className="w-10 h-10 rounded-full bg-[#181c22] border border-gray-700 items-center justify-center active:bg-gray-700"
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
            // 1. Solo clases que nunca van a cambiar durante la vida del componente
            className="w-full mt-8 rounded-lg py-4 flex-row items-center justify-center"
            // 2. Lógica dinámica inyectada directamente a React Native
            style={{
              backgroundColor: activeModule?.state === "completed" ? "#374151" : "#2563eb",
            }}
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
                  name={activeModule?.state === "completed" ? "arrow-back" : "check"}
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
