import React from "react";
import { View, Text, Pressable, ScrollView } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { router } from "expo-router";

export default function PathScreen() {
  // Objeto simulado de lecciones con los estados que definimos
  const lessons = [
    {
      id: "1",
      number: "01",
      title: "Aprendiendo lo básico",
      state: "completed",
    },
    { id: "2", number: "02", title: "Funciones en JS", state: "in-progress" },
    { id: "3", number: "03", title: "Librerías", state: "locked" },
    { id: "4", number: "04", title: "Proyectos Avanzados", state: "locked" },
    { id: "5", number: "05", title: "Proyectos Avanzados", state: "locked" },
    { id: "6", number: "06", title: "Proyectos Avanzados", state: "locked" },
    { id: "7", number: "07", title: "Proyectos Avanzados", state: "locked" },
    { id: "8", number: "08", title: "Proyectos Avanzados", state: "locked" },
    { id: "9", number: "09", title: "Proyectos Avanzados", state: "locked" },
    { id: "10", number: "10", title: "Proyectos Avanzados", state: "locked" },
  ];

  return (
    // Usamos ScrollView por si la ruta crece y tiene más de 4 lecciones
    <ScrollView
      className="flex-1 bg-[#0d1117]"
      contentContainerStyle={{ alignItems: "center", paddingBottom: 40 }}
    >
      <View className="w-full max-w-sm px-4 pt-10">
        {/* Título */}
        <Text className="text-2xl font-bold text-white text-center mb-8 tracking-tight">
          Aprendiendo JS
        </Text>

        {/* Árbol de Progreso Vertical */}
        <View className="items-center w-full">
          {lessons.map((lesson, index) => {
            // Variables por defecto (Estado: locked) [cite: 339, 394]
            let borderCard = "border-gray-800";
            let borderCircle = "border-gray-700";
            let bgCircle = "bg-gray-800/50";
            let textTitle = "text-gray-500";
            let textNumber = "text-gray-500";
            let iconName: any = "lock";
            let iconColor = "#ef4444"; // red-500

            // Estilos dinámicos para completado [cite: 337, 392]
            if (lesson.state === "completed") {
              borderCard = "border-gray-700";
              borderCircle = "border-gray-600";
              bgCircle = "bg-gray-800";
              textTitle = "text-white";
              textNumber = "text-gray-400";
              iconName = "check-circle";
              iconColor = "#9ca3af"; // gris o verde sutil
            }
            // Estilos dinámicos para en progreso [cite: 338, 393]
            else if (lesson.state === "in-progress") {
              borderCard = "border-blue-500";
              borderCircle = "border-blue-500";
              bgCircle = "bg-blue-500/20";
              textTitle = "text-blue-400";
              textNumber = "text-blue-500";
              iconName = "play-circle-filled";
              iconColor = "#3b82f6"; // blue-500
            }

            return (
              <View key={lesson.id} className="w-full items-center">
                {/* Tarjeta del Nivel */}
                <Pressable
                  onPress={() => {
                    // Solo navegamos si no está bloqueada
                    if (lesson.state !== "locked") {
                      // Por ahora navegamos al interior de la lección
                      router.push("/course/1" as any);
                    }
                  }}
                  className={`w-full flex-row items-center justify-between p-4 rounded-xl bg-[#181c22] border-2 ${borderCard} ${
                    lesson.state === "locked"
                      ? "opacity-70"
                      : "active:scale-95 transition-transform"
                  }`}
                >
                  <View className="flex-row items-center">
                    {/* Círculo con el número */}
                    <View
                      className={`w-10 h-10 rounded-full border-2 ${borderCircle} ${bgCircle} items-center justify-center mr-4`}
                    >
                      <Text
                        className={`font-mono text-xs font-bold ${textNumber}`}
                      >
                        {lesson.number}
                      </Text>
                    </View>
                    {/* Título de la Lección */}
                    <Text className={`text-base font-bold ${textTitle}`}>
                      {lesson.title}
                    </Text>
                  </View>

                  {/* Ícono de Estado */}
                  <MaterialIcons name={iconName} size={24} color={iconColor} />
                </Pressable>

                {/* Línea conectora (se renderiza en todos menos en el último elemento) */}
                {index < lessons.length - 1 && (
                  <View className="w-[2px] h-8 bg-gray-700" />
                )}
              </View>
            );
          })}
        </View>
      </View>
    </ScrollView>
  );
}
