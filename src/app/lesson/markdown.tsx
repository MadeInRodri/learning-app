import { MaterialIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useMemo } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import Markdown from "react-native-markdown-display";
import { useCourseStore } from "../../store/courseStore";
import { useModuleStore } from "../../store/moduleStore";

export default function MarkdownLessonScreen() {
  const { modules, activeModuleId } = useModuleStore();
  const { activeCourseName } = useCourseStore();

  // Buscamos el módulo específico que el usuario clickeó
  const activeModule = useMemo(() => {
    return modules.find((m) => m.id === activeModuleId);
  }, [modules, activeModuleId]);

  // Si por alguna razón no hay contenido, mostramos un fallback
  const lessonContent =
    activeModule?.content ||
    "# Contenido no encontrado\nIntenta recargar la lección.";

  return (
    <View className="flex-1 bg-[#0d1117]">
      <View className="flex-row items-center justify-between px-4 pt-12 pb-4 border-b border-gray-800 bg-[#0d1117]">
        <Pressable
          onPress={() => router.back()}
          className="w-10 h-10 rounded-full bg-[#181c22] border border-gray-700 items-center justify-center active:bg-gray-700 transition-colors"
        >
          <MaterialIcons name="arrow-back" size={24} color="#9ca3af" />
        </Pressable>

        {/* Título dinámico basado en el curso actual */}
        <Text className="text-white font-bold text-lg">
          {activeCourseName} - Teoría
        </Text>
        <View className="w-10 h-10" />
      </View>

      <ScrollView className="flex-1 px-4">
        <View className="w-full max-w-md mx-auto pt-6 pb-24">
          <Markdown style={markdownStyles}>{lessonContent}</Markdown>

          <Pressable
            onPress={() => {
              // TODO: Llamada a la BD o estado global para marcar como leída
              router.back();
            }}
            className="w-full mt-8 bg-blue-600 active:bg-blue-700 rounded-lg py-4 flex-row items-center justify-center shadow-lg shadow-blue-500/30"
          >
            <Text className="text-white font-bold mr-2 text-base">
              ¡Entendido! Completar lección
            </Text>
            <MaterialIcons name="check" size={20} color="white" />
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
