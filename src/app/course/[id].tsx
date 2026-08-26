import React from "react";
import { View, Text, Pressable, ScrollView } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { router } from "expo-router";

export default function CourseScreen() {
  const modules = [
    {
      id: "1",
      title: "Variables",
      subtitle: "let, const, var",
      state: "completed",
      type: "lesson",
    },
    {
      id: "2",
      title: "Tipos de Datos",
      subtitle: "Strings, Numbers, Booleans",
      state: "in-progress",
      type: "lesson",
    },
    {
      id: "3",
      title: "Funciones",
      subtitle: "Declaración y Flecha",
      state: "locked",
      type: "lesson",
    },
    {
      id: "3",
      title: "Funciones",
      subtitle: "Declaración y Flecha",
      state: "locked",
      type: "lesson",
    },
    {
      id: "3",
      title: "Funciones",
      subtitle: "Declaración y Flecha",
      state: "locked",
      type: "lesson",
    },
    {
      id: "3",
      title: "Funciones",
      subtitle: "Declaración y Flecha",
      state: "locked",
      type: "lesson",
    },
    {
      id: "4",
      title: "Quiz final",
      subtitle: "Prueba tus conocimientos",
      state: "locked",
      type: "quiz",
    },
  ];

  return (
    <View className="flex-1 bg-[#0d1117]">
      {/* Nuevo Header de Navegación */}
      <View className="flex-row items-center justify-between px-4 pt-12 pb-4 border-b border-gray-800 bg-[#0d1117]">
        {/* Botón Atrás */}
        <Pressable
          onPress={() => router.back()}
          className="w-10 h-10 rounded-full bg-[#181c22] border border-gray-700 items-center justify-center active:bg-gray-700 transition-colors"
        >
          <MaterialIcons name="arrow-back" size={24} color="#9ca3af" />
        </Pressable>

        {/* Título Centralizado del Header */}
        <Text className="text-white font-bold text-lg">
          Ruta de Aprendizaje
        </Text>

        {/* Placeholder invisible para centrar el título con flex-between */}
        <View className="w-10 h-10" />
      </View>

      <ScrollView
        contentContainerStyle={{ alignItems: "center", paddingBottom: 40 }}
      >
        <View className="w-full max-w-md px-4 pt-8">
          {/* Título de la sección */}
          <View className="items-center mb-10">
            <Text className="text-2xl font-bold text-white mb-2 text-center tracking-tight">
              JS - Aprendiendo lo básico
            </Text>
            <Text className="text-gray-400 text-sm text-center">
              Continúa tu ruta de aprendizaje
            </Text>
          </View>

          {/* Contenedor del Árbol */}
          <View className="relative w-full py-4">
            {/* Línea Central Vertical */}
            <View className="absolute top-0 bottom-0 left-1/2 w-[2px] bg-gray-700 -translate-x-[1px]" />

            {/* Renderizado dinámico de los módulos */}
            {modules.map((mod, index) => {
              const isLeft = index % 2 === 0;

              // Variables de estilo por defecto (Locked)
              let cardStyle = "border-gray-800 opacity-60";
              let dotStyle = "border-gray-700 bg-[#161b22]";
              let titleStyle = "text-gray-500";
              let subtitleStyle = "text-gray-600";
              let iconColor = "#6b7280"; // gray-500
              let iconName: any = "lock";

              // Modificadores según estado
              if (mod.state === "completed") {
                cardStyle = isLeft
                  ? "border-emerald-500 border-r-4"
                  : "border-emerald-500 border-l-4";
                dotStyle = "border-emerald-500 bg-[#161b22]";
                titleStyle = "text-white";
                subtitleStyle = "text-gray-400";
                iconColor = "#10b981"; // emerald-500
                iconName = "check";
              } else if (mod.state === "in-progress") {
                cardStyle = isLeft
                  ? "border-blue-400 border-r-4"
                  : "border-blue-400 border-l-4";
                dotStyle =
                  "border-blue-400 bg-blue-900/20 shadow-lg shadow-blue-500/50";
                titleStyle = "text-blue-400";
                subtitleStyle = "text-gray-400";
                iconColor = "#60a5fa"; // blue-400
                iconName = "play-arrow";
              } else if (mod.type === "quiz") {
                cardStyle =
                  "border-gray-700 border-dashed bg-[#1c2026] opacity-60";
                dotStyle = "border-gray-700 border-dashed bg-[#1c2026]";
                iconName = "emoji-events";
              }

              const baseCardClasses = `p-4 bg-[#161b22] rounded-xl border transition-transform ${
                mod.state !== "locked" ? "active:scale-95" : ""
              }`;

              return (
                <View
                  key={mod.id}
                  className="flex-row w-full mb-8 relative items-center"
                >
                  {/* El Punto Central (Icono) */}
                  <View
                    className={`absolute left-1/2 w-8 h-8 rounded-full border-2 items-center justify-center z-10 -translate-x-4 ${dotStyle}`}
                  >
                    <MaterialIcons
                      name={iconName}
                      size={16}
                      color={iconColor}
                    />
                  </View>

                  {isLeft ? (
                    <>
                      <Pressable
                        className="w-1/2 pr-8"
                        onPress={() => {
                          if (mod.state !== "locked") {
                            const route =
                              mod.type === "quiz"
                                ? "/lesson/quiz"
                                : "/lesson/markdown";
                            router.push(route as any);
                          }
                        }}
                      >
                        <View className={`${baseCardClasses} ${cardStyle}`}>
                          <Text
                            className={`text-base font-bold mb-1 ${titleStyle}`}
                          >
                            {mod.title}
                          </Text>
                          <Text className={`text-xs ${subtitleStyle}`}>
                            {mod.subtitle}
                          </Text>
                        </View>
                      </Pressable>
                      <View className="w-1/2" />
                    </>
                  ) : (
                    <>
                      <View className="w-1/2" />
                      <Pressable
                        className="w-1/2 pl-8"
                        onPress={() => {
                          if (mod.state !== "locked") {
                            const route =
                              mod.type === "quiz"
                                ? "/lesson/quiz"
                                : "/lesson/markdown";
                            router.push(route as any);
                          }
                        }}
                      >
                        <View className={`${baseCardClasses} ${cardStyle}`}>
                          <Text
                            className={`text-base font-bold mb-1 ${titleStyle}`}
                          >
                            {mod.title}
                          </Text>
                          <Text className={`text-xs ${subtitleStyle}`}>
                            {mod.subtitle}
                          </Text>
                        </View>
                      </Pressable>
                    </>
                  )}
                </View>
              );
            })}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
